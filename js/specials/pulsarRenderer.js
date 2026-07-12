/**
 * Pulsar / neutron-star focus near-view renderer.
 * Shared host helpers: createGlowMesh, createHaloSprite, createRadialTexture, seededRandom.
 */
/* global THREE */
class PulsarRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
    }

    create(entry) {
        const model = new THREE.Group();
        model.name = `${entry.id}-neutron-star-model`;
        model.userData.effectType = 'pulsar';

        const coreRadius = 10;
        const rotor = new THREE.Group();
        rotor.name = 'neutron-star-rotor';
        rotor.userData.effectRole = 'neutron-star-rotor';

        const core = new THREE.Mesh(
            new THREE.SphereGeometry(coreRadius, 128, 96),
            this.createNeutronStarSurfaceMaterial()
        );
        core.name = 'neutron-star-core';
        core.userData.effectRole = 'neutron-star-core';
        rotor.add(core);

        const innerGlow = this.host.createGlowMesh(coreRadius * 1.35, 0xc8f4ff, 0.72);
        innerGlow.name = 'neutron-star-inner-glow';
        core.add(innerGlow);
        const corona = this.host.createHaloSprite(0x78d9ff, coreRadius * 5.4, 0.22);
        corona.name = 'neutron-star-corona';
        core.add(corona);

        const magneticAxis = new THREE.Group();
        magneticAxis.name = 'neutron-star-magnetic-axis';
        magneticAxis.rotation.z = THREE.MathUtils.degToRad(31);
        magneticAxis.add(this.createPulsarBeamPair(coreRadius));
        magneticAxis.add(this.createMagneticFieldLines(coreRadius));

        [-1, 1].forEach((direction) => {
            const hotspotSize = coreRadius * 0.72;
            const hotspot = this.host.createHaloSprite(0xe6fbff, hotspotSize, 0.62);
            hotspot.name = `magnetic-hotspot-${direction > 0 ? 'north' : 'south'}`;
            hotspot.position.y = direction * coreRadius * 1.02;
            hotspot.userData.effectRole = 'magnetic-hotspot';
            hotspot.userData.baseScale = hotspotSize;
            magneticAxis.add(hotspot);
        });

        rotor.add(magneticAxis);
        model.add(rotor);
        model.add(this.createPulsarWindNebula(entry, coreRadius));
        model.add(this.createPulsarShockRings(coreRadius));

        this.group = model;
        return model;
    }

    update() {}

    // GPU resources freed by SolarSystem.clearFocusView → disposeObject3D(focusGroup)
    dispose() {
        this.group = null;
    }

    createNeutronStarSurfaceMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPulse: { value: 0 }
            },
            vertexShader: `
                varying vec3 vObjectNormal;
                varying vec3 vViewNormal;
                varying vec3 vObjectPosition;

                void main() {
                    vObjectNormal = normalize(normal);
                    vViewNormal = normalize(normalMatrix * normal);
                    vObjectPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;

                uniform float uTime;
                uniform float uPulse;
                varying vec3 vObjectNormal;
                varying vec3 vViewNormal;
                varying vec3 vObjectPosition;

                void main() {
                    vec3 n = normalize(vObjectNormal);
                    float longitude = atan(n.z, n.x);
                    float latitude = asin(clamp(n.y, -1.0, 1.0));
                    float crust = sin(longitude * 8.0 + sin(latitude * 5.0) * 1.5 + uTime * 0.28);
                    crust += sin(longitude * 17.0 - latitude * 13.0 - uTime * 0.18) * 0.32;
                    crust = 0.5 + crust * 0.18;

                    float equatorialBand = exp(-pow(latitude / 0.34, 2.0));
                    float polarHeat = pow(abs(n.y), 10.0);
                    float limb = pow(1.0 - abs(normalize(vViewNormal).z), 2.2);

                    vec3 deepBlue = vec3(0.025, 0.14, 0.3);
                    vec3 electricBlue = vec3(0.16, 0.62, 0.98);
                    vec3 iceWhite = vec3(0.84, 0.98, 1.0);
                    vec3 color = mix(deepBlue, electricBlue, crust * 0.72 + equatorialBand * 0.16);
                    color = mix(color, iceWhite, polarHeat * (0.58 + uPulse * 0.42));
                    color += vec3(0.08, 0.5, 0.92) * limb * 0.85;
                    color += iceWhite * uPulse * polarHeat * 0.38;
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });
    }

    createPulsarBeamPair(coreRadius) {
        const beams = new THREE.Group();
        beams.name = 'neutron-star-beams';
        const length = coreRadius * 14;

        [-1, 1].forEach((direction) => {
            const layers = [
                { radius: coreRadius * 0.12, opacity: 0.24, color: 0xe9fcff },
                { radius: coreRadius * 0.26, opacity: 0.072, color: 0x86dcff },
                { radius: coreRadius * 0.46, opacity: 0.022, color: 0x4a9dff }
            ];

            layers.forEach((layer, index) => {
                const material = new THREE.MeshBasicMaterial({
                    color: layer.color,
                    transparent: true,
                    opacity: layer.opacity,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    side: THREE.DoubleSide
                });
                const cone = new THREE.Mesh(
                    new THREE.ConeGeometry(layer.radius * (1.8 + index * 0.3), length, 48, 1, true),
                    material
                );
                cone.name = `pulsar-beam-${direction}-${index}`;
                cone.position.y = direction * length * 0.5;
                cone.rotation.x = direction > 0 ? Math.PI : 0;
                cone.userData.beamLayer = true;
                cone.userData.baseOpacity = layer.opacity;
                beams.add(cone);
            });

            const random = this.host.seededRandom(`pulsar-beam-particles-${direction}`);
            const positions = [];
            for (let i = 0; i < 110; i += 1) {
                const distance = coreRadius * 1.1 + random() * (length - coreRadius);
                const spread = (distance / length) * coreRadius * 0.72;
                const angle = random() * Math.PI * 2;
                positions.push(
                    Math.cos(angle) * spread * random(),
                    direction * distance,
                    Math.sin(angle) * spread * random()
                );
            }
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            const material = new THREE.PointsMaterial({
                color: 0xdaf8ff,
                size: 1.2,
                map: this.host.createRadialTexture(0xffffff),
                transparent: true,
                opacity: 0.28,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                alphaTest: 0.002
            });
            const particles = new THREE.Points(geometry, material);
            particles.name = `pulsar-beam-particles-${direction}`;
            particles.userData.beamLayer = true;
            particles.userData.baseOpacity = 0.28;
            beams.add(particles);
        });

        return beams;
    }

    createMagneticFieldLines(coreRadius) {
        const field = new THREE.Group();
        field.name = 'neutron-star-magnetosphere';

        for (let shell = 0; shell < 3; shell += 1) {
            const shellRadius = coreRadius * (2.4 + shell * 0.9);
            for (let plane = 0; plane < 6; plane += 1) {
                const phi = plane * Math.PI / 3;
                const points = [];
                for (let i = 0; i <= 72; i += 1) {
                    const theta = 0.22 + (Math.PI - 0.44) * (i / 72);
                    const radial = shellRadius * Math.pow(Math.sin(theta), 2);
                    points.push(new THREE.Vector3(
                        radial * Math.sin(theta) * Math.cos(phi),
                        radial * Math.cos(theta),
                        radial * Math.sin(theta) * Math.sin(phi)
                    ));
                }
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const opacity = 0.15 - shell * 0.028;
                const line = new THREE.Line(
                    geometry,
                    new THREE.LineBasicMaterial({
                        color: shell === 0 ? 0xc4f5ff : 0x55bfff,
                        transparent: true,
                        opacity,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false
                    })
                );
                line.userData.baseOpacity = opacity;
                line.userData.magneticFieldLine = true;
                field.add(line);
            }
        }
        return field;
    }

    createPulsarWindNebula(entry, coreRadius) {
        const random = this.host.seededRandom(`${entry.id}-pulsar-wind`);
        const positions = [];
        const colors = [];
        const innerColor = new THREE.Color(0xcaf7ff);
        const outerColor = new THREE.Color(0x3d76ff);
        const particleColor = new THREE.Color();

        for (let i = 0; i < 1700; i += 1) {
            const distanceRatio = Math.pow(random(), 0.7);
            const radius = coreRadius * (1.8 + distanceRatio * 6.2);
            const angle = random() * Math.PI * 2 + distanceRatio * 7.0;
            const thickness = (random() - 0.5) * coreRadius * (0.25 + distanceRatio * 1.15);
            positions.push(Math.cos(angle) * radius, thickness, Math.sin(angle) * radius);
            const color = particleColor.copy(innerColor).lerp(outerColor, distanceRatio);
            const brightness = 0.45 + random() * 0.55;
            colors.push(color.r * brightness, color.g * brightness, color.b * brightness);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        const material = new THREE.PointsMaterial({
            size: 1.45,
            map: this.host.createRadialTexture(0xffffff),
            vertexColors: true,
            transparent: true,
            opacity: 0.38,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            alphaTest: 0.002,
            sizeAttenuation: true
        });
        const wind = new THREE.Points(geometry, material);
        wind.name = 'pulsar-wind-nebula';
        wind.userData.effectRole = 'neutron-star-wind';
        wind.userData.baseOpacity = 0.38;
        return wind;
    }

    createPulsarShockRings(coreRadius) {
        const group = new THREE.Group();
        group.name = 'pulsar-termination-shocks';
        group.userData.effectRole = 'neutron-star-shocks';

        [3.0, 4.6, 6.4].forEach((multiplier, index) => {
            const opacity = 0.15 - index * 0.035;
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(coreRadius * multiplier, 0.22 + index * 0.08, 12, 160),
                new THREE.MeshBasicMaterial({
                    color: index === 0 ? 0xc7f7ff : 0x4e91ff,
                    transparent: true,
                    opacity,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                })
            );
            ring.rotation.x = Math.PI / 2;
            ring.userData.baseOpacity = opacity;
            ring.userData.phase = index * 1.8;
            group.add(ring);
        });
        return group;
    }
}
