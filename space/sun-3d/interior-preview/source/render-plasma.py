"""独立 Blender 体积渲染：烘焙供网页三维粒子使用的柔和等离子云。"""
import bpy
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=64;s.cycles.use_denoising=True
s.render.resolution_x=s.render.resolution_y=512;s.render.resolution_percentage=100;s.render.film_transparent=True
s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.view_settings.view_transform='Standard'
s.world.use_nodes=True;s.world.node_tree.nodes.get('Background').inputs[0].default_value=(0,0,0,1)
bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,radius=1)
o=bpy.context.object;o.scale=(1.2,1,.72)
m=bpy.data.materials.new('PlasmaVolume');m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;n.clear()
out=n.new('ShaderNodeOutputMaterial');vol=n.new('ShaderNodeVolumePrincipled');tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=2.8;tex.inputs['Distortion'].default_value=2;tex.inputs['Detail'].default_value=5;tex.inputs['Roughness'].default_value=.72
coord=n.new('ShaderNodeNewGeometry');l.new(coord.outputs['Position'],tex.inputs['Vector'])
ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.48;ramp.color_ramp.elements[0].color=(0,0,0,1);ramp.color_ramp.elements[1].position=.65;ramp.color_ramp.elements[1].color=(1,1,1,1)
l.new(tex.outputs['Fac'],ramp.inputs[0])
length=n.new('ShaderNodeVectorMath');length.operation='LENGTH';l.new(coord.outputs['Position'],length.inputs[0])
fall=n.new('ShaderNodeMath');fall.operation='SUBTRACT';fall.inputs[0].default_value=.98;l.new(length.outputs['Value'],fall.inputs[1]);fall.use_clamp=True
mul=n.new('ShaderNodeMath');mul.operation='MULTIPLY';l.new(fall.outputs[0],mul.inputs[0]);l.new(ramp.outputs[0],mul.inputs[1])
strength=n.new('ShaderNodeMath');strength.operation='MULTIPLY';strength.inputs[1].default_value=5;l.new(mul.outputs[0],strength.inputs[0]);l.new(strength.outputs[0],vol.inputs['Density']);l.new(mul.outputs[0],vol.inputs['Emission Strength'])
l.new(ramp.outputs[0],vol.inputs['Color']);vol.inputs['Density Attribute'].default_value='';vol.inputs['Color Attribute'].default_value='';vol.inputs['Emission Color'].default_value=(1,.22,.018,1);l.new(vol.outputs[0],out.inputs['Volume']);o.data.materials.append(m)
bpy.ops.object.camera_add(location=(0,-5,1))
c=bpy.context.object;c.rotation_euler=(-c.location).to_track_quat('-Z','Y').to_euler();c.data.type='ORTHO';c.data.ortho_scale=2.8;s.camera=c
s.render.filepath=str(root/'assets/plasma-cloud.png');bpy.ops.render.render(write_still=True)
