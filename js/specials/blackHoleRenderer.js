/**
 * BlackHoleRenderer — cinematic Schwarzschild ray-march + bloom
 * Visual-first approximation (not full GR/GRMHD). Three.js r128 global THREE.
 *
 * Usage:
 *   const bhr = new BlackHoleRenderer(renderer, config);
 *   group.add(bhr.getMesh());
 *   bhr.update(camera, config, time, aspect);
 *   bhr.dispose();
 */
/* global THREE */
class BlackHoleRenderer {
    constructor(renderer, config = {}) {
        this._renderer = renderer;
        this._cfg = config;
        this._dopplerScale = 1;
        this._renderScale = THREE.MathUtils.clamp(config.renderScale ?? 0.72, 0.5, 1.0);

        this._camWorld = new THREE.Vector3();
        this._forwardWorld = new THREE.Vector3();
        this._forwardShader = new THREE.Vector3();
        this._rightShader = new THREE.Vector3();
        this._upShader = new THREE.Vector3();
        this._spinAxis = new THREE.Vector3(0, 0, 1);
        this._origin = new THREE.Vector3();

        const passVert = [
            'varying vec2 vUv;',
            'void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}'
        ].join('\n');

        // Visual-first geodesic disk: warm Interstellar palette, photon ring,
        // Doppler beaming, soft EH, denser volume samples, mild step jitter.
        const bhFrag = [
            'precision highp float;',
            'varying vec2 vUv;',
            'uniform vec3  uCameraPos,uCamForward,uCamRight,uCamUp;',
            'uniform float uAspect,uTime,uDoppler,uLuminance,uTemperature,uLensing,uTurbulence;',
            '',
            'float h2f(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
            'float sn(vec2 p){',
            '  vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);',
            '  return mix(mix(h2f(i),h2f(i+vec2(1,0)),u.x),mix(h2f(i+vec2(0,1)),h2f(i+vec2(1,1)),u.x),u.y);',
            '}',
            'float fbm(vec2 p){',
            '  float a=.5,v=0.;',
            '  for(int i=0;i<4;i++){v+=a*sn(p);p=p*2.03+vec2(17.1,9.7);a*=.52;}',
            '  return v;',
            '}',
            'vec3 diskHeat(float inner,float shift){',
            // ember → orange → gold → warm white → slight blue-white (temp driven)
            '  vec3 ember=vec3(.12,.008,.001);',
            '  vec3 deepRed=vec3(.55,.04,.005);',
            '  vec3 orange=vec3(1.,.28,.03);',
            '  vec3 gold=vec3(1.,.78,.28);',
            '  vec3 warmWhite=vec3(1.,.96,.82);',
            '  vec3 blueWhite=vec3(.82,.92,1.);',
            '  float tHot=clamp((uTemperature-6500.)/9000.,0.,1.);',
            '  vec3 hot=mix(warmWhite,blueWhite,tHot*.55);',
            '  vec3 c=mix(ember,deepRed,smoothstep(0.,.22,inner));',
            '  c=mix(c,orange,smoothstep(.12,.48,inner));',
            '  c=mix(c,gold,smoothstep(.38,.72,inner));',
            '  c=mix(c,hot,smoothstep(.62,1.,inner));',
            // Doppler color shift: approach cooler/brighter, recede redder
            '  c=mix(c,c*vec3(1.08,.95,.78),clamp(-shift*.35,0.,.45));',
            '  c=mix(c,c*vec3(.78,.9,1.2),clamp(shift*.4,0.,.4));',
            '  return c;',
            '}',
            'vec3 starField(vec3 d){',
            '  vec2 uv=vec2(atan(d.y,d.x)/6.2831853+.5,asin(clamp(d.z,-1.,1.))/3.1415926+.5);',
            '  vec2 grid=uv*vec2(920.,460.);',
            '  vec2 cell=floor(grid),f=fract(grid)-.5;',
            '  float seed=h2f(cell);',
            '  float core=1.-smoothstep(.012,.07,length(f));',
            '  float star=smoothstep(.994,.9998,seed)*core*(.25+1.6*pow(seed,14.));',
            '  vec3 tint=mix(vec3(.55,.7,1.),vec3(1.,.75,.5),h2f(cell+17.));',
            '  return tint*star*.55;',
            '}',
            '',
            'void main(){',
            '  vec2 sc=(vUv-.5)*vec2(uAspect,1.);',
            '  vec3 dir=normalize(uCamForward+uCamRight*sc.x*1.62+uCamUp*sc.y*1.62);',
            '  float camR=length(uCameraPos);',
            '  float stepBase=clamp(camR/150.,.08,.32);',
            // per-pixel jitter breaks concentric ring aliasing
            '  float jitter=h2f(vUv*vec2(1919.3,733.1)+uTime*.01);',
            '  float stepLength=stepBase*(.88+jitter*.24);',
            '  vec3 pos=uCameraPos+dir*stepLength*jitter*.35;',
            '  vec3 vel=dir*stepLength;',
            '  float h2=dot(cross(pos,vel),cross(pos,vel));',
            // geometric units: RS=2, photon sphere ~3, ISCO~6
            '  const float RS=2.,DI=5.2,DO=24.,DH=.72;',
            '  float minR=999.,diskAlpha=0.;',
            '  int fellIn=0;',
            '  vec3 diskColor=vec3(0.);',
            '  for(int i=0;i<180;i++){',
            '    float r=length(pos);',
            '    minR=min(minR,r);',
            '    if(r<RS*.98){fellIn=1;break;}',
            '    if(r>85.&&i>12)break;',
            '    float r2=dot(pos,pos);',
            '    float r5=max(pow(r2,2.5),.0001);',
            // Schwarzschild-like acceleration scaled by lensing uniform
            '    vel+=-1.5*h2*pos/r5*uLensing;',
            '    // mild adaptive step: finer near BH',
            '    float adapt=mix(.55,1.15,smoothstep(RS*1.2,18.,r));',
            '    pos+=vel*adapt;',
            '    float rxy=length(pos.xy);',
            '    float az=abs(pos.z);',
            '    if(az<DH*2.6&&rxy>DI*.92&&rxy<DO){',
            '      float radial=clamp((rxy-DI)/(DO-DI),0.,1.);',
            '      float radialWindow=smoothstep(DI*.95,DI+1.1,rxy)*smoothstep(DO,DO-4.,rxy);',
            '      float thickness=DH*(.55+radial*.95);',
            '      float vertical=exp(-pow(az/max(thickness,.02),2.)*2.8);',
            '      float angle=atan(pos.y,pos.x);',
            '      // multi-scale flow / filaments / knots',
            '      float flow=fbm(vec2(angle*2.4-uTime*(.55+radial*.18),radial*7.5+uTime*.06));',
            // Long filaments follow orbital shear instead of reading as round noise blobs.
            '      float shear=angle*11.-radial*52.-uTime*(1.15+radial*.55);',
            '      float filament=.5+.5*sin(shear+flow*3.5);',
            '      float filamentFine=.5+.5*sin(shear*2.3+radial*17.+flow*2.);',
            '      float spiral=.5+.5*sin(angle*2.-radial*14.-uTime*.35);',
            '      float knots=h2f(floor(vec2(angle*8.+uTime*.07,radial*28.-uTime*.11)));',
            '      float turb=clamp(uTurbulence,0.,1.5);',
            '      float structure=mix(.78,.38+flow*.34+filament*.22+filamentFine*.1+spiral*.12+knots*.12,turb);',
            '      float density=radialWindow*vertical*structure;',
            '      // far-side contribution slightly boosted for lensed upper/lower arcs',
            '      float behind=smoothstep(.15,.85,dot(normalize(pos),normalize(uCameraPos)));',
            '      density*=mix(1.18,1.,behind);',
            '      if(density>.0015){',
            '        vec3 tangent=normalize(vec3(-pos.y,pos.x,0.));',
            '        vec3 toObserver=normalize(uCameraPos-pos);',
            '        float beta=clamp(sqrt(1./max(rxy-RS,.4)),.06,.72);',
            '        float gamma=inversesqrt(max(1.-beta*beta,.04));',
            '        float los=dot(tangent,toObserver);',
            '        float doppler=1./max(gamma*(1.-beta*los),.16);',
            '        float beaming=mix(1.,pow(clamp(doppler,.4,2.6),3.2),clamp(uDoppler,0.,1.2));',
            '        float grav=pow(max(1.-RS/max(rxy,RS+.02),.06),.55);',
            '        float inner=pow(1.-radial,.62);',
            '        vec3 emission=diskHeat(inner,los*uDoppler)*density*beaming*grav;',
            '        emission*=uLuminance*(.5+inner*1.15);',
            '        float sampleAlpha=(1.-exp(-density*stepLength*adapt*2.8))*(.45+inner*.4);',
            '        diskColor+=(1.-diskAlpha)*emission*sampleAlpha;',
            '        diskAlpha+=(1.-diskAlpha)*sampleAlpha;',
            '        if(diskAlpha>.985)break;',
            '      }',
            '    }',
            '  }',
            '  // soft event-horizon mask',
            '  float ehSoft=smoothstep(RS*1.08,RS*.92,minR);',
            '  vec3 background=starField(normalize(vel))*(1.-ehSoft*.98);',
            '  if(fellIn==1) background=vec3(0.);',
            '  vec3 col=background*(1.-diskAlpha)+diskColor;',
            // photon ring near r=3
            '  float photon=exp(-pow((minR-3.)/.13,2.))*smoothstep(RS*1.02,RS*1.18,minR);',
            '  col+=vec3(1.,.9,.62)*photon*1.15*(.55+diskAlpha*.45);',
            // Explicit upper/lower lensed disk echoes keep the cinematic double arc readable.
            '  float arcX=clamp(abs(sc.x)/max(uAspect,.001),0.,1.);',
            '  float arcCurve=.13+.22*pow(arcX,1.65);',
            '  float arcWidth=.014+.018*(1.-arcX);',
            '  float upperArc=exp(-pow((sc.y-arcCurve)/arcWidth,2.))*smoothstep(.04,.18,arcX);',
            '  float lowerArc=exp(-pow((sc.y+arcCurve)/arcWidth,2.))*smoothstep(.04,.18,arcX);',
            '  float arcMask=(upperArc+lowerArc)*uLensing*(1.-diskAlpha*.35);',
            '  col+=vec3(1.,.52,.14)*arcMask*.24;',
            // soft lens glow halo outside photon sphere
            '  float lensGlow=exp(-pow((minR-3.6)/.7,2.))*smoothstep(RS*1.08,RS*1.4,minR);',
            '  col+=vec3(.55,.22,.04)*lensGlow*.14;',
            // subtle EH rim light
            '  float rim=exp(-pow((minR-RS*1.05)/.22,2.))*(1.-ehSoft);',
            '  col+=vec3(1.,.55,.18)*rim*.12;',
            '  col=max(col,vec3(0.));',
            '  gl_FragColor=vec4(col,1.);',
            '}'
        ].join('\n');

        const brightFrag = [
            'precision mediump float;',
            'varying vec2 vUv;',
            'uniform sampler2D tDiffuse;',
            'uniform float uThreshold;',
            'void main(){',
            '  vec3 c=texture2D(tDiffuse,vUv).rgb;',
            '  float lum=dot(c,vec3(0.2126,0.7152,0.0722));',
            '  float b=max(0.,lum-uThreshold);',
            '  // keep warm cast in bloom extract',
            '  gl_FragColor=vec4(c*b/max(lum,0.001)*vec3(1.05,1.,.92),1.);',
            '}'
        ].join('\n');

        const blurFrag = [
            'precision mediump float;',
            'varying vec2 vUv;',
            'uniform sampler2D tDiffuse;',
            'uniform vec2 uDir;',
            'void main(){',
            '  vec3 s=vec3(0.);',
            '  s+=texture2D(tDiffuse,vUv-uDir*3.2).rgb*0.04;',
            '  s+=texture2D(tDiffuse,vUv-uDir*2.).rgb*0.08;',
            '  s+=texture2D(tDiffuse,vUv-uDir).rgb*0.18;',
            '  s+=texture2D(tDiffuse,vUv).rgb*0.4;',
            '  s+=texture2D(tDiffuse,vUv+uDir).rgb*0.18;',
            '  s+=texture2D(tDiffuse,vUv+uDir*2.).rgb*0.08;',
            '  s+=texture2D(tDiffuse,vUv+uDir*3.2).rgb*0.04;',
            '  gl_FragColor=vec4(s,1.);',
            '}'
        ].join('\n');

        const compFrag = [
            'precision mediump float;',
            'varying vec2 vUv;',
            'uniform sampler2D tScene;',
            'uniform sampler2D tBloom;',
            'uniform float uBloomStr,uExposure;',
            'uniform float uBypass;',
            'uniform vec2 uTexel;',
            'void main(){',
            '  vec3 scene=texture2D(tScene,vUv).rgb;',
            '  vec3 bloom=texture2D(tBloom,vUv).rgb;',
            // horizontal streak for cinematic light tail (WebGL1-safe, no textureSize)
            '  vec2 hx=vec2(uTexel.x*2.2,0.);',
            '  vec3 streak=bloom*0.42;',
            '  streak+=texture2D(tBloom,vUv-hx*2.).rgb*0.18;',
            '  streak+=texture2D(tBloom,vUv+hx*2.).rgb*0.18;',
            '  streak+=texture2D(tBloom,vUv-hx*5.).rgb*0.11;',
            '  streak+=texture2D(tBloom,vUv+hx*5.).rgb*0.11;',
            '  vec3 c=(scene+bloom*uBloomStr+streak*uBloomStr*.38)*uExposure;',
            '  if(uBypass<0.5){',
            '    c=clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);',
            '    c=pow(c,vec3(1./2.2));',
            '  }',
            '  float vignette=1.-smoothstep(.42,.92,length(vUv-.5));',
            '  c*=mix(.78,1.,vignette);',
            '  gl_FragColor=vec4(clamp(c,0.,1.),1.);',
            '}'
        ].join('\n');

        this._U = {
            uCameraPos:   { value: new THREE.Vector3() },
            uCamForward:  { value: new THREE.Vector3() },
            uCamRight:    { value: new THREE.Vector3() },
            uCamUp:       { value: new THREE.Vector3() },
            uAspect:      { value: 1.7778 },
            uTime:        { value: 0 },
            uDoppler:     { value: config.dopplerIntensity ?? 0.85 },
            uLuminance:   { value: 1.05 },
            uTemperature: { value: config.diskTemperature ?? 9200.0 },
            uLensing:     { value: config.lensingStrength ?? 1.12 },
            uTurbulence:  { value: config.diskTurbulence ?? 1.15 }
        };

        this._geo = new THREE.PlaneBufferGeometry(2, 2);
        this._quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
        this._quadCam.position.z = 1;

        this._bhMat = new THREE.ShaderMaterial({
            uniforms: this._U,
            vertexShader: passVert,
            fragmentShader: bhFrag,
            depthTest: false,
            depthWrite: false
        });
        this._bhScene = new THREE.Scene();
        const bhQ = new THREE.Mesh(this._geo, this._bhMat);
        bhQ.frustumCulled = false;
        this._bhScene.add(bhQ);

        this._ppScene = new THREE.Scene();
        this._ppQuad = new THREE.Mesh(this._geo, null);
        this._ppQuad.frustumCulled = false;
        this._ppScene.add(this._ppQuad);

        const rtOpts = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        };
        const W = Math.max(1, Math.floor(window.innerWidth * this._renderScale));
        const H = Math.max(1, Math.floor(window.innerHeight * this._renderScale));
        this._rtScene = new THREE.WebGLRenderTarget(W, H, rtOpts);
        this._rtBloomA = new THREE.WebGLRenderTarget(W >> 1, H >> 1, rtOpts);
        this._rtBloomB = new THREE.WebGLRenderTarget(W >> 1, H >> 1, rtOpts);

        this._brightMat = new THREE.ShaderMaterial({
            uniforms: { tDiffuse: { value: null }, uThreshold: { value: 0.28 } },
            vertexShader: passVert,
            fragmentShader: brightFrag,
            depthTest: false,
            depthWrite: false
        });
        this._blurMat = new THREE.ShaderMaterial({
            uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2() } },
            vertexShader: passVert,
            fragmentShader: blurFrag,
            depthTest: false,
            depthWrite: false
        });
        this._compUniforms = {
            tScene:    { value: null },
            tBloom:    { value: null },
            uBloomStr: { value: config.bloomStrength ?? 1.35 },
            uExposure: { value: config.exposureCompensation ?? 1.08 },
            uBypass:   { value: 0.0 },
            uTexel:    { value: new THREE.Vector2(1 / Math.max(W >> 1, 1), 1 / Math.max(H >> 1, 1)) }
        };
        this._compMat = new THREE.ShaderMaterial({
            uniforms: this._compUniforms,
            vertexShader: passVert,
            fragmentShader: compFrag,
            depthTest: false,
            depthWrite: false
        });

        this._proxyMesh = new THREE.Mesh(
            this._geo,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthTest: false, depthWrite: false })
        );
        this._proxyMesh.frustumCulled = false;
        this._proxyMesh.renderOrder = 999;
        this._proxyMesh.userData.effectRole = 'black-hole-fullscreen-shader';
        this._proxyMesh.userData.managedByFocusRenderer = true;
    }

    getMesh() { return this._proxyMesh; }

    setDopplerScale(scale) {
        this._dopplerScale = Number.isFinite(scale) ? scale : 1;
    }

    setSize(width, height) {
        const viewportWidth = Math.max(1, Math.floor(width));
        const viewportHeight = Math.max(1, Math.floor(height));
        const renderWidth = Math.max(1, Math.floor(viewportWidth * this._renderScale));
        const renderHeight = Math.max(1, Math.floor(viewportHeight * this._renderScale));
        this._U.uAspect.value = viewportWidth / viewportHeight;
        this._rtScene.setSize(renderWidth, renderHeight);
        const bw = Math.max(1, renderWidth >> 1);
        const bh = Math.max(1, renderHeight >> 1);
        this._rtBloomA.setSize(bw, bh);
        this._rtBloomB.setSize(bw, bh);
        this._compUniforms.uTexel.value.set(1 / bw, 1 / bh);
    }

    update(camera, config, time, aspect) {
        this._U.uTime.value = time;
        this._U.uAspect.value = aspect;

        if (config) {
            if (config.dopplerIntensity !== undefined) {
                this._U.uDoppler.value = config.dopplerIntensity * this._dopplerScale;
            }
            if (config.bloomStrength !== undefined) {
                this._compUniforms.uBloomStr.value = config.bloomStrength;
            }
            if (config.diskTemperature !== undefined) {
                this._U.uTemperature.value = config.diskTemperature;
            }
            if (config.lensingStrength !== undefined) {
                this._U.uLensing.value = config.lensingStrength;
            }
            if (config.diskTurbulence !== undefined) {
                this._U.uTurbulence.value = config.diskTurbulence;
            }
            if (config.exposureCompensation !== undefined) {
                this._compUniforms.uExposure.value = config.exposureCompensation;
            }
            if (config.logLuminance !== undefined) {
                this._U.uLuminance.value = THREE.MathUtils.clamp(
                    Math.pow(10, config.logLuminance - 6.83),
                    0.7,
                    2.8
                );
            }
            if (config.renderScale !== undefined) {
                const next = THREE.MathUtils.clamp(config.renderScale, 0.5, 1.0);
                if (Math.abs(next - this._renderScale) > 0.01) {
                    this._renderScale = next;
                    this.setSize(window.innerWidth, window.innerHeight);
                }
            }
        }

        const camW = this._camWorld.copy(camera.position);
        this._U.uCameraPos.value.set(camW.x, camW.z, camW.y);

        const fwW = this._forwardWorld.subVectors(this._origin, camW).normalize();
        const fwS = this._forwardShader.set(fwW.x, fwW.z, fwW.y);

        const rtS = this._rightShader.crossVectors(fwS, this._spinAxis);
        if (rtS.lengthSq() < 0.000001) rtS.set(1, 0, 0);
        else rtS.normalize();

        const upS = this._upShader.crossVectors(rtS, fwS).normalize();

        this._U.uCamForward.value.copy(fwS);
        this._U.uCamRight.value.copy(rtS);
        this._U.uCamUp.value.copy(upS);

        this._render();
    }

    dispose() {
        [this._rtScene, this._rtBloomA, this._rtBloomB].forEach((rt) => rt.dispose());
        [this._bhMat, this._brightMat, this._blurMat, this._compMat, this._proxyMesh.material]
            .forEach((m) => m.dispose());
        this._geo.dispose();
    }

    _render() {
        const R = this._renderer;
        const qc = this._quadCam;

        // Dual blur pass for richer bloom (H + V, then H + V again lightly)
        R.setRenderTarget(this._rtScene);
        R.render(this._bhScene, qc);

        this._ppQuad.material = this._brightMat;
        this._brightMat.uniforms.tDiffuse.value = this._rtScene.texture;
        R.setRenderTarget(this._rtBloomA);
        R.render(this._ppScene, qc);

        this._ppQuad.material = this._blurMat;
        this._blurMat.uniforms.tDiffuse.value = this._rtBloomA.texture;
        this._blurMat.uniforms.uDir.value.set(1.2 / this._rtBloomA.width, 0.0);
        R.setRenderTarget(this._rtBloomB);
        R.render(this._ppScene, qc);

        this._blurMat.uniforms.tDiffuse.value = this._rtBloomB.texture;
        this._blurMat.uniforms.uDir.value.set(0.0, 1.2 / this._rtBloomA.height);
        R.setRenderTarget(this._rtBloomA);
        R.render(this._ppScene, qc);

        // second wider blur for soft glow
        this._blurMat.uniforms.tDiffuse.value = this._rtBloomA.texture;
        this._blurMat.uniforms.uDir.value.set(2.4 / this._rtBloomA.width, 0.0);
        R.setRenderTarget(this._rtBloomB);
        R.render(this._ppScene, qc);

        this._blurMat.uniforms.tDiffuse.value = this._rtBloomB.texture;
        this._blurMat.uniforms.uDir.value.set(0.0, 2.4 / this._rtBloomA.height);
        R.setRenderTarget(this._rtBloomA);
        R.render(this._ppScene, qc);

        this._ppQuad.material = this._compMat;
        this._compUniforms.tScene.value = this._rtScene.texture;
        this._compUniforms.tBloom.value = this._rtBloomA.texture;
        R.setRenderTarget(null);
        R.render(this._ppScene, qc);
    }
}
