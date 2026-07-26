/**
 * Routes catalog effectType to a special-body renderer.
 * Returns { renderer, object3d, ownsScreen }.
 */
/* global BlackHoleRenderer, PulsarRenderer, SupernovaRemnantRenderer, RedGiantRenderer, WhiteDwarfRenderer, SunRenderer, SolarSystemFocusRenderer, SimpleSpecialsRenderer, GalaxyRenderer, NebulaRenderer, StarClusterRenderer, GenericStarRenderer, THREE */
globalThis.SpecialBodyFactory = class SpecialBodyFactory {
    /**
     * Derives a focus type for entries without an explicit effectType,
     * so galaxies, nebulae, clusters, and ordinary stars are observable too.
     * Returns null when the entry has no meaningful near view (e.g. direction markers).
     */
    static getFocusType(entry) {
        if (entry.effectType) return entry.effectType;
        if (entry.renderTier === 'bulk') return null;
        switch (entry.category) {
            case 'galaxy':
                return 'galaxy';
            case 'galaxy-group':
            case 'galaxy-cluster':
                return 'galaxy-cluster';
            case 'nebula':
                return /行星状/.test(entry.type || '') ? 'planetary-nebula' : 'nebula';
            case 'supernova-remnant':
                return 'supernova';
            case 'deep-sky':
                if (/球状/.test(entry.type || '')) return 'globular-cluster';
                if (/星团/.test(entry.type || '')) return 'open-cluster';
                if (/星云|恒星形成/.test(entry.type || '')) return 'nebula';
                return null;
            case 'nearby-star':
            case 'stellar-object':
                return 'generic-star';
            default:
                return null;
        }
    }

    /**
     * @param {object} host SolarSystem (renderer, blackHoleConfig, helpers)
     * @param {object} entry catalog entry with effectType
     */
    static create(host, entry) {
        const type = SpecialBodyFactory.getFocusType(entry);

        if (type === 'black-hole') {
            const renderer = new BlackHoleRenderer(host.renderer, host.blackHoleConfig);
            if (entry.id === 'sagittarius-a-star') {
                renderer.setDopplerScale(0.78);
            }
            const group = new THREE.Group();
            group.name = `${entry.id}-bh-fullscreen`;
            group.userData.effectType = type;
            group.add(renderer.getMesh());
            return { renderer, object3d: group, ownsScreen: true };
        }

        if (type === 'pulsar') {
            const renderer = new PulsarRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        if (type === 'supernova') {
            const renderer = new SupernovaRemnantRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        if (type === 'red-giant') {
            const renderer = new RedGiantRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        if (type === 'white-dwarf') {
            const renderer = new WhiteDwarfRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        if (type === 'sun') {
            const renderer = new SunRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        if ([
            'planet-terrestrial',
            'planet-gas',
            'planet-ice',
            'dwarf-planet',
            'moon',
            'comet'
        ].includes(type)) {
            const renderer = new SolarSystemFocusRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        if (type === 'galaxy' || type === 'galaxy-cluster') {
            const renderer = new GalaxyRenderer(host);
            const object3d = renderer.create(entry, type);
            return { renderer, object3d, ownsScreen: false };
        }

        if (type === 'nebula' || type === 'planetary-nebula') {
            const renderer = new NebulaRenderer(host);
            const object3d = renderer.create(entry, type);
            return { renderer, object3d, ownsScreen: false };
        }

        if (type === 'globular-cluster' || type === 'open-cluster') {
            const renderer = new StarClusterRenderer(host);
            const object3d = renderer.create(entry, type);
            return { renderer, object3d, ownsScreen: false };
        }

        if (type === 'generic-star' || type === 'red-dwarf') {
            const renderer = new GenericStarRenderer(host);
            const object3d = renderer.create(entry);
            return { renderer, object3d, ownsScreen: false };
        }

        const renderer = new SimpleSpecialsRenderer(host);
        const object3d = renderer.create(entry);
        return { renderer, object3d, ownsScreen: false };
    }
}
