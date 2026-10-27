/* Blender 内部模型的公共接入器。只由地球、木星主动启用；太阳保持原实现。
   深度、温度、卡片和旁白继续由 dive.js 管理，模型随同一深度参数变化。 */
window.BlenderInterior = (() => {
  'use strict';
  const clamp=THREE.MathUtils.clamp, lerp=THREE.MathUtils.lerp;
  const smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
  const vector=a=>new THREE.Vector3(...a);

  // ============ 科学模型与不同物态的动态 ============
  function makeView(ctx,config,gltf,cloudTexture) {
    const root=new THREE.Group();root.name=config.id+'-blender-interior';root.scale.setScalar(.1);root.visible=false;
    const model=gltf.scene;root.add(model);
    root.add(new THREE.HemisphereLight(0xdcecff,0x492919,.32));
    for(const [color,power,position] of [[0xffe0b0,.95,[14,18,22]],[0x82baff,.45,[-14,8,10]],[0xff7733,.18,[0,-8,4]]]) {
      const light=new THREE.DirectionalLight(color,power);light.position.copy(vector(position));root.add(light);
    }
    const groups={},meshes=[],flowMaterials=[];
    model.traverse(o=>{
      if(o.name)groups[o.name]=o;
      if(!o.isMesh)return;
      meshes.push(o);o.material=o.material.clone();o.material.side=THREE.DoubleSide;
      if(o.name.includes('ribbons')) {
        o.material.transparent=true;o.material.depthWrite=false;
        if(o.material.map)o.material.map=o.material.map.clone();
        flowMaterials.push(o.material);
      }
    });
    // 光点只标示流动路径，不表示能够直接看见的单个原子。
    const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
    const g=canvas.getContext('2d'),gradient=g.createRadialGradient(32,32,0,32,32,32);
    gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.2,'rgba(255,255,255,.7)');gradient.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=gradient;g.fillRect(0,0,64,64);const glow=new THREE.CanvasTexture(canvas);
    const tracers=new THREE.Group();root.add(tracers);
    const count=config.id==='earth'?360:850,positions=new Float32Array(count*3),colors=new Float32Array(count*3);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
    const points=new THREE.Points(geo,new THREE.PointsMaterial({map:glow,size:.005,transparent:true,vertexColors:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending}));tracers.add(points);
    // 地幔用方向箭头表示固体长期变形，保持岩石材质，不绘制熔岩池。
    const arrows=[];
    if(config.id==='earth')for(let i=0;i<10;i++) {
      const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,1,0),new THREE.Vector3(),.32,0xffce7a,.12,.065);
      root.add(arrow);arrows.push(arrow);
    }
    const cloudGroups=[];
    let rng=703;function random(){rng=(1664525*rng+1013904223)>>>0;return rng/4294967296;}
    if(cloudTexture) {
      cloudTexture.encoding=THREE.sRGBEncoding;
      // 预渲染云体放在不同三维位置；不是实时流体求解，也不是内部实拍。
      for(const [zone,num,r0,r1] of [['atmosphere',48,8.5,10.2],['liquid',40,6.9,9.4],['metallic',40,3.0,8.0],['core',65,.1,4.3]]) {
        const material=new THREE.MeshBasicMaterial({map:cloudTexture,color:0xffffff,toneMapped:false,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
        const cloud=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),material,num);cloud.frustumCulled=false;root.add(cloud);
        const seeds=Array.from({length:num},()=>({r:lerp(r0,r1,random()),a:lerp(-2.5,-.6,random()),theta:lerp(.3,2.8,random()),phase:random()*Math.PI*2,size:lerp(2.0,4.6,random())}));
        cloudGroups.push({zone,cloud,seeds});
      }
    }
    // 木星深层大气的短暂闪电，时间压缩示意，最多每 9 秒两次柔和闪光。
    const lightning=new THREE.Group();root.add(lightning);
    if(config.id==='jupiter') {
      const pts=[];for(let i=0;i<17;i++)pts.push(new THREE.Vector3(.5+Math.sin(i*2.6)*.18,1.1-i*.12,8.5+Math.cos(i)*.1));
      lightning.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xc7dfff,transparent:true,opacity:0})));
    }
    const dummy=new THREE.Object3D(),direction=new THREE.Vector3();
    function opacity(group,value) {
      if(!group)return;group.visible=value>.001;
      group.traverse(o=>{if(o.isMesh){o.material.transparent=value<.999;o.material.opacity=value;o.material.depthWrite=value>.8;}});
    }
    function flowPoint(k,t,r,dr){
      const a=-2.35+(k%8)*.22,theta=.6+Math.floor(k/8)*.56;
      const rr=r+dr*Math.cos(t),th=theta+.13*Math.sin(t)+.04*Math.sin(t*3+k),az=a+.17*Math.sin(t)+.05*Math.sin(t*2+k);
      return new THREE.Vector3(rr*Math.sin(th)*Math.cos(az),rr*Math.cos(th)*(config.flatten||1),-rr*Math.sin(th)*Math.sin(az));
    }
    function update(depth,time,overview,motion) {
      const x=clamp(depth-config.first,0,config.stops.length-1),i=Math.min(config.stops.length-2,Math.floor(x)),f=smooth(0,1,x-i);
      const from=config.stops[i],to=config.stops[i+1],here=config.stops[Math.round(x)];
      config.groups.forEach(name=>opacity(groups[name],overview? (config.overviewOpacity?.[name]??1):lerp(from.opacity[name]??1,to.opacity[name]??1,f)));
      for(const m of flowMaterials)if(m.map)m.map.offset.x=time*.018;
      const flow=overview?null:(from.flow||to.flow);
      for(const name of ['outer_core','liquid','metallic','core'])opacity(groups[name+'_flow'],overview?0:lerp(from.flow===name?.16:0,to.flow===name?.16:0,f));
      tracers.visible=!!flow;
      if(flow) {
        const fa=config.flows[from.flow]||config.flows[flow],fb=config.flows[to.flow]||fa;
        const r=lerp(fa[0],fb[0],f),dr=lerp(fa[1],fb[1],f),n=fb[2];
        points.material.opacity=lerp(from.flow?.65:0,to.flow?.65:0,f);
        for(let j=0;j<count;j++) {
          const p=flowPoint(j%n,time*.27+j*2.399,r,dr);p.toArray(positions,j*3);
          const c=new THREE.Color(config.id==='earth'? (j%3?0xffa742:0xffdf94):(j%3?0xa4d8ff:0xf4bc78));c.toArray(colors,j*3);
        }
        geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;
      }
      arrows.forEach((arrow,k)=>{
        arrow.visible=!overview&&!!here.mantle;
        if(!arrow.visible)return;
        const [r,dr]=here.mantle,ph=time*.22+k*.63,th=.55+(k%5)*.5,a=k<5?-.64:-2.5;
        function point(t){const rr=r+dr*Math.cos(t),theta=th+.08*Math.sin(t);return new THREE.Vector3(rr*Math.sin(theta)*Math.cos(a),rr*Math.cos(theta),-rr*Math.sin(theta)*Math.sin(a));}
        arrow.position.copy(point(ph));direction.copy(point(ph+.04)).sub(arrow.position).normalize();arrow.setDirection(direction);arrow.setColor(Math.sin(ph)<0?0xffb65f:0xa5c9e1);
      });
      for(const entry of cloudGroups) {
        const amount=overview?(entry.zone==='core'?.35:0):lerp(from.clouds?.[entry.zone]||0,to.clouds?.[entry.zone]||0,f);
        entry.cloud.visible=amount>.001;entry.cloud.material.opacity=amount;
        const tint=entry.zone==='metallic'?0x8eacd4:entry.zone==='core'?0xc58a57:0xe3bc88;entry.cloud.material.color.set(tint);
        if(!entry.cloud.visible)continue;
        entry.seeds.forEach((p,k)=>{
          const a=p.a+Math.sin(time*.06+p.phase)*.06,th=p.theta+Math.sin(time*.04+p.phase)*.02;
          dummy.position.set(p.r*Math.sin(th)*Math.cos(a),p.r*Math.cos(th)*(config.flatten||1),-p.r*Math.sin(th)*Math.sin(a));
          dummy.quaternion.copy(ctx.camera.quaternion);dummy.rotateZ(p.phase+time*.006);dummy.scale.setScalar(p.size);dummy.updateMatrix();entry.cloud.setMatrixAt(k,dummy.matrix);
        });entry.cloud.instanceMatrix.needsUpdate=true;
      }
      lightning.visible=!overview&&here.id==='atmosphere'&&motion;
      if(lightning.children[0]) {
        const t=time%9,k=Math.exp(-Math.pow((t-5)/.1,2))*.7+Math.exp(-Math.pow((t-5.7)/.16,2))*.4;
        lightning.children[0].material.opacity=k;
      }
      ctx.bloom.strength=config.id==='earth'?.22:.3;
    }
    ctx.scene.add(root);
    return {root,meshes:meshes.length,update};
  }

  // ============ 模型载入、镜头与离开时复原 ============
  function setup(ctx,config) {
    const {camera,controls,renderer,bloom,scene}=ctx;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const hud=document.createElement('div');hud.className='blender-interior-hud';hud.hidden=true;
    hud.innerHTML='<p></p><div><button type="button" class="interior-overview" aria-pressed="false">看整体剖面</button><button type="button" class="interior-motion">暂停运动</button></div>';
    const status=document.createElement('div');status.className='blender-interior-status';status.hidden=true;status.setAttribute('role','status');
    status.innerHTML='<span></span><button type="button" hidden>重新加载</button>';document.body.append(hud,status);
    const overviewButton=hud.querySelector('.interior-overview'),motionButton=hud.querySelector('.interior-motion');
    let enabled=false,active=false,view=null,pending=null,failed=false,depth=0,time=0,motion=!reduced.matches,overview=false;
    let original=null,entry=null,entryAt=0,previous=-1,settledBefore=false,forceCamera=true,cameraBlend=null;
    const visibility=new Map();
    function dispose(o){o.traverse(m=>{m.geometry?.dispose();if(m.material)[].concat(m.material).forEach(mat=>{Object.values(mat).forEach(v=>{if(v?.isTexture)v.dispose();});mat.dispose();});});}
    function load(){
      if(view||pending)return pending;failed=false;status.querySelector('span').textContent='正在准备'+ctx.body.name+'内部…';status.querySelector('button').hidden=true;
      pending=Promise.allSettled([
        new Promise((resolve,reject)=>new THREE.GLTFLoader().load(config.model,resolve,undefined,reject)),
        config.cloud?new Promise((resolve,reject)=>new THREE.TextureLoader().load(config.cloud,resolve,undefined,reject)):Promise.resolve(null),
      ]).then(results=>{
        if(results.some(r=>r.status==='rejected')){if(results[0].status==='fulfilled')dispose(results[0].value.scene);if(results[1].status==='fulfilled')results[1].value?.dispose();throw new Error('模型素材未加载完成');}
        view=makeView(ctx,config,results[0].value,results[1].value);status.hidden=true;
      }).catch(()=>{failed=true;status.querySelector('span').textContent='模型暂时没加载出来，先显示原来的画面。';status.querySelector('button').hidden=false;}).finally(()=>{pending=null;});return pending;
    }
    status.querySelector('button').onclick=load;
    function setOverview(on){overview=on;overviewButton.textContent=on?'回到这一层':'看整体剖面';overviewButton.setAttribute('aria-pressed',String(on));cameraBlend={position:camera.position.clone(),target:controls.target.clone(),at:performance.now()};forceCamera=true;}
    overviewButton.onclick=()=>setOverview(!overview);
    function motionLabel(){motionButton.textContent=motion?'暂停运动':'继续运动';motionButton.setAttribute('aria-pressed',String(!motion));}
    motionButton.onclick=()=>{motion=!motion;motionLabel();};motionLabel();
    reduced.addEventListener('change',()=>{motion=!reduced.matches;motionLabel();});
    function hideExterior(){for(const child of scene.children){if(child===view.root)continue;if(!visibility.has(child))visibility.set(child,child.visible);child.visible=false;}}
    function restore(){
      hud.hidden=true;document.body.classList.remove('has-blender-interior');if(!active)return;view.root.visible=false;
      for(const [o,visible] of visibility)o.visible=visible;visibility.clear();ctx.hooks.sun.setVisible(true);
      renderer.outputEncoding=original.encoding;renderer.toneMapping=original.mapping;renderer.toneMappingExposure=original.exposure;
      bloom.strength=original.strength;bloom.radius=original.radius;bloom.threshold=original.threshold;
      camera.near=original.near;camera.far=original.far;camera.aspect=innerWidth/innerHeight;camera.fov=camera.aspect>=1?38:THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(19))/camera.aspect));camera.clearViewOffset();camera.updateProjectionMatrix();
      controls.minDistance=original.min;controls.maxDistance=original.max;controls.rotateSpeed=original.rotate;controls.target.set(0,0,0);controls.enabled=false;
      active=false;original=null;previous=-1;settledBefore=false;cameraBlend=null;
    }
    function activate(now){
      original={encoding:renderer.outputEncoding,mapping:renderer.toneMapping,exposure:renderer.toneMappingExposure,near:camera.near,far:camera.far,min:controls.minDistance,max:controls.maxDistance,rotate:controls.rotateSpeed,strength:bloom.strength,radius:bloom.radius,threshold:bloom.threshold};
      entry={position:camera.position.clone(),target:camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()))};entryAt=now;
      active=true;document.body.classList.add('has-blender-interior');view.root.visible=true;ctx.hooks.sun.setVisible(false);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.82;
      camera.near=.04;camera.far=30;bloom.radius=.5;bloom.threshold=.85;controls.rotateSpeed=.35;hideExterior();
    }
    function pose(d){
      if(overview)return {position:vector(config.overview.pos).multiplyScalar(.1),target:vector(config.overview.aim).multiplyScalar(.1)};
      const x=clamp(d-config.first,0,config.stops.length-1),i=Math.min(config.stops.length-2,Math.floor(x)),f=smooth(0,1,x-i);
      return {position:vector(config.stops[i].pos).lerp(vector(config.stops[i+1].pos),f).multiplyScalar(.1),target:vector(config.stops[i].aim).lerp(vector(config.stops[i+1].aim),f).multiplyScalar(.1)};
    }
    ctx.hooks.diveView={
      enter(){enabled=true;previous=-1;overview=false;overviewButton.textContent='看整体剖面';overviewButton.setAttribute('aria-pressed','false');load();},
      exit(){enabled=false;status.hidden=true;restore();},
      update(p){
        depth=p.depth;
        if(depth<=config.first-1+.001){status.hidden=true;restore();return false;}
        if(!view){status.hidden=!enabled;return false;}status.hidden=true;
        if(!active)activate(p.now);hud.hidden=false;
        const changed=Math.abs(depth-previous)>1e-7;
        if(changed&&previous>=0&&overview)setOverview(false);
        const here=config.stops[Math.round(clamp(depth-config.first,0,config.stops.length-1))];
        hud.querySelector('p').textContent=overview?'分层定位示意 · '+here.label:here.note;
        if(changed||!p.settled||!settledBefore||forceCamera||cameraBlend||p.now-entryAt<1100){
          const next=pose(depth),blend=Math.min(reduced.matches?1:smooth(0,1,(p.now-entryAt)/1100),smooth(config.first-1,config.first,depth));
          camera.position.lerpVectors(entry.position,next.position,blend);controls.target.lerpVectors(entry.target,next.target,blend);
          if(cameraBlend){const f=reduced.matches?1:smooth(0,1,(p.now-cameraBlend.at)/900);camera.position.lerpVectors(cameraBlend.position,next.position,f);controls.target.lerpVectors(cameraBlend.target,next.target,f);if(f>=1)cameraBlend=null;}
          camera.lookAt(controls.target);forceCamera=false;
        }
        camera.near=clamp(camera.position.distanceTo(controls.target)*.06,.008,.15);camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<400?66:innerWidth<700?58:42;camera.updateProjectionMatrix();
        controls.minDistance=overview?1.35:.06;controls.maxDistance=6;controls.enabled=p.settled&&p.now-entryAt>=1100&&!cameraBlend;controls.update();
        previous=depth;settledBefore=p.settled;return true;
      },
      get state(){return {active,ready:!!view,loading:!!pending,failed,depth,time,motion,overview,meshes:view?.meshes||0,body:config.id};},
    };
    ctx.onFrame((now,dt)=>{if(!enabled||!active||!view)return;if(motion&&!document.hidden)time+=dt;hideExterior();view.update(depth,time,overview,motion);});
  }
  return {setup};
})();
