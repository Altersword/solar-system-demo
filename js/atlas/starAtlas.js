/* global THREE, CELESTIAL_CATALOG, SIMULATION */

/**
 * Owns nearby-star atlas: catalog markers, deep-sky objects, map layers,
 * atlas animations, and expanded multi-body system views.
 */
class StarAtlas {
    constructor(host) {
        this.host = host;
        this.atlasGroup = new THREE.Group();
        this.catalogObjects = new Map();
        this.expandedSystemGroup = null;
        this.animatedAtlasObjects = [];
        this.selectedAtlasMap = 'neighborhood';
        this.showAtlas = true;
    }

    attach(scene) {
        scene.add(this.atlasGroup);
    }

    rebuild() {
        this.clear();
        this.atlasGroup.visible = this.showAtlas;
        this.createDistanceShells();

        CELESTIAL_CATALOG.forEach((entry) => {
            if (
                entry.category === 'deep-sky'
                || entry.category === 'galactic-landmark'
                || entry.category === 'nebula'
                || entry.category === 'stellar-object'
                || entry.category === 'stellar-remnant'
                || entry.category === 'compact-object'
                || entry.category === 'supernova-remnant'
                || entry.category === 'galaxy'
                || entry.category === 'galaxy-group'
                || entry.category === 'galaxy-cluster'
                || entry.category === 'supercluster'
            ) {
                this.createDeepSkyObject(entry);
            } else {
                this.createStarMarker(entry);
            }
        });

        this.updateVisibility();
        this.syncHost();
    }

    clear() {
        this.host.clearGroup(this.atlasGroup);
        this.clearExpandedSystem();
        this.catalogObjects.clear();
        this.animatedAtlasObjects = [];
        this.syncHost();
    }

    syncHost() {
        this.host.atlasGroup = this.atlasGroup;
        this.host.catalogObjects = this.catalogObjects;
        this.host.expandedSystemGroup = this.expandedSystemGroup;
        this.host.animatedAtlasObjects = this.animatedAtlasObjects;
        this.host.selectedAtlasMap = this.selectedAtlasMap;
        this.host.showAtlas = this.showAtlas;
    }

    setMap(mapId) {
        if (!SIMULATION.atlasMaps[mapId] || mapId === this.selectedAtlasMap) return;
        this.selectedAtlasMap = mapId;
        this.clearExpandedSystem();
        this.updateVisibility();
        this.syncHost();
        this.host.hideInfoPanel();
    }

    toggle() {
        this.showAtlas = !this.showAtlas;
        this.updateVisibility();
        if (!this.showAtlas) {
            this.clearExpandedSystem();
            this.host.hideInfoPanel();
        }
        this.syncHost();
        return this.showAtlas;
    }

    updateVisibility() {
        this.atlasGroup.visible = this.showAtlas;
        this.atlasGroup.children.forEach((child) => {
            child.visible = (child.userData.atlasMap || 'neighborhood') === this.selectedAtlasMap;
        });
        this.syncHost();
    }

    updateAnimations(deltaSeconds) {
        if (!this.showAtlas) return;
        const time = this.host.clock.elapsedTime;
        this.animatedAtlasObjects.forEach((item) => {
            if (!item.group.visible) return;
            const pulse = 1 + Math.sin(time * 1.3 + item.phase) * 0.055;
            const effectPulse = item.effectType === 'red-giant' ? 1 + Math.sin(time * 0.9 + item.phase) * 0.1 : pulse;
            item.mesh.scale.setScalar(this.host.enhancedEffects ? effectPulse : 1);
            item.group.rotation.y += deltaSeconds * 0.035;
            item.group.rotation.x += deltaSeconds * 0.009;
            if (item.halo) {
                item.halo.material.opacity = this.host.enhancedEffects ? 0.16 + Math.sin(time * 1.8 + item.phase) * 0.05 : 0.08;
            }
            this.host.updateSpecialObjectEffects(item.group, item.effectType, deltaSeconds, time, item.phase);
        });

        if (this.expandedSystemGroup) {
            const plane = this.expandedSystemGroup.getObjectByName('expanded-orbit-plane');
            if (plane) plane.rotation.z += deltaSeconds * 0.045;
        }
    }

    createStarMarker(entry) {
        const position = this.host.getCatalogPosition(entry);
        const radius = entry.size;
        const group = new THREE.Group();
        group.position.copy(position);
        group.name = entry.id;
        group.userData.atlasMap = entry.atlasMap || 'neighborhood';

        const geometry = new THREE.SphereGeometry(radius, 36, 24);
        const material = new THREE.MeshBasicMaterial({
            color: entry.color,
            transparent: true,
            opacity: 0.96
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { bodyId: entry.id, data: entry, objectKind: 'catalog' };
        group.add(mesh);

        const glow = this.host.createGlowMesh(radius * 3.4, entry.color, 0.28);
        glow.name = `${entry.id}-glow`;
        mesh.add(glow);

        const halo = this.host.createHaloSprite(entry.color, radius * 15, 0.2);
        halo.name = `${entry.id}-halo`;
        group.add(halo);

        this.atlasGroup.add(group);
        this.host.pickables.push(mesh);
        this.catalogObjects.set(entry.id, { entry, group, mesh });
        this.animatedAtlasObjects.push({
            group,
            mesh,
            halo,
            phase: this.host.seededRandom(entry.id)() * Math.PI * 2,
            baseSize: radius
        });
        this.host.createLabel(entry.name, mesh, entry.id, 'stellar');
    }

    createDeepSkyObject(entry) {
        const position = this.host.getCatalogPosition(entry);
        const group = new THREE.Group();
        group.position.copy(position);
        group.name = entry.id;
        group.userData.atlasMap = entry.atlasMap || 'milky-way';

        const coreRadius = Math.max(6, entry.size * 0.3);
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(coreRadius, 28, 18),
            new THREE.MeshBasicMaterial({ color: entry.color, transparent: true, opacity: 0.7 })
        );
        core.userData = { bodyId: entry.id, data: entry, objectKind: 'catalog' };
        group.add(core);

        const cloudCount = entry.category === 'galaxy-group' || entry.category === 'galaxy-cluster' || entry.category === 'supercluster'
            ? 12
            : entry.category === 'galaxy'
                ? 9
                : entry.category === 'nebula'
                    ? 8
                    : entry.category === 'galactic-landmark'
                        ? 5
                        : 7;
        const random = this.host.seededRandom(entry.id);
        for (let i = 0; i < cloudCount; i += 1) {
            const sprite = this.host.createNebulaSprite(entry.color, entry.size * (3.8 + random() * 2.8), 0.13 + random() * 0.13);
            sprite.position.set((random() - 0.5) * entry.size * 4, (random() - 0.5) * entry.size * 2.4, (random() - 0.5) * entry.size * 4);
            group.add(sprite);
        }

        if (entry.effectType) {
            this.decorateSpecialObject(group, entry, core, random);
        }

        this.atlasGroup.add(group);
        this.host.pickables.push(core);
        this.catalogObjects.set(entry.id, { entry, group, mesh: core });
        this.animatedAtlasObjects.push({
            group,
            mesh: core,
            phase: random() * Math.PI * 2,
            baseSize: coreRadius,
            effectType: entry.effectType
        });
        const labelKind = entry.category === 'stellar-object' || entry.category === 'stellar-remnant' || entry.category === 'compact-object' || entry.category === 'supernova-remnant'
            ? 'special-object'
            : entry.category === 'galaxy' || entry.category === 'galaxy-group' || entry.category === 'galaxy-cluster' || entry.category === 'supercluster'
                ? 'galaxy'
                : 'deep-sky';
        this.host.createLabel(entry.name, core, entry.id, labelKind);
    }

    decorateSpecialObject(group, entry, core, random) {
        switch (entry.effectType) {
            case 'red-giant':
                core.add(this.host.createGlowMesh(entry.size * 2.2, entry.color, 0.36));
                group.add(this.host.createParticleShell(entry, 180, entry.size * 2.4, entry.size * 4.2, 0xff8a50, 0.28));
                break;
            case 'red-dwarf':
                core.add(this.host.createGlowMesh(entry.size * 1.8, entry.color, 0.24));
                group.add(this.host.createFlareSparks(entry, random));
                break;
            case 'white-dwarf':
                core.add(this.host.createGlowMesh(entry.size * 2.0, 0xbfe7ff, 0.42));
                group.add(this.host.createCompactHaloRing(entry, 0xbfe7ff, 1.8));
                break;
            case 'pulsar':
                core.add(this.host.createGlowMesh(entry.size * 1.7, 0x8fd8ff, 0.32));
                group.add(this.createPulsarBeams(entry));
                break;
            case 'black-hole':
                core.material.color.setHex(0x020104);
                core.material.opacity = 0.92;
                group.add(this.createAccretionDisk(entry));
                break;
            case 'supernova':
                core.material.opacity = 0.42;
                group.add(this.host.createParticleShell(entry, 360, entry.size * 1.6, entry.size * 5.2, entry.color, 0.5));
                group.add(this.host.createCompactHaloRing(entry, entry.color, 3.1));
                break;
            default:
                break;
        }
    }

    createPulsarBeams(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-pulsar-beams`;
        group.userData.effectRole = 'pulsar-beams';
        const length = entry.size * 9;
        const radius = Math.max(1.2, entry.size * 0.18);

        [-1, 1].forEach((direction) => {
            const material = new THREE.MeshBasicMaterial({
                color: 0x9ee9ff,
                transparent: true,
                opacity: 0.26,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            const cone = new THREE.Mesh(new THREE.ConeGeometry(radius * 2.5, length, 32, 1, true), material);
            cone.position.y = direction * length * 0.5;
            cone.rotation.x = direction > 0 ? Math.PI : 0;
            group.add(cone);
        });
        group.rotation.z = THREE.MathUtils.degToRad(28);
        return group;
    }

    createAccretionDisk(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-accretion-disk`;
        group.userData.effectRole = 'accretion-disk';
        const inner = entry.size * 0.9;
        const outer = entry.size * 3.4;
        const hot = new THREE.Mesh(
            new THREE.RingGeometry(inner, outer, 192),
            new THREE.MeshBasicMaterial({
                color: 0xffb15c,
                transparent: true,
                opacity: 0.58,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        hot.rotation.x = Math.PI / 2;
        group.add(hot);

        const cool = new THREE.Mesh(
            new THREE.RingGeometry(outer * 0.92, outer * 1.45, 192),
            new THREE.MeshBasicMaterial({
                color: 0x8fd8ff,
                transparent: true,
                opacity: 0.24,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        cool.rotation.x = Math.PI / 2;
        group.add(cool);
        return group;
    }

    createDistanceShells() {
        const shellSets = {
            neighborhood: [
                { ly: 5, category: 'nearby-star', color: 0x6da5ff, opacity: 0.055 },
                { ly: 10, category: 'nearby-star', color: 0x5b8fd8, opacity: 0.045 },
                { ly: 25, category: 'nearby-star', color: 0x4b6e9c, opacity: 0.035 },
                { ly: 50, category: 'nearby-star', color: 0x3a5678, opacity: 0.028 }
            ],
            'milky-way': [
                { ly: 500, category: 'nebula', color: 0x7aa7d8, opacity: 0.04 },
                { ly: 1500, category: 'nebula', color: 0x5f86b5, opacity: 0.032 },
                { ly: 5000, category: 'nebula', color: 0x4a6a90, opacity: 0.026 },
                { ly: 15000, category: 'nebula', color: 0x385272, opacity: 0.02 }
            ],
            'local-group': [
                { ly: 200000, category: 'galaxy', color: 0x8f7ad8, opacity: 0.035 },
                { ly: 800000, category: 'galaxy', color: 0x7360b4, opacity: 0.028 },
                { ly: 2500000, category: 'galaxy', color: 0x5b4a94, opacity: 0.022 }
            ],
            'cosmic-neighborhood': [
                { ly: 12000000, category: 'galaxy-group', color: 0xd89a6a, opacity: 0.03 },
                { ly: 54000000, category: 'galaxy-cluster', color: 0xb87a52, opacity: 0.024 },
                { ly: 250000000, category: 'supercluster', color: 0x966040, opacity: 0.018 }
            ]
        };

        Object.entries(shellSets).forEach(([atlasMap, shells]) => {
            shells.forEach((shellDef) => {
                const mockEntry = {
                    distanceLy: shellDef.ly,
                    category: shellDef.category,
                    atlasMap
                };
                const radius = this.host.scaleCatalogDistance(mockEntry);
                const geometry = new THREE.SphereGeometry(radius, 80, 40);
                const material = new THREE.MeshBasicMaterial({
                    color: shellDef.color,
                    transparent: true,
                    opacity: shellDef.opacity,
                    wireframe: true,
                    depthWrite: false
                });
                const shell = new THREE.Mesh(geometry, material);
                shell.name = `${atlasMap}-${shellDef.ly}ly-shell`;
                shell.userData.atlasMap = atlasMap;
                this.atlasGroup.add(shell);
            });
        });
    }

    showExpandedSystem(data) {
        this.clearExpandedSystem();
        if (!data.systemLayout || !this.host.selectedObject) return;

        const anchor = new THREE.Vector3();
        this.host.selectedObject.getWorldPosition(anchor);

        const radial = anchor.clone().normalize();
        if (radial.lengthSq() < 0.01) radial.set(1, 0, 0);
        const tangent = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), radial).normalize();
        if (tangent.lengthSq() < 0.01) tangent.set(1, 0, 0);

        const group = new THREE.Group();
        group.name = `${data.id}-expanded-system`;
        group.position.copy(anchor).add(tangent.multiplyScalar(95)).add(new THREE.Vector3(0, 46, 0));
        group.userData.anchor = anchor.clone();

        const plane = new THREE.Group();
        plane.name = 'expanded-orbit-plane';
        plane.rotation.x = THREE.MathUtils.degToRad(-62);
        group.add(plane);

        const scale = data.systemLayout.sceneScale || (data.id === 'trappist-1' ? 1.7 : 1.45);
        const centerMap = new Map();

        data.systemLayout.bodies.forEach((body) => {
            if (!Number.isFinite(body.orbit)) {
                centerMap.set(body.name, new THREE.Vector3(
                    ((body.x ?? 50) - 50) * scale,
                    0,
                    ((body.y ?? 50) - 50) * scale
                ));
            }
        });

        data.systemLayout.bodies.forEach((body) => {
            const center = body.orbitCenter ? centerMap.get(body.orbitCenter) || new THREE.Vector3() : new THREE.Vector3();
            if (Number.isFinite(body.orbit) && body.kind !== 'debris-disk') {
                plane.add(this.createExpandedOrbit(body, center, scale));
            }
        });

        data.systemLayout.bodies.forEach((body) => {
            const mesh = this.createExpandedBody(body, centerMap, scale);
            plane.add(mesh);
            const label = this.host.createTextSprite(body.name, body.kind === 'candidate' ? '#ffd184' : '#f6f3e8');
            label.position.copy(mesh.position).add(new THREE.Vector3(0, (body.size || 7) * 0.65 + 6, 0));
            label.scale.set(34, 12, 1);
            plane.add(label);
        });

        const connector = this.createConnectorLine(anchor, group.position, data.color || 0x9ec9ff);
        group.add(connector);

        this.expandedSystemGroup = group;
        this.host.scene.add(group);
        this.syncHost();
        this.host.flyCameraTo(group.position, data.systemLayout.cameraDistance || (data.id === 'trappist-1' ? 210 : 185));
    }

    createExpandedOrbit(body, center, scale) {
        const radius = body.orbit * scale;
        const points = [];
        const segments = 128;
        for (let i = 0; i <= segments; i += 1) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                center.x + Math.cos(angle) * radius,
                0,
                center.z + Math.sin(angle) * radius
            ));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: body.kind === 'candidate' ? 0xffd184 : 0x8fb2ff,
            transparent: true,
            opacity: body.kind === 'candidate' ? 0.38 : 0.3,
            depthWrite: false
        });
        const line = new THREE.Line(geometry, material);
        line.name = `${body.name}-expanded-orbit`;
        return line;
    }

    createExpandedBody(body, centerMap, scale) {
        if (body.kind === 'debris-disk') {
            const center = body.orbitCenter ? centerMap.get(body.orbitCenter) || new THREE.Vector3() : new THREE.Vector3();
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(Math.max(2, body.orbit * scale - 2), body.orbit * scale + 2, 128),
                new THREE.MeshBasicMaterial({
                    color: body.color,
                    transparent: true,
                    opacity: 0.22,
                    side: THREE.DoubleSide,
                    depthWrite: false
                })
            );
            ring.rotation.x = Math.PI / 2;
            ring.position.copy(center);
            return ring;
        }

        let position;
        if (Number.isFinite(body.orbit)) {
            const center = body.orbitCenter ? centerMap.get(body.orbitCenter) || new THREE.Vector3() : new THREE.Vector3();
            const angle = THREE.MathUtils.degToRad(body.angleDeg || 0);
            position = new THREE.Vector3(
                center.x + Math.cos(angle) * body.orbit * scale,
                0,
                center.z + Math.sin(angle) * body.orbit * scale
            );
        } else {
            position = new THREE.Vector3(
                ((body.x ?? 50) - 50) * scale,
                0,
                ((body.y ?? 50) - 50) * scale
            );
        }

        const radius = Math.max(1.8, (body.size || 7) * 0.36);
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 32, 20),
            new THREE.MeshBasicMaterial({
                color: body.color,
                transparent: body.kind === 'candidate',
                opacity: body.kind === 'candidate' ? 0.78 : 1
            })
        );
        mesh.name = `${body.name}-expanded-body`;
        mesh.position.copy(position);

        if (['star', 'white-dwarf'].includes(body.kind)) {
            mesh.add(this.host.createGlowMesh(radius * 3.4, body.color, body.kind === 'white-dwarf' ? 0.36 : 0.28));
        }
        if (body.kind === 'candidate') {
            mesh.add(this.host.createGlowMesh(radius * 2.2, 0xffd184, 0.18));
        }
        return mesh;
    }

    createConnectorLine(from, to, color) {
        const localFrom = from.clone().sub(to);
        const geometry = new THREE.BufferGeometry().setFromPoints([localFrom, new THREE.Vector3()]);
        const material = new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0.28,
            depthWrite: false
        });
        const line = new THREE.Line(geometry, material);
        line.name = 'expanded-system-connector';
        return line;
    }

    clearExpandedSystem() {
        if (!this.expandedSystemGroup) return;
        this.host.disposeObject3D(this.expandedSystemGroup);
        this.host.scene.remove(this.expandedSystemGroup);
        this.expandedSystemGroup = null;
        this.syncHost();
    }
}
