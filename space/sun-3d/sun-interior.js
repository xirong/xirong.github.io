/* 太阳专用内部画面：只接管对流区、辐射区、核心。
   复用已验收的 Blender 资产与预览的材质、流动和聚变动画，半径 10 缩到公共引擎的 1。
   公共深度条、温度计、卡片、声音仍由 Explorer dive 模块管理。 */
window.SunInterior = (() => {
  'use strict';
  const clamp = THREE.MathUtils.clamp, smooth = (a,b,x) => THREE.MathUtils.smoothstep(x,a,b), lerp=THREE.MathUtils.lerp;
  function buildScene(ctx, gltf, cloudMap, reaction) {
    const {camera,bloom}=ctx;
    const sun=new THREE.Group();sun.name='sun-blender-interior';sun.scale.setScalar(.1);sun.visible=false;
    const state={depth:3,time:0};
    const model=gltf.scene;sun.add(model);
    let cap,volume,paths,coreMaterial,meshCount=0;
    const shells=[];
    sun.add(new THREE.AmbientLight(0xffba76,.3));
    const light=new THREE.DirectionalLight(0xffe0b2,.6);light.position.set(15,20,30);sun.add(light);
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
  const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xaca99b,size:.018,transparent:true,opacity:.5,depthWrite:false}));sun.add(stars);
  // 对流光点沿 Blender 对流胞的同一参数路径移动。
  const n=3600, pos=new Float32Array(n*3), color=new Float32Array(n*3), particleData=[];
  const geom=new THREE.BufferGeometry();
  for(let i=0;i<n;i++){
    const zone=i<2000?0:i<3100?1:2;
    particleData.push({zone,phase:random()*Math.PI*2,a:lerp(-2.4,-.6,random()),theta:lerp(.45,2.7,random()),r:random(),speed:lerp(.25,.7,random())});
    const c=new THREE.Color(zone===0?0xff8b32:zone===1?0xffc571:0xffeab8);c.toArray(color,i*3);
  }
  geom.setAttribute('position',new THREE.BufferAttribute(pos,3));geom.setAttribute('color',new THREE.BufferAttribute(color,3));
  // PointsMaterial 的点尺寸不会跟随父物体缩放，需同步缩小为预览中的 1/10。
  const particles=new THREE.Points(geom,new THREE.PointsMaterial({map:glow,size:.0085,vertexColors:true,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending}));sun.add(particles);particles.visible=false;
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
  const cloudTexture=cloudMap;cloudTexture.encoding=THREE.sRGBEncoding;
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

    cap=model.getObjectByName('opening_cap');volume=model.getObjectByName('convection_volume');paths=model.getObjectByName('radiative_paths');
    model.traverse(obj=>{
      if(!obj.isMesh)return;
      meshCount++;
      obj.material=obj.material.clone();obj.material.side=THREE.DoubleSide;
      obj.material.emissiveIntensity=.6;
      if(obj.material.name==='hot_flow')obj.material.emissiveIntensity=.9;
      if(obj.name.startsWith('observed_surface'))obj.material.emissiveIntensity=1.05;
      if(obj.name==='core_surface'){coreMaterial=obj.material;obj.material.emissiveIntensity=.8;}
      if(obj.name.startsWith('volume_roll')||obj.name.startsWith('radiation_walk')||obj.name.startsWith('convection_volume')||obj.name.startsWith('radiative_paths')){
        obj.material.transparent=true;obj.material.depthWrite=false;obj.material.blending=THREE.AdditiveBlending;
        obj.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>','gl_FragColor.a *= smoothstep(0.05, 0.2, length(vViewPosition));\n#include <dithering_fragment>');};
        if(obj.name.startsWith('radiative_paths')){obj.material.color.set(0xa56117);obj.material.emissive.set(0xffa541);obj.material.emissiveIntensity=.6;}
      }
    });
    for(const name of ['convection','radiative','photosphere']){model.getObjectByName(name).traverse(o=>{if(o.isMesh)shells.push(o);});}
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
    fusion.visible=d>5.6;reaction.hidden=d<5.8;fusion.scale.setScalar(smooth(5.6,6,d));
    bloom.strength=lerp(.45,.62,smooth(3.5,6,d));
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
    reaction.textContent=cycle<.56?'4 个氢核，靠近了…':'聚变成氦核，释放能量';
    flash.material.opacity=burst*.8;flash.scale.setScalar(.3+burst*1.2);
    ring.material.opacity=burst*.4;ring.scale.setScalar(.25+smooth(.58,.95,cycle)*1.3);ring.lookAt(camera.position);
    if(coreMaterial)coreMaterial.emissiveIntensity=.8+.03*sin(t*.8);
  }
    ctx.scene.add(sun);
    return { root:sun, meshCount, update(depth,time){state.depth=depth;state.time=time;updateModel();animateParticles();} };
  }

  // ============ 载入与生命周期 ============
  function setup(ctx) {
    const {scene,camera,controls,renderer,bloom}=ctx;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const status=document.createElement('div');status.className='sun-interior-status';status.hidden=true;status.setAttribute('role','status');
    status.innerHTML='<span>正在准备太阳内部…</span><button type="button" hidden>重新加载</button>';
    const reaction=document.createElement('p');reaction.className='sun-interior-reaction';reaction.hidden=true;
    document.body.append(status,reaction);
    let view=null,pending=null,failed=false,enabled=false,active=false,time=0,depth=0,previousDepth=-1,previousSettled=false;
    let original=null,entryPose=null,entryAt=0;
    const visibility=new Map();
    const stopPoses=[
      {pos:[1,1.5,10.1],aim:[-.7,.4,6.7]},
      {pos:[1.7,1.2,6.7],aim:[-.4,0,2.2]},
      {pos:[.45,.25,1.9],aim:[0,0,0]},
    ];
    function dispose(object){object.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)[].concat(o.material).forEach(m=>{for(const v of Object.values(m))if(v&&v.isTexture)v.dispose();m.dispose();});});}
    function load(){
      if(view||pending)return pending;
      failed=false;status.querySelector('span').textContent='正在准备太阳内部…';status.querySelector('button').hidden=true;
      pending=Promise.allSettled([
        new Promise((resolve,reject)=>new THREE.GLTFLoader().load('interior-preview/assets/sun-interior.glb?v=6',resolve,undefined,reject)),
        new Promise((resolve,reject)=>new THREE.TextureLoader().load('interior-preview/assets/plasma-cloud.png?v=4',resolve,undefined,reject)),
      ]).then(results=>{
        if(results.some(r=>r.status==='rejected')){
          if(results[0].status==='fulfilled')dispose(results[0].value.scene);
          if(results[1].status==='fulfilled')results[1].value.dispose();
          throw new Error('太阳内部资产未加载完成');
        }
        view=buildScene(ctx,results[0].value,results[1].value,reaction);
        failed=false;status.hidden=true;
      }).catch(()=>{
        failed=true;status.querySelector('span').textContent='内部模型暂时没加载出来，先显示原来的剖面。';status.querySelector('button').hidden=false;
      }).finally(()=>{pending=null;});
      return pending;
    }
    status.querySelector('button').onclick=load;
    function hideExterior(){
      for(const child of scene.children){if(child===view.root)continue;if(!visibility.has(child))visibility.set(child,child.visible);child.visible=false;}
    }
    function restore(){
      if(!active)return;
      view.root.visible=false;reaction.hidden=true;
      for(const [object,visible] of visibility)object.visible=visible;visibility.clear();
      ctx.hooks.sun.setVisible(true);
      renderer.outputEncoding=original.encoding;renderer.toneMapping=original.mapping;renderer.toneMappingExposure=original.exposure;
      bloom.strength=original.bloomStrength;bloom.radius=original.bloomRadius;bloom.threshold=original.bloomThreshold;
      // 外层沿用原引擎按横向视野适配竖屏的方式，覆盖内部探索期间发生的窗口变化。
      const a=innerWidth/innerHeight;camera.aspect=a;camera.fov=a>=1?38:THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(19))/a));
      camera.near=original.near;camera.clearViewOffset();camera.updateProjectionMatrix();
      controls.minDistance=original.min;controls.maxDistance=original.max;controls.rotateSpeed=original.rotateSpeed;controls.target.set(0,0,0);controls.enabled=false;
      active=false;original=null;previousDepth=-1;previousSettled=false;
    }
    function activate(now){
      original={encoding:renderer.outputEncoding,mapping:renderer.toneMapping,exposure:renderer.toneMappingExposure,near:camera.near,min:controls.minDistance,max:controls.maxDistance,rotateSpeed:controls.rotateSpeed,bloomStrength:bloom.strength,bloomRadius:bloom.radius,bloomThreshold:bloom.threshold};
      entryPose={position:camera.position.clone(),target:camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()))};entryAt=now;
      active=true;view.root.visible=true;ctx.hooks.sun.setVisible(false);
      renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;
      camera.near=.0018;bloom.radius=.65;bloom.threshold=.76;controls.rotateSpeed=.45;
      hideExterior();
    }
    function pose(x){
      const v=clamp(x-5,0,2),i=Math.min(1,Math.floor(v)),f=smooth(0,1,v-i);
      return {position:new THREE.Vector3(...stopPoses[i].pos).lerp(new THREE.Vector3(...stopPoses[i+1].pos),f).multiplyScalar(.1),target:new THREE.Vector3(...stopPoses[i].aim).lerp(new THREE.Vector3(...stopPoses[i+1].aim),f).multiplyScalar(.1)};
    }
    ctx.hooks.diveView={
      enter(){enabled=true;depth=0;previousDepth=-1;load();},
      exit(){enabled=false;status.hidden=true;restore();reaction.hidden=true;},
      update(p){
        depth=p.depth;
        if(depth<=4.001){status.hidden=true;restore();return false;}
        if(!view){status.hidden=!enabled;return false;}
        status.hidden=true;
        if(!active)activate(p.now);
        const changed=Math.abs(depth-previousDepth)>1e-7;
        // 停稳时保留孩子拖动后的视角，换层时才沿原定镜头飞行。
        if(changed||!p.settled||!previousSettled||p.now-entryAt<1100){
          const next=pose(depth),arrival=reduced.matches?1:smooth(0,1,(p.now-entryAt)/1100);
          const ingress=smooth(4,5,depth),blend=Math.min(arrival,ingress);
          camera.position.lerpVectors(entryPose.position,next.position,blend);controls.target.lerpVectors(entryPose.target,next.target,blend);
          camera.lookAt(controls.target);
        }
        const w=innerWidth;camera.aspect=w/innerHeight;camera.fov=w<360?68:w<600?64:42;camera.clearViewOffset();camera.updateProjectionMatrix();
        controls.minDistance=depth>6.5?.035:.13;controls.maxDistance=depth>6.5?.6:2.4;
        controls.enabled=p.settled&&p.now-entryAt>=1100;controls.update();
        previousDepth=depth;previousSettled=p.settled;
        return true;
      },
      get state(){return {ready:!!view,loading:!!pending,failed,active,depth,meshes:view?view.meshCount:0,time};},
    };
    // SunLook 在自己的帧回调中管理外观和辉光；此回调排在后面，只在内部接管。
    ctx.onFrame((now,dt)=>{
      if(!enabled||!active||!view)return;
      if(!reduced.matches&&!document.hidden)time+=dt;
      hideExterior();view.update(Math.max(3,depth-1),time);
    });
  }
  return {setup};
})();
