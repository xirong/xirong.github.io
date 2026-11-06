/* 正式太阳系的 Blender 资产和光照层。保留原来的 Mesh、轨道、标签和选择接口。 */
window.SolarRealism = (() => {
    const dayNight = { value: 0 };
    const status = { state: 'idle', naturalBodies: 0, artificialBodies: 0, officialModels: 0, rocks: 0 };
    const rings = [];
    const clouds = [];
    let context;
    let templates;
    let loading;
    let asteroidInstances;
    const textureLoader = new THREE.TextureLoader();
    const textureCache = new Map();
    const irregular = {
        '火卫一': 'irregularPhobos', '火卫二': 'irregularDeimos',
        '冥卫二': 'irregularNix', '冥卫三': 'irregularHydra',
        '冥卫四': 'irregularKerberos', '冥卫五': 'irregularStyx',
        '妊卫一': 'irregularHiiaka', '鸟卫一': 'irregularMK2', '阋卫一': 'irregularDysnomia'
    };

    // ============ 纹理与局部材质 ============
    function texture(path, color = true) {
        const key = `${path}:${color}`;
        if (!textureCache.has(key)) {
            const map = textureLoader.load(path, undefined, undefined, () => {
                setStatus('部分贴图未加载，请检查网络后刷新');
            });
            map.encoding = color ? THREE.sRGBEncoding : THREE.LinearEncoding;
            map.anisotropy = Math.min(8, context.renderer.capabilities.getMaxAnisotropy());
            textureCache.set(key, map);
        }
        return textureCache.get(key);
    }

    // 只扩展本模块创建的 PBR 材质，不影响太阳、背景恒星和大小对比。
    function litMaterial(options = {}, extras = {}) {
        const material = extras.base ? extras.base.clone() : new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, ...options });
        material.onBeforeCompile = shader => {
            shader.uniforms.solarDayNight = dayNight;
            if (extras.ring) {
                shader.uniforms.solarBodyCenter = extras.ring.center;
                shader.uniforms.solarBodyRadius = extras.ring.radius;
            }
            shader.vertexShader = `varying vec3 vSolarPosition;\nvarying vec3 vSolarNormal;\n${shader.vertexShader}`;
            shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
                #include <project_vertex>
                vec4 solarPosition = vec4(transformed, 1.0);
                #ifdef USE_INSTANCING
                    solarPosition = instanceMatrix * solarPosition;
                #endif
                vSolarPosition = (modelMatrix * solarPosition).xyz;
                vSolarNormal = inverseTransformDirection(transformedNormal, viewMatrix);
            `);
            shader.fragmentShader = `uniform float solarDayNight;
                varying vec3 vSolarPosition;
                varying vec3 vSolarNormal;
                ${extras.ring ? 'uniform vec3 solarBodyCenter; uniform float solarBodyRadius;' : ''}
                ${shader.fragmentShader}`;
            if (extras.night) {
                shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `
                    #include <emissivemap_fragment>
                    float solarFacing = dot(normalize(vSolarNormal), normalize(-vSolarPosition));
                    totalEmissiveRadiance *= (1.0 - smoothstep(-0.18, 0.08, solarFacing)) * solarDayNight;
                `);
            }
            shader.fragmentShader = shader.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );', `
                float viewFacing = abs(dot(normalize(vSolarNormal), normalize(cameraPosition - vSolarPosition)));
                vec3 clearSurface = diffuseColor.rgb * (0.72 + 0.28 * sqrt(viewFacing));
                ${extras.ring ? `
                    vec3 rayToSun = normalize(-vSolarPosition);
                    vec3 toBody = solarBodyCenter - vSolarPosition;
                    float alongRay = dot(toBody, rayToSun);
                    float rayDistance = length(toBody - rayToSun * alongRay);
                    float occultation = (1.0 - smoothstep(solarBodyRadius * 0.94, solarBodyRadius, rayDistance)) * step(0.0, alongRay);
                    // 薄环的冰粒会向两侧散射，背面仍能看到环；投影处保持暗影。
                    float ringLight = 0.22 + 0.78 * abs(dot(normalize(vSolarNormal), rayToSun));
                    outgoingLight = diffuseColor.rgb * ringLight * (1.0 - occultation * 0.97);
                ` : ''}
                outgoingLight = mix(clearSurface, outgoingLight, solarDayNight);
                gl_FragColor = vec4(outgoingLight, diffuseColor.a);
            `);
        };
        material.customProgramCacheKey = () => `solar-realism-v1-${!!extras.night}-${!!extras.ring}`;
        return material;
    }

    function sourceMap(body) {
        const uniforms = body.material.uniforms;
        return uniforms?.planetTexture?.value || uniforms?.dayTexture?.value || uniforms?.moonTexture?.value || body.material.map;
    }

    function prepareBody(body) {
        const map = sourceMap(body);
        if (map) {
            map.encoding = THREE.sRGBEncoding;
            map.anisotropy = Math.min(8, context.renderer.capabilities.getMaxAnisotropy());
        }
        const options = { map, color: map ? 0xffffff : body.userData.color || 0xc8c8c8 };
        if (body.name === 'earth') {
            options.normalMap = texture('textures/earth_normal.jpg', false);
            options.normalScale = new THREE.Vector2(0.35, 0.35);
            options.roughness = 0.82;
            options.emissiveMap = texture('textures/earth_nightmap.jpg');
            options.emissive = new THREE.Color(0xffffff);
            options.emissiveIntensity = 0.85;
        }
        const old = body.material;
        body.material = litMaterial(options, { night: body.name === 'earth' });
        old.dispose();
        body.children.filter(child => child.isMesh && !child.name && !child.isSprite).forEach(child => {
            // 旧云层和大气换为跟随太阳的薄层，轨道、标签和具名环保留。
            body.remove(child);
            child.geometry.dispose();
            child.material.dispose();
        });
        if (body.name === 'earth') {
            const cloud = new THREE.Mesh(new THREE.SphereGeometry(body.userData.size * 1.009, 64, 40), litMaterial({
                alphaMap: texture('textures/earth_clouds.jpg', false), transparent: true,
                opacity: 0.72, depthWrite: false, color: 0xffffff
            }));
            cloud.name = '写实云层';
            body.add(cloud);
            clouds.push(cloud);
            body.userData.cloudMesh = cloud;
            const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(body.userData.size * 1.035, 64, 40), new THREE.ShaderMaterial({
                uniforms: { solarDayNight: dayNight },
                vertexShader: `varying vec3 vNormal; varying vec3 vView; varying vec3 vSun;
                    void main() { vec4 p = modelViewMatrix * vec4(position,1.0);
                        vNormal = normalize(normalMatrix * normal); vView = normalize(-p.xyz);
                        vSun = normalize((viewMatrix * vec4(0.0,0.0,0.0,1.0)).xyz - p.xyz);
                        gl_Position = projectionMatrix * p; }`,
                fragmentShader: `uniform float solarDayNight; varying vec3 vNormal; varying vec3 vView; varying vec3 vSun;
                    void main() { float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.5);
                        float daylight = mix(1.0, smoothstep(-0.15,0.4,dot(normalize(vNormal),normalize(vSun))),solarDayNight);
                        gl_FragColor=vec4(0.18,0.46,1.0,rim*0.32*daylight); }`,
                transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
            }));
            atmosphere.name = '写实大气';
            body.add(atmosphere);
        }
    }

    // ============ Blender 几何接入 ============
    function geometry(nodeName, size) {
        const node = templates.getObjectByName(nodeName);
        if (!node?.isMesh) throw new Error(`缺少 Blender 节点 ${nodeName}`);
        const result = node.geometry.clone().scale(size, size, size);
        // Blender/glTF 的北极 V=0；沿用 TextureLoader 的 flipY=true 时转回 Three.js UV。
        const uv = result.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
        return result;
    }

    function replaceBody(body) {
        const nodeName = irregular[body.name] || ({ jupiter: 'jupiterBody', saturn: 'saturnBody', haumea: 'haumeaBody' })[body.name] || 'unitSphere';
        if (body.userData.blenderAsset) return;
        const old = body.geometry;
        body.geometry = geometry(nodeName, body.userData.size);
        old.dispose();
        body.userData.blenderAsset = nodeName;
        status.naturalBodies++;
        if (body.userData.cloudMesh) {
            const cloud = body.userData.cloudMesh;
            cloud.geometry.dispose();
            cloud.geometry = geometry('unitSphere', body.userData.size * 1.009);
        }
        const ringNodes = {
            '土星光环': 'SaturnRings', '天王星明亮光环': 'UranusRings', '天王星内侧亮环': 'UranusInnerRings'
        };
        body.children.filter(child => child.isMesh && (ringNodes[child.name] || /尘埃环|外侧淡环/.test(child.name))).forEach(ring => {
            const node = ringNodes[ring.name] || (ring.name.includes('尘埃环') ? 'RheaDustRing' : 'RheaOuterDustRing');
            // 原 RingGeometry 位于 XY 平面，先让 GLB 的 XZ 环恢复同一局部朝向。
            ring.geometry.dispose();
            ring.geometry = geometry(node, body.userData.size).rotateX(Math.PI / 2);
            const oldMaterial = ring.material;
            if (oldMaterial.map) oldMaterial.map.encoding = THREE.sRGBEncoding;
            const shadow = { body, center: { value: new THREE.Vector3() }, radius: { value: body.userData.size * 0.93 } };
            ring.material = litMaterial({ map: oldMaterial.map, color: oldMaterial.color,
                transparent: true, opacity: oldMaterial.opacity, side: THREE.DoubleSide,
                depthWrite: false, alphaTest: 0.015 }, { ring: shadow });
            oldMaterial.dispose();
            ring.userData.blenderAsset = node;
            rings.push(shadow);
        });
    }

    function replaceBelt(belt) {
        if (belt.userData.blenderAsset) return;
        const positions = belt.geometry.attributes.position;
        const sizes = belt.geometry.attributes.size;
        const group = new THREE.Group();
        group.name = 'Blender 岩块实例';
        const dummy = new THREE.Object3D();
        const icy = belt.name === 'kuiperBelt';
        const material = litMaterial({ map: texture('textures/moon.jpg'), color: icy ? 0xc2d0db : 0xaaa294 });
        for (let variant = 0; variant < 4; variant++) {
            const count = Math.ceil((positions.count - variant) / 4);
            const mesh = new THREE.InstancedMesh(geometry(`asteroidRock${variant}`, 1), material, count);
            // r128 的实例化包围球不包含各实例位置，关闭剔除避免靠近时整带消失。
            mesh.frustumCulled = false;
            for (let j = 0; j < count; j++) {
                const i = j * 4 + variant;
                dummy.position.fromBufferAttribute(positions, i);
                dummy.rotation.set(i * 1.71, i * 2.39, i * 0.63);
                dummy.scale.setScalar((sizes?.getX(i) || 1) * (icy ? 0.16 : 0.10));
                dummy.updateMatrix();
                mesh.setMatrixAt(j, dummy.matrix);
            }
            mesh.instanceMatrix.needsUpdate = true;
            group.add(mesh);
        }
        // 只隐藏旧粒子的绘制；父对象仍管理位置、可见性和原有动画。
        belt.material.visible = false;
        belt.add(group);
        belt.userData.blenderAsset = 'asteroidRock0..3';
        if (!icy) asteroidInstances = group;
        status.rocks += positions.count;
    }

    const artificialNames = {
        '国际空间站': 'artificialISS', '中国空间站': 'artificialTiangong',
        '哈勃望远镜': 'artificialHubble', '韦伯望远镜': 'artificialWebb'
    };
    function replaceArtificial(body) {
        if (body.userData.blenderAsset) return;
        const nodeName = artificialNames[body.name] || (body.name.includes('北斗') ? 'artificialBeidou' : body.name.includes('GPS') ? 'artificialGPS' : body.name.includes('气象') ? 'artificialWeather' : 'artificialComms');
        const source = templates.getObjectByName(nodeName);
        if (!source) throw new Error(`缺少 Blender 节点 ${nodeName}`);
        const model = source.clone(true);
        model.traverse(node => {
            if (!node.isMesh) return;
            const convert = original => litMaterial({ color: original.color, metalness: Math.min(original.metalness, 0.25), roughness: Math.max(original.roughness, 0.5), map: original.map });
            node.material = Array.isArray(node.material) ? node.material.map(convert) : convert(node.material);
        });
        model.scale.setScalar(body.userData.size * 2.8);
        model.name = 'Blender 航天器';
        body.children.filter(child => child.isMesh).forEach(child => { body.remove(child); child.geometry.dispose(); child.material.dispose(); });
        body.material.visible = false;
        body.add(model);
        body.userData.blenderAsset = nodeName;
        body.userData.modelKind = '教学外形示意';
        status.artificialBodies++;
    }

    async function loadOfficialModels() {
        const files = { '国际空间站': 'iss', '哈勃望远镜': 'hubble', '韦伯望远镜': 'webb' };
        await Promise.all(Object.entries(files).map(async ([name, file]) => {
            const body = context.satellites.find(item => item.name === name);
            try {
                const gltf = await new Promise((resolve, reject) => new THREE.GLTFLoader().load(`solar-assets/artificial/${file}.glb?v=20261106-r2`, resolve, undefined, reject));
                const model = gltf.scene;
                model.traverse(node => {
                    if (!node.isMesh) return;
                    const wrap = source => {
                        const material = litMaterial({}, { base: source });
                        // 没有环境反射贴图的场景里保留一定漫反射，以便看清金属部件。
                        material.metalness = Math.min(material.metalness, 0.4);
                        return material;
                    };
                    node.material = Array.isArray(node.material) ? node.material.map(wrap) : wrap(node.material);
                });
                model.name = 'Blender 官方航天器';
                model.scale.setScalar(body.userData.size * 2.8);
                const previous = body.children.find(child => child.name === 'Blender 航天器');
                if (previous) {
                    body.remove(previous);
                    previous.traverse(child => {
                        if (child.isMesh) (Array.isArray(child.material) ? child.material : [child.material]).forEach(material => material.dispose());
                    });
                }
                body.add(model);
                body.userData.blenderAsset = `artificial/${file}.glb`;
                body.userData.modelKind = 'NASA 官方可视化模型';
                status.officialModels++;
            } catch (error) {
                // 独立下载失败时保留已显示的 Blender 教学模型，场景与开关继续可用。
                console.warn(`${name}官方模型未载入，保留教学模型`, error);
            }
        }));
    }

    function validateCatalog() {
        const required = ['unitSphere', 'jupiterBody', 'saturnBody', 'haumeaBody',
            ...Object.values(irregular), 'SaturnRings', 'UranusRings', 'UranusInnerRings',
            'RheaDustRing', 'RheaOuterDustRing', ...Array.from({ length: 4 }, (_, i) => `asteroidRock${i}`),
            ...Object.values(artificialNames), 'artificialGPS', 'artificialBeidou', 'artificialComms', 'artificialWeather'];
        required.forEach(name => {
            const node = templates.getObjectByName(name);
            let hasMesh = false;
            node?.traverse(child => { if (child.isMesh && child.geometry.attributes.position) hasMesh = true; });
            if (!hasMesh) throw new Error(`Blender 资产不完整：${name}`);
        });
    }


    // ============ 开关、加载和逐帧同步 ============
    function setStatus(message) {
        const element = document.getElementById('solarAssetStatus');
        if (element) element.textContent = message;
    }
    function setDayNight(enabled) {
        dayNight.value = enabled ? 1 : 0;
        const button = document.getElementById('toggleDayNight');
        button?.setAttribute('aria-pressed', String(!!enabled));
        const label = document.getElementById('dayNightState');
        if (label) label.textContent = enabled ? '开' : '关';
    }
    function refreshLights() {
        context.scene.traverse(object => {
            if (!object.isLight || object.userData.solarRealism) return;
            object.intensity = 0;
        });
    }
    async function loadAssets() {
        if (loading) return loading;
        status.state = 'loading';
        setStatus('正在载入立体模型…');
        loading = new Promise((resolve, reject) => new THREE.GLTFLoader().load('solar-assets/models.glb?v=20261106-r2', resolve, undefined, reject))
            .then(gltf => {
                templates = gltf.scene;
                validateCatalog();
                context.bodies.forEach(replaceBody);
                context.satellites.forEach(replaceArtificial);
                replaceBelt(context.asteroidBelt);
                replaceBelt(context.kuiperBelt);
                status.state = 'ready';
                setStatus('部分外形与间距为教学示意');
                loadOfficialModels();
            }).catch(error => {
                status.state = 'fallback';
                setStatus('模型未载入，保留基础外形');
                document.getElementById('retrySolarAssets').hidden = false;
                console.warn('太阳系模型加载失败，保留基础外形', error);
            }).finally(() => { loading = null; });
        return loading;
    }
    function init(options) {
        context = options;
        options.renderer.outputEncoding = THREE.sRGBEncoding;
        options.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        options.renderer.toneMappingExposure = 1.1;
        options.bodies.forEach(prepareBody);
        refreshLights();
        const ambient = new THREE.AmbientLight(0xffffff, 0.035);
        const sunlight = new THREE.PointLight(0xfff6e8, 2.35, 0, 0);
        ambient.userData.solarRealism = sunlight.userData.solarRealism = true;
        options.scene.add(ambient, sunlight);
        document.getElementById('toggleDayNight').addEventListener('click', () => setDayNight(!dayNight.value));
        document.getElementById('retrySolarAssets').addEventListener('click', () => {
            document.getElementById('retrySolarAssets').hidden = true;
            loadAssets();
        });
        const settings = document.querySelector('.sun-style-selector');
        const settingsButton = document.getElementById('solarSettingsToggle');
        settingsButton.addEventListener('click', () => {
            const expanded = settings.classList.toggle('is-open');
            settingsButton.setAttribute('aria-expanded', String(expanded));
            if (!expanded) settingsButton.blur();
        });
        document.addEventListener('pointerdown', event => {
            if (!settings.contains(event.target)) {
                settings.classList.remove('is-open');
                settingsButton.setAttribute('aria-expanded', 'false');
            }
        });
        document.getElementById('solarModelSourcesButton').addEventListener('click', () => {
            document.getElementById('solarModelSources').showModal();
        });
        setDayNight(false);
        return loadAssets();
    }
    function update(delta, elapsed, animating) {
        rings.forEach(shadow => {
            shadow.body.getWorldPosition(shadow.center.value);
            shadow.radius.value = shadow.body.userData.size * shadow.body.scale.x * 0.93;
        });
        if (animating) clouds.forEach(cloud => { cloud.rotation.y += delta * 0.018; });
        // 旧 shader 的 XZ 旋转方向与 Three.js 的正 Y 轴旋转相反。
        if (asteroidInstances) asteroidInstances.rotation.y = -elapsed * 0.01;
    }
    return { init, update, refreshLights, setDayNight, status, get dayNightEnabled() { return !!dayNight.value; } };
})();
