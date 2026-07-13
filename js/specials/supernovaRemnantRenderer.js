/**
 * Integrated-GPU friendly supernova-remnant near-view renderer.
 * Uses layered shells, deterministic filaments, and static point clouds.
 */
/* global THREE */
class SupernovaRemnantRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.shells = [];
        this.filaments = [];
        this.gasClouds = [];
        this.centralSource = null;
    }

    create(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-supernova-remnant-model`;
        group.userData.effectType = 'supernova';

        const shellConfigs = [
            { radius: 42, color: 0x79ddff, opacity: 0.24, seed: 'hot', speed: 0.055 },
            { radius: 55, color: 0x7677ff, opacity: 0.14, seed: 'gas', speed: -0.032 },
            { radius: 68, color: 0xff7d54, opacity: 0.11, seed: 'dust', speed: 0.021 }
        ];
        shellConfigs.forEach((config, index) => {
            const shell = this.createIrregularShell(entry, config, index);
            group.add(shell);
            this.shells.push(shell);
        });

        const filamentGroup = this.createFilaments(entry);
        group.add(filamentGroup);
        group.add(this.createParticleCloud(entry, 'inner', 1300, 18, 58, 0x8adfff, 1.5, 0.26));
        group.add(this.createParticleCloud(entry, 'outer', 900, 48, 78, 0xff8d61, 1.35, 0.2));

        const source = new THREE.Mesh(
            new THREE.SphereGeometry(2.1, 32, 24),
            new THREE.MeshBasicMaterial({ color: 0xd9f7ff, transparent: true, opacity: 0.58 })
        );
        source.name = 'remnant-central-source';
        source.add(this.host.createGlowMesh(7.5, 0x8fdcff, 0.18));
        group.add(source);
        this.centralSource = source;

        group.rotation.set(0.18, -0.3, 0.08);
        this.group = group;
        return group;
    }

    update(deltaSeconds, time) {
        if (!this.group) return;
        this.shells.forEach((shell, index) => {
            shell.rotation.y += deltaSeconds * shell.userData.rotationSpeed;
            shell.rotation.x += deltaSeconds * shell.userData.rotationSpeed * 0.28;
            if (shell.material?.uniforms) {
                shell.material.uniforms.uTime.value = time;
                shell.material.uniforms.uOpacity.value = shell.userData.baseOpacity * (0.88 + Math.sin(time * 0.55 + index * 1.7) * 0.12);
            }
        });
        this.filaments.forEach((filament, index) => {
            filament.material.opacity = filament.userData.baseOpacity * (0.74 + Math.sin(time * 0.8 + index * 0.63) * 0.22);
        });
        this.gasClouds.forEach((cloud, index) => {
            cloud.rotation.y += deltaSeconds * (index === 0 ? 0.025 : -0.014);
            cloud.material.opacity = cloud.userData.baseOpacity * (0.9 + Math.sin(time * 0.42 + index) * 0.1);
        });
        if (this.centralSource) {
            const pulse = 0.92 + Math.sin(time * 2.4) * 0.08;
            this.centralSource.scale.setScalar(pulse);
            this.centralSource.material.opacity = 0.48 + Math.sin(time * 2.4) * 0.1;
        }
        const expansion = 1 + Math.sin(time * 0.36) * 0.012;
        this.group.scale.setScalar(expansion);
    }

    dispose() {
        this.group = null;
        this.shells = [];
        this.filaments = [];
        this.gasClouds = [];
        this.centralSource = null;
    }

    createIrregularShell(entry, config, index) {
        const geometry = new THREE.SphereGeometry(config.radius, 48, 32);
        const random = this.host.seededRandom(`${entry.id}-shell-${config.seed}`);
        const position = geometry.attributes.position;
        for (let vertex = 0; vertex < position.count; vertex += 1) {
            const x = position.getX(vertex);
            const y = position.getY(vertex);
            const z = position.getZ(vertex);
            const length = Math.max(Math.sqrt(x * x + y * y + z * z), 0.001);
            const wave = Math.sin(x * 0.13 + index) * 0.045 + Math.sin(y * 0.17 - z * 0.11) * 0.035;
            const displacement = 1 + wave + (random() - 0.5) * 0.09;
            position.setXYZ(vertex, x / length * config.radius * displacement, y / length * config.radius * displacement, z / length * config.radius * displacement);
        }
        position.needsUpdate = true;
        geometry.computeVertexNormals();

        const color = new THREE.Color(config.color);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uOpacity: { value: config.opacity },
                uColor: { value: color }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vec4 world = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = world.xyz;
                    gl_Position = projectionMatrix * viewMatrix * world;
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform float uTime;
                uniform float uOpacity;
                uniform vec3 uColor;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                void main() {
                    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                    float rim = pow(1.0 - abs(dot(normalize(vNormal), viewDirection)), 2.25);
                    float textureWave = 0.58 + 0.22 * sin(vWorldPosition.x * 0.11 + uTime * 0.18);
                    textureWave += 0.2 * sin(vWorldPosition.y * 0.15 - vWorldPosition.z * 0.09);
                    float gap = smoothstep(-0.28, 0.18, sin(vWorldPosition.x * 0.075 + vWorldPosition.y * 0.12));
                    float alpha = uOpacity * rim * max(0.12, textureWave) * (0.38 + gap * 0.62);
                    gl_FragColor = vec4(uColor * (0.55 + rim * 1.3), alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        const shell = new THREE.Mesh(geometry, material);
        shell.name = `remnant-shell-${config.seed}`;
        shell.userData.baseOpacity = config.opacity;
        shell.userData.rotationSpeed = config.speed;
        shell.rotation.set(index * 0.17, index * 0.28, index * 0.11);
        return shell;
    }

    createFilaments(entry) {
        const group = new THREE.Group();
        group.name = 'remnant-filaments';
        const random = this.host.seededRandom(`${entry.id}-filaments`);
        for (let index = 0; index < 24; index += 1) {
            const radius = 45 + random() * 27;
            const start = random() * Math.PI * 2;
            const span = 0.4 + random() * 1.05;
            const tilt = (random() - 0.5) * 1.35;
            const points = [];
            for (let pointIndex = 0; pointIndex < 7; pointIndex += 1) {
                const ratio = pointIndex / 6;
                const angle = start + span * ratio;
                const jitter = 1 + Math.sin(ratio * Math.PI * 3 + index) * 0.055;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * radius * jitter,
                    Math.sin(angle * 1.7 + tilt) * radius * 0.34 + Math.sin(tilt) * radius * 0.28,
                    Math.sin(angle) * radius * jitter
                ));
            }
            const curve = new THREE.CatmullRomCurve3(points);
            const opacity = 0.18 + random() * 0.24;
            const material = new THREE.MeshBasicMaterial({
                color: index % 3 === 0 ? 0xff8b61 : 0x87e7ff,
                transparent: true,
                opacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const filament = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.18 + random() * 0.32, 5, false), material);
            filament.userData.baseOpacity = opacity;
            group.add(filament);
            this.filaments.push(filament);
        }
        return group;
    }

    createParticleCloud(entry, suffix, count, innerRadius, outerRadius, color, size, opacity) {
        const random = this.host.seededRandom(`${entry.id}-${suffix}-particles`);
        const positions = [];
        for (let index = 0; index < count; index += 1) {
            const radius = innerRadius + Math.pow(random(), 0.72) * (outerRadius - innerRadius);
            const theta = random() * Math.PI * 2;
            const vertical = Math.asin(random() * 2 - 1);
            const asymmetry = 0.76 + random() * 0.42;
            positions.push(
                Math.cos(theta) * Math.cos(vertical) * radius * asymmetry,
                Math.sin(vertical) * radius * (0.7 + random() * 0.45),
                Math.sin(theta) * Math.cos(vertical) * radius
            );
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color,
            size,
            map: this.host.createRadialTexture(0xffffff),
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            alphaTest: 0.002,
            sizeAttenuation: true
        });
        const cloud = new THREE.Points(geometry, material);
        cloud.name = `remnant-${suffix}-particles`;
        cloud.userData.baseOpacity = opacity;
        this.gasClouds.push(cloud);
        return cloud;
    }
}
