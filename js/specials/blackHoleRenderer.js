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

        // Hybrid geodesic renderer: adaptive Schwarzschild-like bending plus
        // explicit thin-disk crossings. The surface crossings keep the primary disk crisp,
        // while the volume samples preserve turbulent thickness and naturally create the
        // upper/lower secondary images when a ray loops around the shadow.
        const bhFrag = `
precision highp float;
varying vec2 vUv;
uniform vec3 uCameraPos, uCamForward, uCamRight, uCamUp;
uniform float uAspect, uTime, uDoppler, uLuminance, uTemperature, uLensing, uTurbulence;

#define PI 3.141592653589793
const float RS = 2.0;
const float DISK_INNER = 5.15;
const float DISK_OUTER = 24.0;

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
        mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.52;
    mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);
    for (int octave = 0; octave < 5; octave++) {
        value += amplitude * noise2(p);
        p = rotation * p * 2.03 + vec2(13.7, 7.9);
        amplitude *= 0.5;
    }
    return value;
}

vec3 kelvinToRgb(float kelvin) {
    float temperature = clamp(kelvin, 1000.0, 40000.0) / 100.0;
    float red;
    float green;
    float blue;

    if (temperature <= 66.0) {
        red = 1.0;
        green = clamp((99.4708025861 * log(max(temperature, 1.0)) - 161.1195681661) / 255.0, 0.0, 1.0);
    } else {
        red = clamp((329.698727446 * pow(temperature - 60.0, -0.1332047592)) / 255.0, 0.0, 1.0);
        green = clamp((288.1221695283 * pow(temperature - 60.0, -0.0755148492)) / 255.0, 0.0, 1.0);
    }

    if (temperature >= 66.0) {
        blue = 1.0;
    } else if (temperature <= 19.0) {
        blue = 0.0;
    } else {
        blue = clamp((138.5177312231 * log(temperature - 10.0) - 305.0447927307) / 255.0, 0.0, 1.0);
    }

    return max(vec3(red, green, blue), vec3(0.0));
}

float temperatureProfile(float radius) {
    float ratio = clamp(DISK_INNER / max(radius, DISK_INNER + 0.001), 0.0, 0.9999);
    float standardDisk = pow(ratio, 0.75) * pow(max(1.0 - sqrt(ratio), 0.0001), 0.25);
    return pow(clamp(standardDisk / 0.488, 0.0, 1.0), 1.32);
}

vec4 diskRadiance(vec3 position, vec3 travelDirection, float pathLength, float surfaceBoost) {
    float radius = length(position.xy);
    if (radius <= DISK_INNER || radius >= DISK_OUTER) return vec4(0.0);

    float radial = (radius - DISK_INNER) / (DISK_OUTER - DISK_INNER);
    float radialWindow = smoothstep(DISK_INNER, DISK_INNER + 0.75, radius)
        * (1.0 - smoothstep(DISK_OUTER - 4.2, DISK_OUTER, radius));

    float angularVelocity = pow(DISK_INNER / radius, 1.5);
    float angle = atan(position.y, position.x);
    float phase = angle - uTime * (0.34 + 0.72 * angularVelocity);
    float shearCoordinate = phase * 3.4 - radial * 14.0;
    float coarseFlow = fbm(vec2(shearCoordinate, radial * 9.0 + uTime * 0.035));
    float fineFlow = fbm(vec2(phase * 8.0 - radial * 34.0, radial * 24.0 - uTime * 0.08));
    float filament = pow(0.5 + 0.5 * sin(phase * 17.0 - radial * 78.0 + coarseFlow * 4.5), 1.7);
    float narrowFilament = pow(0.5 + 0.5 * sin(phase * 31.0 - radial * 132.0 + fineFlow * 3.0), 2.2);
    float turbulence = clamp(uTurbulence, 0.0, 1.4);
    float structure = mix(0.82, 0.30 + coarseFlow * 0.42 + fineFlow * 0.16 + filament * 0.25 + narrowFilament * 0.12, turbulence);

    float warp = sin(phase * 2.0 - radial * 9.0) * (0.018 + radial * 0.045);
    // Keep the primary disk optically thin; the lensed copies should read as bands,
    // not as a second opaque torus below the shadow.
    float thickness = 0.062 + radial * 0.155 + coarseFlow * 0.028;
    float vertical = exp(-pow(abs(position.z - warp) / max(thickness, 0.035), 2.0) * 3.8);
    float density = radialWindow * vertical * structure * surfaceBoost;
    if (density < 0.001) return vec4(0.0);

    vec3 tangent = normalize(vec3(-position.y, position.x, 0.0));
    vec3 toObserver = normalize(uCameraPos - position);
    float lineOfSight = dot(tangent, toObserver);
    float beta = clamp(sqrt(RS / max(2.0 * (radius - RS), 0.2)), 0.04, 0.68);
    float gamma = inversesqrt(max(1.0 - beta * beta, 0.05));
    float doppler = 1.0 / max(gamma * (1.0 - beta * lineOfSight), 0.18);
    float gravitationalShift = sqrt(max(1.0 - RS / radius, 0.035));
    float totalShift = clamp(doppler * gravitationalShift, 0.42, 1.72);
    float dopplerMix = clamp(uDoppler, 0.0, 1.15);

    float heat = temperatureProfile(radius);
    float emittedTemperature = mix(1250.0, uTemperature, heat);
    float observedTemperature = emittedTemperature * mix(1.0, totalShift, dopplerMix);
    vec3 color = kelvinToRgb(observedTemperature);
    vec3 spectralTint = mix(
        vec3(1.30, 0.58, 0.11),
        vec3(0.62, 0.88, 1.24),
        smoothstep(0.025, 0.60, heat)
    );
    color *= mix(vec3(1.0), spectralTint, 0.68);
    vec3 kinematicTint = mix(
        vec3(1.28, 0.48, 0.10),
        vec3(0.60, 0.90, 1.30),
        clamp(lineOfSight * 0.5 + 0.5, 0.0, 1.0)
    );
    color *= mix(vec3(1.0), kinematicTint, clamp(uDoppler * 0.72, 0.0, 0.82));

    // Keep spectral colour and energy separate so one side can remain blue-white
    // while the receding flow stays amber instead of both clipping to flat white.
    float beaming = mix(1.0, pow(totalShift, 2.35), dopplerMix);
    float thermalPower = 0.34 + heat * 1.30;
    float outerEmber = mix(0.60, 1.0, heat);
    color *= beaming * thermalPower * outerEmber * uLuminance * 0.92;

    float opacity = 1.0 - exp(-density * pathLength * (1.55 + surfaceBoost * 0.48));
    opacity *= mix(0.10, 0.62, pow(heat, 0.72));
    return vec4(color, clamp(opacity, 0.0, 0.66));
}

vec3 starField(vec3 direction) {
    vec2 uv = vec2(
        atan(direction.y, direction.x) / (2.0 * PI) + 0.5,
        asin(clamp(direction.z, -1.0, 1.0)) / PI + 0.5
    );
    vec2 grid = uv * vec2(1180.0, 590.0);
    vec2 cell = floor(grid);
    vec2 local = fract(grid) - 0.5;
    float seed = hash21(cell);
    float starCore = 1.0 - smoothstep(0.025, 0.12, length(local));
    float star = smoothstep(0.9965, 0.9998, seed) * starCore * (0.25 + 1.9 * pow(seed, 18.0));
    vec3 tint = mix(vec3(0.58, 0.72, 1.0), vec3(1.0, 0.78, 0.54), hash21(cell + 17.0));

    float galacticLatitude = abs(uv.y - 0.46 + sin(uv.x * 10.0) * 0.018);
    float dustBand = exp(-galacticLatitude * galacticLatitude * 420.0);
    float dustNoise = fbm(uv * vec2(18.0, 44.0));
    vec3 haze = vec3(0.055, 0.040, 0.032) * dustBand * dustNoise * 0.010;
    return tint * star * 0.72 + haze;
}

void main() {
    vec2 screen = (vUv - 0.5) * vec2(uAspect, 1.0);
    vec3 rayDirection = normalize(
        uCamForward + uCamRight * screen.x * 1.78 + uCamUp * screen.y * 1.78
    );

    float stableJitter = hash21(gl_FragCoord.xy);
    vec3 position = uCameraPos + rayDirection * (0.015 + stableJitter * 0.055);
    float minimumRadius = 1.0e5;
    float diskAlpha = 0.0;
    vec3 diskColor = vec3(0.0);
    float orbitAmount = 0.0;
    int captured = 0;

    for (int stepIndex = 0; stepIndex < 240; stepIndex++) {
        float radius = length(position);
        minimumRadius = min(minimumRadius, radius);

        if (radius < RS * 0.985) {
            captured = 1;
            break;
        }
        if (radius > 96.0 && dot(position, rayDirection) > 0.0 && stepIndex > 18) break;

        float stepLength = clamp(radius * 0.025, 0.035, 0.28);
        if (abs(position.z) < 1.05 && length(position.xy) < DISK_OUTER + 1.0) stepLength *= 0.52;

        vec3 previousPosition = position;
        vec3 towardCenter = -position / max(radius, 0.0001);
        vec3 perpendicularPull = towardCenter - rayDirection * dot(towardCenter, rayDirection);
        float bending = 1.58 * RS * stepLength / max(radius * radius, 0.08);
        bending *= uLensing * (1.0 + 0.42 * RS / max(radius, RS));
        rayDirection = normalize(rayDirection + perpendicularPull * bending);
        position += rayDirection * stepLength;
        orbitAmount += bending;

        bool crossedDisk = previousPosition.z * position.z <= 0.0;
        if (crossedDisk) {
            float denominator = previousPosition.z - position.z;
            float crossingT = abs(denominator) > 0.00001 ? previousPosition.z / denominator : 0.5;
            vec3 crossing = mix(previousPosition, position, clamp(crossingT, 0.0, 1.0));
            // A crossing represents a finite optical column, rather than one
            // ray-march slice, which keeps both lensed disk images continuous.
            vec4 surfaceSample = diskRadiance(crossing, rayDirection, max(stepLength * 2.5, 0.48), 1.35);
            float lensedImageBoost = 1.0 + 3.4 * smoothstep(0.28, 1.05, orbitAmount);
            diskColor += (1.0 - diskAlpha * 0.24) * surfaceSample.rgb * surfaceSample.a * lensedImageBoost;
            diskAlpha += (1.0 - diskAlpha) * surfaceSample.a * 0.24;
        } else if (abs(position.z) < 0.82 && length(position.xy) < DISK_OUTER) {
            vec4 volumeSample = diskRadiance(position, rayDirection, stepLength, 0.50);
            float volumeLensingBoost = 0.72 + 3.2 * smoothstep(0.20, 0.82, orbitAmount);
            diskColor += (1.0 - diskAlpha * 0.18) * volumeSample.rgb * volumeSample.a * volumeLensingBoost;
            diskAlpha += (1.0 - diskAlpha) * volumeSample.a * 0.08;
        }

        if (diskAlpha > 0.92) break;
    }

    float shadow = 1.0 - smoothstep(RS * 0.98, RS * 1.24, minimumRadius);
    if (captured == 1) shadow = 1.0;

    vec3 background = starField(normalize(rayDirection));
    background *= 1.0 - shadow;

    vec3 color = background * (1.0 - diskAlpha) + diskColor;

    float photonRing = exp(-pow((minimumRadius - 3.0) / 0.105, 2.0));
    photonRing *= smoothstep(RS * 1.12, RS * 1.34, minimumRadius);
    float ringVisibility = 0.12 + diskAlpha * 0.36 + min(orbitAmount * 0.035, 0.12);
    color += vec3(0.92, 0.82, 0.66) * photonRing * ringVisibility * 0.38;

    float horizonRim = exp(-pow((minimumRadius - RS * 1.10) / 0.17, 2.0));
    color += vec3(0.66, 0.27, 0.07) * horizonRim * (1.0 - shadow) * 0.028;

    color = max(color, vec3(0.0));
    gl_FragColor = vec4(color, 1.0);
}`;

        const brightFrag = [
            'precision mediump float;',
            'varying vec2 vUv;',
            'uniform sampler2D tDiffuse;',
            'uniform float uThreshold;',
            'void main(){',
            '  vec3 c=texture2D(tDiffuse,vUv).rgb;',
            '  float lum=dot(c,vec3(0.2126,0.7152,0.0722));',
            '  float knee=max(uThreshold*.55,0.001);',
            '  float soft=clamp((lum-uThreshold+knee)/(2.*knee),0.,1.);',
            '  float b=max(lum-uThreshold,0.)+soft*soft*knee*.55;',
            '  // keep warm cast in bloom extract',
            '  gl_FragColor=vec4(c*b/max(lum,0.001)*vec3(1.02,1.,.97),1.);',
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
            '  vec2 hx=vec2(uTexel.x*1.7,0.);',
            '  vec3 streak=bloom*0.10;',
            '  streak+=texture2D(tBloom,vUv-hx*2.).rgb*0.045;',
            '  streak+=texture2D(tBloom,vUv+hx*2.).rgb*0.045;',
            '  streak+=texture2D(tBloom,vUv-hx*5.).rgb*0.018;',
            '  streak+=texture2D(tBloom,vUv+hx*5.).rgb*0.018;',
            '  vec3 c=(scene+bloom*uBloomStr+streak*uBloomStr*.08)*uExposure;',
            '  if(uBypass<0.5){',
            '    c=clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);',
            '    c=pow(c,vec3(1./2.2));',
            '  }',
            '  float vignette=1.-smoothstep(.42,.92,length(vUv-.5));',
            '  c*=mix(.84,1.,vignette);',
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
            uLuminance:   { value: 0.78 },
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
            uniforms: { tDiffuse: { value: null }, uThreshold: { value: 0.42 } },
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
            uBloomStr: { value: config.bloomStrength ?? 1.16 },
            uExposure: { value: config.exposureCompensation ?? 1.03 },
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
                    0.55,
                    1.8
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
        this._blurMat.uniforms.uDir.value.set(1.85 / this._rtBloomA.width, 0.0);
        R.setRenderTarget(this._rtBloomB);
        R.render(this._ppScene, qc);

        this._blurMat.uniforms.tDiffuse.value = this._rtBloomB.texture;
        this._blurMat.uniforms.uDir.value.set(0.0, 1.85 / this._rtBloomA.height);
        R.setRenderTarget(this._rtBloomA);
        R.render(this._ppScene, qc);

        this._ppQuad.material = this._compMat;
        this._compUniforms.tScene.value = this._rtScene.texture;
        this._compUniforms.tBloom.value = this._rtBloomA.texture;
        R.setRenderTarget(null);
        R.render(this._ppScene, qc);
    }
}
