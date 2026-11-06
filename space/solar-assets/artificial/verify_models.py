"""重新导入最终 GLB，验证尺寸与依赖；加 -- --render 可生成原始/优化外形对照。"""

from pathlib import Path
import json
import struct
import sys

import bpy
from mathutils import Matrix, Vector

BASE = Path(__file__).resolve().parent
RENDER = "--render" in sys.argv
KEYS = ("iss", "hubble", "webb")


def bounds(objects):
    vertices = [obj.matrix_world @ v.co for obj in objects for v in obj.data.vertices]
    low = Vector(tuple(min(v[i] for v in vertices) for i in range(3)))
    high = Vector(tuple(max(v[i] for v in vertices) for i in range(3)))
    center = (low + high) * 0.5
    return center, max((v - center).length for v in vertices)


def import_model(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path), merge_vertices=True)
    bpy.context.view_layer.update()
    return [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]


def preview(objects, path):
    center, radius = bounds(objects)
    for obj in objects:
        world = obj.matrix_world.copy()
        obj.data = obj.data.copy()
        obj.data.transform(Matrix.Scale(1 / radius, 4) @ Matrix.Translation(-center) @ world)
        obj.parent = None
        obj.matrix_world = Matrix.Identity(4)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 12
    scene.cycles.use_denoising = True
    scene.render.resolution_x = scene.render.resolution_y = 512
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = 85
    scene.render.filepath = str(path)
    scene.world = bpy.data.worlds.new("InspectionWorld")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs[0].default_value = (0.13, 0.16, 0.20, 1)
    scene.world.node_tree.nodes["Background"].inputs[1].default_value = 0.55
    scene.view_settings.view_transform = "AgX"
    bpy.ops.object.camera_add(location=(2.6, -3.8, 2.6))
    camera = bpy.context.object
    camera.rotation_euler = (-camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 2.45
    scene.camera = camera
    for location, power, size in [((3, -4, 5), 800, 4), ((-3, -1, 2), 500, 3), ((0, 4, 3), 700, 3)]:
        bpy.ops.object.light_add(type="AREA", location=location)
        light = bpy.context.object
        light.data.energy = power
        light.data.shape = "DISK"
        light.data.size = size
        light.rotation_euler = (-light.location).to_track_quat("-Z", "Y").to_euler()
    bpy.ops.render.render(write_still=True)


results = {}
for key in KEYS:
    path = BASE / f"{key}.glb"
    raw = path.read_bytes()
    assert raw[:4] == b"glTF"
    length = struct.unpack_from("<I", raw, 12)[0]
    document = json.loads(raw[20:20 + length])
    assert "KHR_draco_mesh_compression" not in document.get("extensionsUsed", [])
    assert not any("uri" in image for image in document.get("images", []))
    assert not any("uri" in buffer for buffer in document.get("buffers", []))
    objects = import_model(path)
    center, radius = bounds(objects)
    results[key] = {
        "reimported": True,
        "center": list(center),
        "maximumVertexRadius": radius,
        "materials": len(document.get("materials", [])),
        "embeddedImages": len(document.get("images", [])),
        "externalDependencies": False,
        "dracoRequired": False,
        "extensionsRequired": document.get("extensionsRequired", []),
    }
    if RENDER:
        target = BASE / "verification"
        target.mkdir(exist_ok=True)
        preview(objects, target / f"{key}-optimized.jpg")
        original_objects = import_model(BASE / "sources" / f"{key}-original.glb")
        preview(original_objects, target / f"{key}-original.jpg")
    assert center.length < 0.00001, (key, list(center))
    assert abs(radius - 1) < 0.00001, (key, radius)

(BASE / "verification.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
total_bytes = sum(path.stat().st_size for path in BASE.rglob("*") if path.is_file())
assert total_bytes <= 10_000_000, total_bytes
print("VERIFIED " + json.dumps({"models": results, "directoryBytes": total_bytes}), flush=True)
