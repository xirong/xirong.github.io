"""Blender Cycles 渲染木星内部教学模型用的中性云体精灵。"""
import bpy
from pathlib import Path
root=Path(__file__).resolve().parents[2]/'jupiter-3d/assets/interior'
root.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=64;s.cycles.use_denoising=True;s.cycles.device='CPU'
s.render.resolution_x=s.render.resolution_y=512;s.render.resolution_percentage=100
s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA'
s.view_settings.view_transform='Standard';s.world.color=(0,0,0)
bpy.ops.mesh.primitive_cube_add(size=2);o=bpy.context.object
m=bpy.data.materials.new('VolumetricCloud');m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;n.clear()
out=n.new('ShaderNodeOutputMaterial');vol=n.new('ShaderNodeVolumePrincipled');coord=n.new('ShaderNodeTexCoord');center=n.new('ShaderNodeVectorMath');center.operation='SUBTRACT';center.inputs[1].default_value=(.5,.5,.5);l.new(coord.outputs['Generated'],center.inputs[0]);scale=n.new('ShaderNodeVectorMath');scale.operation='SCALE';scale.inputs[3].default_value=2;l.new(center.outputs[0],scale.inputs[0])
tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=3;tex.inputs['Detail'].default_value=5;tex.inputs['Distortion'].default_value=2
l.new(scale.outputs[0],tex.inputs['Vector'])
ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.48;ramp.color_ramp.elements[1].position=.65
l.new(tex.outputs['Fac'],ramp.inputs[0])
length=n.new('ShaderNodeVectorMath');length.operation='LENGTH';l.new(scale.outputs[0],length.inputs[0])
fall=n.new('ShaderNodeMath');fall.operation='SUBTRACT';fall.inputs[0].default_value=.98;fall.use_clamp=True;l.new(length.outputs['Value'],fall.inputs[1])
mul=n.new('ShaderNodeMath');mul.operation='MULTIPLY';l.new(fall.outputs[0],mul.inputs[0]);l.new(ramp.outputs[0],mul.inputs[1])
density=n.new('ShaderNodeMath');density.operation='MULTIPLY';density.inputs[1].default_value=5;l.new(mul.outputs[0],density.inputs[0]);l.new(density.outputs[0],vol.inputs['Density'])
vol.inputs['Density Attribute'].default_value='';vol.inputs['Color Attribute'].default_value='';vol.inputs['Color'].default_value=(.8,.8,.8,1)
vol.inputs['Emission Color'].default_value=(1,1,1,1);bright=n.new('ShaderNodeMath');bright.operation='MULTIPLY';bright.inputs[1].default_value=5;l.new(mul.outputs[0],bright.inputs[0]);l.new(bright.outputs[0],vol.inputs['Emission Strength']);l.new(vol.outputs[0],out.inputs['Volume']);o.data.materials.append(m)
bpy.ops.object.camera_add(location=(0,-5,1));c=bpy.context.object;c.rotation_euler=(-c.location).to_track_quat('-Z','Y').to_euler();c.data.type='ORTHO';c.data.ortho_scale=2.8;s.camera=c
s.render.filepath=str(root/'cloud-volume.png');bpy.ops.render.render(write_still=True)
