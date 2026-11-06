"""通过 Blender 导入 NASA 官方 GLB，整理后导出无外部依赖的网页资产。

从仓库根目录运行：
  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
    --python space/solar-assets/artificial/build_models.py

只在独立后台进程运行。保留官方材质与贴图；归零、归一化、清理冗余网格。
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import bpy
import bmesh
from mathutils import Matrix, Vector

BASE = Path(__file__).resolve().parent
CATALOG = json.loads((BASE / "sources.json").read_text())
TRIANGLE_BUDGET = 40_000


# ============ 网格计量 ============
def triangle_count(objects):
    return sum(sum(max(0, len(p.vertices) - 2) for p in obj.data.polygons) for obj in objects)


def world_bounds(objects):
    points = [obj.matrix_world @ vertex.co for obj in objects for vertex in obj.data.vertices]
    low = Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high = Vector(tuple(max(p[i] for p in points) for i in range(3)))
    center = (low + high) * 0.5
    radius = max((point - center).length for point in points)
    return center, radius, low, high


# ============ 保留材质的网格整理 ============
def apply_modifier(obj, modifier):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def clean_meshes(objects):
    # 优先合并同一平面上的冗余三角面，保留材质、UV 和法线边界。
    for obj in objects:
        if len(obj.data.polygons) < 100:
            continue
        modifier = obj.modifiers.new("PlanarCleanup", "DECIMATE")
        modifier.decimate_type = "DISSOLVE"
        modifier.angle_limit = 0.0001
        modifier.delimit = {"NORMAL", "MATERIAL", "UV"}
        apply_modifier(obj, modifier)

    triangles = triangle_count(objects)
    if triangles <= TRIANGLE_BUDGET:
        return

    # 小组件保持原形，只简化较大的网格；材质槽及贴图保留。
    large = [obj for obj in objects if triangle_count([obj]) >= 500]
    small_count = triangles - triangle_count(large)
    ratio = max(0.02, min(1.0, (TRIANGLE_BUDGET - small_count) / triangle_count(large)))
    for obj in large:
        modifier = obj.modifiers.new("WebDetailBudget", "DECIMATE")
        modifier.decimate_type = "COLLAPSE"
        modifier.ratio = ratio
        modifier.use_collapse_triangulate = True
        apply_modifier(obj, modifier)


# ============ 删除不参与成像的退化面与孤立顶点 ============
def prune_unused_geometry(objects):
    removed_faces = 0
    for obj in objects:
        referenced = {index for polygon in obj.data.polygons for index in polygon.vertices}
        has_degenerate = any(polygon.area <= 1e-12 for polygon in obj.data.polygons)
        if len(referenced) == len(obj.data.vertices) and not has_degenerate:
            continue
        mesh = bmesh.new()
        mesh.from_mesh(obj.data)
        invalid_faces = [face for face in mesh.faces if face.calc_area() <= 1e-12]
        removed_faces += len(invalid_faces)
        if invalid_faces:
            bmesh.ops.delete(mesh, geom=invalid_faces, context="FACES_ONLY")
        loose_vertices = [vertex for vertex in mesh.verts if not vertex.link_faces]
        if loose_vertices:
            bmesh.ops.delete(mesh, geom=loose_vertices, context="VERTS")
        mesh.to_mesh(obj.data)
        mesh.free()
        obj.data.update()
    return removed_faces


# ============ 静态资产归一化 ============
def normalize(objects):
    # 将源层级的变换烘焙到各自网格，避免实例共享数据导致重复缩放。
    for obj in objects:
        world = obj.matrix_world.copy()
        obj.data = obj.data.copy()
        obj.data.transform(world)
        obj.parent = None
        obj.matrix_world = Matrix.Identity(4)
    bpy.context.view_layer.update()

    center, radius, _, _ = world_bounds(objects)
    if radius <= 0:
        raise RuntimeError("模型没有有效尺寸")
    transform = Matrix.Scale(1.0 / radius, 4) @ Matrix.Translation(-center)
    for obj in objects:
        obj.data.transform(transform)
        obj.data.update()
    bpy.context.view_layer.update()


# ============ 构建 ============
def build(key, source):
    original = BASE / source["original"]
    if hashlib.sha256(original.read_bytes()).hexdigest() != source["sha256"]:
        raise RuntimeError(f"原始文件校验失败：{key}")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(original), merge_vertices=True)
    objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not objects:
        raise RuntimeError(f"没有导入网格：{key}")
    original_triangles = triangle_count(objects)

    # 先烘焙，确保所有网格清理都在同一单位尺度下执行。
    normalize(objects)
    repaired_meshes = []
    for obj in objects:
        if obj.data.validate(clean_customdata=False):
            repaired_meshes.append(obj.name)
    clean_meshes(objects)
    removed_degenerate_faces = prune_unused_geometry(objects)
    for obj in objects:
        if obj.data.validate(clean_customdata=False):
            repaired_meshes.append(obj.name)
        obj.data.update()
    normalize(objects)
    root = bpy.data.objects.new(key, None)
    bpy.context.collection.objects.link(root)
    root["source"] = source["page"]
    root["credit"] = source["credit"]
    root["normalization"] = "bbox center at origin; maximum vertex radius = 1; glTF Y-up"
    for obj in objects:
        obj.parent = root

    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = root
    output = BASE / f"{key}.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_texcoords=True,
        export_normals=True,
        export_extras=True,
        export_draco_mesh_compression_enable=False,
    )
    center, radius, low, high = world_bounds(objects)
    if center.length > 0.00001 or abs(radius - 1) > 0.00001:
        raise RuntimeError(f"归一化校验失败：{key}, center={center}, radius={radius}")
    report = {
        "file": output.name,
        "sourcePage": source["page"],
        "credit": source["credit"],
        "sourceSha256": source["sha256"],
        "outputSha256": hashlib.sha256(output.read_bytes()).hexdigest(),
        "bytes": output.stat().st_size,
        "meshObjects": len(objects),
        "originalTriangles": original_triangles,
        "triangles": triangle_count(objects),
        "repairedMeshData": sorted(set(repaired_meshes)),
        "removedDegenerateFaces": removed_degenerate_faces,
        "centerBlenderZUp": list(center),
        "maximumVertexRadius": radius,
        "boundsBlenderZUp": [list(low), list(high)],
        "exportAxes": "glTF Y-up",
        "blenderVersion": bpy.app.version_string,
    }
    print("ASSET_REPORT " + json.dumps(report, ensure_ascii=False), flush=True)
    return report


reports = {key: build(key, source) for key, source in CATALOG["models"].items()}
(BASE / "build-report.json").write_text(json.dumps(reports, ensure_ascii=False, indent=2) + "\n")
total_bytes = sum(path.stat().st_size for path in BASE.rglob("*") if path.is_file())
print("DIRECTORY_BYTES " + str(total_bytes), flush=True)
if total_bytes > 10_000_000:
    raise RuntimeError(f"目录超过 10 MB 预算：{total_bytes}")
