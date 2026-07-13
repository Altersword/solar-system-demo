/**
 * Lightweight focus models for remaining simple specials (e.g. red-dwarf).
 * Red giant / white dwarf / supernova / pulsar / black hole use dedicated renderers.
 */
/* global THREE */
class SimpleSpecialsRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.effectType = null;
    }

    create(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-focused-model`;
        group.userData.effectType = entry.effectType;
        this.effectType = entry.effectType;

        const coreSize = this.host.getFocusedCoreSize(entry.effectType);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: entry.color,
            transparent: false,
            opacity: 1
        });
        const core = new THREE.Mesh(new THREE.SphereGeometry(coreSize, 96, 64), coreMaterial);
        core.name = 'focus-core';
        group.add(core);

        switch (entry.effectType) {
            case 'red-dwarf':
                core.add(this.host.createGlowMesh(coreSize * 2.0, entry.color, 0.38));
                group.add(this.host.createFlareSparks({ ...entry, size: coreSize }, this.host.seededRandom(`${entry.id}-focus-flare`)));
                group.add(this.host.createCompactHaloRing({ ...entry, size: coreSize }, 0xffb36f, 2.2));
                break;
            default:
                core.add(this.host.createGlowMesh(coreSize * 2, entry.color, 0.35));
                break;
        }

        this.group = group;
        return group;
    }

    update() {}

    dispose() {
        this.group = null;
        this.effectType = null;
    }
}
