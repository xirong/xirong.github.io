"""Blender 5.2: 制作太阳剖面、等离子流场与烘焙纹理。
运行：Blender --background --factory-startup --python source/build-sun.py
模型的太阳半径为 10；内部是可视化示意，不是真实观测。
"""
import bpy, math, random, json, sys
from pathlib import Path
from mathutils import Vector, noise
from math import sin, cos, pi
random.seed(628)
ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
SOURCE = ROOT / 'source'
ASSETS.mkdir(exist_ok=True)
# 仅用于独立 --factory-startup 进程，不接触打开的用户文档。
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 8
scene.cycles.device = 'CPU'
scene.render.resolution_x = scene.render.resolution_y = 768
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.view_settings.view_transform = 'Standard'
scene.world.color = (0,0,0)
scene.world.use_nodes=True
scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(0,0,0,1)

# ============ 真实观测表面与 Blender 烘焙纹理 ============
def image_mat(name, image, strength=1):
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    nodes=mat.node_tree.nodes; links=mat.node_tree.links
    bs=nodes.get('Principled BSDF')
    tex=nodes.new('ShaderNodeTexImage'); tex.image=image
    links.new(tex.outputs['Color'], bs.inputs['Base Color'])
    links.new(tex.outputs['Color'], bs.inputs['Emission Color'])
    bs.inputs['Emission Strength'].default_value=strength
    bs.inputs['Roughness'].default_value=.85
    return mat

# 烘焙发光颜色，使 GLB 中保留 Blender 的多尺度等离子纹理。
def bake_plasma(name, colors, scale, distortion):
    path=ASSETS/(name+'.png')
    if path.exists() and '--rebake' not in sys.argv: return image_mat(name,bpy.data.images.load(str(path),check_existing=True))
    mat=bpy.data.materials.new(name+'_procedural'); mat.use_nodes=True
    n=mat.node_tree.nodes; l=mat.node_tree.links; n.clear()
    out=n.new('ShaderNodeOutputMaterial'); em=n.new('ShaderNodeEmission')
    coord=n.new('ShaderNodeTexCoord'); tex=n.new('ShaderNodeTexNoise')
    tex.inputs['Scale'].default_value=scale; tex.inputs['Detail'].default_value=6
    tex.inputs['Roughness'].default_value=.72; tex.inputs['Distortion'].default_value=distortion
    l.new(coord.outputs['Generated'],tex.inputs['Vector'])
    ramp=n.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements.remove(ramp.color_ramp.elements[1])
    for i,(pos,color) in enumerate(colors):
        e=ramp.color_ramp.elements[0] if i==0 else ramp.color_ramp.elements.new(pos)
        e.position=pos; e.color=(*color,1)
    l.new(tex.outputs['Fac'],ramp.inputs['Fac']); l.new(ramp.outputs['Color'],em.inputs[0]); l.new(em.outputs[0],out.inputs[0])
    bpy.ops.mesh.primitive_plane_add(size=2)
    plane=bpy.context.object; plane.data.materials.append(mat)
    img=bpy.data.images.new(name,768,768,alpha=False)
    target=n.new('ShaderNodeTexImage'); target.image=img; n.active=target
    scene.render.bake.use_clear=True
    bpy.ops.object.bake(type='EMIT')
    img.filepath_raw=str(path); img.file_format='PNG'; img.save()
    bpy.data.objects.remove(plane,do_unlink=True)
    return image_mat(name,img)

conv=bake_plasma('convection-plasma',[(0,(.002,0,0)),(.42,(.008,.0003,0)),(.54,(.12,.003,0)),(.61,(.8,.075,.002)),(.69,(1,.45,.04)),(.78,(1,.9,.4)),(1,(1,.96,.72))],9,3.2)
rad=bake_plasma('radiative-plasma',[(0,(.003,0,0)),(.38,(.03,.001,0)),(.51,(.18,.017,.0005)),(.62,(.8,.17,.01)),(.72,(1,.7,.14)),(.86,(1,.97,.68)),(1,(1,1,.8))],6,5)
core=bake_plasma('core-plasma',[(0,(.015,.0005,0)),(.4,(.18,.03,.001)),(.54,(.75,.24,.015)),(.65,(1,.76,.2)),(.78,(1,.97,.78)),(1,(1,1,.96))],8,4)
surface=bpy.data.images.load(str(ROOT.parent/'assets/map-304.jpg'),check_existing=True)
surf=image_mat('photosphere_observed_SDO304',surface)
# 对照外观使用已存档的 SDO AIA 304 Å 伪彩图，正文明确标记。

def simple_mat(name,col,strength=1):
    m=bpy.data.materials.new(name); m.use_nodes=True
    s=m.node_tree.nodes.get('Principled BSDF'); s.inputs['Base Color'].default_value=(*col,1)
    s.inputs['Emission Color'].default_value=(*col,1); s.inputs['Emission Strength'].default_value=strength
    s.inputs['Roughness'].default_value=.65
    return m
hot=simple_mat('hot_flow', (1,.37,.025)); warm=simple_mat('cool_flow',(.43,.028,.002)); white=simple_mat('fusion_light',(1,.88,.5))

# ============ 有厚度的三维剖面 ============
def make_mesh(name, verts, faces, uv, mat, group=None):
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
    obj=bpy.data.objects.new(name,mesh); scene.collection.objects.link(obj); mesh.materials.append(mat)
    uvl=mesh.uv_layers.new(name='UVMap')
    for p in mesh.polygons:
        p.use_smooth=True
        for li in p.loop_indices: uvl.data[li].uv=uv[mesh.loops[li].vertex_index]
    if group: obj.parent=group
    return obj

def group(name):
    g=bpy.data.objects.new(name,None); scene.collection.objects.link(g); return g

# 打开前方 110 度楔形，完整三层保留球面、内侧和两块带起伏的径向切面。
start=math.radians(-35); end=math.radians(215)

def sphere_patch(name,r,a0,a1,mat,parent,amp=0,nu=128,nv=64):
    vs=[]; uv=[]; fs=[]
    for j in range(nv+1):
        th=.0001+(pi-.0002)*j/nv
        for i in range(nu+1):
            a=a0+(a1-a0)*i/nu; v=Vector((sin(th)*cos(a),sin(th)*sin(a),cos(th)))
            rr=r+amp*noise.noise_vector(v*9)[0]
            vs.append(tuple(v*rr)); uv.append(((a+pi)/(2*pi),1-j/nv))
    for j in range(nv):
        for i in range(nu):
            k=j*(nu+1)+i; fs.append((k,k+1,k+nu+2,k+nu+1))
    return make_mesh(name,vs,fs,uv,mat,parent)

def cut_face(name,r0,r1,az,mat,parent,amp):
    vs=[]; uv=[]; fs=[]; nr=24; nt=96
    normal=Vector((-sin(az),cos(az),0))
    for j in range(nt+1):
        th=pi*j/nt
        for i in range(nr+1):
            f=i/nr; r=r0+(r1-r0)*f
            p=Vector((r*sin(th)*cos(az),r*sin(th)*sin(az),r*cos(th)))
            p+=normal*(amp*sin(pi*f)*sin(th)*noise.noise_vector(p*.8)[0])
            vs.append(tuple(p)); uv.append((r*sin(th)/10,r*cos(th)/20+.5))
    for j in range(nt):
        for i in range(nr):
            k=j*(nr+1)+i; fs.append((k,k+1,k+nr+2,k+nr+1))
    return make_mesh(name,vs,fs,uv,mat,parent)

for name,r0,r1,mat,amp in [('convection',7,9.96,conv,.17),('radiative',2.5,7,rad,.1)]:
    g=group(name)
    sphere_patch(name+'_outer',r1,start,end,mat,g,amp*.1)
    # 内边界复用更内一层的外表，避免两个共面的发光表面互相覆盖。
    cut_face(name+'_cut_right',r0,r1,start,mat,g,amp)
    cut_face(name+'_cut_left',r0,r1,end,mat,g,amp)
photo=group('photosphere')
sphere_patch('observed_surface',10,start,end,surf,photo,.008)
cap=group('opening_cap')
sphere_patch('observed_surface_cap',10,end,start+2*pi,surf,cap,.008,64,64)
cor=group('core')
sphere_patch('core_surface',2.5,0,2*pi,core,cor,.055,96,64)

# ============ 等离子流线，Blender 建模并导出真实网格 ============
def tube(name,pts,r,mat,parent,sides=6):
    vs=[];uv=[];fs=[]; count=len(pts)
    for i,p in enumerate(pts):
        p=Vector(p); d=Vector(pts[min(i+1,count-1)])-Vector(pts[max(0,i-1)])
        d.normalize(); axis=d.cross(Vector((0,0,1)))
        if axis.length<.01: axis=d.cross(Vector((0,1,0)))
        axis.normalize(); other=d.cross(axis).normalized()
        taper=.38+.62*sin(pi*i/(count-1))**.5
        for j in range(sides):
            a=j*2*pi/sides
            vs.append(tuple(p+(cos(a)*axis+sin(a)*other)*r*taper)); uv.append((i/(count-1)*2,j/sides))
    for i in range(count-1):
        for j in range(sides):
            k=i*sides+j; z=i*sides+(j+1)%sides
            fs.append((k,z,z+sides,k+sides))
    return make_mesh(name,vs,fs,uv,mat,parent)

# 截面内的大小不一对流胞，有上下翻滚的空间结构。
flow=group('convection_flows')
for side,az in enumerate([start-.028,end+.028]):
    for k in range(18):
        theta=.12+(pi-.24)*(k+.5)/18
        for strand in range(3):
            pts=[]
            for j in range(65):
                t=2*pi*j/64; rr=8.45+1.27*cos(t)
                th=theta+.051*sin(t)+.014*sin(3*t+k+strand)
                aa=az+.014*strand+.03*sin(3*t+k)+.012*sin(11*t+strand)
                p=Vector((rr*sin(th)*cos(aa),rr*sin(th)*sin(aa),rr*cos(th)))
                pts.append(tuple(p))
            tube(f'convection_roll_{side}_{k}_{strand}',pts,.007+strand*.005,conv,flow)
# 开口中可穿行的流场。只有靠近该层时网页才让它显现。
volume=group('convection_volume')
for k in range(24):
    az=math.radians(-137)+k%8*math.radians(13)
    theta=.68+(k//8)*.66
    pts=[]
    for j in range(73):
        t=2*pi*j/72; rr=8.48+1.15*cos(t)
        th=theta+.1*sin(t)+.025*sin(4*t+k); aa=az+.07*sin(3*t+k)
        pts.append((rr*sin(th)*cos(aa),rr*sin(th)*sin(aa),rr*cos(th)))
    tube(f'volume_roll_{k}',pts,.018,conv,volume,6)

# 辐射能量的多次吸收、再发射，表现为折返的三维路径。
rays=group('radiative_paths')
for k in range(16):
    az=random.uniform(-2.2,-.8); theta=random.uniform(.4,2.6)
    p=Vector((4.8*sin(theta)*cos(az),4.8*sin(theta)*sin(az),4.8*cos(theta))); pts=[tuple(p)]
    for j in range(22):
        v=Vector((random.uniform(-1,1),random.uniform(-1,1),random.uniform(-1,1))).normalized()
        cand=p+v*.35
        if 2.7<cand.length<6.7: p=cand
        pts.append(tuple(p))
    tube(f'radiation_walk_{k}',pts,.0025,white,rays,5)

# 核心细丝与磁环，用于感知球体的体积与近远。
fils=group('core_filaments')
for k in range(22):
    q=Vector((random.uniform(-1,1),random.uniform(-1,1),random.uniform(-1,1))).to_track_quat('Z','Y')
    pts=[]
    for j in range(97):
        t=2*pi*j/96; rr=2.52+.08*sin(t*5+k)
        pts.append(tuple(q@Vector((rr*cos(t),rr*sin(t),.11*sin(t*3+k)))))
    tube(f'core_filament_{k}',pts,.014,hot,fils)
loops=group('coronal_loops')
for k in range(16):
    az=random.uniform(start,end); th=random.uniform(.45,2.6)
    direction=Vector((sin(th)*cos(az),sin(th)*sin(az),cos(th)))
    tangent=direction.cross(Vector((0,0,1))).normalized()
    center=direction*9.8; pts=[]; extent=random.uniform(.7,1.7)
    for j in range(65):
        t=pi*j/64
        pts.append(tuple(center+tangent*cos(t)*extent+direction*sin(t)*extent*1.3))
    tube(f'coronal_loop_{k}',pts,.025,hot,loops)

# ============ 导出网页资产，保留可编辑源工程 ============
# 合并同组流线，降低网页绘制次数，保留分层对象。
for g in (flow,volume,rays,fils,loops):
    bpy.ops.object.select_all(action='DESELECT')
    children=[o for o in g.children if o.type=='MESH']
    for o in children: o.select_set(True)
    bpy.context.view_layer.objects.active=children[0]
    bpy.ops.object.join()
    bpy.context.object.name=g.name+'_mesh'
for obj in scene.objects: obj.select_set(obj.type=='MESH' or obj.type=='EMPTY')
bpy.ops.export_scene.gltf(filepath=str(ASSETS/'sun-interior.glb'),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False,export_extras=True,export_image_format='AUTO')
# 生成一张独立的 Blender 实际渲染，网页仍然是实时模型。

for g in (cap,volume,rays):
    g.hide_render=True
    for o in g.children_recursive: o.hide_render=True
cam_data=bpy.data.cameras.new('PreviewCamera'); camera=bpy.data.objects.new('PreviewCamera',cam_data); scene.collection.objects.link(camera)
camera.location=(16,-32,16); direction=Vector((0,0,0))-camera.location; camera.rotation_euler=direction.to_track_quat('-Z','Y').to_euler(); camera.data.lens=44; scene.camera=camera
scene.render.resolution_x=1600; scene.render.resolution_y=1200; scene.cycles.samples=24
scene.render.film_transparent=False
# Blender 5.2 的合成器使用独立节点组。
ng=bpy.data.node_groups.new('SolarGlow','CompositorNodeTree')
ng.interface.new_socket(name='Image',in_out='OUTPUT',socket_type='NodeSocketColor')
inp=ng.nodes.new('CompositorNodeRLayers'); glare=ng.nodes.new('CompositorNodeGlare'); glare.inputs['Type'].default_value='Fog Glow'; glare.inputs['Quality'].default_value='High'; glare.inputs['Threshold'].default_value=.7; glare.inputs['Strength'].default_value=.4
out=ng.nodes.new('NodeGroupOutput'); ng.links.new(inp.outputs['Image'],glare.inputs['Image']); ng.links.new(glare.outputs['Image'],out.inputs['Image']); scene.compositing_node_group=ng
scene.render.filepath=str(ASSETS/'blender-cutaway.png')
# 打包外部贴图；保存后任何机器都能继续编辑。
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'sun-interior.blend'),compress=True)
bpy.ops.render.render(write_still=True)
manifest={'blender':bpy.app.version_string,'radius':10,'coreRadius':2.5,'radiativeRadius':7,'objects':len([o for o in scene.objects if o.type=='MESH']),'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in scene.objects if o.type=='MESH'),'seed':628,'note':'内部是科学模型；纹理由 Blender 烘焙。外表使用 SDO AIA 304 Å 观测伪彩图。'}
(ASSETS/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(manifest,ensure_ascii=False))
