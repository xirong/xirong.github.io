/* 飞进太阳：Blender 资产 + 连续镜头 + Three.js 实时交互。
   所有修改均限独立预览；不依赖或修改共用 Explorer 钻入模块。 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = THREE.MathUtils.clamp;
  const smooth = (a,b,x) => THREE.MathUtils.smoothstep(x,a,b);
  const lerp = THREE.MathUtils.lerp;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const state = { depth:0, target:0, flying:false, motion:!reduced.matches, sound:false, ready:false, time:0, stop:-1, transition:null, cameraBlend:null };
  const stops = [
    {title:'太阳里面，<br>藏着什么？',eyebrow:'一场向内的旅行',fact:'穿过翻滚的热浪，<br>去找太阳发光的秘密。',temp:'从这里出发',where:'目的地 · 太阳核心',pos:[19,10,35],aim:[0,0,0],dot:112},
    {title:'穿过太阳的<br>发光外衣',eyebrow:'01 / 日冕',fact:'外面很稀薄，却特别热。<br>弯弯的磁环托着发光的物质。',temp:'约 100 万～200 万℃',where:'位置 · 太阳外层大气',pos:[12,4.8,22],aim:[3.5,1.8,3],dot:110,audio:'dive_corona'},
    {title:'这片“海”，<br>滚烫又柔软',eyebrow:'02 / 靠近表面',fact:'明亮的表面也在翻滚。<br>这里没有可以站的地面。',temp:'光球约 5,500℃',where:'途经色球、过渡区 · 薄层已放大',pos:[5,2,15.4],aim:[1,0,7],dot:107,audio:'dive_photosphere'},
    {title:'打开太阳，<br>里面有三层',eyebrow:'03 / 看清内部',fact:'翻滚的外层，传递能量的中层，<br>还有最里面发光的核心。',temp:'一起往里面飞',where:'剖开只是看法 · 太阳没有硬壳',pos:[20,15,33],aim:[0,0,0],dot:100},
    {title:'热浪，<br>翻个跟头',eyebrow:'04 / 对流区',fact:'热的往上升，凉的往下沉。<br>一圈一圈，把热量搬出去。',temp:'约 5,700℃～200 万℃',where:'从表面深入 · 约 0.7～1 个太阳半径',pos:[1,1.5,10.1],aim:[-.7,.4,6.7],dot:98,audio:'dive_convection'},
    {title:'能量在这里<br>走迷宫',eyebrow:'05 / 辐射区',fact:'吸收，再发出；再吸收，再发出。<br>能量走走停停，慢慢向外传。',temp:'约 200 万～700 万℃',where:'继续深入 · 约 0.25～0.7 个太阳半径',pos:[1.7,1.2,6.7],aim:[-.4,0,2.2],dot:82},
    {title:'找到啦！<br>太阳的心脏',eyebrow:'06 / 核心',fact:'氢聚变成氦，释放能量。<br>阳光的故事，从这里开始。',temp:'中心约 1,500 万℃',where:'微观过程放大示意 · 省略中间反应',pos:[.45,.25,1.9],aim:[0,0,0],dot:60,audio:'dive_core'}
  ];
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({canvas:$('scene'),antialias:true,alpha:false,powerPreference:'high-performance'});
  } catch(e) { fail('这台设备暂时打不开 3D，仍然可以看渲染图。'); return; }
  renderer.setClearColor(0x070706);
  renderer.info.autoReset=false;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .92;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42,1,.018,300);
  const controls = new THREE.OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true; controls.dampingFactor=.07; controls.enablePan=false;
  controls.minDistance=.35; controls.maxDistance=65; controls.rotateSpeed=.45;
  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene,camera));
  const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(1,1),.65,.65,.76);
  composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0xffba76,.3));
  const light=new THREE.DirectionalLight(0xffe0b2,.6); light.position.set(15,20,30); scene.add(light);
  const sun = new THREE.Group(); scene.add(sun);
  let model, cap, volume, paths, core, coreMaterial;
  const shells=[];
  const dynamicMaterials=[];
  // ============ 可重复的粒子与光晕 ============
  let seed=1928;
  function random(){ seed=(1664525*seed+1013904223)>>>0; return seed/4294967296; }
  function glowTexture(){
    const c=document.createElement('canvas'); c.width=c.height=64;
    const g=c.getContext('2d'), grad=g.createRadialGradient(32,32,0,32,32,32);
    grad.addColorStop(0,'rgba(255,255,255,1)'); grad.addColorStop(.13,'rgba(255,242,205,.95)'); grad.addColorStop(.4,'rgba(255,162,60,.2)'); grad.addColorStop(1,'rgba(255,110,0,0)');
    g.fillStyle=grad;g.fillRect(0,0,64,64); return new THREE.CanvasTexture(c);
  }
  const glow=glowTexture();
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0xff5b13,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending}));
  halo.scale.set(35,35,1); sun.add(halo);
  const starsGeo=new THREE.BufferGeometry();const starPos=[];
  for(let i=0;i<850;i++){const a=random()*Math.PI*2,z=random()*2-1,r=100;starPos.push(r*Math.sqrt(1-z*z)*Math.cos(a),r*z,r*Math.sqrt(1-z*z)*Math.sin(a));}
  starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));
  const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xaca99b,size:.18,transparent:true,opacity:.5,depthWrite:false}));scene.add(stars);
  // 对流光点沿 Blender 对流胞的同一参数路径移动。
  const n=3600, pos=new Float32Array(n*3), color=new Float32Array(n*3), particleData=[];
  const geom=new THREE.BufferGeometry();
  for(let i=0;i<n;i++){
    const zone=i<2000?0:i<3100?1:2;
    particleData.push({zone,phase:random()*Math.PI*2,a:lerp(-2.4,-.6,random()),theta:lerp(.45,2.7,random()),r:random(),speed:lerp(.25,.7,random())});
    const c=new THREE.Color(zone===0?0xff8b32:zone===1?0xffc571:0xffeab8);c.toArray(color,i*3);
  }
  geom.setAttribute('position',new THREE.BufferAttribute(pos,3));geom.setAttribute('color',new THREE.BufferAttribute(color,3));
  const particles=new THREE.Points(geom,new THREE.PointsMaterial({map:glow,size:.085,vertexColors:true,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending}));sun.add(particles);particles.visible=false;
  // 核心近景：四个氢核聚合为一个氦核的概念缩略，粒子尺度被放大。
  const fusion=new THREE.Group();sun.add(fusion);fusion.visible=false;
  const nuclei=[];
  for(let i=0;i<4;i++){
    const m=new THREE.Mesh(new THREE.SphereGeometry(.074,18,12),new THREE.MeshStandardMaterial({color:i%2?0xc64e09:0xffa94b,emissive:0xff650c,emissiveIntensity:.35,roughness:.5,metalness:.05}));
    const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0xffbb62,transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending}));spr.scale.set(.28,.28,1);m.add(spr);fusion.add(m);nuclei.push(m);
  }
  const flash=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0xffe8b7,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));fusion.add(flash);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.005,5,100),new THREE.MeshBasicMaterial({color:0xffc771,transparent:true,opacity:0,depthWrite:false}));fusion.add(ring);
  const fogSprites=[];
  const cloudTexture=new THREE.TextureLoader().load('assets/plasma-cloud.png?v=4');cloudTexture.encoding=THREE.sRGBEncoding;
  const cloudMaterial=new THREE.MeshBasicMaterial({map:cloudTexture,color:0xffa654,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  const clouds=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),cloudMaterial,60);sun.add(clouds);clouds.frustumCulled=false;
  const cloudSeeds=[],cloudDummy=new THREE.Object3D();
  for(let i=0;i<60;i++){
    const a=lerp(-2.65,-.5,random()),th=lerp(.3,2.85,random()),r=lerp(.7,10,random());
    cloudSeeds.push({position:new THREE.Vector3(r*Math.sin(th)*Math.cos(a),r*Math.cos(th),-r*Math.sin(th)*Math.sin(a)),scale:lerp(1.4,4.5,random()),phase:random()*Math.PI*2});
  }
  for(let i=0;i<8;i++){
    const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:i%2?0xe3520b:0xffaa35,transparent:true,opacity:.024,depthWrite:false,blending:THREE.AdditiveBlending}));
    const a=random()*Math.PI*2,r=lerp(1.5,7,random());spr.position.set(cos(a)*r,(random()-.5)*r,sin(a)*r);
    spr.scale.setScalar(lerp(3,8,random()));sun.add(spr);fogSprites.push(spr);
  }
  function sin(x){return Math.sin(x);} function cos(x){return Math.cos(x);}

  // ============ 载入 Blender 资产 ============
  new THREE.GLTFLoader().load('assets/sun-interior.glb?v=6',gltf=>{
    model=gltf.scene;sun.add(model);
    cap=model.getObjectByName('opening_cap');volume=model.getObjectByName('convection_volume');paths=model.getObjectByName('radiative_paths');core=model.getObjectByName('core');
    model.traverse(obj=>{
      if(!obj.isMesh)return;
      obj.material=obj.material.clone();obj.material.side=THREE.DoubleSide;
      obj.material.emissiveIntensity=.6;
      if(obj.material.name==='hot_flow')obj.material.emissiveIntensity=.9;
      if(obj.name.startsWith('observed_surface'))obj.material.emissiveIntensity=1.05;
      if(obj.name==='core_surface'){coreMaterial=obj.material;obj.material.emissiveIntensity=.8;}
      if(obj.name.startsWith('volume_roll')||obj.name.startsWith('radiation_walk')||obj.name.startsWith('convection_volume')||obj.name.startsWith('radiative_paths')){
        obj.material.transparent=true;obj.material.depthWrite=false;obj.material.blending=THREE.AdditiveBlending;dynamicMaterials.push(obj.material);
        obj.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>','gl_FragColor.a *= smoothstep(0.5, 2.0, length(vViewPosition));\n#include <dithering_fragment>');};
        if(obj.name.startsWith('radiative_paths')){obj.material.color.set(0xa56117);obj.material.emissive.set(0xffa541);obj.material.emissiveIntensity=.6;}
      }
    });
    for(const name of ['convection','radiative','photosphere']){model.getObjectByName(name).traverse(o=>{if(o.isMesh)shells.push(o);});}
    state.ready=true;$('fly').disabled=false;$('depth').disabled=false;
    $('loading').hidden=true;setCamera(0);updateView();
    // 仅用于可重复验收，默认不干预正常用户旅程。
    const initial=Number(new URLSearchParams(location.search).get('stop'));
    if(initial>=0&&initial<=6&&initial!==0)seek(initial,false);
  },event=>{
    if(event.total)$('load-text').textContent=`正在搬来一颗太阳… ${Math.round(event.loaded/event.total*100)}%`;
  },()=>fail('太阳模型没有加载完成，请重试或先看渲染图。'));

  function fail(message){
    $('load-text').textContent=message;
    const a=document.createElement('a');a.href='assets/blender-cutaway.png';a.textContent='查看 Blender 渲染图';a.style.color='#ffd195';$('loading').append(a);
    const button=document.createElement('button');button.textContent='重新加载';button.onclick=()=>location.reload();$('loading').append(button);
  }
  // ============ 连续镜头与逐层位置 ============
  const tmp=new THREE.Vector3();
  function pose(depth){
    const i=Math.min(5,Math.floor(depth)), f=smooth(0,1,depth-i), a=stops[i],b=stops[i+1];
    return {position:new THREE.Vector3(...a.pos).lerp(new THREE.Vector3(...b.pos),f),target:new THREE.Vector3(...a.aim).lerp(new THREE.Vector3(...b.aim),f)};
  }
  function setCamera(depth){
    const p=pose(depth);camera.position.copy(p.position);controls.target.copy(p.target);
    if(state.cameraBlend){const b=state.cameraBlend,f=smooth(0,1,(performance.now()-b.start)/1000);camera.position.lerpVectors(b.position,p.position,f);controls.target.lerpVectors(b.target,p.target,f);if(f>=1)state.cameraBlend=null;}
    controls.minDistance=depth>5.5?.35:depth>3.5?1.3:8;
    controls.maxDistance=depth>5.5?6:depth>3.5?24:65;
    camera.lookAt(controls.target);controls.update();
  }
  function seek(value,animate=true){
    if(!state.ready)return;
    state.flying=false;state.target=clamp(value,0,6);stopAudio();
    if(animate&&state.motion){state.cameraBlend={position:camera.position.clone(),target:controls.target.clone(),start:performance.now()};state.transition={from:state.depth,to:state.target,start:performance.now(),duration:Math.min(4800,1800+Math.abs(state.target-state.depth)*500)};}
    else {state.depth=state.target;state.transition=null;state.cameraBlend=null;setCamera(state.depth);}
    updateView();updatePlay();
  }
  function updateModel(){
    if(!model)return;
    const d=state.depth,opened=smooth(2.1,2.95,d);
    cap.visible=opened<.995;cap.scale.setScalar(1+opened*.6);cap.position.z=opened*12;cap.position.x=-opened*9;
    cap.traverse(o=>{if(o.isMesh){o.material.transparent=opened>.005;o.material.opacity=1-opened;o.material.depthWrite=opened<.005;}});
    const dissolve=smooth(3.25,4,d)*.97+smooth(4.5,6,d)*.029;
    shells.forEach(o=>{o.material.transparent=dissolve>.001;o.material.opacity=1-dissolve;o.material.depthWrite=dissolve<.1;});
    model.getObjectByName('convection_flows').visible=d<3.7;
    model.getObjectByName('coronal_loops').visible=d<3.4;
    clouds.visible=d>3.25;cloudMaterial.opacity=smooth(3.25,4,d)*.38;
    cloudSeeds.forEach((c,i)=>{cloudDummy.position.copy(c.position);cloudDummy.quaternion.copy(camera.quaternion);cloudDummy.rotateZ(c.phase+state.time*.008);cloudDummy.scale.setScalar(c.scale);cloudDummy.updateMatrix();clouds.setMatrixAt(i,cloudDummy.matrix);});clouds.instanceMatrix.needsUpdate=true;
    // 开口中的体积流场随镜头靠近才显现，让总览保持结构清楚。
    const vf=smooth(3.3,3.9,d)*(1-smooth(4.5,5.15,d));
    volume.visible=vf>.001;volume.traverse(o=>{if(o.isMesh)o.material.opacity=vf*.35;});
    const rf=smooth(4.3,4.95,d)*(1-smooth(5.45,5.9,d));
    paths.visible=rf>.001;paths.traverse(o=>{if(o.isMesh)o.material.opacity=rf*.23;});
    // 镜头进入核心时，渐隐遮挡近景的外层，以放大展示微观过程。
    const inside=smooth(5.65,5.95,d);
    coreMaterial.transparent=d>3.4;coreMaterial.opacity=(1-inside*.999)*(1-smooth(3.4,4,d)*.75*(1-smooth(4.9,5.5,d)));coreMaterial.depthWrite=inside<.01;
    model.getObjectByName('core_filaments').visible=d<3.7||(d>5.2&&d<5.8);
    halo.material.opacity=.18*(1-smooth(3.3,5,d));stars.material.opacity=.5*(1-smooth(2.5,4.2,d));
    particles.visible=d>3.4;particles.material.opacity=smooth(3.4,4,d)*.85;
    fogSprites.forEach(s=>s.visible=d>3.7);
    fusion.visible=d>5.6;$('reaction').hidden=d<5.8;fusion.scale.setScalar(smooth(5.6,6,d));
    bloom.strength=lerp(.45,.62,smooth(3.5,6,d));
    const labelOpacity=smooth(2.7,2.95,d)*(1-smooth(3.1,3.6,d));
    for(const [key,p] of Object.entries({convection:[6.9,4.2,4.6],radiative:[4.6,2.2,3.2],core:[1.5,-.1,1.8]})){
      tmp.set(...p).project(camera);const el=document.querySelector(`[data-layer="${key}"]`);el.hidden=labelOpacity<.001;
      el.style.transform=`translate(${(tmp.x+1)*innerWidth/2}px,${(1-tmp.y)*innerHeight/2}px)`;el.style.opacity=labelOpacity;
    }
  }
  function updateView(){
    const d=state.depth, index=clamp(Math.round(d),0,6),s=stops[index];
    $('depth').value=Math.round(d*100);$('depth').style.setProperty('--progress',`${d/6*100}%`);$('percent').textContent=Math.round(d/6*100)+'%';
    $('depth').setAttribute('aria-valuetext',s.eyebrow.replace(/^\d+ \/ /,'')+'，'+Math.round(d/6*100)+'%');
    $('position-dot').setAttribute('cx',lerp(stops[Math.floor(d)].dot,stops[Math.min(6,Math.floor(d)+1)].dot,d%1));
    if(index===state.stop)return;
    state.stop=index;$('eyebrow').textContent=s.eyebrow;$('title').innerHTML=s.title;$('fact').innerHTML=s.fact;$('temperature').textContent=s.temp;$('location').textContent=s.where;
    $('locator-label').textContent=index===0?'太空 → 核心':s.eyebrow.split(' / ')[1];
    document.querySelectorAll('[data-stop]').forEach((b,i)=>{if(i===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    if(state.sound&&s.audio)playAudio(s.audio);
  }
  function updatePlay(){
    $('fly').innerHTML=state.flying?'<span aria-hidden="true">Ⅱ</span> 暂停飞行':state.depth>=5.99?'<span aria-hidden="true">↻</span> 再飞一次':'<span aria-hidden="true">▷</span> '+(state.depth>.05?'继续飞行':'开始飞行');
  }
  function animateParticles(){
    const t=state.time;
    for(let i=0;i<n;i++){
      const p=particleData[i];let r,a=p.a,theta=p.theta;
      if(p.zone===0){const k=i%24,ph=p.phase+t*p.speed;a=(-137+(k%8)*13)*Math.PI/180;theta=.68+Math.floor(k/8)*.66; r=8.48+1.15*cos(ph)+(p.r-.5)*.15;theta+=.1*sin(ph)+.025*sin(4*ph+k);a+=.07*sin(3*ph+k)+(p.r-.5)*.015;const rising=sin(ph)<0;color[i*3]=rising?1:.55;color[i*3+1]=rising?.6:.12;color[i*3+2]=rising?.19:.015;}
      else if(p.zone===1){r=2.9+p.r*3.6+sin(t*p.speed+p.phase)*.13;a+=sin(t*.8+p.phase)*.035;theta+=cos(t*.67+p.phase)*.035;}
      else {r=.3+p.r*2;a+=t*p.speed*.12;theta+=sin(t*.4+p.phase)*.12;}
      pos[i*3]=r*sin(theta)*cos(a);pos[i*3+1]=r*cos(theta);pos[i*3+2]=-r*sin(theta)*sin(a);
    }
    geom.attributes.position.needsUpdate=true;geom.attributes.color.needsUpdate=true;
    const cycle=(t*.22)%1, approach=1-smooth(.12,.6,cycle),burst=smooth(.55,.61,cycle)*(1-smooth(.63,.95,cycle));
    nuclei.forEach((m,i)=>{const a=i*Math.PI*.5+t*.08,r=.11+approach*.72;m.position.set(cos(a)*r,sin(a)*r*.7,(i%2-.5)*r*.65);});
    $('reaction').textContent=cycle<.56?'4 个氢核，靠近了…':'聚变成氦核，释放能量';
    flash.material.opacity=burst*.8;flash.scale.setScalar(.3+burst*1.2);
    ring.material.opacity=burst*.4;ring.scale.setScalar(.25+smooth(.58,.95,cycle)*1.3);ring.lookAt(camera.position);
    if(coreMaterial)coreMaterial.emissiveIntensity=.8+.03*sin(t*.8);
  }
  // ============ 声音复用原版预生成 MP3 ============
  let audio=null;
  function stopAudio(){if(audio){audio.pause();audio=null;}}
  function playAudio(key){
    stopAudio();const item=window.NARRATION[key];if(!item)return;
    audio=new Audio('../'+item.audio);audio.volume=.75;
    audio.play().catch(()=>{if(audio){$('sound').textContent='点击听讲解';}});
  }
  $('sound').onclick=()=>{state.sound=!state.sound;$('sound').setAttribute('aria-pressed',state.sound);$('sound').setAttribute('aria-label',state.sound?'关闭讲解声音':'打开讲解声音');$('sound').textContent=state.sound?'声音开':'声音关';if(!state.sound)stopAudio();else if(stops[state.stop].audio)playAudio(stops[state.stop].audio);};
  // ============ 操作、响应式与暂停 ============
  $('fly').onclick=()=>{
    if(!state.ready)return;
    if(state.flying){state.flying=false;stopAudio();}
    else {if(state.depth>5.99){state.depth=0;state.stop=-1;}state.transition=null;state.cameraBlend={position:camera.position.clone(),target:controls.target.clone(),start:performance.now()};state.flying=true;setCamera(state.depth);}
    updatePlay();
  };
  $('overview').onclick=()=>seek(3);$('outside').onclick=()=>seek(0);
  $('depth').addEventListener('input',e=>seek(Number(e.target.value)/100,false));
  document.querySelectorAll('[data-stop]').forEach(b=>b.onclick=()=>seek(Number(b.dataset.stop)));
  controls.addEventListener('start',()=>{state.flying=false;state.transition=null;state.cameraBlend=null;updatePlay();});
  $('motion').onclick=()=>{state.motion=!state.motion;if(!state.motion){state.flying=false;state.transition=null;updatePlay();}updateMotion();};
  function updateMotion(){$('motion').textContent=state.motion?'暂停动画':'开启动画';$('motion').setAttribute('aria-pressed',!state.motion);$('motion').setAttribute('aria-label',state.motion?'暂停场景动画':'开启场景动画');}
  reduced.addEventListener('change',()=>{state.motion=!reduced.matches;if(!state.motion){state.flying=false;state.transition=null;}updateMotion();updatePlay();});updateMotion();
  $('about').onclick=()=>{state.flying=false;state.transition=null;updatePlay();stopAudio();$('info').showModal();};
  document.addEventListener('visibilitychange',()=>{if(document.hidden){state.flying=false;state.transition=null;stopAudio();updatePlay();}});
  window.addEventListener('pagehide',stopAudio);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();state.ready=false;state.flying=false;$('loading').hidden=false;fail('3D 显示中断了，可以重新加载继续探索。');});
  function resize(){
    const w=innerWidth,h=innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio,w<700?1.5:1.7));renderer.setSize(w,h);composer.setSize(w,h);
    camera.aspect=w/h;camera.clearViewOffset();
    if(w>600)camera.setViewOffset(w,h,-w*.105,0,w,h);
    else camera.setViewOffset(w,h,0,-h*.025,w,h);
    camera.fov=w<360?68:w<600?64:42;camera.updateProjectionMatrix();
  }
  window.addEventListener('resize',resize);resize();setCamera(0);
  let previous=performance.now();
  function frame(now){
    requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.06);previous=now;
    if(document.hidden||!state.ready)return;
    if(state.motion)state.time+=dt;
    if(state.flying){state.depth=Math.min(6,state.depth+dt/7.3);setCamera(state.depth);if(state.depth>=6){state.flying=false;updatePlay();}}
    else if(state.transition){const tr=state.transition,f=clamp((now-tr.start)/tr.duration,0,1);state.depth=lerp(tr.from,tr.to,smooth(0,1,f));setCamera(state.depth);if(f===1){state.transition=null;updatePlay();}}
    else controls.update();
    updateView();updateModel();animateParticles();renderer.info.reset();composer.render();
  }
  requestAnimationFrame(frame);
  // 只读诊断，便于确认模型加载与镜头所在位置。
  window.SolarPreview={get state(){return {depth:state.depth,stop:state.stop,ready:state.ready,flying:state.flying,motion:state.motion,meshes:model?(()=>{let n=0;model.traverse(o=>{if(o.isMesh)n++;});return n;})():0,camera:camera.position.toArray(),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,time:state.time,audio:audio?{src:audio.src,currentTime:audio.currentTime,paused:audio.paused}:null};}};
})();
