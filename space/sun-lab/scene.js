/* Three.js r128，所有外部纹理均本地加载。内部运动是教学模型。 */
window.SolarScene = class SolarScene {
  constructor(host, labelHost, onPick) {
    this.host = host; this.labelHost = labelHost; this.onPick = onPick;
    this.R = 4.2; this.time = 0; this.mode = 'observe'; this.selected = 'sun';
    this.cut = 0; this.cutTarget = 0; this.spectrum = 'euv'; this.detail = false;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.paused = this.reduced; this.measureProgress = 1; this.labels = []; this.updaters = [];
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#080b10');
    this.camera = new THREE.PerspectiveCamera(38, 1, .05, 300);
    this.renderer = new THREE.WebGLRenderer({antialias:true, alpha:false, powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.host.appendChild(this.renderer.domElement);
    this.renderer.domElement.setAttribute('aria-label', '拖动旋转太阳，滚轮或双指缩放；也可使用页面上的层级按钮');
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; this.controls.dampingFactor = .065;
    this.controls.enablePan = false; this.controls.rotateSpeed = .55;
    this.controls.minDistance = 6; this.controls.maxDistance = 42;
    this.controls.addEventListener('start', () => { this.cameraMove = null; });
    this.sunGroup = new THREE.Group(); this.scene.add(this.sunGroup);
    this.detailGroup = new THREE.Group(); this.detailGroup.visible = false; this.scene.add(this.detailGroup);
    this.measureGroup = new THREE.Group(); this.measureGroup.visible = false; this.scene.add(this.measureGroup);
    this.scene.add(new THREE.AmbientLight('#ffffff', .85));
    const light = new THREE.DirectionalLight('#fff5dd', 1.1); light.position.set(-4,5,8); this.scene.add(light);
    this.raycaster = new THREE.Raycaster(); this.pickTargets = [];
    this.createStars(); this.spriteTexture = this.makeSprite();
    this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(host);
    this.resize(); this.bindPointer();
    this.renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault(); this.contextLost = true;
      window.dispatchEvent(new CustomEvent('solar-render-error', {detail:'三维画面暂时中断。请重新加载，恢复太阳实验室。'}));
    });
    this.ready = this.loadTextures().then(() => {
      this.createSun(); this.createActivity(); this.createDetails(); this.createMeasures();
      this.setView('observe', 'sun'); this.loaded = true;
    });
    this.lastTime = performance.now(); this.animate = this.animate.bind(this); this.frame = requestAnimationFrame(this.animate);
  }

  // ============ 资源与基础场景 ============
  async loadTextures() {
    const loader = new THREE.TextureLoader();
    const load = path => new Promise((resolve,reject) => loader.load(path, t => {
      t.anisotropy = Math.min(8,this.renderer.capabilities.getMaxAnisotropy()); resolve(t);
    }, undefined, () => reject(new Error('无法加载素材：' + path))));
    [this.sunTexture,this.earthTexture,this.spotTexture,this.granuleTexture] = await Promise.all([
      load('../textures/sun.jpg'),load('../textures/earth_daymap.jpg'),load('assets/sunspot-observation.jpg'),load('assets/granules-observation.jpg')
    ]);
    this.earthTexture.encoding = THREE.sRGBEncoding;
  }
  makeSprite() {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d'); const g = ctx.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.15,'rgba(255,240,200,.9)');
    g.addColorStop(.4,'rgba(255,200,120,.2)');g.addColorStop(1,'rgba(255,160,80,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,64,64);return new THREE.CanvasTexture(canvas);
  }
  createStars() {
    let seed=21; const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    this.random=rand; const positions=[];
    for(let i=0;i<450;i++){const v=new THREE.Vector3(rand()-.5,rand()-.5,rand()-.5).normalize().multiplyScalar(65+rand()*35);positions.push(v.x,v.y,v.z);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    this.stars=new THREE.Points(g,new THREE.PointsMaterial({color:'#aeb8ca',size:.08,transparent:true,opacity:.42,depthWrite:false}));this.scene.add(this.stars);
  }
  pointMaterial(color='#ffd594',size=.1){return new THREE.PointsMaterial({color,size,map:this.spriteTexture,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});}
  glow(color,size){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:this.spriteTexture,color,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));s.scale.setScalar(size);return s;}
  line(points,color='#ffd391',opacity=1){const g=new THREE.BufferGeometry().setFromPoints(points);return new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity}));}
  sphere(radius,color){return new THREE.Mesh(new THREE.SphereGeometry(radius,40,28),new THREE.MeshBasicMaterial({color}));}
  resize(){
    const w=Math.max(1,this.host.clientWidth),h=Math.max(1,this.host.clientHeight);
    this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
    this.fitDistance=15.3/Math.min(1,w/h);this.controls.maxDistance=Math.max(45,this.fitDistance*2);
    if(!this.loaded || !this.detail)this.resetCamera(false);
  }
  resetCamera(animate=true){
    const distance=this.detail ? 16/Math.min(1,this.camera.aspect) : this.fitDistance;
    const angle=this.mode==='interior'&&!this.detail?.20:0;
    const position=new THREE.Vector3(Math.sin(angle)*distance, this.detail?1.4:(this.mode==='interior'?2.2:.9), Math.cos(angle)*distance);
    const target=new THREE.Vector3(0, this.detail?0:-.15, 0);
    if(animate&&!this.reduced)this.cameraMove={from:this.camera.position.clone(),to:position,start:performance.now(),targetFrom:this.controls.target.clone(),targetTo:target};
    else{this.camera.position.copy(position);this.controls.target.copy(target);this.controls.update();this.cameraMove=null;}
  }
  setLabels(items){
    this.labelHost.replaceChildren();this.labels=items.map(item=>{
      const el=document.createElement('span');el.className='scene-label';el.textContent=item.text;this.labelHost.appendChild(el);
      return{...item,el};
    });
  }
  updateLabels(){
    const w=this.host.clientWidth,h=this.host.clientHeight;
    for(const label of this.labels){
      const p=typeof label.position==='function'?label.position():label.position.clone();
      if(label.parent)label.parent.localToWorld(p);
      p.project(this.camera);label.el.style.left=((p.x+1)*w/2)+'px';label.el.style.top=((-p.y+1)*h/2)+'px';
      label.el.hidden=p.z>1||p.z< -1||Math.abs(p.x)>.95||Math.abs(p.y)>.9;
    }
    const handle=document.getElementById('cut-handle');
    if(handle&&!handle.hidden){const p=new THREE.Vector3(Math.sin(this.cut)*this.R,0,Math.cos(this.cut)*this.R).project(this.camera);handle.style.left=THREE.MathUtils.clamp((p.x+1)*w/2,32,w-32)+'px';handle.style.top=THREE.MathUtils.clamp((-p.y+1)*h/2,120,h-180)+'px';}
  }

  // ============ 太阳外观与真实三维剖面 ============
  createSun(){
    const vertex=`varying vec2 vUv;varying vec3 vPos;varying vec3 vNormal;varying vec3 vWorld;
      void main(){vUv=uv;vPos=position;vNormal=normalize(mat3(modelMatrix)*normal);vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
    const wedge=`float angle=atan(vPos.x,vPos.z);if(angle<0.)angle+=6.2831853;if(cut>0.002&&angle<cut)discard;`;
    this.sunUniforms={map:{value:this.sunTexture},cut:{value:0},time:{value:0},visibleLight:{value:0},flare:{value:0}};
    this.sunMaterial=new THREE.ShaderMaterial({uniforms:this.sunUniforms,vertexShader:vertex,fragmentShader:`
      uniform sampler2D map;uniform float cut,time,visibleLight,flare;
      varying vec2 vUv;varying vec3 vPos,vNormal,vWorld;
      void main(){${wedge}
        vec2 uv=vUv;uv.x+=time*.001;uv+=vec2(sin(vUv.y*60.+time*.15),cos(vUv.x*70.+time*.13))*.0006;
        vec3 tex=texture2D(map,uv).rgb;
        float luminance=dot(tex,vec3(.2126,.7152,.0722));
        float mu=max(dot(normalize(cameraPosition-vWorld),normalize(vNormal)),0.);
        vec3 warm=pow(tex,vec3(1.1))*.95+vec3(.11,.025,.005);
        vec3 white=vec3(.98,.95,.88)*(.55+luminance*.5)*(.4+.6*pow(mu,.4));
        vec3 col=mix(warm,white,visibleLight);
        float bright=exp(-length(vUv-vec2(.22,.56))*35.)*flare;
        col+=vec3(1.,.65,.25)*bright;
        gl_FragColor=vec4(col,1.);
      }`});
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(this.R,144,96),this.sunMaterial);mesh.userData={id:'photosphere',outer:true};
    this.sunGroup.add(mesh);this.surface=mesh;this.pickTargets.push(mesh);
    this.interiorGroup=new THREE.Group();this.sunGroup.add(this.interiorGroup);this.shellMaterials=[];this.cutFaces=[];
    const rings=[{inner:0,outer:.25,color:'#ffe2a0',id:'core',kind:0},{inner:.25,outer:.70,color:'#ce6f36',id:'radiative',kind:1},{inner:.70,outer:.992,color:'#af4324',id:'convection',kind:2},{inner:.992,outer:1,color:'#ffe4a2',id:'photosphere',kind:3},{inner:1,outer:1.014,color:'#d9685e',id:'chromosphere',kind:3},{inner:1.014,outer:1.022,color:'#ae98c6',id:'transition',kind:3}];
    for(const ring of rings){
      const uniforms={map:{value:this.sunTexture},cut:{value:0},time:{value:0},color:{value:new THREE.Color(ring.color)},kind:{value:ring.kind},highlight:{value:0}};
      const material=new THREE.ShaderMaterial({uniforms,side:THREE.DoubleSide,vertexShader:vertex,fragmentShader:`
        uniform sampler2D map;uniform vec3 color;uniform float cut,time,kind,highlight;varying vec2 vUv;varying vec3 vPos,vNormal,vWorld;
        void main(){${wedge} float t=texture2D(map,vUv).r;gl_FragColor=vec4(color*(.55+t*.35)+highlight*.08,1.);}`});
      if(ring.outer<=1){const sphere=new THREE.Mesh(new THREE.SphereGeometry(this.R*ring.outer*.998,96,64),material);this.interiorGroup.add(sphere);}
      this.shellMaterials.push(material);
      for(let side=0;side<2;side++){
        const faceMaterial=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{...uniforms,cut:{value:0}},vertexShader:vertex,fragmentShader:`
          uniform sampler2D map;uniform vec3 color;uniform float time,kind,highlight;varying vec2 vUv;varying vec3 vPos,vNormal,vWorld;
          void main(){float r=length(vPos.xy)/4.2;float a=atan(vPos.y,vPos.x);
            vec2 uv=vec2(a/6.283+time*.002,r*1.2);float tex=texture2D(map,uv).r;
            float flow=sin(a*26.+sin(r*38.-time*.5)*1.3)*.5+.5;
            float gain=.70+tex*.30;
            if(kind>1.5&&kind<2.5)gain=.55+tex*.35+flow*.18;
            if(kind<.5)gain=.75+.25*(1.-r*2.);
            vec3 col=color*gain+vec3(1.,.7,.3)*highlight*.12;
            gl_FragColor=vec4(col,1.);}`});
        const geometry=new THREE.RingGeometry(this.R*ring.inner,this.R*ring.outer,128,2,-Math.PI/2,Math.PI);
        const face=new THREE.Mesh(geometry,faceMaterial);face.userData={id:ring.id,side};face.rotation.y=-Math.PI/2;
        this.interiorGroup.add(face);this.cutFaces.push(face);this.pickTargets.push(face);
      }
    }
    this.atmosphere=this.glow('#ef6f1c',this.R*3.7);this.atmosphere.material.opacity=.45;this.sunGroup.add(this.atmosphere);
    this.interiorGroup.visible=false;
  }
  setCut(value){this.cutTarget=THREE.MathUtils.clamp(value,0,1)*2.16;if(this.reduced){this.cut=this.cutTarget;this.updateCut();}}
  updateCut(){
    this.sunUniforms.cut.value=this.cut;this.interiorGroup.visible=this.cut>.002;
    this.shellMaterials.forEach(m=>m.uniforms.cut.value=this.cut);
    this.cutFaces.forEach(face=>{face.rotation.y=(face.userData.side?this.cut:0)-Math.PI/2;});
  }
  setSpectrum(value){this.spectrum=value;this.sunUniforms.visibleLight.value=value==='visible'?1:0;this.atmosphere.material.opacity=value==='visible'?.08:.45;this.atmosphere.material.color.set(value==='visible'?'#e1d8bd':'#ef6f1c');this.updateVisibility();}
  highlightLayer(id){for(const face of this.cutFaces)face.material.uniforms.highlight.value=face.userData.id===id?1:0;}

  // ============ 日珥、日冕环与活动区域 ============
  addArc(group,normal,height,width,color,phase=0){
    const tangent=new THREE.Vector3().crossVectors(normal,new THREE.Vector3(0,1,0)).normalize();
    if(tangent.length()<.1)tangent.set(1,0,0);
    const points=[];for(let i=0;i<=60;i++){const t=i/60;points.push(normal.clone().multiplyScalar(this.R+Math.sin(t*Math.PI)*height).addScaledVector(tangent,Math.cos(t*Math.PI)*width));}
    const curve=new THREE.CatmullRomCurve3(points);
    const line=new THREE.Mesh(new THREE.TubeGeometry(curve,60,.012,4,false),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));group.add(line);
    const dot=this.glow(color,.18);group.add(dot);this.updaters.push(t=>{if(group.visible)dot.position.copy(curve.getPoint((t*.07+phase)%1));});
  }
  createActivity(){
    this.activity=new THREE.Group();this.sunGroup.add(this.activity);
    const normals=[new THREE.Vector3(-.91,.16,.3).normalize(),new THREE.Vector3(.9,-.1,.35).normalize(),new THREE.Vector3(.35,.83,.35).normalize(),new THREE.Vector3(-.45,-.78,.3).normalize()];
    normals.forEach((n,j)=>{for(let i=0;i<9;i++)this.addArc(this.activity,n,.4+i*.075,.25+i*.04,i%3?'#ff8a32':'#ffd38b',j*.2+i*.08);});
    this.spotGroup=new THREE.Group();this.sunGroup.add(this.spotGroup);
    const spot=new THREE.Mesh(new THREE.PlaneGeometry(1.22,.86),new THREE.ShaderMaterial({
      uniforms:{map:{value:this.spotTexture},visibleLight:this.sunUniforms.visibleLight},transparent:true,depthWrite:false,
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform sampler2D map;uniform float visibleLight;varying vec2 vUv;void main(){float r=length((vUv-.5)*2.);float a=1.-smoothstep(.65,1.,r);float t=texture2D(map,vUv).r;vec3 tint=mix(vec3(1.,.51,.16),vec3(.92,.89,.82),visibleLight);gl_FragColor=vec4(tint*(t*.9+.02),a);}'
    }));
    const n=new THREE.Vector3(-.4,.15,.9).normalize();spot.position.copy(n.multiplyScalar(this.R+.035));spot.lookAt(spot.position.clone().multiplyScalar(2));spot.userData={id:'sunspot'};this.spotGroup.add(spot);this.pickTargets.push(spot);
    this.flareGlow=this.glow('#fff2bd',1);this.flareGlow.position.set(-1.5,.6,4);this.flareGlow.visible=false;this.sunGroup.add(this.flareGlow);
    this.flareStart=-100;
  }
  triggerFlare(){this.flareStart=this.time;this.flareGlow.visible=true;}
  updateVisibility(){
    if(!this.activity)return;
    this.activity.visible=this.mode==='observe'&&!this.detail&&(this.spectrum==='euv'||this.selected==='prominence');
    this.atmosphere.visible=!this.detail&&this.mode==='observe';this.spotGroup.visible=this.mode==='observe'&&!this.detail;
  }

  // ============ 局部教学场景 ============
  createDetails(){
    this.details={};
    const add=(id)=>{const group=new THREE.Group();group.visible=false;this.detailGroup.add(group);this.details[id]=group;return group;};
    const core=add('core');
    const coreGlow=this.glow('#ff8f26',13);coreGlow.material.opacity=.3;core.add(coreGlow);
    const protons=[];for(let i=0;i<4;i++){const g=this.sphere(.34,'#ffb75a');g.add(this.glow('#ffab40',1.5));core.add(g);protons.push(g);}
    const helium=new THREE.Group();for(let i=0;i<4;i++){const n=this.sphere(.34,i%2?'#fff1b8':'#ffb75a');n.position.set((i%2-.5)*.48,(Math.floor(i/2)-.5)*.48,0);helium.add(n);}core.add(helium);helium.add(this.glow('#fff1b1',2.5));
    const rays=[];for(let i=0;i<28;i++){const p=this.glow('#ffeac1',.16);p.userData.dir=new THREE.Vector3(this.random()-.5,this.random()-.5,this.random()-.5).normalize();core.add(p);rays.push(p);}
    this.updaters.push(t=>{if(!core.visible)return;const phase=(t%8)/8;helium.visible=phase>.57;helium.scale.setScalar(.8+Math.sin(t)*.05);
      protons.forEach((p,i)=>{const a=i*Math.PI/2+t*.12;const d=3.2*(1-Math.min(1,phase/.6))+.2;p.position.set(Math.cos(a)*d,Math.sin(a)*d,.2*Math.sin(a*2));p.visible=phase<.6;});
      rays.forEach((p,i)=>{p.visible=phase>.6;p.position.copy(p.userData.dir).multiplyScalar(Math.max(0,phase-.6)*15+(i%3)*.1);p.material.opacity=Math.max(0,1-(phase-.6)*2);});
    });
    const radiative=add('radiative');
    const radHalo=this.glow('#ed8e49',13);radHalo.material.opacity=.16;radiative.add(radHalo);
    const count=180,positions=new Float32Array(count*3),states=[];
    for(let i=0;i<count;i++){const p=new THREE.Vector3((this.random()-.5)*7,(this.random()-.5)*6,(this.random()-.5)*3);states.push({p,dir:new THREE.Vector3(this.random()-.5,this.random()-.5,this.random()-.5).normalize(),next:this.random()});}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));const dots=new THREE.Points(geo,this.pointMaterial('#ffd5a3',.17));radiative.add(dots);
    const route=[];let current=new THREE.Vector3(-3,-1,0);for(let i=0;i<30;i++){route.push(current.clone());current.add(new THREE.Vector3(.22+(this.random()-.5)*.5,(this.random()-.5)*1.4,(this.random()-.5)*.5));}radiative.add(this.line(route,'#d59659',.45));
    this.updaters.push((t,dt)=>{if(!radiative.visible)return;states.forEach((s,i)=>{if(t>s.next){s.dir.set(this.random()-.5,this.random()-.5,this.random()-.5).normalize();s.next=t+.2+this.random()*.8;}s.p.addScaledVector(s.dir,dt*.75);['x','y','z'].forEach((k,j)=>{const bound=j===2?1.8:3.5;if(Math.abs(s.p[k])>bound)s.dir[k]=-Math.sign(s.p[k])*Math.abs(s.dir[k]);});positions[i*3]=s.p.x;positions[i*3+1]=s.p.y;positions[i*3+2]=s.p.z;});geo.attributes.position.needsUpdate=true;});
    const convection=add('convection');
    const bottom=this.glow('#dc6228',10);bottom.position.y=-2.2;bottom.material.opacity=.18;convection.add(bottom);
    for(let j=0;j<4;j++){
      const points=[];for(let i=0;i<=100;i++){const a=i/100*Math.PI*2;points.push(new THREE.Vector3((j-1.5)*1.95+Math.cos(a)*.8,Math.sin(a)*2.15,Math.sin(a*2)*.25));}
      const curve=new THREE.CatmullRomCurve3(points);convection.add(this.line(points,j%2?'#bf8661':'#e8a257',.4));
      for(let k=0;k<12;k++){const p=this.glow('#ffcc82',.20);convection.add(p);this.updaters.push(t=>{if(!convection.visible)return;const u=(t*.065+k/12)%1;p.position.copy(curve.getPoint(u));p.material.color.set(p.position.x>(j-1.5)*1.95?'#ffd18b':'#b47f78');});}
    }
    const fluidCount=1100,fluidPos=new Float32Array(fluidCount*3),fluidColors=new Float32Array(fluidCount*3),fluidSeeds=[];
    for(let i=0;i<fluidCount;i++)fluidSeeds.push({cell:i%4,phase:this.random()*Math.PI*2,width:.45+this.random()*.55,depth:(this.random()-.5)*1.7});
    const fluidGeo=new THREE.BufferGeometry();fluidGeo.setAttribute('position',new THREE.BufferAttribute(fluidPos,3));fluidGeo.setAttribute('color',new THREE.BufferAttribute(fluidColors,3));
    const fluidMaterial=this.pointMaterial('#ffffff',.12);fluidMaterial.vertexColors=true;fluidMaterial.opacity=.6;convection.add(new THREE.Points(fluidGeo,fluidMaterial));
    this.updaters.push(t=>{if(!convection.visible)return;fluidSeeds.forEach((s,i)=>{const a=t*.41+s.phase,x=Math.cos(a);fluidPos[i*3]=(s.cell-1.5)*1.95+x*s.width;fluidPos[i*3+1]=Math.sin(a)*2.1;fluidPos[i*3+2]=s.depth+.15*Math.sin(a*2);fluidColors[i*3]=x>0?1:.65;fluidColors[i*3+1]=x>0?.5:.24;fluidColors[i*3+2]=x>0?.16:.12;});fluidGeo.attributes.position.needsUpdate=true;fluidGeo.attributes.color.needsUpdate=true;});
    const photo=add('photosphere'),spot=add('sunspot');
    [photo,spot].forEach(group=>{
      const plane=new THREE.Mesh(new THREE.PlaneGeometry(8,group===photo?8:4,50,35),new THREE.MeshBasicMaterial({map:group===photo?this.granuleTexture:this.spotTexture,color:'#ffffff',side:THREE.DoubleSide}));
      const a=plane.geometry.attributes.position;for(let i=0;i<a.count;i++)a.setZ(i,-.035*(a.getX(i)**2+a.getY(i)**2));a.needsUpdate=true;plane.geometry.computeVertexNormals();plane.rotation.x=-.08;group.add(plane);
    });
    this.magneticGroup=new THREE.Group();spot.add(this.magneticGroup);
    for(let i=0;i<11;i++){const points=[];for(let j=0;j<=60;j++){const a=j/60*Math.PI;points.push(new THREE.Vector3(Math.cos(a)*(1.2+i*.06)+.4,Math.sin(a)*(.8+i*.06)+.1,Math.sin(a)*(.9+i*.09)+.1));}this.magneticGroup.add(this.line(points,'#89cbd2',.48));}
    this.magneticGroup.visible=false;
    const chromo=add('chromosphere');this.addFloor(chromo);
    for(let i=0;i<35;i++){const p=this.glow(i%2?'#ffbb81':'#ed6752',.14);chromo.add(p);const x=(this.random()-.5)*7,z=(this.random()-.5)*2,h=1.4+this.random()*2.7,phase=this.random();
      const path=[new THREE.Vector3(x,-2,z),new THREE.Vector3(x+.1,h-2,z),new THREE.Vector3(x+.35,-2,z)];chromo.add(this.line(path,'#cf7052',.2));
      this.updaters.push(t=>{if(!chromo.visible)return;const u=(t*.1+phase)%1;p.position.set(x+u*.35,-2+Math.sin(u*Math.PI)*h,z);});}
    const transition=add('transition');
    for(let i=0;i<24;i++){const points=[];for(let j=0;j<=70;j++){const x=-4+j/70*8;points.push(new THREE.Vector3(x,-2.1+i*.18+Math.sin(x*1.7+i*.2)*.18,Math.cos(x*.7)*.25));}transition.add(this.line(points,new THREE.Color().setHSL(.04+i/24*.5,.65,.48+i/24*.2),.65));}
    const corona=add('corona'),prominence=add('prominence');
    [corona,prominence].forEach((group,idx)=>{this.addFloor(group);for(let i=0;i<25;i++){
      const points=[];for(let j=0;j<=80;j++){const a=j/80*Math.PI;points.push(new THREE.Vector3(Math.cos(a)*(2+i*.035),-2+Math.sin(a)*(2.7+i*.045),Math.sin(a)*(i-12)*.055));}
      const curve=new THREE.CatmullRomCurve3(points);group.add(this.line(points,idx?'#fa9a59':'#bad6dc',.26));
      const p=this.glow(idx?'#ffc885':'#d8f6ff',.15);group.add(p);this.updaters.push(t=>{if(group.visible)p.position.copy(curve.getPoint((t*.06+i*.039)%1));});
    }});
  }
  addFloor(group){const plane=new THREE.Mesh(new THREE.PlaneGeometry(8,3,1,1),new THREE.MeshBasicMaterial({map:this.sunTexture,color:'#ad6952',side:THREE.DoubleSide}));plane.rotation.x=-Math.PI/2;plane.position.y=-2.05;group.add(plane);}
  enterDetail(id){
    this.detail=true;this.selected=id;this.sunGroup.visible=false;this.measureGroup.visible=false;this.detailGroup.visible=true;this.stars.visible=false;
    Object.entries(this.details).forEach(([key,g])=>g.visible=key===id);
    const V=(x,y,z)=>new THREE.Vector3(x,y,z);
    const labels={core:[{text:'氢核汇聚 · 核聚变净结果示意',position:V(0,-3.4,0)}],radiative:[{text:'吸收、再发射与散射',position:V(0,-3.4,0)}],convection:[{text:'较热物质上升 ↑',position:V(2.5,2.7,0)},{text:'冷却后下沉 ↓',position:V(-2.3,-2.8,0)}],photosphere:[{text:'真实观测：米粒组织与黑子',position:V(0,-3.3,0)}],sunspot:[{text:'本影 · 较暗的中心',position:V(1.25,0,.2)},{text:'半影 · 外围丝状结构',position:V(1.7,1.8,.2)}],chromosphere:[{text:'喷流的运动示意 · 尺度已放大',position:V(0,2.8,0)}],transition:[{text:'色球',position:V(-3.7,-2.2,0)},{text:'日冕',position:V(3.7,2.4,0)}],corona:[{text:'稀薄的日冕物质沿结构分布',position:V(0,2.7,0)}],prominence:[{text:'被磁场支撑和引导的太阳物质',position:V(0,2.7,0)}]};
    this.setLabels(labels[id]||[]);this.updaters.forEach(fn=>fn(this.time,0));this.resetCamera();this.updateVisibility();
  }
  toggleMagnetic(){this.magneticGroup.visible=!this.magneticGroup.visible;return this.magneticGroup.visible;}

  // ============ 同尺度测量与不同物理量比较 ============
  createMeasures(){
    this.ruler=new THREE.Group();this.measureGroup.add(this.ruler);
    this.radiusLine=this.line([new THREE.Vector3(),new THREE.Vector3(1,0,0)]);this.ruler.add(this.radiusLine);
    this.diameterLine=this.line([new THREE.Vector3(),new THREE.Vector3(1,0,0)],'#9dc5cc');this.diameterLine.position.set(0,-this.R,0);this.diameterLine.rotation.z=Math.PI/2;this.ruler.add(this.diameterLine);
    [this.radiusLine,this.diameterLine].forEach(line=>{line.material.depthTest=false;line.renderOrder=5;});
    for(let i=0;i<3;i++){const tick=this.line([new THREE.Vector3(0,-.12,0),new THREE.Vector3(0,.12,0)]);tick.position.set((i-1)*this.R,0,this.R+.12);this.ruler.add(tick);}
    this.earthRow=new THREE.InstancedMesh(new THREE.SphereGeometry(this.R/109.2,12,8),new THREE.MeshBasicMaterial({map:this.earthTexture}),109);this.measureGroup.add(this.earthRow);
    const matrix=new THREE.Matrix4();for(let i=0;i<109;i++){matrix.makeTranslation(-this.R+(i+.5)*this.R*2/109,-this.R-.35,1);this.earthRow.setMatrixAt(i,matrix);}this.earthRow.instanceMatrix.needsUpdate=true;
    this.earthReference=new THREE.Mesh(new THREE.SphereGeometry(this.R/109.2,20,16),new THREE.MeshBasicMaterial({map:this.earthTexture}));this.earthReference.position.set(-4.8,-2,2);this.measureGroup.add(this.earthReference);
    this.massGroup=new THREE.Group();this.measureGroup.add(this.massGroup);
    this.massDots=new THREE.InstancedMesh(new THREE.SphereGeometry(.09,12,8),new THREE.MeshBasicMaterial({color:'#99d0d4'}),100);
    for(let i=0;i<100;i++){matrix.makeTranslation(1+(i%10)*.32,-1.4+Math.floor(i/10)*.32,0);this.massDots.setMatrixAt(i,matrix);}this.massDots.instanceMatrix.needsUpdate=true;this.massGroup.add(this.massDots);
    const massSun=new THREE.Mesh(new THREE.SphereGeometry(1.4,64,48),new THREE.MeshBasicMaterial({map:this.sunTexture}));massSun.position.x=-2.6;this.massGroup.add(massSun);
    this.distanceGroup=new THREE.Group();this.measureGroup.add(this.distanceGroup);
    const s=new THREE.Mesh(new THREE.SphereGeometry(1.1,64,48),new THREE.MeshBasicMaterial({map:this.sunTexture}));s.position.x=-4.1;this.distanceGroup.add(s);const halo=this.glow('#ff9c35',3.7);halo.position.x=-4.1;halo.material.opacity=.3;this.distanceGroup.add(halo);
    const e=new THREE.Mesh(new THREE.SphereGeometry(.38,48,32),new THREE.MeshPhongMaterial({map:this.earthTexture}));e.position.x=4.3;this.distanceGroup.add(e);
    const line=this.line([new THREE.Vector3(-3,0,0),new THREE.Vector3(3.92,0,0)],'#a69983',.3);this.distanceGroup.add(line);
    this.photon=this.glow('#fff2c4',.5);this.distanceGroup.add(this.photon);
  }
  setMeasureProgress(p){
    this.measureProgress=p;
    this.radiusLine.scale.x=this.R*p;this.diameterLine.scale.x=this.R*2*p;
    this.earthRow.count=Math.round(109*p);this.massDots.count=Math.round(100*p);
    this.photon.position.set(-3+p*6.92,0,.1);
    if(this.mode==='measure'&&this.selected==='volume')this.sunGroup.scale.setScalar(1/Math.cbrt(1304000)+p*(1-1/Math.cbrt(1304000)));
  }
  setView(mode,id){
    this.mode=mode;this.selected=id;this.detail=false;this.detailGroup.visible=false;this.stars.visible=true;Object.values(this.details).forEach(g=>g.visible=false);
    this.sunGroup.visible=true;this.sunGroup.scale.setScalar(1);this.sunGroup.rotation.set(0,0,0);
    this.measureGroup.visible=mode==='measure';this.flareGlow.visible=false;
    this.setCut(mode==='interior'?.70:0);this.highlightLayer(id);
    this.ruler.visible=mode==='measure'&&id==='radius';this.earthRow.visible=mode==='measure'&&id==='earths';this.earthReference.visible=mode==='measure'&&id==='volume';
    this.massGroup.visible=mode==='measure'&&id==='mass';this.distanceGroup.visible=mode==='measure'&&id==='distance';
    if(mode==='measure'&&(id==='mass'||id==='distance'))this.sunGroup.visible=false;
    this.setMeasureProgress(mode==='measure'&&id==='distance'?0:1);
    const V=(x,y,z)=>new THREE.Vector3(x,y,z);
    let labels=[];
    if(mode==='interior')labels=[{text:'核心',position:V(.45,-.3,1.3)},{text:'辐射区',position:V(1.9,.6,.8)},{text:'对流区',position:V(3.5,1,.5)}];
    if(mode==='observe'&&id==='sun')labels=[{text:'拖动，换一个角度看太阳',position:V(0,-5.1,0)}];
    if(mode==='measure'){
      if(id==='radius')labels=[{text:'半径 69.57 万千米',position:V(2.1,.45,0)},{text:'直径 139.14 万千米',position:V(-1.5,-1.7,0)}];
      if(id==='earths')labels=[{text:'每一颗小球都是一个同尺度的地球',position:V(0,-5.2,1)}];
      if(id==='volume')labels=[{text:'地球',position:V(-4.8,-2.5,2)}];
      if(id==='mass')labels=[{text:'1 个太阳的质量',position:V(-2.6,-2,0)},{text:'每个光点 = 3,329 个地球的质量',position:V(2.4,2.6,0)}];
      if(id==='distance')labels=[{text:'太阳',position:V(-4.1,-1.6,0)},{text:'地球',position:V(4.3,-1.1,0)}];
    }
    this.setLabels(labels);this.updateVisibility();this.resetCamera();
  }

  // ============ 拾取、相机与动画 ============
  bindPointer(){
    const canvas=this.renderer.domElement;let down=null;const pointers=new Set();
    canvas.addEventListener('pointerdown',event=>{pointers.add(event.pointerId);down=pointers.size===1?{x:event.clientX,y:event.clientY}:null;});
    canvas.addEventListener('pointercancel',event=>{pointers.delete(event.pointerId);down=null;});
    canvas.addEventListener('pointerup',event=>{
      pointers.delete(event.pointerId);if(!down||this.detail||this.mode==='measure'||!this.loaded)return;
      const d=Math.hypot(event.clientX-down.x,event.clientY-down.y);down=null;if(d>6)return;
      const rect=canvas.getBoundingClientRect();this.raycaster.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),this.camera);
      const hits=this.raycaster.intersectObjects(this.pickTargets).filter(hit=>{
        let p=hit.object;while(p){if(!p.visible)return false;p=p.parent;}
        if(hit.object.userData.outer&&this.cut>.002){const pos=this.sunGroup.worldToLocal(hit.point.clone());let a=Math.atan2(pos.x,pos.z);if(a<0)a+=Math.PI*2;if(a<this.cut)return false;}
        return true;
      });
      if(hits[0])this.onPick(hits[0].object.userData.id);
    });
  }
  animate(now){
    this.frame=requestAnimationFrame(this.animate);if(this.contextLost)return;
    const dt=THREE.MathUtils.clamp((now-this.lastTime)/1000,0,.05);this.lastTime=now;
    if(document.hidden)return;
    const running=!this.paused; if(running)this.time+=dt;
    if(this.cameraMove){const m=this.cameraMove;const t=Math.min(1,(now-m.start)/850);const e=t*t*(3-2*t);this.camera.position.lerpVectors(m.from,m.to,e);this.controls.target.lerpVectors(m.targetFrom,m.targetTo,e);if(t===1)this.cameraMove=null;}
    this.controls.update();
    if(this.loaded){
      this.cut=THREE.MathUtils.lerp(this.cut,this.cutTarget,this.reduced?1:Math.min(1,dt*7));this.updateCut();
      this.sunUniforms.time.value=this.time;
      this.shellMaterials.forEach(m=>m.uniforms.time.value=this.time);this.cutFaces.forEach(f=>f.material.uniforms.time.value=this.time);
      if(running)this.updaters.forEach(fn=>fn(this.time,dt));
      const age=this.time-this.flareStart;const burst=age>=0&&age<7?Math.sin(age/7*Math.PI)**2:0;
      this.sunUniforms.flare.value=burst*1.5;this.flareGlow.scale.setScalar(1+burst*3.5);this.flareGlow.material.opacity=burst;
      if(age>=7)this.flareGlow.visible=false;
      this.updateLabels();
    }
    this.renderer.render(this.scene,this.camera);
  }
};
