/* 仅验证样式与一次点击切换；复用现有观测图片，不加载旧三维场景或音频。 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const views = {
    sun: {
      image:'assets/sdo-ultraviolet.jpg', alt:'NASA SDO 拍摄的太阳极紫外全貌，金色为科学配色，图中保留观测时间',
      label:'太阳全貌', instrument:'NASA / SDO · AIA 171 Å', note:'极紫外观测，金色为科学配色；不是肉眼看到的颜色。',
      chapter:'认识一颗恒星', title:'太阳', lead:'我们每天的光和温暖，<br>来自这颗恒星。',
      facts:[['为什么会发光？','中心的氢原子核结合成氦，释放出能量。这叫<strong>核聚变</strong>。'],['能站在上面吗？','不能。太阳由极热的物质组成，<strong>没有坚硬的地面</strong>。'],['阳光要走多久？','离开太阳的光，大约要走<strong>8 分 20 秒</strong>，才能到地球。']],
      source:'https://science.nasa.gov/sun/facts/'
    },
    sunspot: {
      image:'assets/sunspot-observation.jpg', alt:'Hinode SOT 拍摄的太阳黑子近景，黑子周围可以看到细丝和米粒组织',
      label:'太阳黑子 · 近景', instrument:'Hinode / SOT · NASA SVS 制图', note:'2007 年 1 月 5 日的观测，金色为显示配色。',
      chapter:'靠近太阳的表面', title:'太阳黑子', lead:'太阳上的暗斑，<br>里面也很热。',
      facts:[['黑子是洞吗？','它是太阳表面的一片区域。因为<strong>比周围凉一些</strong>，看起来才更暗。'],['为什么这里会变凉？','这里的磁场很强，影响热量从里面传上来。温度虽低一些，仍有<strong>几千摄氏度</strong>。'],['旁边的小颗粒是什么？','热的物质上升，冷却后下沉，在太阳表面留下<strong>明暗相间的纹路</strong>。']],
      source:'https://solarscience.msfc.nasa.gov/feature1.shtml'
    }
  };
  let selected='sun';
  const image=$('observation-image');
  function setView(id){
    const item=views[id];if(!item)return;selected=id;
    document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===id)));
    image.hidden=false;$('image-error').hidden=true;image.alt=item.alt;image.src=item.image;
    $('view-label').textContent=item.label;$('instrument').textContent=item.instrument;$('image-note').textContent=item.note;
    $('chapter').textContent=item.chapter;$('topic-title').textContent=item.title;$('topic-lead').innerHTML=item.lead;
    $('facts').innerHTML=item.facts.map(([title,text])=>`<div><dt>${title}</dt><dd>${text}</dd></div>`).join('');
    $('science-source').href=item.source;
  }
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
  image.addEventListener('error',()=>{image.hidden=true;$('image-error').hidden=false;});
  $('retry').addEventListener('click',()=>setView(selected));
})();
