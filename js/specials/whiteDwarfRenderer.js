/**
 * White-dwarf near-view renderer.
 * Tiny dense core, controlled bloom-friendly glows, thin ring, no jets.
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

        // Keep cinematic visibility, but clearly denser/smaller than red giants.
        const coreSize = this.host.getFocusedCoreSize('white-dwarf') * 0.42;
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(coreSize, 64, 48),
            new THREE.MeshBasicMaterial({ color: 0xf4fbff })
        );
        core.name = 'white-dwarf-core';
        group.add(core);

        const innerGlow = this.host.createGlowMesh(coreSize * 2.2, 0xd7f4ff, 0.55);
        innerGlow.userData.baseOpacity = 0.55;
        core.add(innerGlow);

        const outerGlow = this.host.createGlowMesh(coreSize * 4.6, 0x8fd8ff, 0.16);
        outerGlow.userData.baseOpacity = 0.16;
        core.add(outerGlow);

        const ring = this.host.createCompactHaloRing(
            { ...entry, size: coreSize * 0.9 },
            0xbfe7ff,
            2.6
        );
        if (ring.material) {
            ring.material.opacity = 0.18;
            ring.userData.baseOpacity = 0.18;
        }
        group.add(ring);

        const hotspot = this.host.createHaloSprite(0xffffff, coreSize * 1.5, 0.28);
        hotspot.position.set(coreSize * 0.9, coreSize * 0.28, 0);
        hotspot.userData.baseOpacity = 0.28;
        hotspot.userData.baseScale = coreSize * 1.5;
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
        const pulse = 0.92 + Math.sin(time * 2.8) * 0.08;

        if (this.innerGlow?.material?.uniforms) {
            this.innerGlow.material.uniforms.opacity.value =
                this.innerGlow.userData.baseOpacity * (0.86 + pulse * 0.14);
            this.innerGlow.scale.setScalar(0.97 + pulse * 0.05);
        }
        if (this.outerGlow?.material?.uniforms) {
            this.outerGlow.material.uniforms.opacity.value =
                this.outerGlow.userData.baseOpacity * (0.78 + Math.sin(time * 1.4) * 0.14);
        }
        if (this.ring) {
            this.ring.rotation.z += deltaSeconds * 0.45;
            if (this.ring.material) {
                this.ring.material.opacity = (this.ring.userData.baseOpacity || 0.18)
                    * (0.8 + Math.sin(time * 1.6) * 0.14);
            }
        }
        if (this.hotspot?.material) {
            const hot = 0.62 + Math.max(0, Math.sin(time * 3.6)) * 0.28;
            this.hotspot.material.opacity = this.hotspot.userData.baseOpacity * hot;
            const scale = this.hotspot.userData.baseScale * (0.9 + hot * 0.12);
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
