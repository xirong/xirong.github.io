/* 木星：云层以下连续变稠；金属氢是导电流体；稀释核心没有硬球面。 */
window.JupiterInterior={setup(ctx){BlenderInterior.setup(ctx,{
  id:'jupiter',first:2,flatten:.935,model:'assets/interior/jupiter-interior.glb?v=1',cloud:'assets/interior/cloud-volume.png?v=2',
  groups:['surface','atmosphere','liquid','metallic'],overviewOpacity:{surface:.85,atmosphere:.75,liquid:.65,metallic:.55},
  overview:{pos:[20,14,40],aim:[0,0,0]},flows:{liquid:[8.75,.55,18],metallic:[6,1.55,24],core:[2.5,1.65,32]},
  stops:[
    {id:'atmosphere',label:'更深的大气',note:'穿过层层云雾，这里没有地面',pos:[0,1.2,13.5],aim:[0,0,8.2],opacity:{surface:0,atmosphere:0,liquid:0,metallic:0},clouds:{atmosphere:.65,liquid:.16}},
    {id:'liquid',label:'液态氢',note:'氢逐渐变稠 · 没有坚硬的分界面',pos:[1.4,2,14],aim:[-.4,.1,6.5],flow:'liquid',opacity:{surface:0,atmosphere:0,liquid:0,metallic:0},clouds:{liquid:.4,metallic:.12}},
    {id:'metallic',label:'金属氢',note:'能导电的液态氢 · 颜色为示意',pos:[1.3,.9,12],aim:[-.3,0,3.5],flow:'metallic',opacity:{surface:0,atmosphere:0,liquid:0,metallic:0},clouds:{metallic:.32,core:.15}},
    {id:'core',label:'稀释核心',note:'重物质与氢氦混合 · 没有硬球边界',pos:[1,1,10],aim:[0,0,.7],flow:'core',opacity:{surface:0,atmosphere:0,liquid:0,metallic:0},clouds:{metallic:.12,core:.38}},
  ],
});}};
