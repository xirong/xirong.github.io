/* 页面状态与无障碍操作；三维渲染由 scene.js 负责。 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const data = window.SOLAR_DATA;
  const state = {mode:'observe',id:'sun',detail:false,cut:70,sound:true,journey:-1,flight:false};
  let solar, toastTimer, audioSerial=0, discoveries=new Set();
  const narrator = new Audio(); narrator.preload='none';
  try { const saved=JSON.parse(localStorage.getItem('solar-lab-discoveries')||'[]'); if(Array.isArray(saved))discoveries=new Set(saved.filter(id=>[...data.layers,...data.observations,...data.measures].some(x=>x.id===id))); } catch(_) {}
  const itemsFor = mode => mode==='interior'?data.layers:mode==='measure'?data.measures:data.observations;
  const current = () => itemsFor(state.mode).find(x=>x.id===state.id);

  // ============ 语音：预生成 MP3 优先 ============
  function stopAudio(){audioSerial++;narrator.pause();narrator.currentTime=0;narrator.onerror=null;if('speechSynthesis' in window)speechSynthesis.cancel();$('narrate').textContent='▷ 听小晓讲一讲';}
  function say(key){
    stopAudio();if(!state.sound)return;const entry=window.NARRATION[key];if(!entry)return;
    const serial=audioSerial;let fallbackUsed=false;
    const fallback=()=>{
      if(serial!==audioSerial||fallbackUsed||!state.sound)return;fallbackUsed=true;narrator.pause();
      if(!('speechSynthesis' in window)){toast('语音暂时不可用，右侧仍可阅读完整讲解。');return;}
      const utterance=new SpeechSynthesisUtterance(entry.text);utterance.lang='zh-CN';utterance.rate=.9;
      const voice=speechSynthesis.getVoices().find(v=>v.lang.startsWith('zh'));if(voice)utterance.voice=voice;
      $('audio-source').textContent='正在使用备用中文讲解';
      utterance.onend=()=>{if(serial===audioSerial)$('narrate').textContent='▷ 再听一遍';};
      utterance.onerror=()=>{if(serial===audioSerial)$('narrate').textContent='▷ 重试语音';};
      speechSynthesis.speak(utterance);
    };
    $('narrate').textContent='Ⅱ 停止讲解';
    if(!entry.audio){fallback();return;}
    $('audio-source').textContent='小晓为你讲解太阳的故事';
    narrator.src=entry.audio;narrator.onerror=fallback;
    narrator.onended=()=>{if(serial===audioSerial)$('narrate').textContent='▷ 再听一遍';};
    narrator.play().catch(fallback);
  }
  function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4000);}
  function remember(id){discoveries.add(id);try{localStorage.setItem('solar-lab-discoveries',JSON.stringify([...discoveries]));}catch(_){}$('discovery-count').textContent=`已经留下 ${discoveries.size} 个发现`;
  }

  // ============ 模式、层级与知识卡 ============
  function renderList(){
    const items=itemsFor(state.mode);$('explore-list').replaceChildren();
    $('explorer-title').textContent=state.mode==='interior'?'从核心，到日冕':state.mode==='measure'?'换一种方式认识太阳':'选择一个发现';
    items.forEach(item=>{
      const button=document.createElement('button');button.className='explore-item'+(state.id===item.id?' active':'');
      button.setAttribute('aria-pressed',String(state.id===item.id));button.dataset.id=item.id;button.style.setProperty('--dot',item.color);
      const dot=document.createElement('span');dot.className='item-dot';dot.setAttribute('aria-hidden','true');
      const text=document.createElement('span');const title=document.createElement('strong');title.textContent=item.name;
      const sub=document.createElement('small');sub.textContent=item.sub;text.append(title,sub);
      const arrow=document.createElement('span');arrow.className='item-arrow';arrow.textContent='›';button.append(dot,text,arrow);
      button.addEventListener('click',()=>select(item.id));$('explore-list').append(button);
    });
    $('explorer-count').textContent=String(items.findIndex(x=>x.id===state.id)+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');
    const active=$('explore-list').querySelector('.active');if(active&&innerWidth<560)$('explore-list').scrollTo({left:active.offsetLeft-15,behavior:solar.reduced?'instant':'smooth'});
  }
  function renderCard(){
    const item=current();const index=itemsFor(state.mode).indexOf(item)+1;
    $('card-index').textContent=(state.mode==='interior'?'内部探索':state.mode==='measure'?'测量笔记':'观察笔记')+' / '+String(index).padStart(2,'0');
    $('card-symbol').textContent=item.symbol;$('card-category').textContent=item.en;$('card-title').textContent=item.name;
    $('card-summary').textContent=item.summary;$('stat-label').textContent=item.label;$('stat-value').textContent=item.value;$('stat-unit').textContent=item.unit;$('stat-note').textContent=item.note;
    $('card-fact').textContent=item.fact;$('card-more').textContent=item.more;$('card-source').href=item.source;
    $('temperature').hidden=state.mode!=='interior';
    if(state.mode==='interior')$('temperature-marker').style.left=THREE.MathUtils.clamp(Math.log(item.temp/5500)/Math.log(15000000/5500)*100,0,100)+'%';
    updatePrimary();
  }
  function updatePrimary(){
    let text='打开太阳，看看里面';
    if(state.mode==='interior')text=state.detail?'返回完整剖面':'进入'+current().name+'看看';
    if(state.mode==='observe'){
      if(state.id==='sunspot')text=state.detail?(solar.magneticGroup.visible?'隐藏磁场示意':'显示磁场示意'):'靠近黑子，看看细节';
      if(state.id==='prominence')text=state.detail?'回到太阳全景':'绕到日珥旁边';
      if(state.id==='flare')text='播放一次耀斑';
    }
    if(state.mode==='measure')text=({radius:'从中心开始测量',earths:'从第一个地球开始',volume:'看看完整太阳',mass:'累计到太阳的质量',distance:state.flight?'暂停这段旅程':'播放阳光的旅程'})[state.id];
    $('primary-action').replaceChildren(document.createTextNode(text));const arrow=document.createElement('span');arrow.textContent='↗';$('primary-action').append(arrow);
  }
  function renderStage(){
    const item=current();const detail=state.detail;
    document.querySelector('.workspace').dataset.mode=state.mode;
    document.querySelectorAll('[data-mode]').forEach(b=>{const active=b.dataset.mode===state.mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    $('observation-switch').hidden=state.mode!=='observe'||detail;
    $('slice-control').hidden=state.mode!=='interior'||detail||state.journey>=0;
    $('cut-handle').hidden=$('slice-control').hidden;$('cut-handle').setAttribute('aria-valuenow',String(state.cut));
    $('measure-control').hidden=state.mode!=='measure';
    $('minimap').hidden=!detail||state.mode!=='interior';
    if(detail&&state.mode==='interior'){
      $('map-ring').setAttribute('r',String(Math.min(46,item.radius*44)));$('map-label').textContent=item.name+' · 局部';
    }
    let badge=detail?'局部教学模型 · 尺度与时间已调整':state.mode==='interior'?'内部科学模型 · 薄层已放大':state.mode==='measure'?'测量示意 · 请留意比例说明':solar.spectrum==='visible'?'外观合成 · 可见光配色':'外观合成 · 特殊波段配色';
    if(detail&&(state.id==='sunspot'||state.id==='photosphere'))badge='真实观测贴图 · 局部教学展示';
    if(state.mode==='measure'&&(state.id==='distance'||state.id==='mass'))badge=state.id==='distance'?'距离示意 · 天体大小已放大':'质量份额示意 · 不表示天体大小';
    $('view-badge').replaceChildren(document.createElement('i'),document.createTextNode(badge));
    $('stage-kicker').textContent=detail?'换一个角度，发现它怎样工作':state.mode==='interior'?'打开观察窗口，找到恒星的心脏':state.mode==='measure'?'动手测一测，让数字有了模样':'一颗恒星，也是一切的开始';
    $('stage-title').textContent=state.mode==='observe'&&state.id==='sun'?'你好，太阳。':detail?item.name+'的世界':item.name;
    $('gesture-hint').textContent=state.mode==='interior'&&!detail?'拖动旋转 · 点剖面选层 · 拉滑杆打开':detail?'拖动环视 · 滚轮或双指缩放':'拖动旋转 · 滚轮或双指缩放';
    $('science-note').textContent=state.mode==='interior'?'内部不是实际拍摄 · 颜色用于区分结构 · 温度为近似值':state.mode==='measure'?'体积与质量分别比较 · 日地距离场景放大了天体':'模型用于探索 · 亮度和时间经过调整 · 请勿直视现实中的太阳';
    $('cut').value=state.cut;$('cut-value').textContent='打开 '+state.cut+'%';
    if(state.mode==='measure')updateMeasurement();
    updateJourneyUI();
  }
  function select(id,{keepJourney=false}={}){
    stopAudio();clearTimeout(toastTimer);$('toast').classList.remove('show');if(!keepJourney)state.journey=-1;state.flight=false;state.id=id;state.detail=false;
    solar.setView(state.mode,id);
    if(state.mode==='interior'){
      if(state.cut<25)state.cut=70;solar.setCut(state.cut/100);
    }
    $('measure-range').value=state.mode==='measure'&&id==='distance'?0:100;
    remember(id);renderList();renderCard();renderStage();
    try{history.replaceState(null,'','#'+state.mode+'/'+id);}catch(_){}
  }
  function changeMode(mode,id){state.mode=mode;select(id||({observe:'sun',interior:'core',measure:'radius'})[mode]);}
  function enter(){
    state.detail=true;solar.enterDetail(state.id);renderStage();updatePrimary();
    if(state.mode==='interior')toast('你正在观察'+current().name+'的局部模型。右下角能找到你的位置。');
  }
  function exitDetail(){state.detail=false;solar.setView(state.mode,state.id);if(state.mode==='interior')solar.setCut(state.cut/100);renderStage();updatePrimary();}
  function primary(){
    if(state.mode==='interior'){state.detail?exitDetail():enter();return;}
    if(state.mode==='observe'){
      if(state.id==='sun'){changeMode('interior');return;}
      if(state.id==='sunspot'){if(!state.detail)enter();else{solar.toggleMagnetic();updatePrimary();toast(solar.magneticGroup.visible?'青色线条是磁场示意，磁场线本身不可见。':'已隐藏磁场示意。');}return;}
      if(state.id==='prominence'){state.detail?exitDetail():enter();return;}
      if(state.id==='flare'){if(solar.paused){solar.paused=false;updatePause();}solar.triggerFlare();toast('一次加速的耀斑示意。亮度和持续时间经过调整。');return;}
    }
    if(state.mode==='measure'){
      if(state.id==='distance'){state.flight=!state.flight;if(+ $('measure-range').value>=100)$('measure-range').value=0;if(state.flight&&solar.paused){solar.paused=false;updatePause();}updatePrimary();}
      else{$('measure-range').value=['radius','earths'].includes(state.id)?0:100;updateMeasurement();}
    }
  }

  // ============ 测量与能量旅行 ============
  function updateMeasurement(){
    const p=Number($('measure-range').value)/100;solar.setMeasureProgress(p);
    const fmt=n=>Math.round(n).toLocaleString('zh-CN');let label='',output='';
    switch(state.id){
      case 'radius':label='拉动尺子，从中心量到边缘';output=`半径：${fmt(695700*p)} 千米`;break;
      case 'earths':label='把同尺度的地球排成一列';output=`已经排了 ${Math.round(109*p)} / 109 个地球`;break;
      case 'volume':{label='缩放太阳，观察体积怎样变化';const scale=1/Math.cbrt(1304000)+p*(1-1/Math.cbrt(1304000));output=`此时球体的体积 ≈ ${fmt(1304000*scale**3)} 个地球`;break;}
      case 'mass':label='累计地球的质量份额';output=`相当于 ${fmt(Math.round(100*p)*3329)} 个地球的质量`;break;
      case 'distance':{label='沿着时间，向地球出发';const seconds=Math.round(500*p);output=`${Math.floor(seconds/60)} 分 ${String(seconds%60).padStart(2,'0')} 秒 / 8 分 20 秒`;break;}
    }
    $('measure-label').textContent=label;$('measure-output').textContent=output;
  }
  function journeyStep(step){
    state.journey=THREE.MathUtils.clamp(step,0,data.journey.length-1);const item=data.journey[state.journey];
    state.mode=item.id==='distance'?'measure':'interior';select(item.id,{keepJourney:true});
    if(state.mode==='interior')enter();
    if(state.sound)say(item.id);updateJourneyUI();
  }
  function updateJourneyUI(){
    const active=state.journey>=0;$('journey-player').hidden=!active;document.querySelector('.stage').classList.toggle('journey-active',active);
    if(!active)return;const item=data.journey[state.journey];
    $('journey-step').textContent=`能量旅行 · ${state.journey+1} / ${data.journey.length}`;$('journey-title').textContent=item.title;$('journey-description').textContent=item.text;
    $('journey-progress-fill').style.width=((state.journey+1)/data.journey.length*100)+'%';$('journey-prev').disabled=state.journey===0;
    $('journey-next').textContent=state.journey===data.journey.length-1?'↺':'→';$('journey-next').setAttribute('aria-label',state.journey===data.journey.length-1?'重新开始旅行':'旅行下一步');
  }
  function updatePause(){$('pause').textContent=solar.paused?'▷ 继续':'Ⅱ 暂停';$('pause').setAttribute('aria-pressed',String(solar.paused));}
  let lastFlight=performance.now();
  function flightLoop(now){const dt=THREE.MathUtils.clamp((now-lastFlight)/1000,0,.05);lastFlight=now;
    if(state.flight&&!solar.paused&&!document.hidden&&state.mode==='measure'&&state.id==='distance'){
      const next=Math.min(100,Number($('measure-range').value)+dt*8);$('measure-range').value=String(next);updateMeasurement();
      if(next>=100){state.flight=false;updatePrimary();toast('到达地球！这段演示约 12.5 秒，实际需要约 8 分 20 秒。');}
    }requestAnimationFrame(flightLoop);
  }

  // ============ 来源、照片与资料 ============
  function openDialog(kind){
    stopAudio();$('dialog-eyebrow').textContent=kind==='photos'?'OBSERVATION ARCHIVE':'SCIENCE & CREDITS';
    $('dialog-content').innerHTML=kind==='photos'?`
      <h2>模型之外，真实的太阳。</h2><p>这些是保存到本页的观测快照，不是实时画面。观测日期见图内标注。不同仪器看到太阳的不同侧面。</p>
      <div class="photo-grid"><figure><img src="assets/sdo-visible.jpg" alt="SDO HMI 可见光连续谱太阳观测，灰度图，含观测时间"><figcaption><b>可见光连续谱 · HMI</b><br>灰度呈现亮度与黑子，不代表肉眼可安全直视的亮度。来源：NASA/SDO 与 HMI 科学团队。</figcaption></figure>
      <figure><img src="assets/sdo-ultraviolet.jpg" alt="SDO AIA 171 埃极紫外太阳观测，金色为指定配色"><figcaption><b>极紫外 · AIA 171 Å</b><br>人眼看不到这一波段，金色是为显示观测信息指定的颜色。来源：NASA/SDO 与 AIA 科学团队。</figcaption></figure>
      <figure><img src="assets/sunspot-observation.jpg" alt="太阳黑子的暗核、半影和周围米粒组织的观测近景"><figcaption><b>太阳黑子与米粒组织</b><br>Hinode/SOT，2007 年 1 月 5 日，G 波段观测。制图：NASA/GSFC Scientific Visualization Studio，Tom Bridgman。模型中的磁场线为另外叠加的示意。</figcaption></figure></div>
      <p><a href="https://sdo.gsfc.nasa.gov/data/" target="_blank" rel="noopener">查看 SDO 观测资料 ↗</a> · <a href="https://svs.gsfc.nasa.gov/4061/" target="_blank" rel="noopener">黑子图原始来源页 ↗</a></p>`:`
      <h2>好奇心，也需要可靠的依据。</h2>
      <p>这个实验室把真实观测素材与可操作的科学模型结合。太阳内部无法直接摄影，内部颜色、粒子、剖面切口与运动路径都用于帮助理解。</p>
      <h3>画面怎样处理</h3><ul><li>主球面使用项目已有的 Solar System Scope 合成太阳贴图，配合动态光照；它不表示太阳此刻的全球状态。</li><li>活动太阳使用特殊波段风格的配色，可见光模式降低亮度并表现边缘变暗。切换配色不会把合成贴图变成另一张真实观测。</li><li>内部区域按约 25%、70% 半径分界。光球、色球和过渡区非常薄，通过局部放大认识它们。日冕没有硬的外边界。</li><li>温度都是近似代表值或范围。中心温度不代表整个核心；动画时间、物质颗粒大小和能量路径经过简化。</li><li>大小比较、体积比较和质量比较分别展示。日地距离场景为看清两端放大了天体。</li></ul>
      <h3>科学资料</h3><ul class="source-list">
      <li><a href="https://science.nasa.gov/sun/facts/" target="_blank" rel="noopener">NASA · 太阳结构、大气与活动现象</a></li>
      <li><a href="https://solarscience.msfc.nasa.gov/interior.shtml" target="_blank" rel="noopener">NASA/Marshall · 核心、辐射区与对流区</a></li>
      <li><a href="https://solarscience.msfc.nasa.gov/feature1.shtml" target="_blank" rel="noopener">NASA/Marshall · 黑子与米粒组织</a></li>
      <li><a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html" target="_blank" rel="noopener">NASA · 太阳数值与日地比较</a></li>
      <li><a href="https://spaceplace.nasa.gov/all-about-the-sun/en/" target="_blank" rel="noopener">NASA Space Place · 给孩子的太阳知识</a></li></ul>
      <h3>素材与使用说明</h3><p>太阳与地球球面素材：<a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noopener">Solar System Scope，CC BY 4.0</a>。观测快照：NASA/SDO 与 AIA、HMI 科学团队。黑子与米粒组织近景：Hinode/SOT；制图 NASA/GSFC Scientific Visualization Studio，Tom Bridgman。依据 NASA 影像使用准则保留署名，用于教育展示。完整清单见 <a href="CREDITS.md" target="_blank" rel="noopener">素材说明</a>。</p>
      <p>旁白：小晓，Edge TTS 预生成语音。三维绘制：Three.js r128（MIT）。</p><p>请勿直视现实中的太阳，也不要用没有专业太阳滤镜的望远镜观察。</p>`;
    $('info-dialog').showModal();
  }

  // ============ 启动与事件 ============
  function showError(message){$('loading').hidden=true;$('render-error').hidden=false;$('error-message').textContent=message;}
  $('reload').addEventListener('click',()=>location.reload());
  window.addEventListener('solar-render-error',e=>showError(e.detail));
  $('dialog-close').addEventListener('click',()=>$('info-dialog').close());
  $('info-dialog').addEventListener('click',event=>{if(event.target===$('info-dialog')){const rect=$('info-dialog').getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)$('info-dialog').close();}});
  $('sources').addEventListener('click',()=>openDialog('sources'));$('photo-open').addEventListener('click',()=>openDialog('photos'));
  try{
    solar=new SolarScene($('canvas-host'),$('scene-labels'),id=>{
      if(state.mode==='interior'&&data.layers.some(x=>x.id===id))select(id);
      else if(state.mode==='observe'&&id==='sunspot'){select('sunspot');enter();}
    });
    solar.ready.then(()=>{
      $('loading').hidden=true;
      document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>changeMode(b.dataset.mode)));
      document.querySelectorAll('[data-spectrum]').forEach(b=>b.addEventListener('click',()=>{solar.setSpectrum(b.dataset.spectrum);document.querySelectorAll('[data-spectrum]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderStage();}));
      const changeCut=value=>{state.cut=Math.round(THREE.MathUtils.clamp(value,0,100));$('cut').value=state.cut;solar.setCut(state.cut/100);$('cut-value').textContent='打开 '+state.cut+'%';$('cut-handle').setAttribute('aria-valuenow',String(state.cut));};
      $('cut').addEventListener('input',()=>changeCut(Number($('cut').value)));
      let handleDrag=null;
      $('cut-handle').addEventListener('pointerdown',e=>{handleDrag={x:e.clientX,value:state.cut};e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault();});
      $('cut-handle').addEventListener('pointermove',e=>{if(handleDrag)changeCut(handleDrag.value+(e.clientX-handleDrag.x)/Math.min(250,$('canvas-host').clientWidth*.6)*100);});
      ['pointerup','pointercancel','lostpointercapture'].forEach(type=>$('cut-handle').addEventListener(type,()=>{handleDrag=null;}));
      $('cut-handle').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();changeCut(e.key==='Home'?0:e.key==='End'?100:state.cut+(e.key==='ArrowRight'?5:-5));}});
      $('measure-range').step='0.1';$('measure-range').addEventListener('input',()=>{state.flight=false;updateMeasurement();updatePrimary();});
      $('primary-action').addEventListener('click',primary);$('exit-detail').addEventListener('click',exitDetail);
      $('home-view').addEventListener('click',()=>{if(state.detail)exitDetail();else solar.resetCamera();});
      $('pause').addEventListener('click',()=>{solar.paused=!solar.paused;updatePause();});updatePause();
      $('sound').addEventListener('click',()=>{state.sound=!state.sound;if(!state.sound)stopAudio();$('sound').setAttribute('aria-pressed',String(state.sound));$('sound').innerHTML=state.sound?'◖♪ <span>语音开</span>':'◖ <span>语音关</span>';});
      $('narrate').addEventListener('click',()=>{if(!state.sound){toast('语音已关闭。点右上角“语音关”可以重新打开。');return;}if(!narrator.paused||('speechSynthesis'in window&&speechSynthesis.speaking))stopAudio();else say(state.id);});
      $('journey').addEventListener('click',()=>journeyStep(0));$('journey-prev').addEventListener('click',()=>journeyStep(state.journey-1));$('journey-next').addEventListener('click',()=>journeyStep((state.journey+1)%data.journey.length));
      $('journey-close').addEventListener('click',()=>{state.journey=-1;stopAudio();renderStage();});
      $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.querySelector('.stage').requestFullscreen)await document.querySelector('.stage').requestFullscreen();else toast('这个浏览器暂不支持全屏，可以横屏获得更大的画面。');}catch(_){toast('当前环境无法进入全屏，可以横屏观看。');}});
      const match=location.hash.match(/^#(observe|interior|measure)\/([a-z]+)$/);if(match&&itemsFor(match[1]).some(x=>x.id===match[2]))changeMode(match[1],match[2]);else changeMode('observe');
      $('audio-source').textContent='小晓为你讲解太阳的故事';
      requestAnimationFrame(flightLoop);
      // 只读的验收入口，用于检查当前状态和画布，不修改教学状态。
      window.solarLab={getState:()=>({...state,paused:solar.paused,cut:solar.cut,drawCalls:solar.renderer.info.render.calls,triangles:solar.renderer.info.render.triangles,magnetic:solar.magneticGroup.visible,audio:{paused:narrator.paused,time:narrator.currentTime,src:narrator.currentSrc}}),scene:solar};
    }).catch(error=>showError(error.message));
  }catch(error){showError('当前设备无法启动三维画面：'+error.message);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});
  window.addEventListener('pagehide',stopAudio);
})();
