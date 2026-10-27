"""用 Blender 制作地球与木星内部模型，纹理烘焙后导出 GLB。
Blender --background --factory-startup --python build-planet-interiors.py -- earth
只操作本次新建的独立场景；不读取或修改用户打开的 Blender 文档。
"""
import bpy, json, math, random, sys
from pathlib import Path
from math import sin, cos, pi
from mathutils import Vector, noise

BODY = sys.argv[sys.argv.index('--') + 1]
assert BODY in ('earth', 'jupiter')
SPACE = Path(__file__).resolve().parents[2]
OUT = SPACE / (BODY + '-3d') / 'assets/interior'
SOURCE = SPACE / (BODY + '-3d') / 'interior-source'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE.mkdir(parents=True, exist_ok=True)
random.seed(20261027)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 8
scene.cycles.device = 'CPU'
scene.view_settings.view_transform = 'Standard'
scene.world.use_nodes = True
scene.world.node_tree.nodes.get('Background').inputs[0].default_value = (.025, .035, .055, 1)
scene.world.node_tree.nodes.get('Background').inputs[1].default_value = .3
scene.render.image_settings.file_format = 'PNG'

# ============ 多尺度纹理与真实表面 ============
def image_material(name, color, normal=None, metal=0, rough=.65, emission=0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    bs = n.get('Principled BSDF')
    t = n.new('ShaderNodeTexImage'); t.image = color
    l.new(t.outputs['Color'], bs.inputs['Base Color'])
    l.new(t.outputs['Color'], bs.inputs['Emission Color'])
    bs.inputs['Emission Strength'].default_value = emission
    bs.inputs['Metallic'].default_value = metal
    bs.inputs['Roughness'].default_value = rough
    if normal:
        t = n.new('ShaderNodeTexImage'); t.image = normal; normal.colorspace_settings.name = 'Non-Color'
        nm = n.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = .75
        l.new(t.outputs['Color'], nm.inputs['Color']); l.new(nm.outputs[0], bs.inputs['Normal'])
    return m

def bake(name, palette, style, metal=0, rough=.75, emission=0):
    color_path, normal_path = OUT/(name+'.jpg'), OUT/(name+'-normal.jpg')
    if color_path.exists() and normal_path.exists() and '--rebake' not in sys.argv:
        return image_material(name, bpy.data.images.load(str(color_path)), bpy.data.images.load(str(normal_path)), metal, rough, emission)
    m = bpy.data.materials.new(name+'_baking'); m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links; n.clear()
    out = n.new('ShaderNodeOutputMaterial'); em = n.new('ShaderNodeEmission'); bs = n.new('ShaderNodeBsdfPrincipled')
    coord = n.new('ShaderNodeTexCoord'); tex = n.new('ShaderNodeTexNoise')
    tex.inputs['Scale'].default_value = 7 if style == 'fluid' else 26
    tex.inputs['Detail'].default_value = 7; tex.inputs['Roughness'].default_value = .75
    tex.inputs['Distortion'].default_value = 5 if style == 'fluid' else .35
    l.new(coord.outputs['Generated'], tex.inputs['Vector'])
    fine = n.new('ShaderNodeTexNoise'); fine.inputs['Scale'].default_value = 155
    fine.inputs['Detail'].default_value = 3; l.new(coord.outputs['Generated'], fine.inputs['Vector'])
    mix = n.new('ShaderNodeMixRGB'); mix.blend_type = 'MULTIPLY'; mix.inputs[0].default_value = .35
    l.new(tex.outputs['Fac'], mix.inputs[1]); l.new(fine.outputs['Fac'], mix.inputs[2])
    ramp = n.new('ShaderNodeValToRGB'); ramp.color_ramp.elements.remove(ramp.color_ramp.elements[1])
    for i, (at, col) in enumerate(palette):
        e = ramp.color_ramp.elements[0] if i == 0 else ramp.color_ramp.elements.new(at)
        e.position = at; e.color = (*col, 1)
    l.new(mix.outputs[0], ramp.inputs[0]); l.new(ramp.outputs[0], em.inputs[0]); l.new(em.outputs[0], out.inputs[0])
    bump = n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = .55
    bump.inputs['Distance'].default_value = .12 if style == 'rock' else .045
    l.new(mix.outputs[0], bump.inputs['Height']); l.new(bump.outputs[0], bs.inputs['Normal'])
    bpy.ops.mesh.primitive_plane_add(size=2); plane = bpy.context.object; plane.data.materials.append(m)
    color = bpy.data.images.new(name+'_color', 1024, 1024, alpha=False)
    target = n.new('ShaderNodeTexImage'); target.image = color; n.active = target
    bpy.ops.object.bake(type='EMIT'); color.filepath_raw = str(color_path); color.file_format = 'JPEG'; color.save()
    normal = bpy.data.images.new(name+'_normal', 1024, 1024, alpha=False); normal.colorspace_settings.name = 'Non-Color'
    target.image = normal; n.active = target; l.new(bs.outputs[0], out.inputs[0])
    bpy.ops.object.bake(type='NORMAL'); normal.filepath_raw = str(normal_path); normal.file_format = 'JPEG'; normal.save()
    bpy.data.objects.remove(plane, do_unlink=True)
    return image_material(name, color, normal, metal, rough, emission)

if BODY == 'earth':
    materials = {
      'crust': bake('crust-rock', [(0,(.018,.022,.018)),(.3,(.08,.075,.055)),(.47,(.22,.19,.14)),(.65,(.48,.44,.32)),(1,(.8,.76,.61))], 'rock'),
      'upper_mantle': bake('mantle-grain', [(0,(.022,.018,.011)),(.3,(.12,.08,.035)),(.48,(.29,.16,.055)),(.68,(.47,.34,.11)),(1,(.66,.55,.27))], 'rock', emission=.08),
      'lower_mantle': bake('deep-mantle', [(0,(.018,.009,.006)),(.3,(.09,.027,.015)),(.47,(.27,.075,.025)),(.68,(.55,.23,.06)),(1,(.75,.42,.12))], 'rock', emission=.18),
      'outer_core': bake('liquid-iron', [(0,(.035,.006,.001)),(.27,(.17,.025,.003)),(.46,(.5,.13,.016)),(.64,(.85,.37,.055)),(1,(1,.67,.22))], 'fluid', metal=.35, rough=.3, emission=.55),
      'inner_core': bake('solid-iron', [(0,(.07,.045,.025)),(.3,(.25,.15,.055)),(.46,(.55,.36,.12)),(.67,(.82,.62,.3)),(1,(.96,.84,.55))], 'rock', metal=.55, rough=.38, emission=.28),
    }
    layers = [('crust',9.945,10),('upper_mantle',8.96,9.945),('lower_mantle',5.46,8.96),('outer_core',1.915,5.46)]
    flatten = 1
else:
    materials = {
      'atmosphere': bake('dense-clouds', [(0,(.025,.021,.022)),(.3,(.12,.095,.075)),(.46,(.36,.28,.18)),(.67,(.66,.55,.37)),(1,(.87,.81,.65))], 'fluid', rough=.9, emission=.12),
      'liquid': bake('molecular-hydrogen', [(0,(.025,.018,.011)),(.3,(.12,.07,.035)),(.47,(.38,.22,.095)),(.66,(.69,.47,.24)),(1,(.91,.76,.47))], 'fluid', metal=.1, rough=.4, emission=.28),
      'metallic': bake('metallic-hydrogen', [(0,(.018,.025,.055)),(.3,(.075,.12,.21)),(.47,(.22,.32,.47)),(.64,(.48,.58,.68)),(1,(.81,.84,.77))], 'fluid', metal=.55, rough=.3, emission=.28),
      'core': bake('mixed-core', [(0,(.023,.014,.035)),(.3,(.12,.05,.07)),(.46,(.35,.16,.11)),(.63,(.59,.39,.23)),(1,(.86,.69,.43))], 'fluid', metal=.25, rough=.55, emission=.35),
    }
    layers = [('atmosphere',9.5,10),('liquid',8,9.5),('metallic',4,8)]
    flatten = .935

surface_path = SPACE/(BODY+'-3d')/'assets/textures'/('day-4k.jpg' if BODY=='earth' else 'jupiter-4k.jpg')
surface = bpy.data.images.load(str(surface_path)); surface.scale(2048,1024)
surface_mat = image_material('observed_surface',surface,rough=.75,emission=.12)

# ============ 三维壳层与有起伏的切面 ============
def group(name, parent=None):
    g=bpy.data.objects.new(name,None);scene.collection.objects.link(g);g.parent=parent;return g
root=group(BODY+'_interior');root.scale.z=flatten
start,end=math.radians(-35),math.radians(215)

def mesh(name,vs,fs,uv,mat,parent):
    data=bpy.data.meshes.new(name);data.from_pydata(vs,[],fs);data.update()
    obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.parent=parent;data.materials.append(mat)
    tex=data.uv_layers.new(name='UVMap')
    for p in data.polygons:
        p.use_smooth=True
        for k in p.loop_indices:tex.data[k].uv=uv[data.loops[k].vertex_index]
    return obj

def sphere(name,r,mat,parent,a0=start,a1=end,amp=0,nu=144,nv=96):
    vs=[];uv=[];fs=[]
    for j in range(nv+1):
        th=.0001+(pi-.0002)*j/nv
        for i in range(nu+1):
            a=a0+(a1-a0)*i/nu;v=Vector((sin(th)*cos(a),sin(th)*sin(a),cos(th)))
            rr=r+amp*noise.noise_vector(v*23)[0]
            vs.append(tuple(v*rr));uv.append(((a+pi)/(2*pi),1-j/nv))
    for j in range(nv):
        for i in range(nu):
            k=j*(nu+1)+i;fs.append((k,k+nu+1,k+nu+2,k+1))
    return mesh(name,vs,fs,uv,mat,parent)

def face(name,r0,r1,a,mat,parent,relief):
    vs=[];uv=[];fs=[];nr=32;nt=96;normal=Vector((-sin(a),cos(a),0))
    for j in range(nt+1):
        th=pi*j/nt
        for i in range(nr+1):
            f=i/nr;r=r0+(r1-r0)*f;p=Vector((r*sin(th)*cos(a),r*sin(th)*sin(a),r*cos(th)))
            p+=normal*(relief*sin(pi*f)*sin(th)*noise.noise_vector(p*3)[0])
            vs.append(tuple(p));uv.append((r*sin(th)/6,r*cos(th)/12+.5))
    for j in range(nt):
        for i in range(nr):
            k=j*(nr+1)+i;fs.append((k,k+1,k+nr+2,k+nr+1))
    return mesh(name,vs,fs,uv,mat,parent)

for name,r0,r1 in layers:
    g=group(name,root);g['inner_radius']=r0/10;g['outer_radius']=r1/10
    if name not in ('crust','atmosphere'):
        sphere(name+'_outer',r1,materials[name],g)
    for suffix,a in [('right',start),('left',end)]:
        face(name+'_cut_'+suffix,r0,r1,a,materials[name],g,min(.06,(r1-r0)*.12))
surface_group=group('surface',root);sphere('observed_surface',10.012,surface_mat,surface_group)
if BODY=='earth':
    g=group('inner_core',root);g['outer_radius']=.1915
    sphere('solid_inner_core',1.915,materials['inner_core'],g,a0=0,a1=2*pi,amp=.012)

# ============ 流场的真实三维网格 ============
def tube(name,pts,r,mat,parent,sides=5):
    vs=[];uv=[];fs=[]
    for i,p in enumerate(pts):
        p=Vector(p);d=(Vector(pts[min(i+1,len(pts)-1)])-Vector(pts[max(0,i-1)])).normalized()
        axis=d.cross(Vector((0,0,1)))
        if axis.length<.01:axis=d.cross(Vector((0,1,0)))
        axis.normalize();other=d.cross(axis).normalized()
        for j in range(sides):
            a=j*2*pi/sides;vs.append(tuple(p+r*(cos(a)*axis+sin(a)*other)));uv.append((i/(len(pts)-1)*2,j/sides))
    for i in range(len(pts)-1):
        for j in range(sides):
            k=i*sides+j;z=i*sides+(j+1)%sides;fs.append((k,z,z+sides,k+sides))
    return mesh(name,vs,fs,uv,mat,parent)

flow_groups=[]
flow_specs = [('outer_core',3.65,1.25,16)] if BODY=='earth' else [('liquid',8.75,.55,18),('metallic',6,1.55,24),('core',2.5,1.65,32)]
for name,r,dr,count in flow_specs:
    g=group(name+'_flow',root);flow_groups.append(g)
    for k in range(count):
        a=-2.35+(k%8)*.22;theta=.6+(k//8)*.56
        pts=[]
        for j in range(81):
            ph=j*2*pi/80;rr=max(.25,r+dr*cos(ph));th=theta+.13*sin(ph)+.04*sin(ph*3+k);az=a+.17*sin(ph)+.05*sin(ph*2+k)
            pts.append((rr*sin(th)*cos(az),rr*sin(th)*sin(az),rr*cos(th)))
        tube(name+'_ribbon_'+str(k),pts,.022 if BODY=='earth' else .035,materials[name],g,6)
    bpy.ops.object.select_all(action='DESELECT')
    for o in g.children:o.select_set(True)
    bpy.context.view_layer.objects.active=g.children[0];bpy.ops.object.join();bpy.context.object.name=name+'_ribbons'

# ============ 导出与可编辑工程 ============
for o in scene.objects:o.select_set(o.type in ('MESH','EMPTY'))
bpy.ops.export_scene.gltf(filepath=str(OUT/(BODY+'-interior.glb')),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False,export_extras=True,export_image_format='AUTO')
for g in flow_groups:
    g.hide_render=True
    for o in g.children_recursive:o.hide_render=True
if BODY=='jupiter':
    # 稀释核心没有硬质球面，Blender 渲染同样用密度渐变的体积表达。
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=32,radius=4)
    o=bpy.context.object;o.name='core_volume_render_only';o.scale.z=flatten
    m=bpy.data.materials.new('CoreVolume');m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;n.clear()
    out=n.new('ShaderNodeOutputMaterial');vol=n.new('ShaderNodeVolumePrincipled');vol.inputs['Density'].default_value=.35
    vol.inputs['Color'].default_value=(.38,.19,.07,1);vol.inputs['Emission Color'].default_value=(.8,.31,.06,1);vol.inputs['Emission Strength'].default_value=.25
    l.new(vol.outputs[0],out.inputs['Volume']);o.data.materials.append(m)
for name,loc,col,energy,size in [('Key',(14,-20,18),(1,.86,.66),2300,13),('Rim',(-14,-8,7),(.38,.62,1),1700,10),('Fill',(5,0,-10),(1,.25,.07),1100,9)]:
    data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.color=col;data.shape='DISK';data.size=size
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
data=bpy.data.cameras.new('Camera');cam=bpy.data.objects.new('Camera',data);scene.collection.objects.link(cam)
cam.location=(16,-29,13);cam.rotation_euler=(-cam.location).to_track_quat('-Z','Y').to_euler();data.lens=43;scene.camera=cam
scene.render.resolution_x=1400;scene.render.resolution_y=1100;scene.render.resolution_percentage=100;scene.cycles.samples=24
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/(BODY+'-interior.blend')),compress=True)
manifest={'body':BODY,'blender':bpy.app.version_string,'radius':10,'flatten':flatten,'layers':[{'id':n,'r0':a/10,'r1':b/10} for n,a,b in layers], 'hasSolidInnerCore':BODY=='earth','note':'内部材料、色彩与运动为科学教学模型；表面使用本项目已归档观测贴图。'}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
render=SPACE.parent/'output/playwright'/('blender-'+BODY+'-cutaway.png');render.parent.mkdir(parents=True,exist_ok=True)
scene.render.filepath=str(render);bpy.ops.render.render(write_still=True)
print('FINISHED',json.dumps(manifest,ensure_ascii=False))
