const {
    CELESTIAL_CATALOG,
    SIMULATION
} = require('../js/planetData.js');

const validCategories = new Set([
    'nearby-star',
    'deep-sky',
    'galactic-landmark',
    'nebula',
    'stellar-object',
    'stellar-remnant',
    'compact-object',
    'supernova-remnant',
    'galaxy',
    'galaxy-group',
    'galaxy-cluster',
    'supercluster'
]);

const errors = [];
const ids = new Set();

for (const entry of CELESTIAL_CATALOG) {
    if (ids.has(entry.id)) errors.push(`${entry.id}: duplicate id`);
    ids.add(entry.id);

    if (!entry.name || !entry.nameEn) errors.push(`${entry.id}: missing name/nameEn`);
    if (!SIMULATION.atlasMaps[entry.atlasMap]) errors.push(`${entry.id}: invalid atlasMap`);
    if (!validCategories.has(entry.category)) errors.push(`${entry.id}: invalid category`);
    if (!Number.isFinite(entry.distanceLy) || entry.distanceLy <= 0) errors.push(`${entry.id}: invalid distanceLy`);
    if (!Number.isFinite(entry.galactic?.lDeg) || !Number.isFinite(entry.galactic?.bDeg)) {
        errors.push(`${entry.id}: invalid galactic coordinates`);
    }
    if (!Number.isFinite(entry.color) || !Number.isFinite(entry.size) || entry.size <= 0) {
        errors.push(`${entry.id}: invalid color/size`);
    }
    if (entry.effectType && !['red-giant', 'red-dwarf', 'white-dwarf', 'pulsar', 'black-hole', 'supernova'].includes(entry.effectType)) {
        errors.push(`${entry.id}: unknown effectType ${entry.effectType}`);
    }
    if (entry.systemLayout && (!Array.isArray(entry.systemLayout.bodies) || !entry.systemLayout.bodies.length)) {
        errors.push(`${entry.id}: systemLayout has no bodies`);
    }
}

const phaseATargetIds = [
    'alpha-centauri-b', 'luyten-726-8', 'ross-128', 'teegarden-star', 'gj-667',
    'kepler-186', 'kepler-452', 'lhs-1140', 'gj-1132', 'hd-219134'
];
for (const id of phaseATargetIds) {
    const entry = CELESTIAL_CATALOG.find((candidate) => candidate.id === id);
    if (!entry) errors.push(`${id}: missing phase A target`);
    else if (entry.atlasMap !== 'neighborhood') errors.push(`${id}: phase A target is not neighborhood`);
}

const phaseBTargetIds = [
    'orion-arm-landmark', 'scutum-centaurus-arm', 'galactic-bulge-landmark',
    'm13-great-cluster', 'm3-globular-cluster', 'ngc-604', 'ngc-3603',
    'wr-104', 'pistol-star', 'vela-supernova-remnant'
];
for (const id of phaseBTargetIds) {
    const entry = CELESTIAL_CATALOG.find((candidate) => candidate.id === id);
    if (!entry) errors.push(`${id}: missing phase B target`);
    else if (entry.atlasMap !== 'milky-way') errors.push(`${id}: phase B target is not milky-way`);
}

const phaseCTargetMaps = {
    'ic-1613': 'local-group',
    'ngc-6822': 'local-group',
    'wolf-lundmark-melotte': 'local-group',
    'andromeda-ii': 'local-group',
    'andromeda-iii': 'local-group',
    'ngc-253': 'cosmic-neighborhood',
    'm82-starburst': 'cosmic-neighborhood',
    'centaurus-a-galaxy': 'cosmic-neighborhood',
    'm87-galaxy': 'cosmic-neighborhood',
    'local-supercluster-direction': 'cosmic-neighborhood'
};
for (const [id, atlasMap] of Object.entries(phaseCTargetMaps)) {
    const entry = CELESTIAL_CATALOG.find((candidate) => candidate.id === id);
    if (!entry) errors.push(`${id}: missing phase C target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
}

if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
} else {
    const byMap = Object.groupBy
        ? Object.groupBy(CELESTIAL_CATALOG, (entry) => entry.atlasMap)
        : CELESTIAL_CATALOG.reduce((result, entry) => {
            (result[entry.atlasMap] ||= []).push(entry);
            return result;
        }, {});
    console.log(`Catalog valid: ${CELESTIAL_CATALOG.length} entries`);
    for (const [map, entries] of Object.entries(byMap)) console.log(`  ${map}: ${entries.length}`);
}
