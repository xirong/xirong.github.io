"""生成 solar-system.html 可复用的 Blender 天体与人造卫星几何 catalog。

从仓库根目录运行：
  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
    --python space/solar-assets/build_models.py

没有图片会被打进 GLB。网页复用 space/textures/ 中已有的真实贴图，并在加载后
为 clone 出来的命名模板单独设置材质。所有对象在 glTF 中是 Y-up、原点中心、
identity node transform；Blender 内部仅为导出坐标转换临时使用 Z-up。
"""

from __future__ import annotations

import json
import math
import struct
from pathlib import Path

import bpy
from mathutils import Vector


# ============ 文件与网格预算 ============
SCRIPT = Path(__file__).resolve()
ROOT = SCRIPT.parents[2]
OUTPUT = SCRIPT.parent / "models.glb"
MAX_BYTES = 2_000_000

UNIT_SEGMENTS = 96
UNIT_RINGS = 64
IRREGULAR_SEGMENTS = 48
IRREGULAR_RINGS = 24
ASTEROID_SUBDIVISIONS = 2

# glTF/Three.js 中的 (x, y, z) 轴长；Y 是自转轴。
BODY_AXES = {
    "jupiterBody": (1.0, 0.935, 1.0),
    "saturnBody": (1.0, 0.900, 1.0),
    # app.js 当前只写了“长椭球”，没有数值 axisScale。
    # 这是一套明确标记为教学示意的三轴比例，不能当作观测精确形状。
    "haumeaBody": (1.0, 0.440, 0.740),
}

# 对应 app.js moonsData 中 shape:'irregularRock' 的实际配置。
# seed、axes 与现有 createIrregularRockGeometry 公式一致，坐标重排后导出为 Y-up。
IRREGULAR_MOONS = {
    "irregularPhobos": {"source": "moonsData.mars[0]", "seed": 1.7, "axes": (1.25, 1.02, 0.84)},
    "irregularDeimos": {"source": "moonsData.mars[1]", "seed": 2.4, "axes": (1.18, 0.96, 0.84)},
    "irregularNix": {"source": "moonsData.pluto[1]", "seed": 3.1, "axes": (1.45, 1.00, 0.74)},
    "irregularHydra": {"source": "moonsData.pluto[2]", "seed": 4.2, "axes": (1.55, 0.92, 0.70)},
    "irregularKerberos": {"source": "moonsData.pluto[3]", "seed": 5.3, "axes": (1.50, 0.88, 0.66)},
    "irregularStyx": {"source": "moonsData.pluto[4]", "seed": 6.4, "axes": (1.42, 0.86, 0.64)},
    "irregularHiiaka": {"source": "moonsData.haumea[0]", "seed": 7.5, "axes": (1.16, 1.00, 0.86)},
    "irregularMK2": {"source": "moonsData.makemake[0]", "seed": 8.6, "axes": (1.20, 0.95, 0.80)},
    "irregularDysnomia": {"source": "moonsData.eris[0]", "seed": 9.7, "axes": (1.12, 0.96, 0.82)},
}

RING_SPECS = (
    # app.js createSaturnRings() 尺度，单位为主星半径。
    ("SaturnRings", 1.40, 2.30, 192, 4, "SaturnRingPBR", "saturn"),
    ("UranusRings", 1.35, 2.75, 160, 2, "UranusRingPBR", "uranus-main"),
    ("UranusInnerRings", 1.78, 1.92, 160, 1, "UranusInnerRingPBR", "uranus-inner"),
    # Rhea 在当前 moonsData 中 hasDustRing:true；这两条保持现有半径比例。
    ("RheaDustRing", 1.55, 2.35, 96, 1, "RheaDustPBR", "rhea-dust"),
    ("RheaOuterDustRing", 2.38, 2.55, 96, 1, "RheaOuterDustPBR", "rhea-outer-dust"),
)

# 这些是供 satellitesData 复用的教学外形模板，不是任一飞行器的 CAD 或工程模型。
# 每个模板的顶点会按最大到原点距离归一化到 1，页面只需 clone geometry 后 scale(size)。
ARTIFICIAL_TEMPLATE_SPECS = {
    "artificialISS": {
        "satellites_data": (0,),
        "kind": "teaching-iss-fallback",
        "source": "NASA ISS facts: truss, pressurized modules and eight main solar arrays",
    },
    "artificialTiangong": {
        "satellites_data": (1,),
        "kind": "teaching-tiangong-fallback",
        "source": "China Manned Space: Tianhe, Wentian and Mengtian three-module station",
    },
    "artificialHubble": {
        "satellites_data": (2,),
        "kind": "teaching-hubble-fallback",
        "source": "NASA Hubble configuration: cylindrical optical telescope and two solar arrays",
    },
    "artificialWebb": {
        "satellites_data": (3,),
        "kind": "teaching-webb-fallback",
        "source": "NASA Webb diagram: 18 gold hexagonal mirror segments and five-layer sunshield",
    },
    "artificialGPS": {
        "satellites_data": (4, 5, 6),
        "kind": "generic-navigation-satellite",
        "source": "GPS.gov space segment; generic spacecraft silhouette, not a block-specific model",
    },
    "artificialComms": {
        "satellites_data": (7, 8),
        "kind": "generic-communications-satellite",
        "source": "generic teaching communications spacecraft; not a named flight model",
    },
    "artificialWeather": {
        "satellites_data": (9,),
        "kind": "generic-weather-satellite",
        "source": "NOAA GOES-R mission and solar-array configuration; not a GOES engineering model",
    },
    "artificialBeidou": {
        "satellites_data": (10,),
        "kind": "generic-beidou-navigation-satellite",
        "source": "BeiDou official constellation material; generic spacecraft silhouette, not a block-specific model",
    },
}

ARTIFICIAL_TEMPLATE_NAMES = tuple(ARTIFICIAL_TEMPLATE_SPECS)
NATURAL_MATERIAL_NAMES = {
    "SurfacePBR",
    "RockPBR",
    "SaturnRingPBR",
    "UranusRingPBR",
    "UranusInnerRingPBR",
    "RheaDustPBR",
    "RheaOuterDustPBR",
}


# ============ Blender / glTF 坐标转换 ============
def blender_to_gltf(point: Vector) -> Vector:
    """Blender Z-up 到 glTF Y-up：X 不变，Blender Z 成 Y，Y 成 -Z。"""
    return Vector((point.x, point.z, -point.y))


def gltf_to_blender(point: Vector) -> Vector:
    """blender_to_gltf 的逆变换。"""
    return Vector((point.x, -point.z, point.y))


def set_metallic(bsdf: bpy.types.Node, metallic: float) -> None:
    socket = bsdf.inputs.get("Metallic IOR Level") or bsdf.inputs.get("Metallic")
    if socket is None:
        raise RuntimeError("Principled BSDF 缺少 Metallic 输入")
    socket.default_value = metallic


def make_pbr_material(
    name: str,
    color: tuple[float, float, float],
    roughness: float,
    alpha: float = 1.0,
    metallic: float = 0.0,
) -> bpy.types.Material:
    """只含 glTF metallic-roughness 参数的默认材质，不创建任何 Image Texture node。"""
    if not 0.0 <= metallic <= 1.0:
        raise ValueError(f"{name} metallic 应在 0 到 1 之间")
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.use_backface_culling = False
    material.diffuse_color = (*color, alpha)
    if alpha < 1.0:
        material.surface_render_method = "BLENDED"

    nodes = material.node_tree.nodes
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (*color, alpha)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Alpha"].default_value = alpha
    set_metallic(bsdf, metallic)
    material.node_tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return material


def clear_factory_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def set_metadata(obj: bpy.types.Object, kind: str, **values: object) -> None:
    obj["catalog_key"] = obj.name
    obj["template_kind"] = kind
    obj["coordinate_system"] = "glTF Y-up; geometry baked; node transform identity"
    for key, value in values.items():
        obj[key] = value


def mark_smooth(mesh: bpy.types.Mesh, smooth: bool) -> None:
    for polygon in mesh.polygons:
        polygon.use_smooth = smooth
    mesh.update()


# ============ 归一化球与扁球 ============
def create_uv_sphere(
    key: str,
    axes_gltf: tuple[float, float, float],
    material: bpy.types.Material,
    kind: str,
    segments: int = UNIT_SEGMENTS,
    rings: int = UNIT_RINGS,
) -> bpy.types.Object:
    """创建已烘焙轴比例的 UV 球；Blender 局部缩放顺序会转换为 glTF Y-up。"""
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segments,
        ring_count=rings,
        radius=1.0,
        location=(0.0, 0.0, 0.0),
    )
    obj = bpy.context.object
    obj.name = key
    obj.data.name = f"{key}Mesh"
    # Blender (X,Y,Z) -> glTF (X,Z,-Y)，故三轴目标需为 (X,Z,Y)。
    obj.scale = (axes_gltf[0], axes_gltf[2], axes_gltf[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mark_smooth(obj.data, True)
    obj.data.materials.append(material)
    set_metadata(
        obj,
        kind,
        axes_gltf=list(axes_gltf),
        radius=1.0,
        uv_mapping="equirectangular UV sphere",
    )
    return obj


def create_unit_and_icy(surface: bpy.types.Material) -> tuple[bpy.types.Object, bpy.types.Object]:
    unit = create_uv_sphere("unitSphere", (1.0, 1.0, 1.0), surface, "shared-spherical-body")
    icy = unit.copy()
    icy.data = unit.data  # 一个 glTF mesh，两个语义节点，降低 GLB 体积。
    icy.name = "icySphere"
    bpy.context.collection.objects.link(icy)
    set_metadata(
        icy,
        "shared-icy-body",
        axes_gltf=[1.0, 1.0, 1.0],
        radius=1.0,
        uv_mapping="equirectangular UV sphere; shares unitSphereMesh",
    )
    return unit, icy


# ============ 不规则天然卫星 ============
def irregular_factor(normal: Vector, seed: float) -> float:
    """与 app.js createIrregularRockGeometry 使用同一组三角函数形变。"""
    broad_lump = math.sin(normal.x * 3.2 + normal.y * 1.7 + seed) * 0.055
    side_dent = math.sin(normal.y * 4.5 - normal.z * 2.1 + seed * 1.9) * 0.040
    ridge = math.sin((normal.x + normal.z) * 5.3 + seed * 2.7) * 0.030
    return 1.0 + broad_lump + side_dent + ridge


def create_irregular_moon(
    key: str,
    source: str,
    seed: float,
    axes_gltf: tuple[float, float, float],
    material: bpy.types.Material,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=IRREGULAR_SEGMENTS,
        ring_count=IRREGULAR_RINGS,
        radius=1.0,
        location=(0.0, 0.0, 0.0),
    )
    obj = bpy.context.object
    obj.name = key
    obj.data.name = f"{key}Mesh"
    for vertex in obj.data.vertices:
        normal_gltf = blender_to_gltf(vertex.co).normalized()
        factor = irregular_factor(normal_gltf, seed)
        deformed_gltf = Vector((
            normal_gltf.x * axes_gltf[0] * factor,
            normal_gltf.y * axes_gltf[1] * (factor * 0.96 + 0.04),
            normal_gltf.z * axes_gltf[2] * (factor * 0.98 + 0.02),
        ))
        vertex.co = gltf_to_blender(deformed_gltf)
    mark_smooth(obj.data, True)
    obj.data.materials.append(material)
    set_metadata(
        obj,
        "irregular-moon-template",
        source_config=source,
        rock_seed=seed,
        axes_gltf=list(axes_gltf),
        uv_mapping="equirectangular UV sphere",
        scientific_boundary="deterministic teaching mesh; not an observed surface reconstruction",
    )
    return obj


# ============ 通用低面小行星 ============
def asteroid_factor(normal: Vector, seed: float) -> float:
    return (
        1.0
        + math.sin(normal.x * 4.1 + normal.y * 1.6 + seed) * 0.12
        + math.sin(normal.y * 5.3 - normal.z * 2.9 + seed * 1.7) * 0.08
        + math.sin((normal.x - normal.z) * 7.0 + seed * 2.2) * 0.045
    )


def add_spherical_uv(mesh: bpy.types.Mesh) -> None:
    """为低面 icosphere 写入按 glTF Y-up 计算的经纬 UV，供网页岩石贴图复用。"""
    uv_layer = mesh.uv_layers.new(name="SphericalUV")
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            point = blender_to_gltf(mesh.vertices[mesh.loops[loop_index].vertex_index].co)
            radius = point.length or 1.0
            longitude = math.atan2(point.z, point.x)
            latitude = math.asin(max(-1.0, min(1.0, point.y / radius)))
            uv_layer.data[loop_index].uv = (0.5 + longitude / math.tau, 0.5 - latitude / math.pi)


def create_asteroid(
    key: str,
    seed: float,
    axes_gltf: tuple[float, float, float],
    material: bpy.types.Material,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=ASTEROID_SUBDIVISIONS, radius=1.0)
    obj = bpy.context.object
    obj.name = key
    obj.data.name = f"{key}Mesh"
    for vertex in obj.data.vertices:
        normal_gltf = blender_to_gltf(vertex.co).normalized()
        deformed = asteroid_factor(normal_gltf, seed)
        vertex.co = gltf_to_blender(Vector((
            normal_gltf.x * axes_gltf[0] * deformed,
            normal_gltf.y * axes_gltf[1] * deformed,
            normal_gltf.z * axes_gltf[2] * deformed,
        )))
    add_spherical_uv(obj.data)
    # 轮廓保留 80 面低多边形，法线平滑以免 5,000 个实例出现闪烁硬边。
    mark_smooth(obj.data, True)
    obj.data.materials.append(material)
    set_metadata(
        obj,
        "generic-low-poly-asteroid-template",
        seed=seed,
        axes_gltf=list(axes_gltf),
        uv_mapping="spherical longitude/latitude UV",
        scientific_boundary="generic asteroid family member; not an individual observed asteroid shape",
    )
    return obj


# ============ 平面环 ============
def create_ring(
    key: str,
    inner_radius: float,
    outer_radius: float,
    segments: int,
    radial_bands: int,
    material: bpy.types.Material,
    source: str,
) -> bpy.types.Object:
    """在 Blender XY 平面建模，导出后为无倾斜的 glTF XZ 平面。"""
    vertices: list[tuple[float, float, float]] = []
    vertex_uvs: list[tuple[float, float]] = []
    faces: list[tuple[int, int, int, int]] = []
    columns = segments + 1
    for row in range(radial_bands + 1):
        radial_t = row / radial_bands
        radius = inner_radius + (outer_radius - inner_radius) * radial_t
        for column in range(columns):
            angle = math.tau * column / segments
            vertices.append((radius * math.cos(angle), radius * math.sin(angle), 0.0))
            vertex_uvs.append((radial_t, 0.5))
    for row in range(radial_bands):
        row_start = row * columns
        next_row_start = (row + 1) * columns
        for column in range(segments):
            inner = row_start + column
            outer = next_row_start + column
            faces.append((inner, outer, outer + 1, inner + 1))

    mesh = bpy.data.meshes.new(f"{key}Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.validate(clean_customdata=False)
    mesh.update()
    uv_layer = mesh.uv_layers.new(name="RingRadialUV")
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            vertex_index = mesh.loops[loop_index].vertex_index
            uv_layer.data[loop_index].uv = vertex_uvs[vertex_index]
    mesh.materials.append(material)
    obj = bpy.data.objects.new(key, mesh)
    bpy.context.collection.objects.link(obj)
    set_metadata(
        obj,
        "thin-ring-template",
        inner_radius=inner_radius,
        outer_radius=outer_radius,
        source_config=source,
        uv_mapping="u=normalized radial distance; v=0.5",
        plane="glTF XZ",
    )
    return obj


# ============ 人造卫星教学模板 ============
def bake_part_transform(obj: bpy.types.Object, material: bpy.types.Material) -> bpy.types.Object:
    """把临时零件的位置、朝向、尺度写入顶点，随后 join 后的根节点保持 identity。"""
    obj.data.materials.append(material)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return obj


def satellite_box(
    location_gltf: tuple[float, float, float],
    dimensions_gltf: tuple[float, float, float],
    material: bpy.types.Material,
) -> bpy.types.Object:
    """创建在 glTF 坐标中指定的低面方舱、太阳翼或遮阳层。"""
    if any(value <= 0.0 for value in dimensions_gltf):
        raise ValueError(f"非法方盒尺寸：{dimensions_gltf}")
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=gltf_to_blender(Vector(location_gltf)))
    obj = bpy.context.object
    # Blender (X, Y, Z) 的尺寸对应 glTF (X, Z, Y)。
    obj.scale = (
        dimensions_gltf[0] / 2.0,
        dimensions_gltf[2] / 2.0,
        dimensions_gltf[1] / 2.0,
    )
    return bake_part_transform(obj, material)


def satellite_cylinder(
    location_gltf: tuple[float, float, float],
    radius: float,
    depth: float,
    axis_gltf: str,
    material: bpy.types.Material,
    vertices: int = 12,
) -> bpy.types.Object:
    """创建沿 glTF X/Y/Z 轴的低面圆舱、天线杆或镜面六角片。"""
    if radius <= 0.0 or depth <= 0.0 or vertices < 3:
        raise ValueError("圆柱参数无效")
    rotation = {
        "Y": (0.0, 0.0, 0.0),
        # Blender 本地 Z 轴在 glTF 中是 +Y；下面两个旋转把它转向 +X / +Z。
        "X": (0.0, math.pi / 2.0, 0.0),
        "Z": (math.pi / 2.0, 0.0, 0.0),
    }.get(axis_gltf)
    if rotation is None:
        raise ValueError(f"未知 glTF 轴：{axis_gltf}")
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=gltf_to_blender(Vector(location_gltf)),
        rotation=rotation,
    )
    return bake_part_transform(bpy.context.object, material)


def satellite_cone(
    location_gltf: tuple[float, float, float],
    radius_base: float,
    radius_tip: float,
    depth: float,
    axis_gltf: str,
    material: bpy.types.Material,
    vertices: int = 12,
) -> bpy.types.Object:
    """创建浅锥形高增益天线或仪器罩，保持低面数。"""
    if min(radius_base, radius_tip, depth) < 0.0 or radius_base <= 0.0 or vertices < 3:
        raise ValueError("圆锥参数无效")
    rotation = {
        "Y": (0.0, 0.0, 0.0),
        "X": (0.0, math.pi / 2.0, 0.0),
        "Z": (math.pi / 2.0, 0.0, 0.0),
    }.get(axis_gltf)
    if rotation is None:
        raise ValueError(f"未知 glTF 轴：{axis_gltf}")
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=radius_base,
        radius2=radius_tip,
        depth=depth,
        location=gltf_to_blender(Vector(location_gltf)),
        rotation=rotation,
    )
    return bake_part_transform(bpy.context.object, material)


def artificial_mesh_radius_gltf(mesh: bpy.types.Mesh) -> float:
    """返回本地顶点在 glTF 坐标中的最大原点距离。"""
    if not mesh.vertices:
        raise RuntimeError(f"{mesh.name} 没有顶点")
    return max(blender_to_gltf(vertex.co).length for vertex in mesh.vertices)


def center_and_normalize_artificial_mesh(mesh: bpy.types.Mesh) -> float:
    """让教学模板几何居中，并以最大顶点距离 1.0 作为统一单位半径。"""
    positions = [blender_to_gltf(vertex.co) for vertex in mesh.vertices]
    if not positions:
        raise RuntimeError(f"{mesh.name} 没有顶点")
    minimum = Vector((
        min(point.x for point in positions),
        min(point.y for point in positions),
        min(point.z for point in positions),
    ))
    maximum = Vector((
        max(point.x for point in positions),
        max(point.y for point in positions),
        max(point.z for point in positions),
    ))
    center = (minimum + maximum) * 0.5
    radius = max((point - center).length for point in positions)
    if radius <= 0.0:
        raise RuntimeError(f"{mesh.name} 的归一化半径无效")
    for vertex, point in zip(mesh.vertices, positions):
        vertex.co = gltf_to_blender((point - center) / radius)
    mesh.update()
    return radius


def join_satellite_parts(key: str, parts: list[bpy.types.Object]) -> bpy.types.Object:
    """把多个带材质的临时零件合成单一 Mesh node，便于网页直接 clone geometry。"""
    if not parts:
        raise RuntimeError(f"{key} 没有零件")
    bpy.ops.object.select_all(action="DESELECT")
    for part in parts:
        part.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    obj = bpy.context.object
    if obj is None or obj.type != "MESH":
        raise RuntimeError(f"{key} 合并后不是 Mesh")
    obj.name = key
    obj.data.name = f"{key}Mesh"
    center_and_normalize_artificial_mesh(obj.data)
    if not obj.data.uv_layers:
        # 当前 Blender 原语都有 UV；保留这一分支使模板契约在未来替换零件时仍成立。
        add_spherical_uv(obj.data)
    return obj


def create_artificial_iss(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    """模块、横向桁架、八块阵列与散热器构成的 ISS 备用轮廓。"""
    metal = materials["SatelliteMetalPBR"]
    white = materials["SatelliteWhitePBR"]
    solar = materials["SolarPanelPBR"]
    parts = [
        satellite_cylinder((-0.10, 0.0, 0.0), 0.13, 0.78, "X", white),
        satellite_cylinder((0.36, 0.0, 0.0), 0.14, 0.22, "X", metal),
        satellite_cylinder((-0.49, 0.0, 0.0), 0.12, 0.22, "X", white),
        satellite_box((0.0, 0.16, 0.0), (1.12, 0.055, 0.085), metal),
        satellite_box((-0.10, 0.29, 0.0), (0.24, 0.025, 0.44), white),
    ]
    for x in (-0.42, -0.14, 0.14, 0.42):
        for z in (-0.52, 0.52):
            parts.append(satellite_box((x, 0.0, z), (0.16, 0.025, 0.44), solar))
    return parts


def create_artificial_tiangong(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    """天和核心舱加两侧实验舱和成对太阳翼的三舱教学轮廓。"""
    metal = materials["SatelliteMetalPBR"]
    white = materials["SatelliteWhitePBR"]
    solar = materials["SolarPanelPBR"]
    parts = [
        satellite_cylinder((-0.34, 0.0, 0.0), 0.135, 0.42, "X", white),
        satellite_cylinder((0.0, 0.0, 0.0), 0.16, 0.31, "X", metal),
        satellite_cylinder((0.34, 0.0, 0.0), 0.135, 0.42, "X", white),
        satellite_cylinder((0.0, 0.0, 0.0), 0.20, 0.11, "Z", metal),
        satellite_box((0.0, 0.16, 0.0), (0.98, 0.045, 0.075), metal),
    ]
    for x in (-0.34, 0.34):
        for z in (-0.46, 0.46):
            parts.append(satellite_box((x, 0.0, z), (0.28, 0.024, 0.40), solar))
    return parts


def create_artificial_hubble(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    """圆柱光学筒、开口遮光罩和双太阳翼构成的哈勃备用轮廓。"""
    metal = materials["SatelliteMetalPBR"]
    white = materials["SatelliteWhitePBR"]
    dark = materials["SatelliteDarkPBR"]
    solar = materials["SolarPanelPBR"]
    return [
        satellite_cylinder((0.0, 0.0, 0.0), 0.18, 0.84, "X", white),
        satellite_cylinder((0.46, 0.0, 0.0), 0.195, 0.06, "X", dark),
        satellite_cylinder((-0.45, 0.0, 0.0), 0.12, 0.11, "X", metal),
        satellite_box((0.0, 0.0, -0.53), (0.30, 0.024, 0.48), solar),
        satellite_box((0.0, 0.0, 0.53), (0.30, 0.024, 0.48), solar),
        satellite_cone((-0.53, 0.0, 0.0), 0.10, 0.025, 0.10, "X", metal),
    ]


def create_artificial_webb(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    """18 片金色六角镜、五层遮阳罩、总线与太阳翼构成的 Webb 备用轮廓。"""
    metal = materials["SatelliteMetalPBR"]
    dark = materials["SatelliteDarkPBR"]
    solar = materials["SolarPanelPBR"]
    gold = materials["GoldPBR"]
    sunshield = materials["SunshieldPBR"]
    parts: list[bpy.types.Object] = []
    mirror_rows = (
        (-0.30, (-0.18, 0.0, 0.18)),
        (-0.15, (-0.27, -0.09, 0.09, 0.27)),
        (0.0, (-0.27, -0.09, 0.09, 0.27)),
        (0.15, (-0.27, -0.09, 0.09, 0.27)),
        (0.30, (-0.18, 0.0, 0.18)),
    )
    for y, xs in mirror_rows:
        for x in xs:
            parts.append(satellite_cylinder((x, y, 0.22), 0.102, 0.018, "Z", gold, vertices=6))
    # 用五片不同尺寸的薄层表现多层遮阳罩，不把它伪称为工程可展开结构。
    for index in range(5):
        shrink = 1.0 - index * 0.055
        parts.append(satellite_box(
            (0.0, 0.0, -0.08 - index * 0.018),
            (1.48 * shrink, 0.88 * shrink, 0.012),
            sunshield,
        ))
    parts.extend((
        satellite_box((0.0, -0.28, -0.23), (0.34, 0.18, 0.18), metal),
        satellite_box((0.0, -0.62, -0.22), (0.25, 0.42, 0.018), solar),
        satellite_cylinder((0.0, 0.0, 0.31), 0.055, 0.032, "Z", dark, vertices=8),
        satellite_cylinder((0.0, 0.16, 0.33), 0.018, 0.25, "Y", metal, vertices=8),
        satellite_cylinder((-0.14, -0.08, 0.30), 0.014, 0.30, "X", metal, vertices=8),
        satellite_cylinder((0.14, -0.08, 0.30), 0.014, 0.30, "X", metal, vertices=8),
    ))
    return parts


def create_artificial_beidou(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    """带双翼、天线杆和金色载荷罩的通用北斗导航卫星教学轮廓。"""
    metal = materials["SatelliteMetalPBR"]
    white = materials["SatelliteWhitePBR"]
    solar = materials["SolarPanelPBR"]
    gold = materials["GoldPBR"]
    return [
        satellite_box((0.0, 0.0, 0.0), (0.34, 0.25, 0.28), metal),
        satellite_box((0.0, 0.15, 0.0), (0.22, 0.07, 0.18), white),
        satellite_box((-0.52, 0.0, 0.0), (0.52, 0.024, 0.28), solar),
        satellite_box((0.52, 0.0, 0.0), (0.52, 0.024, 0.28), solar),
        satellite_cylinder((0.0, 0.0, 0.21), 0.105, 0.05, "Z", gold, vertices=10),
        satellite_cylinder((0.0, 0.0, 0.32), 0.022, 0.22, "Z", metal, vertices=8),
        satellite_cone((0.0, 0.0, 0.45), 0.065, 0.018, 0.045, "Z", gold, vertices=10),
    ]


def create_artificial_gps(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    """紧凑总线、双太阳翼和信号天线组成的通用 GPS 教学轮廓。"""
    metal = materials["SatelliteMetalPBR"]
    white = materials["SatelliteWhitePBR"]
    solar = materials["SolarPanelPBR"]
    gold = materials["GoldPBR"]
    return [
        satellite_box((0.0, 0.0, 0.0), (0.32, 0.25, 0.30), white),
        satellite_box((0.0, -0.15, 0.0), (0.22, 0.07, 0.20), metal),
        satellite_box((-0.50, 0.0, 0.0), (0.50, 0.022, 0.24), solar),
        satellite_box((0.50, 0.0, 0.0), (0.50, 0.022, 0.24), solar),
        satellite_cylinder((0.0, 0.0, 0.20), 0.075, 0.045, "Z", gold, vertices=10),
        satellite_cylinder((0.0, 0.0, -0.21), 0.040, 0.12, "Z", metal, vertices=8),
    ]


def create_artificial_comms(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    """带大口径高增益天线和双太阳翼的通用通信卫星教学轮廓。"""
    metal = materials["SatelliteMetalPBR"]
    white = materials["SatelliteWhitePBR"]
    solar = materials["SolarPanelPBR"]
    gold = materials["GoldPBR"]
    return [
        satellite_box((0.0, 0.0, 0.0), (0.38, 0.30, 0.30), metal),
        satellite_box((0.0, -0.18, 0.0), (0.25, 0.07, 0.20), white),
        satellite_box((-0.54, 0.0, 0.0), (0.52, 0.024, 0.30), solar),
        satellite_box((0.54, 0.0, 0.0), (0.52, 0.024, 0.30), solar),
        satellite_cone((0.0, 0.0, 0.27), 0.26, 0.045, 0.10, "Z", white, vertices=16),
        satellite_cylinder((0.0, 0.0, 0.33), 0.040, 0.05, "Z", gold, vertices=10),
        satellite_cylinder((0.0, 0.0, -0.23), 0.024, 0.18, "Z", metal, vertices=8),
    ]


def create_artificial_weather(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    """五片太阳翼、仪器圆筒与总线构成的通用静止气象卫星教学轮廓。"""
    metal = materials["SatelliteMetalPBR"]
    white = materials["SatelliteWhitePBR"]
    dark = materials["SatelliteDarkPBR"]
    solar = materials["SolarPanelPBR"]
    gold = materials["GoldPBR"]
    parts = [
        satellite_box((0.0, 0.0, 0.0), (0.36, 0.32, 0.30), white),
        satellite_box((0.0, -0.19, 0.0), (0.26, 0.07, 0.22), metal),
        satellite_cylinder((0.0, 0.0, 0.24), 0.15, 0.10, "Z", dark, vertices=12),
        satellite_cylinder((0.0, 0.0, 0.30), 0.10, 0.035, "Z", gold, vertices=10),
    ]
    for x in (-0.62, -0.43, -0.24, 0.24, 0.43):
        parts.append(satellite_box((x, 0.0, 0.0), (0.17, 0.024, 0.32), solar))
    return parts


def create_artificial_templates(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    builders = {
        "artificialISS": create_artificial_iss,
        "artificialTiangong": create_artificial_tiangong,
        "artificialHubble": create_artificial_hubble,
        "artificialWebb": create_artificial_webb,
        "artificialBeidou": create_artificial_beidou,
        "artificialGPS": create_artificial_gps,
        "artificialComms": create_artificial_comms,
        "artificialWeather": create_artificial_weather,
    }
    if set(builders) != set(ARTIFICIAL_TEMPLATE_SPECS):
        raise RuntimeError("人造卫星 builder 与节点契约不一致")

    result: list[bpy.types.Object] = []
    for key in ARTIFICIAL_TEMPLATE_NAMES:
        obj = join_satellite_parts(key, builders[key](materials))
        spec = ARTIFICIAL_TEMPLATE_SPECS[key]
        set_metadata(
            obj,
            spec["kind"],
            satellites_data_indices=list(spec["satellites_data"]),
            unit_radius=1.0,
            source_summary=spec["source"],
            component_materials=", ".join(material.name for material in obj.data.materials),
            scientific_boundary=(
                "teaching silhouette for in-page scale and recognition; "
                "not official CAD, engineering geometry, or a specific flight unit"
            ),
        )
        result.append(obj)
    return result


# ============ 导出与验证 ============
def mesh_triangles(mesh: bpy.types.Mesh) -> int:
    return sum(max(0, len(polygon.vertices) - 2) for polygon in mesh.polygons)


def validate_scene(objects: list[bpy.types.Object]) -> dict[str, object]:
    expected = {
        "unitSphere", "icySphere", "jupiterBody", "saturnBody", "haumeaBody",
        *IRREGULAR_MOONS.keys(),
        "asteroidRock0", "asteroidRock1", "asteroidRock2", "asteroidRock3",
        *(spec[0] for spec in RING_SPECS),
        *ARTIFICIAL_TEMPLATE_NAMES,
    }
    actual = {obj.name for obj in objects}
    if actual != expected:
        raise RuntimeError(f"catalog 节点不完整：missing={sorted(expected - actual)} extra={sorted(actual - expected)}")
    for obj in objects:
        if obj.type != "MESH" or not obj.data.uv_layers:
            raise RuntimeError(f"{obj.name} 缺少 mesh 或 UV")
        if obj.location.length > 1e-7 or any(abs(value) > 1e-7 for value in obj.rotation_euler):
            raise RuntimeError(f"{obj.name} 的节点位置或旋转没有烘焙")
        if any(abs(value - 1.0) > 1e-7 for value in obj.scale):
            raise RuntimeError(f"{obj.name} 的节点缩放没有烘焙：{tuple(obj.scale)}")
    artificial_radius: dict[str, float] = {}
    for key in ARTIFICIAL_TEMPLATE_NAMES:
        obj = next(obj for obj in objects if obj.name == key)
        radius = artificial_mesh_radius_gltf(obj.data)
        if abs(radius - 1.0) > 1e-6:
            raise RuntimeError(f"{key} 不是单位半径：{radius}")
        material_names = {material.name for material in obj.data.materials}
        if not {"SatelliteMetalPBR", "SolarPanelPBR"}.issubset(material_names):
            raise RuntimeError(f"{key} 缺少金属或太阳能板材质组：{sorted(material_names)}")
        artificial_radius[key] = radius
    webb_materials = {
        material.name
        for obj in objects
        if obj.name == "artificialWebb"
        for material in obj.data.materials
    }
    if not {"GoldPBR", "SunshieldPBR"}.issubset(webb_materials):
        raise RuntimeError("artificialWebb 缺少金镜或遮阳罩材质组")
    meshes = {obj.data.as_pointer(): obj.data for obj in objects}
    if any(node.type == "TEX_IMAGE" for material in bpy.data.materials for node in material.node_tree.nodes):
        raise RuntimeError("catalog 不应嵌入或引用贴图")
    return {
        "nodes": len(objects),
        "unique_meshes": len(meshes),
        "unique_triangles": sum(mesh_triangles(mesh) for mesh in meshes.values()),
        "artificial_unit_radius": artificial_radius,
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


def validate_export(expected_names: set[str]) -> dict[str, object]:
    data = OUTPUT.read_bytes()
    magic, version, declared_size = struct.unpack_from("<4sII", data, 0)
    json_length, json_magic = struct.unpack_from("<I4s", data, 12)
    if magic != b"glTF" or version != 2 or declared_size != len(data) or json_magic != b"JSON":
        raise RuntimeError("GLB header 无效")
    document = json.loads(data[20:20 + json_length])
    nodes = document.get("nodes", [])
    node_names = {node.get("name") for node in nodes}
    if node_names != expected_names:
        raise RuntimeError(f"GLB node 名称不匹配：{sorted(node_names)}")
    for node in nodes:
        if any(key in node for key in ("translation", "rotation", "scale")):
            raise RuntimeError(f"{node['name']} 的 GLB 节点变换没有烘焙")
    if document.get("images") or document.get("textures"):
        raise RuntimeError("GLB 不应包含图片或纹理引用")
    material_names = set()
    for material in document.get("materials", []):
        material_name = material.get("name")
        material_names.add(material_name)
        pbr = material.get("pbrMetallicRoughness")
        if pbr is None:
            raise RuntimeError(f"材质缺少 metallic-roughness PBR：{material_name}")
        metallic = pbr.get("metallicFactor", 1.0)
        if not 0.0 <= metallic <= 1.0:
            raise RuntimeError(f"材质 metallicFactor 无效：{material_name}={metallic}")
        if material_name in NATURAL_MATERIAL_NAMES and metallic != 0.0:
            raise RuntimeError(f"自然天体默认材质应是非金属 PBR：{material_name}")
    required_artificial_materials = {
        "SatelliteMetalPBR",
        "SatelliteWhitePBR",
        "SatelliteDarkPBR",
        "SolarPanelPBR",
        "GoldPBR",
        "SunshieldPBR",
    }
    missing_artificial_materials = required_artificial_materials - material_names
    if missing_artificial_materials:
        raise RuntimeError(f"GLB 缺少人造卫星材质：{sorted(missing_artificial_materials)}")
    if len(data) >= MAX_BYTES:
        raise RuntimeError(f"GLB 太大：{len(data)} bytes，目标 < {MAX_BYTES}")
    return {
        "glb_bytes": len(data),
        "glb_nodes": len(nodes),
        "glb_meshes": len(document.get("meshes", [])),
        "glb_materials": len(document.get("materials", [])),
        "embedded_images": len(document.get("images", [])),
    }


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    clear_factory_scene()

    surface = make_pbr_material("SurfacePBR", (0.70, 0.70, 0.70), roughness=0.68)
    rock = make_pbr_material("RockPBR", (0.38, 0.34, 0.29), roughness=0.84)
    saturn_ring = make_pbr_material("SaturnRingPBR", (0.82, 0.75, 0.62), roughness=0.82, alpha=0.85)
    uranus_ring = make_pbr_material("UranusRingPBR", (0.50, 0.78, 0.84), roughness=0.86, alpha=0.48)
    uranus_inner = make_pbr_material("UranusInnerRingPBR", (0.72, 0.86, 0.90), roughness=0.86, alpha=0.32)
    rhea_dust = make_pbr_material("RheaDustPBR", (0.72, 0.82, 0.90), roughness=0.90, alpha=0.28)
    rhea_outer = make_pbr_material("RheaOuterDustPBR", (0.55, 0.68, 0.78), roughness=0.90, alpha=0.12)
    satellite_metal = make_pbr_material(
        "SatelliteMetalPBR", (0.44, 0.51, 0.60), roughness=0.32, metallic=0.78
    )
    satellite_white = make_pbr_material(
        "SatelliteWhitePBR", (0.78, 0.80, 0.83), roughness=0.52, metallic=0.12
    )
    satellite_dark = make_pbr_material(
        "SatelliteDarkPBR", (0.035, 0.045, 0.060), roughness=0.38, metallic=0.28
    )
    solar_panel = make_pbr_material(
        "SolarPanelPBR", (0.015, 0.055, 0.23), roughness=0.34, metallic=0.46
    )
    gold = make_pbr_material(
        "GoldPBR", (0.95, 0.53, 0.08), roughness=0.29, metallic=0.84
    )
    sunshield = make_pbr_material(
        "SunshieldPBR", (0.56, 0.25, 0.19), roughness=0.42, metallic=0.30
    )
    materials = {
        "SurfacePBR": surface,
        "RockPBR": rock,
        "SaturnRingPBR": saturn_ring,
        "UranusRingPBR": uranus_ring,
        "UranusInnerRingPBR": uranus_inner,
        "RheaDustPBR": rhea_dust,
        "RheaOuterDustPBR": rhea_outer,
        "SatelliteMetalPBR": satellite_metal,
        "SatelliteWhitePBR": satellite_white,
        "SatelliteDarkPBR": satellite_dark,
        "SolarPanelPBR": solar_panel,
        "GoldPBR": gold,
        "SunshieldPBR": sunshield,
    }

    objects: list[bpy.types.Object] = []
    objects.extend(create_unit_and_icy(surface))
    for key, axes in BODY_AXES.items():
        kind = "oblate-gas-giant" if key in {"jupiterBody", "saturnBody"} else "teaching-triaxial-dwarf-planet"
        objects.append(create_uv_sphere(key, axes, surface, kind))
    for key, spec in IRREGULAR_MOONS.items():
        objects.append(create_irregular_moon(key, spec["source"], spec["seed"], spec["axes"], rock))
    for index, (seed, axes) in enumerate(((1.2, (1.12, 0.84, 0.93)), (2.8, (0.93, 1.10, 0.81)), (4.4, (1.05, 0.78, 1.16)), (6.1, (0.86, 0.96, 1.05)))):
        objects.append(create_asteroid(f"asteroidRock{index}", seed, axes, rock))
    for key, inner, outer, segments, bands, material_name, source in RING_SPECS:
        objects.append(create_ring(key, inner, outer, segments, bands, materials[material_name], source))
    objects.extend(create_artificial_templates(materials))

    report = validate_scene(objects)
    export_glb(objects)
    report.update(validate_export({obj.name for obj in objects}))
    report["output"] = str(OUTPUT.relative_to(ROOT))
    print(json.dumps(report, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
