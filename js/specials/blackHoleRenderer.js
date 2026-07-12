/**
 * BlackHoleRenderer — Schwarzschild geodesic ray-march shader
 * Compatible with THREE.js r128 (global THREE, non-module)
 * Ported from 测试黑洞/index.html v7
 *
 * Usage:
 *   const bhr = new BlackHoleRenderer(renderer, config);
 *   group.add(bhr.getMesh());
 *   // in animation loop:
 *   bhr.update(camera, config, time, aspect);
 *   // on cleanup:
 *   bhr.dispose();
 */

/* global THREE */
class BlackHoleRenderer {
    constructor(renderer, config = {}) {
        this._renderer = renderer;
        this._cfg = config;
        this._dopplerScale = 1;
        this._renderScale = THREE.MathUtils.clamp(config.renderScale ?? 0.58, 0.45, 1.0);

        // Reused vectors keep the five-pass render loop allocation-free.
        this._camWorld = new THREE.Vector3();
        this._forwardWorld = new THREE.Vector3();
        this._forwardShader = new THREE.Vector3();
        this._rightShader = new THREE.Vector3();
        this._upShader = new THREE.Vector3();
        this._spinAxis = new THREE.Vector3(0, 0, 1);
        this._origin = new THREE.Vector3();

        // ── Shaders ───────────────────────────────────────────────────────────
        const passVert = [
            'varying vec2 vUv;',
            'void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}'
        ].join('\n');

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
            'vec3 diskHeat(float inner,float shift){',
            '  vec3 ember=vec3(.15,.012,.001),orange=vec3(1.,.19,.012),gold=vec3(1.,.72,.16);',
            '  vec3 warmWhite=vec3(1.,.94,.72),blueWhite=vec3(.76,.9,1.);',
            '  vec3 hot=mix(warmWhite,blueWhite,clamp((uTemperature-9000.)/11000.,0.,1.));',
            '  vec3 c=mix(ember,orange,smoothstep(.0,.34,inner));',
            '  c=mix(c,gold,smoothstep(.25,.64,inner));',
            '  c=mix(c,hot,smoothstep(.58,1.,inner));',
            '  return mix(c,c*vec3(.78,.92,1.18),clamp(shift*.32,0.,.3));',
            '}',
            'vec3 starField(vec3 d){',
            '  vec2 uv=vec2(atan(d.y,d.x)/6.2831853+.5,asin(clamp(d.z,-1.,1.))/3.1415926+.5);',
            '  vec2 grid=uv*vec2(760.,380.);',
            '  vec2 cell=floor(grid),f=fract(grid)-.5;',
            '  float seed=h2f(cell);',
            '  float core=1.-smoothstep(.018,.085,length(f));',
            '  float star=smoothstep(.9935,.9997,seed)*core*(.38+1.8*pow(seed,12.));',
            '  vec3 tint=mix(vec3(.65,.78,1.),vec3(1.,.72,.45),h2f(cell+17.));',
            '  return tint*star;',
            '}',
            '',
            'void main(){',
            '  vec2 sc=(vUv-.5)*vec2(uAspect,1.);',
            '  vec3 dir=normalize(uCamForward+uCamRight*sc.x*1.58+uCamUp*sc.y*1.58);',
            '  float stepLength=clamp(length(uCameraPos)/128.,.12,.4);',
            '  vec3 pos=uCameraPos,vel=dir*stepLength;',
            '  float h2=dot(cross(pos,vel),cross(pos,vel));',
            '  const float RS=2.,ISCO=6.,DI=5.35,DO=22.5,DH=.58;',
            '  float minR=999.,diskAlpha=0.; int fellIn=0;',
            '  vec3 diskColor=vec3(0.);',
            '  for(int i=0;i<144;i++){',
            '    float r=length(pos); minR=min(minR,r);',
            '    if(r<RS){fellIn=1;break;}',
            '    if(r>72.&&i>10)break;',
            '    float r2=dot(pos,pos),r5=max(pow(r2,2.5),.0001);',
            '    vel+=-1.5*h2*pos/r5*uLensing;',
            '    pos+=vel;',
            '    float rxy=length(pos.xy),az=abs(pos.z);',
            '    if(az<DH*2.2&&rxy>DI&&rxy<DO){',
            '      float radial=clamp((rxy-DI)/(DO-DI),0.,1.);',
            '      float radialWindow=smoothstep(DI,DI+.75,rxy)*smoothstep(DO,DO-3.2,rxy);',
            '      float thickness=DH*(.72+radial*.72);',
            '      float vertical=exp(-pow(az/max(thickness,.01),2.)*3.4);',
            '      float angle=atan(pos.y,pos.x);',
            '      float flow=sn(vec2(angle*3.1-uTime*(.62+radial*.22),radial*9.5+uTime*.08));',
            '      float filament=.5+.5*sin(angle*15.-radial*47.-uTime*1.65+flow*4.2);',
            '      float knots=h2f(floor(vec2(angle*9.+uTime*.08,radial*31.-uTime*.13)));',
            '      float structure=mix(.72,.48+flow*.4+filament*.2+knots*.14,clamp(uTurbulence,0.,1.4));',
            '      float density=radialWindow*vertical*structure;',
            '      if(density>.002){',
            '        vec3 tangent=normalize(vec3(-pos.y,pos.x,0.));',
            '        vec3 toObserver=normalize(uCameraPos-pos);',
            '        float beta=clamp(sqrt(1./max(rxy-RS,.35)),.05,.68);',
            '        float gamma=inversesqrt(max(1.-beta*beta,.05));',
            '        float los=dot(tangent,toObserver);',
            '        float doppler=1./max(gamma*(1.-beta*los),.18);',
            '        float beaming=mix(1.,pow(clamp(doppler,.45,2.35),3.),clamp(uDoppler,0.,1.));',
            '        float grav=sqrt(max(1.-RS/max(rxy,RS+.01),.08));',
            '        float inner=pow(1.-radial,.58);',
            '        vec3 emission=diskHeat(inner,los*uDoppler)*density*beaming*grav;',
            '        emission*=uLuminance*(.42+inner*.92);',
            '        float sampleAlpha=(1.-exp(-density*stepLength*2.35))*(.5+inner*.35);',
            '        diskColor+=(1.-diskAlpha)*emission*sampleAlpha;',
            '        diskAlpha+=(1.-diskAlpha)*sampleAlpha;',
            '      }',
            '    }',
            '  }',
            '  vec3 background=fellIn==1?vec3(0.):starField(normalize(vel));',
            '  vec3 col=background*(1.-diskAlpha)+diskColor;',
            '  float photon=exp(-pow((minR-3.)/.16,2.))*smoothstep(RS*1.01,RS*1.12,minR);',
            '  float lensGlow=exp(-pow((minR-3.55)/.58,2.))*smoothstep(RS*1.05,RS*1.35,minR);',
            '  col+=vec3(1.,.88,.58)*photon*.88;',
            '  col+=vec3(.35,.16,.035)*lensGlow*.075;',
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
            '  gl_FragColor=vec4(c*b/max(lum,0.001),1.);',
            '}'
        ].join('\n');

        const blurFrag = [
            'precision mediump float;',
            'varying vec2 vUv;',
            'uniform sampler2D tDiffuse;',
            'uniform vec2 uDir;',
            'void main(){',
            '  vec3 s=vec3(0.);',
            '  s+=texture2D(tDiffuse,vUv-uDir*2.).rgb*0.0625;',
            '  s+=texture2D(tDiffuse,vUv-uDir   ).rgb*0.25;',
            '  s+=texture2D(tDiffuse,vUv         ).rgb*0.375;',
            '  s+=texture2D(tDiffuse,vUv+uDir   ).rgb*0.25;',
            '  s+=texture2D(tDiffuse,vUv+uDir*2.).rgb*0.0625;',
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
            'void main(){',
            '  vec3 scene=texture2D(tScene,vUv).rgb;',
            '  vec3 bloom=texture2D(tBloom,vUv).rgb;',
            '  vec3 c=(scene+bloom*uBloomStr)*uExposure;',
            '  if(uBypass<0.5){',
            '    c=clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);',
            '    c=pow(c,vec3(1./2.2));',
            '  }',
            '  float vignette=1.-smoothstep(.34,.82,length(vUv-.5));',
            '  c*=mix(.82,1.,vignette);',
            '  gl_FragColor=vec4(clamp(c,0.,1.),1.);',
            '}'
        ].join('\n');

        // ── BH uniforms ───────────────────────────────────────────────────────
        this._U = {
            uCameraPos:   { value: new THREE.Vector3() },
            uCamForward:  { value: new THREE.Vector3() },
            uCamRight:    { value: new THREE.Vector3() },
            uCamUp:       { value: new THREE.Vector3() },
            uAspect:      { value: 1.7778 },
            uTime:        { value: 0 },
            uDoppler:     { value: config.dopplerIntensity ?? 0.5 },
            uLuminance:   { value: 0.8 },
            uTemperature: { value: config.diskTemperature ?? 8751.0 },
            uLensing:     { value: config.lensingStrength ?? 1.0 },
            uTurbulence:  { value: config.diskTurbulence ?? 1.0 }
        };

        // ── Geometry + ortho cam ──────────────────────────────────────────────
        this._geo    = new THREE.PlaneBufferGeometry(2, 2);
        this._quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
        this._quadCam.position.z = 1;

        // ── BH scene ──────────────────────────────────────────────────────────
        this._bhMat = new THREE.ShaderMaterial({
            uniforms: this._U,
            vertexShader: passVert,
            fragmentShader: bhFrag,
            depthTest: false, depthWrite: false
        });
        this._bhScene = new THREE.Scene();
        const bhQ = new THREE.Mesh(this._geo, this._bhMat);
        bhQ.frustumCulled = false;
        this._bhScene.add(bhQ);

        // ── Post-process scene (one quad, material swapped) ───────────────────
        this._ppScene = new THREE.Scene();
        this._ppQuad  = new THREE.Mesh(this._geo, null);
        this._ppQuad.frustumCulled = false;
        this._ppScene.add(this._ppQuad);

        // ── Render targets ────────────────────────────────────────────────────
        const rtOpts = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        };
        const W = Math.max(1, Math.floor(window.innerWidth * this._renderScale));
        const H = Math.max(1, Math.floor(window.innerHeight * this._renderScale));
        this._rtScene  = new THREE.WebGLRenderTarget(W, H, rtOpts);
        this._rtBloomA = new THREE.WebGLRenderTarget(W >> 1, H >> 1, rtOpts);
        this._rtBloomB = new THREE.WebGLRenderTarget(W >> 1, H >> 1, rtOpts);

        // ── Post-process materials ────────────────────────────────────────────
        this._brightMat = new THREE.ShaderMaterial({
            uniforms: { tDiffuse: { value: null }, uThreshold: { value: 0.35 } },
            vertexShader: passVert, fragmentShader: brightFrag,
            depthTest: false, depthWrite: false
        });
        this._blurMat = new THREE.ShaderMaterial({
            uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2() } },
            vertexShader: passVert, fragmentShader: blurFrag,
            depthTest: false, depthWrite: false
        });
        this._compUniforms = {
            tScene:    { value: null },
            tBloom:    { value: null },
            uBloomStr: { value: config.bloomStrength ?? 1.5 },
            uExposure: { value: config.exposureCompensation ?? 1.0 },
            uBypass:   { value: 0.0 }
        };
        this._compMat = new THREE.ShaderMaterial({
            uniforms: this._compUniforms,
            vertexShader: passVert, fragmentShader: compFrag,
            depthTest: false, depthWrite: false
        });

        // ── Visible proxy mesh (invisible fullscreen quad in the focus group) ─
        // Rendering happens in this class; the proxy only participates in focus cleanup.
        this._proxyMesh = new THREE.Mesh(
            this._geo,
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthTest: false, depthWrite: false })
        );
        this._proxyMesh.frustumCulled = false;
        this._proxyMesh.renderOrder   = 999;
        this._proxyMesh.userData.effectRole       = 'black-hole-fullscreen-shader';
        this._proxyMesh.userData.managedByFocusRenderer = true;
    }

    // ── Public API ────────────────────────────────────────────────────────────

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
        this._rtBloomA.setSize(Math.max(1, renderWidth >> 1), Math.max(1, renderHeight >> 1));
        this._rtBloomB.setSize(Math.max(1, renderWidth >> 1), Math.max(1, renderHeight >> 1));
    }

    /**
     * Called every frame by updateSpecialObjectEffects.
     * @param {THREE.PerspectiveCamera} camera - the scene camera
     * @param {object}  config  - blackHoleConfig from solarSystem
     * @param {number}  time    - elapsed seconds
     * @param {number}  aspect  - viewport width/height
     */
    update(camera, config, time, aspect) {
        this._U.uTime.value    = time;
        this._U.uAspect.value  = aspect;

        // Apply config overrides
        if (config) {
            if (config.dopplerIntensity !== undefined) this._U.uDoppler.value = config.dopplerIntensity * this._dopplerScale;
            if (config.bloomStrength    !== undefined) this._compUniforms.uBloomStr.value = config.bloomStrength;
            if (config.diskTemperature  !== undefined) this._U.uTemperature.value = config.diskTemperature;
            if (config.lensingStrength  !== undefined) this._U.uLensing.value = config.lensingStrength;
            if (config.diskTurbulence   !== undefined) this._U.uTurbulence.value = config.diskTurbulence;
            if (config.exposureCompensation !== undefined) this._compUniforms.uExposure.value = config.exposureCompensation;
            if (config.logLuminance !== undefined) {
                this._U.uLuminance.value = THREE.MathUtils.clamp(Math.pow(10, config.logLuminance - 6.83), 0.55, 2.4);
            }
        }

        // Camera world pos → shader Z=spin coord (swap Y↔Z)
        const camW = this._camWorld.copy(camera.position);
        this._U.uCameraPos.value.set(camW.x, camW.z, camW.y);

        // Forward direction (camera→origin since focus group is at origin)
        const fwW = this._forwardWorld.subVectors(this._origin, camW).normalize();
        const fwS = this._forwardShader.set(fwW.x, fwW.z, fwW.y);

        // Right = cross(forward, spin_up=(0,0,1)) in shader space
        const rtS = this._rightShader.crossVectors(fwS, this._spinAxis);
        if (rtS.lengthSq() < 0.000001) rtS.set(1, 0, 0);
        else rtS.normalize();

        // Up = cross(right, forward)
        const upS = this._upShader.crossVectors(rtS, fwS).normalize();

        this._U.uCamForward.value.copy(fwS);
        this._U.uCamRight.value.copy(rtS);
        this._U.uCamUp.value.copy(upS);

        // Execute the 5-pass bloom pipeline, drawing directly to screen
        this._render();
    }

    dispose() {
        [this._rtScene, this._rtBloomA, this._rtBloomB].forEach(rt => rt.dispose());
        [this._bhMat, this._brightMat, this._blurMat, this._compMat, this._proxyMesh.material].forEach(m => m.dispose());
        this._geo.dispose();
    }

    // ── Private ───────────────────────────────────────────────────────────────

    _render() {
        const R  = this._renderer;
        const qc = this._quadCam;

        // 1. BH → rtScene
        R.setRenderTarget(this._rtScene);
        R.render(this._bhScene, qc);

        // 2. Bright extract → rtBloomA
        this._ppQuad.material = this._brightMat;
        this._brightMat.uniforms.tDiffuse.value = this._rtScene.texture;
        R.setRenderTarget(this._rtBloomA);
        R.render(this._ppScene, qc);

        // 3. H-blur → rtBloomB
        this._ppQuad.material = this._blurMat;
        this._blurMat.uniforms.tDiffuse.value = this._rtBloomA.texture;
        this._blurMat.uniforms.uDir.value.set(1.0 / this._rtBloomA.width, 0.0);
        R.setRenderTarget(this._rtBloomB);
        R.render(this._ppScene, qc);

        // 4. V-blur → rtBloomA
        this._blurMat.uniforms.tDiffuse.value = this._rtBloomB.texture;
        this._blurMat.uniforms.uDir.value.set(0.0, 1.0 / this._rtBloomA.height);
        R.setRenderTarget(this._rtBloomA);
        R.render(this._ppScene, qc);

        // 5. Composite → screen
        this._ppQuad.material = this._compMat;
        this._compUniforms.tScene.value = this._rtScene.texture;
        this._compUniforms.tBloom.value = this._rtBloomA.texture;
        R.setRenderTarget(null);
        R.render(this._ppScene, qc);
    }

}
