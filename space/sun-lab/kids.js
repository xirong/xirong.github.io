/* 儿童界面只显示一个动作；完整科学解释仍来自 data.js。 */
window.SOLAR_KIDS = {
  sun: {name:'太阳', icon:'☀️', task:'转一转太阳', hint:'用小手拖一拖', action:'打开它', detail:'里面藏着什么？'},
  sunspot: {name:'黑点点', icon:'🔍', task:'找找黑点点', hint:'点放大镜，靠近看', action:'放大看', detail:'黑点点也很烫哦'},
  prominence: {name:'弯弯桥', icon:'🌈', task:'找找弯弯桥', hint:'绕到太阳旁边看', action:'靠近看', detail:'太阳的物质弯成了桥'},
  flare: {name:'闪一下', icon:'✨', task:'让太阳闪一下', hint:'点一下，仔细看', action:'闪一下', detail:'哇，突然变亮了！'},
  core: {name:'最里面', icon:'💛', task:'打开太阳找中心', hint:'拖动黄色小把手', action:'钻进去', detail:'能量在这里诞生'},
  radiative: {name:'绕弯弯', icon:'〰️', task:'跟着光点走', hint:'点进去，看看它的路线', action:'钻进去', detail:'能量绕着弯往外走'},
  convection: {name:'转圈圈', icon:'🔄', task:'找找转圈的光点', hint:'点进去，跟它转一圈', action:'钻进去', detail:'热的上去，凉的下来'},
  photosphere: {name:'亮表面', icon:'☀️', task:'看看亮亮的表面', hint:'点进去，找小颗粒', action:'靠近看', detail:'这里没有能站的地面'},
  chromosphere: {name:'小喷泉', icon:'⛲', task:'找找小喷泉', hint:'点进去，看它往上冒', action:'靠近看', detail:'太阳的物质向上喷'},
  transition: {name:'变热啦', icon:'🌡️', task:'看看哪里更热', hint:'点进去，沿着亮光看', action:'钻进去', detail:'薄薄一层，变得更热'},
  corona: {name:'外衣', icon:'👑', task:'看看太阳的外衣', hint:'点进去，找弯弯的光', action:'靠近看', detail:'外面也很热哦'},
  radius: {name:'量一量', icon:'📏', task:'给太阳量一量', hint:'拖动下面的小圆点', action:'再量一次', detail:'两段半径，合成直径'},
  earths: {name:'排地球', icon:'🌍', task:'让地球排排队', hint:'把小圆点往右拖', action:'重新排', detail:'太阳比地球大好多'},
  volume: {name:'变大啦', icon:'🎈', task:'小球变大啦', hint:'慢慢往右拖', action:'变大', detail:'三个方向一起变大'},
  mass: {name:'比质量', icon:'⚖️', task:'看看谁的物质多', hint:'拖一拖，让光点亮起来', action:'点亮', detail:'太阳含有好多物质'},
  distance: {name:'追阳光', icon:'🚀', task:'送阳光到地球', hint:'点出发，跟着亮点走', action:'出发', detail:'阳光到地球啦'}
};
// 图片按钮配合短词和语音。插图只用于导航，不代表天体真实外形。
window.solarKidIcon = id => {
  if(['sun','sunspot','prominence','flare'].includes(id))return `<span class="picture-sun picture-${id}"><i></i></span>`;
  if(id!=='core'&&['radiative','convection','photosphere','chromosphere','transition','corona'].includes(id))return `<span class="picture-emoji">${SOLAR_KIDS[id].icon}</span>`;
  if(['core','radiative','convection','photosphere','chromosphere','transition','corona'].includes(id)){
    const radii={core:7,radiative:14,convection:21,photosphere:23,chromosphere:25,transition:27,corona:30};
    return `<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="29" fill="#f09b44"/><circle cx="36" cy="36" r="21" fill="#ed683b"/><circle cx="36" cy="36" r="14" fill="#ffc469"/><circle cx="36" cy="36" r="7" fill="#fff4af"/><circle cx="36" cy="36" r="${radii[id]}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="4 3"/></svg>`;
  }
  return `<span class="picture-emoji">${SOLAR_KIDS[id].icon}</span>`;
};
