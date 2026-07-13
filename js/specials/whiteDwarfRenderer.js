/**
 * White-dwarf near-view renderer.
 * Tiny dense core, strong bloom-friendly glows, optional thin ring, no jets.
 */
/* global THREE */
class WhiteDwarfRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.core = null;
        this.innerGlow = null;
        this.outerGlow = null;
        this.ring = null;
        this.hotspot = null;
    }

    create(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-white-dwarf-model`;
        group.userData.effectType = 'white-dwarf';

        const coreSize = this.host.getFocusedCoreSize('white-dwarf') * 0.62;
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(coreSize, 64, 48),
            new THREE.MeshBasicMaterial({ color: 0xeef9ff })
        );
        core.name = 'white-dwarf-core';
        group.add(core);

        const innerGlow = this.host.createGlowMesh(coreSize * 3.4, 0xd7f4ff, 0.78);
        innerGlow.userData.baseOpacity = 0.78;
        core.add(innerGlow);

        const outerGlow = this.host.createGlowMesh(coreSize * 7.2, 0x8fd8ff, 0.26);
        outerGlow.userData.baseOpacity = 0.26;
        core.add(outerGlow);

        const ring = this.host.createCompactHaloRing(
            { ...entry, size: coreSize },
            0xbfe7ff,
            3.2
        );
        ring.userData.baseOpacity = ring.material?.opacity ?? 0.32;
        group.add(ring);

        const hotspot = this.host.createHaloSprite(0xffffff, coreSize * 2.4, 0.42);
        hotspot.position.set(coreSize * 1.15, coreSize * 0.35, 0);
        hotspot.userData.baseOpacity = 0.42;
        hotspot.userData.baseScale = coreSize * 2.4;
        group.add(hotspot);

        this.group = group;
        this.core = core;
        this.innerGlow = innerGlow;
        this.outerGlow = outerGlow;
        this.ring = ring;
        this.hotspot = hotspot;
        return group;
    }

    update(deltaSeconds, time) {
        if (!this.group) return;
        const pulse = 0.9 + Math.sin(time * 3.4) * 0.1;

        if (this.innerGlow?.material) {
            this.innerGlow.material.opacity = this.innerGlow.userData.baseOpacity * (0.78 + pulse * 0.22);
            this.innerGlow.scale.setScalar(0.96 + pulse * 0.08);
        }
        if (this.outerGlow?.material) {
            this.outerGlow.material.opacity = this.outerGlow.userData.baseOpacity * (0.72 + Math.sin(time * 1.7) * 0.18);
        }
        if (this.ring) {
            this.ring.rotation.z += deltaSeconds * 0.65;
            if (this.ring.material) {
                this.ring.material.opacity = (this.ring.userData.baseOpacity || 0.3)
                    * (0.75 + Math.sin(time * 2.1) * 0.2);
            }
        }
        if (this.hotspot?.material) {
            const hot = 0.55 + Math.max(0, Math.sin(time * 4.5)) * 0.45;
            this.hotspot.material.opacity = this.hotspot.userData.baseOpacity * hot;
            const scale = this.hotspot.userData.baseScale * (0.85 + hot * 0.25);
            this.hotspot.scale.set(scale, scale, 1);
        }
    }

    dispose() {
        this.group = null;
        this.core = null;
        this.innerGlow = null;
        this.outerGlow = null;
        this.ring = null;
        this.hotspot = null;
    }
}
