"""用 Blender 5.2 后台生成独立 demo 的土星 GLB。

从仓库根目录运行：
  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
    --python space/realism-lab/blender/build_saturn.py

本脚本只在独立的 --factory-startup 进程中使用。Blender 内部保持 Z 轴为自转轴：
glTF 导出器转为 Y-up 后，环自然位于 glTF 的 XZ 平面；页面再负责 26.7° 倾角。
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import bpy


# ============ 资产尺度与低多边形预算 ============
# 赤道半径为 1；极半径为 0.9。环的 U 始终是归一化半径，V 固定在条带中线，
# 与项目现有 RingGeometry 的 saturn_ring.png 映射一致。
BODY_RADIUS = 1.0
POLAR_RATIO = 0.90
RING_INNER_RADIUS = 1.24
RING_OUTER_RADIUS = 2.28
BODY_SEGMENTS = 128
BODY_RING_COUNT = 64
RING_SEGMENTS = 192
RING_RADIAL_BANDS = 4
MAX_TRIANGLES = 20_000

SCRIPT = Path(__file__).resolve()
ROOT = SCRIPT.parents[3]
TEXTURES = ROOT / "space" / "textures"
ASSETS = ROOT / "space" / "realism-lab" / "assets"
BODY_TEXTURE = TEXTURES / "saturn.jpg"
RING_TEXTURE = TEXTURES / "saturn_ring.png"
OUTPUT = ASSETS / "saturn.glb"


# ============ 场景与材质 ============
def clear_factory_scene() -> None:
    """清空 factory-startup 自带物件，避免把相机或灯光导出。"""
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def set_non_metallic(bsdf: bpy.types.Node) -> None:
    """兼容 Blender Principled BSDF 的两个金属度 socket 名称。"""
    metallic = bsdf.inputs.get("Metallic IOR Level") or bsdf.inputs.get("Metallic")
    if metallic is not None:
        metallic.default_value = 0.0


def make_pbr_texture_material(
    name: str,
    image: bpy.types.Image,
    roughness: float,
    use_alpha: bool = False,
) -> bpy.types.Material:
    """建立不含金属成分的 PBR 贴图材质；环保留 PNG alpha。"""
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.use_backface_culling = False
    if use_alpha:
        # Blender 5.2 的 BLENDED 会由 glTF 导出器写成 alphaMode: BLEND。
        material.surface_render_method = "BLENDED"

    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (380, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (120, 0)
    bsdf.inputs["Base Color"].default_value = (1.0, 1.0, 1.0, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    set_non_metallic(bsdf)

    texture = nodes.new("ShaderNodeTexImage")
    texture.location = (-180, 0)
    texture.image = image
    links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
    if use_alpha:
        bsdf.inputs["Alpha"].default_value = 1.0
        links.new(texture.outputs["Alpha"], bsdf.inputs["Alpha"])

    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return material


# ============ 土星球体 ============
def create_body(material: bpy.types.Material) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=BODY_SEGMENTS,
        ring_count=BODY_RING_COUNT,
        radius=BODY_RADIUS,
        location=(0.0, 0.0, 0.0),
    )
    body = bpy.context.object
    body.name = "SaturnBody"
    body.data.name = "SaturnBodyMesh"
    body.scale = (1.0, 1.0, POLAR_RATIO)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for polygon in body.data.polygons:
        polygon.use_smooth = True
    body.data.materials.append(material)
    body["equatorial_radius"] = BODY_RADIUS
    body["polar_radius"] = BODY_RADIUS * POLAR_RATIO
    body["polar_ratio"] = POLAR_RATIO
    return body


# ============ 土星平面环 ============
def create_rings(material: bpy.types.Material) -> bpy.types.Object:
    """在 Blender XY 平面构造薄环，导出 glTF 后即为 XZ 平面。"""
    vertices: list[tuple[float, float, float]] = []
    vertex_uvs: list[tuple[float, float]] = []
    faces: list[tuple[int, int, int, int]] = []
    columns = RING_SEGMENTS + 1

    for radial_index in range(RING_RADIAL_BANDS + 1):
        radial_t = radial_index / RING_RADIAL_BANDS
        radius = RING_INNER_RADIUS + (RING_OUTER_RADIUS - RING_INNER_RADIUS) * radial_t
        for angle_index in range(columns):
            angle = math.tau * angle_index / RING_SEGMENTS
            vertices.append((radius * math.cos(angle), radius * math.sin(angle), 0.0))
            # ring texture 的横向是半径方向，固定 V 不把条带纹理拉成环向花纹。
            vertex_uvs.append((radial_t, 0.5))

    for radial_index in range(RING_RADIAL_BANDS):
        row_start = radial_index * columns
        next_row_start = (radial_index + 1) * columns
        for angle_index in range(RING_SEGMENTS):
            inner = row_start + angle_index
            outer = next_row_start + angle_index
            # 朝 +Z 的稳定法线；glTF 材质仍明确声明双面渲染。
            faces.append((inner, outer, outer + 1, inner + 1))

    mesh = bpy.data.meshes.new("SaturnRingsMesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.validate(clean_customdata=False)
    mesh.update()
    uv_layer = mesh.uv_layers.new(name="RingRadialUV")
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            vertex_index = mesh.loops[loop_index].vertex_index
            uv_layer.data[loop_index].uv = vertex_uvs[vertex_index]
    mesh.materials.append(material)

    rings = bpy.data.objects.new("SaturnRings", mesh)
    bpy.context.collection.objects.link(rings)
    rings["inner_radius"] = RING_INNER_RADIUS
    rings["outer_radius"] = RING_OUTER_RADIUS
    rings["uv_mapping"] = "u=normalized_radius; v=0.5"
    return rings


# ============ 导出与本地结构检查 ============
def triangle_count(obj: bpy.types.Object) -> int:
    return sum(max(0, len(polygon.vertices) - 2) for polygon in obj.data.polygons)


def validate_scene(body: bpy.types.Object, rings: bpy.types.Object) -> dict[str, object]:
    """在导出前检查尺度、未倾斜状态和网格预算。"""
    dimensions = tuple(round(value, 6) for value in body.dimensions)
    expected_dimensions = (2.0, 2.0, 1.8)
    if any(abs(actual - expected) > 1e-5 for actual, expected in zip(body.dimensions, expected_dimensions)):
        raise RuntimeError(f"SaturnBody 尺寸异常：{dimensions}，预期 (2.0, 2.0, 1.8)")
    if tuple(round(value, 6) for value in body.rotation_euler) != (0.0, 0.0, 0.0):
        raise RuntimeError("SaturnBody 不应在资产中倾斜")
    if tuple(round(value, 6) for value in rings.rotation_euler) != (0.0, 0.0, 0.0):
        raise RuntimeError("SaturnRings 不应在资产中倾斜")
    triangles = triangle_count(body) + triangle_count(rings)
    if triangles >= MAX_TRIANGLES:
        raise RuntimeError(f"三角面过多：{triangles}，上限 {MAX_TRIANGLES}")
    return {
        "body_dimensions_blender_z_up": dimensions,
        "ring_inner_radius": RING_INNER_RADIUS,
        "ring_outer_radius": RING_OUTER_RADIUS,
        "triangles": triangles,
        "blender": bpy.app.version_string,
    }


def export_glb(objects: list[bpy.types.Object]) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT),
        export_format="GLB",
        use_selection=True,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_texcoords=True,
        export_normals=True,
        export_yup=True,
        export_apply=False,
        export_extras=True,
    )


def main() -> None:
    if not BODY_TEXTURE.is_file() or not RING_TEXTURE.is_file():
        raise FileNotFoundError("缺少 saturn.jpg 或 saturn_ring.png，无法生成真实贴图资产")
    ASSETS.mkdir(parents=True, exist_ok=True)
    clear_factory_scene()

    body_image = bpy.data.images.load(str(BODY_TEXTURE), check_existing=False)
    body_image.name = "saturn.jpg"
    ring_image = bpy.data.images.load(str(RING_TEXTURE), check_existing=False)
    ring_image.name = "saturn_ring.png"
    ring_image.alpha_mode = "STRAIGHT"

    body = create_body(make_pbr_texture_material("SaturnBodyMaterial", body_image, roughness=0.62))
    rings = create_rings(make_pbr_texture_material("SaturnRingMaterial", ring_image, roughness=0.78, use_alpha=True))
    report = validate_scene(body, rings)
    export_glb([body, rings])
    report["output"] = str(OUTPUT.relative_to(ROOT))
    report["bytes"] = OUTPUT.stat().st_size
    print(json.dumps(report, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
