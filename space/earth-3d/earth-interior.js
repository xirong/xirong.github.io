/* 地球：薄地壳、固态地幔、液态外核、固态内核；模型半径 10。 */
window.EarthInterior={setup(ctx){BlenderInterior.setup(ctx,{
  id:'earth',first:2,model:'assets/interior/earth-interior.glb?v=1',
  groups:['surface','crust','upper_mantle','lower_mantle','outer_core','inner_core'],
  overview:{pos:[20,14,40],aim:[0,0,0]},flows:{outer_core:[3.65,1.25,16]},
  stops:[
    {id:'crust',label:'地壳',note:'外面薄薄一层，是坚硬的地壳',pos:[20,14,40],aim:[0,0,0],opacity:{}},
    {id:'upper_mantle',label:'上地幔',note:'固态岩石缓慢变形 · 箭头运动已加速',pos:[3.7,2.5,11.4],aim:[7.7,.5,5.4],mantle:[9.42,.37],opacity:{surface:.12,crust:.15,lower_mantle:.6,outer_core:.55}},
    {id:'lower_mantle',label:'下地幔',note:'更深、更厚的固态岩石 · 运动已加速',pos:[2.8,2.2,8.6],aim:[5.8,.2,4.1],mantle:[7.2,1.45],opacity:{surface:.015,crust:.015,upper_mantle:.025,outer_core:.55}},
    {id:'outer_core',label:'外核',note:'液态铁镍在流动 · 曲线与光点表示流动',pos:[1.5,2.4,10],aim:[0,.4,2.5],flow:'outer_core',opacity:{surface:0,crust:0,upper_mantle:.006,lower_mantle:0,outer_core:.14,inner_core:.42}},
    {id:'inner_core',label:'内核',note:'压力非常大，铁镍保持固体',pos:[2.2,1.4,7.8],aim:[0,0,0],opacity:{surface:0,crust:0,upper_mantle:0,lower_mantle:0,outer_core:.012}},
  ],
});}};
