/* 科学数值只在此处定义；温度为代表值或近似范围，不是实时测量。 */
window.SOLAR_DATA = (() => {
  const facts = 'https://science.nasa.gov/sun/facts/';
  const interior = 'https://solarscience.msfc.nasa.gov/interior.shtml';
  const sheet = 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html';
  const layers = [
    { id:'core', name:'核心', en:'THE CORE', sub:'能量诞生的地方', color:'#ffe2a0', symbol:'◉', radius:.25, temp:15000000, value:'1,500', unit:'万℃', label:'太阳中心的近似温度', note:'核心向外逐渐变冷，并非整层都是这个温度', summary:'往太阳的最深处走。这里，氢的原子核经过核聚变形成氦，释放出能量。', fact:'太阳不需要木头或氧气来发光。核聚变提供了它的能量。', more:'核心约占太阳半径的四分之一。局部场景用发光粒子演示氢核聚变成氦的净结果，真实过程分多步进行，还产生其他粒子。画面中的粒子大小、颜色与反应速度均为示意。', source:interior },
    { id:'radiative', name:'辐射区', en:'RADIATIVE ZONE', sub:'能量曲折地向外走', color:'#f3b16c', symbol:'⋯', radius:.70, temp:7000000, value:'700 → 200', unit:'万℃', label:'从辐射区内侧到外侧', note:'边界约位于太阳半径的 25% 和 70%', summary:'这里非常稠密。能量不断被吸收、重新发射和散射，沿曲折的路径缓慢向外传递。', fact:'光点的曲折路线表示能量传递，不代表同一个光子一路走到地球。', more:'辐射区主要以辐射传输能量。不同模型对内部传输时间给出的估计并不一致，远远长于光从太阳表面到地球的时间。动画已大幅加速。', source:interior },
    { id:'convection', name:'对流区', en:'CONVECTION ZONE', sub:'上下循环，搬运热量', color:'#ee7f41', symbol:'↻', radius:1, temp:2000000, value:'200', unit:'万℃', label:'对流区底部的近似温度', note:'向外逐渐降低，接近表面时约几千摄氏度', summary:'较热的物质上升，冷却后又下沉。一圈又一圈，热量被带向太阳表面。', fact:'太阳表面像小颗粒的纹路，正是对流在表面留下的痕迹。', more:'对流区大约占最外面的 30% 半径。动画以少量闭合环展示流动方向；实际流动是复杂的三维湍流，并非整齐的传送带。', source:interior },
    { id:'photosphere', name:'光球', en:'PHOTOSPHERE', sub:'我们看见的太阳表面', color:'#efcc91', symbol:'☉', radius:1.001, temp:5500, value:'5,500', unit:'℃', label:'代表性温度', note:'有效温度约 5,772 K，各高度的温度不同', summary:'我们平常看见的太阳来自这里。明亮的小颗粒和太阳黑子，都出现在这一带。', fact:'光球是一层发光的气体，没有可以站立的坚硬地面。', more:'光球相对太阳半径极薄。剖面中的细边和局部画面经过放大，不能当作真实厚度。明亮颗粒中较热物质上升，暗沟中较冷物质下沉。', source:'https://solarscience.msfc.nasa.gov/surface.shtml' },
    { id:'chromosphere', name:'色球', en:'CHROMOSPHERE', sub:'表面上方的纤细世界', color:'#ed7261', symbol:'≋', radius:1.005, temp:20000, value:'约 2', unit:'万℃', label:'上部的代表性温度', note:'温度从较低处的数千度向上升高', summary:'越过光球，还有一层活跃的大气。细长的物质喷流伸向上方，又逐渐落下。', fact:'用特定波段观察时，太阳会显现平时看不到的结构。', more:'色球名称与氢发出的红色谱线有关。局部喷流动画是教学示意，厚度与运动均被放大。真实色球温度和形态随位置、时间变化。', source:'https://solarscience.msfc.nasa.gov/chromos.shtml' },
    { id:'transition', name:'过渡区', en:'TRANSITION REGION', sub:'温度突然升高的薄层', color:'#b598d4', symbol:'↗', radius:1.007, temp:500000, value:'数万 → 百万', unit:'℃', label:'向日冕过渡时的温度变化', note:'这是不规则的过渡区域，不是坚硬的球壳', summary:'这一带很薄，温度却迅速升高。拖到这里，看看温度的变化方向。', fact:'太阳温度不会一直向外降低。进入外层大气后，又会升高。', more:'过渡区连接色球和日冕，形状随磁场与物质运动而变化。模型为了方便选择，以一条放大的边界表示它，局部画面也不是实际比例。', source:facts },
    { id:'corona', name:'日冕', en:'THE CORONA', sub:'稀薄而炽热的外层大气', color:'#a8cdd3', symbol:'✺', radius:1.35, temp:1500000, value:'100～200', unit:'万℃', label:'日冕的典型温度', note:'活动区域可更热；日冕没有固定的外边界', summary:'太阳外围的日冕非常稀薄，却比光球更热。沿着弯曲的结构，看物质如何运动。', fact:'温度高不等于相同体积内的热量多；日冕中的物质非常稀少。', more:'磁场相关过程为日冕加热，但不同机制如何贡献仍是研究课题。发光弧线表现沿磁场分布的物质结构；辅助磁场线本身不可见。', source:facts }
  ];
  const observations = [
    { id:'sun', name:'整颗太阳', en:'OUR NEAREST STAR', sub:'认识我们的恒星', color:'#ffbd6e', symbol:'☉', label:'太阳的直径', value:'139.14', unit:'万千米', note:'大约是地球直径的 109 倍', summary:'它不断发光，把温暖送到地球。转动这颗太阳，看看它活跃的表面。', fact:'你可以打开一个观察窗口，亲手找到太阳的核心。', more:'太阳是由氢和氦为主的炽热物质组成的恒星。主模型使用合成球面贴图，动态与结构经过教学处理；“真实观测”里保留望远镜拍到的平面影像。', source:facts },
    { id:'sunspot', name:'太阳黑子', en:'SUNSPOTS', sub:'暗处也有几千度', color:'#be8d66', symbol:'◌', label:'黑子暗核的示例温度', value:'3,400', unit:'℃', note:'约 3,700 K；不同黑子的温度并不相同', summary:'看起来很暗的地方，也炽热得惊人。与更亮、更热的周围相比，黑子才显得暗。', fact:'强磁场影响对流，使局部向外传递的热量减少。黑子不是洞。', more:'黑子的中央暗区叫本影，外围较亮的丝状区域叫半影。这里的近景采用 Hinode/SOT 的真实观测图（NASA SVS 制图）；磁场弧线为教学叠加，不是照片拍到的光线。', source:'https://solarscience.msfc.nasa.gov/feature1.shtml' },
    { id:'prominence', name:'太阳日珥', en:'SOLAR PROMINENCE', sub:'悬在太阳边缘的物质', color:'#ef8762', symbol:'∩', label:'观察重点', value:'沿着磁场', unit:'运动', note:'相对周围日冕，日珥物质更冷、更密', summary:'绕到太阳边缘，看这一道拱起的物质。磁场帮助支撑、引导它的形状。', fact:'日珥在太阳边缘像拱桥；在太阳圆盘前方，常显成暗色的条带。', more:'日珥是太阳物质构成的结构，不是燃烧的火舌。模型采用立体弧束表现其空间关系，颜色、规模与时间均为教学示意。', source:facts },
    { id:'flare', name:'太阳耀斑', en:'SOLAR FLARE', sub:'短暂而强烈的能量释放', color:'#ffe0a0', symbol:'✧', label:'释放的能量形式', value:'强烈辐射', unit:'', note:'点击下方按钮，观察一次加速演示', summary:'太阳的磁场可以释放大量能量，让局部突然变亮。一次耀斑，是一次强烈的能量释放。', fact:'耀斑和日冕物质抛射有联系，但并不是同一件事。', more:'耀斑强调辐射能量的突然释放。日冕物质抛射则会把大量磁化物质抛向太空，两者不总是同时出现。本动画不代表某次真实事件。', source:facts }
  ];
  const measures = [
    {id:'radius',name:'半径与直径',en:'RADIUS & DIAMETER',sub:'从中心到边缘',color:'#ffc37b',symbol:'↔',label:'太阳半径',value:'69.57',unit:'万千米',note:'直径 = 2 × 半径 = 139.14 万千米',summary:'拖动下面的尺子。从中心到表面是一条半径；穿过中心连接两侧，就是直径。',fact:'两条半径首尾相接，正好组成一条直径。',more:'这里采用太阳体积平均半径 695,700 千米。太阳没有硬边界，常用半径以光球附近为基准。',source:sheet},
    {id:'earths',name:'和地球比大小',en:'A LINE OF EARTHS',sub:'109 个地球排成一列',color:'#80bcb9',symbol:'⊕',label:'太阳与地球的直径比',value:'109',unit:'倍左右',note:'地球参考平均直径约 12,742 千米',summary:'拉动滑杆，让一颗颗地球沿太阳直径排列。每一颗地球都保持同一比例。',fact:'一颗地球在这颗太阳旁边，只是小小的一点。',more:'这里比较直径，不表示太阳到地球的真实距离。地球一列的位置只是测量参照。',source:sheet},
    {id:'volume',name:'比较体积',en:'VOLUME',sub:'占据多大的空间',color:'#d2a67f',symbol:'◯',label:'太阳与地球的体积比',value:'约 130',unit:'万倍',note:'太阳体积约 1.412 × 10¹⁸ 立方千米',summary:'直径变大，三个方向都跟着变大。用滑杆缩放球体，看看体积增长得多快。',fact:'体积比约等于直径比的三次方：109.2 × 109.2 × 109.2。',more:'130 万倍表示总体积相当，不表示可以无缝塞入 130 万颗坚硬的地球。场景中的球采用相同缩放比例，读数按完整太阳和地球计算。',source:sheet},
    {id:'mass',name:'比较质量',en:'MASS',sub:'含有多少物质',color:'#c9abda',symbol:'⚖',label:'太阳与地球的质量比',value:'约 33.3',unit:'万倍',note:'太阳质量约 1.9884 × 10³⁰ 千克',summary:'质量告诉我们含有多少物质。拖动滑杆，累计到与一个太阳相当的地球质量。',fact:'体积约 130 万倍，质量约 33.3 万倍。太阳的平均密度比地球小。',more:'此处用等大小的符号表示质量份额，并非天体真实尺寸，也不是站在太阳上称体重。质量和所在位置的重力不同。',source:sheet},
    {id:'distance',name:'阳光的旅程',en:'LIGHT TO EARTH',sub:'大约 8 分 20 秒',color:'#a1bfd4',symbol:'↝',label:'平均日地距离',value:'1.496',unit:'亿千米',note:'光在真空中的速度约每秒 30 万千米',summary:'拖动时间滑杆，跟着一束离开太阳的光，走完通往地球的旅程。',fact:'看到太阳时，我们看到的是大约 8 分钟前离开它的光。',more:'日地距离随轨道位置变化，8 分 20 秒是近似值。本场景为看清两端而放大天体，天体大小与间距不使用同一比例。',source:'https://spaceplace.nasa.gov/all-about-the-sun/en/'}
  ];
  const journey = [
    {id:'core',title:'能量，在核心诞生',text:'氢核通过核聚变形成氦，释放能量。这里显示简化的反应净结果。'},
    {id:'radiative',title:'穿过辐射区',text:'能量经历吸收、再发射与散射，曲折地向外传递。动画已大幅加速。'},
    {id:'convection',title:'搭上对流的循环',text:'较热的物质上升，冷却后下沉，把热量带向表面。'},
    {id:'photosphere',title:'从光球走向太空',text:'大量可见光从光球向外发出。太阳没有坚硬的表面。'},
    {id:'distance',title:'大约 8 分 20 秒后，到达地球',text:'这是离开太阳之后的时间。拖动时间滑杆体验旅程，或重新回到核心。'}
  ];
  return {layers,observations,measures,journey,constants:{radiusKm:695700,earthDiameterKm:12742,volumeKm3:1.412e18,massKg:1.9884e30,massEarths:332900,lightSeconds:500}};
})();
