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
const catalogById = new Map();
const names = new Map();
const englishNames = new Map();
const bulkDirectionsByMap = new Map();

for (const entry of CELESTIAL_CATALOG) {
    if (ids.has(entry.id)) errors.push(`${entry.id}: duplicate id`);
    ids.add(entry.id);
    catalogById.set(entry.id, entry);

    if (!entry.name || !entry.nameEn) errors.push(`${entry.id}: missing name/nameEn`);

    const normalizedName = entry.name?.trim().toLocaleLowerCase();
    const normalizedEnglishName = entry.nameEn?.trim().toLocaleLowerCase();
    if (normalizedName) {
        const existingId = names.get(normalizedName);
        if (existingId) errors.push(`${entry.id}: duplicate name with ${existingId}: ${entry.name}`);
        else names.set(normalizedName, entry.id);
    }
    if (normalizedEnglishName) {
        const existingId = englishNames.get(normalizedEnglishName);
        if (existingId) errors.push(`${entry.id}: duplicate nameEn with ${existingId}: ${entry.nameEn}`);
        else englishNames.set(normalizedEnglishName, entry.id);
    }
    if (!SIMULATION.atlasMaps[entry.atlasMap]) errors.push(`${entry.id}: invalid atlasMap`);
    if (!validCategories.has(entry.category)) errors.push(`${entry.id}: invalid category`);
    if (!Number.isFinite(entry.distanceLy) || entry.distanceLy <= 0) errors.push(`${entry.id}: invalid distanceLy`);
    if (!Number.isFinite(entry.galactic?.lDeg) || !Number.isFinite(entry.galactic?.bDeg)) {
        errors.push(`${entry.id}: invalid galactic coordinates`);
    } else {
        if (entry.galactic.lDeg < 0 || entry.galactic.lDeg >= 360 || entry.galactic.bDeg < -90 || entry.galactic.bDeg > 90) {
            errors.push(`${entry.id}: galactic coordinates out of range`);
        }
        if (entry.renderTier === 'bulk') {
            const directions = bulkDirectionsByMap.get(entry.atlasMap) || new Map();
            const directionKey = `${entry.galactic.lDeg.toFixed(6)}:${entry.galactic.bDeg.toFixed(6)}`;
            const existingId = directions.get(directionKey);
            if (existingId) errors.push(`${entry.id}: duplicate bulk direction with ${existingId}`);
            else directions.set(directionKey, entry.id);
            bulkDirectionsByMap.set(entry.atlasMap, directions);
        }
    }
    if (!Number.isFinite(entry.color) || !Number.isFinite(entry.size) || entry.size <= 0) {
        errors.push(`${entry.id}: invalid color/size`);
    }
    if (entry.renderTier && entry.renderTier !== 'bulk') {
        errors.push(`${entry.id}: unknown renderTier ${entry.renderTier}`);
    }
    if (entry.renderTier === 'bulk') {
        if (entry.dataQuality !== 'synthetic') errors.push(`${entry.id}: bulk entry must declare synthetic dataQuality`);
        if (entry.source !== 'generated-stress-test') errors.push(`${entry.id}: bulk entry has invalid source`);
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
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing phase A target`);
    else if (entry.atlasMap !== 'neighborhood') errors.push(`${id}: phase A target is not neighborhood`);
}

const phaseBTargetIds = [
    'orion-arm-landmark', 'scutum-centaurus-arm', 'galactic-bulge-landmark',
    'm13-great-cluster', 'm3-globular-cluster', 'ngc-604', 'ngc-3603',
    'wr-104', 'pistol-star', 'vela-supernova-remnant'
];
for (const id of phaseBTargetIds) {
    const entry = catalogById.get(id);
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
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing phase C target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
}

const stellarBoostMaps = {
    'van-maanen-star': 'neighborhood',
    '40-eridani-b': 'neighborhood',
    aldebaran: 'milky-way',
    arcturus: 'milky-way',
    mira: 'milky-way'
};
const stellarBoostEffects = {
    'van-maanen-star': 'white-dwarf',
    '40-eridani-b': 'white-dwarf',
    aldebaran: 'red-giant',
    arcturus: 'red-giant',
    mira: 'red-giant'
};
for (const [id, atlasMap] of Object.entries(stellarBoostMaps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing stellar boost target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
    else if (entry.effectType !== stellarBoostEffects[id]) {
        errors.push(`${id}: expected effectType ${stellarBoostEffects[id]}, got ${entry.effectType}`);
    }
}

const atlasBoostMaps = {
    'kapteyns-star': 'neighborhood',
    'gliese-876': 'neighborhood',
    capella: 'milky-way',
    pollux: 'milky-way',
    'sculptor-dwarf': 'local-group'
};
for (const [id, atlasMap] of Object.entries(atlasBoostMaps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing atlas boost target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
}

const atlasBoost2Maps = {
    'luytens-star': 'neighborhood',
    'groombridge-34': 'neighborhood',
    spica: 'milky-way',
    regulus: 'milky-way',
    castor: 'milky-way',
    'veil-nebula': 'milky-way',
    'draco-dwarf': 'local-group',
    'm51-whirlpool': 'cosmic-neighborhood'
};
for (const [id, atlasMap] of Object.entries(atlasBoost2Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing atlas boost-2 target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
}

const atlasBoost3Maps = {
    'ross-248': 'neighborhood',
    'lacaille-9352': 'neighborhood',
    fomalhaut: 'milky-way',
    albireo: 'milky-way',
    'dumbbell-nebula': 'milky-way',
    'leo-ii': 'local-group',
    'ursa-minor-dwarf': 'local-group',
    'm101-pinwheel': 'cosmic-neighborhood'
};
for (const [id, atlasMap] of Object.entries(atlasBoost3Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing atlas boost-3 target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
}

const atlasBoost4Maps = {
    'gj-1061': 'neighborhood',
    'wolf-1061': 'neighborhood',
    'm44-beehive': 'milky-way',
    'double-cluster-perseus': 'milky-way',
    'rho-ophiuchi-cloud': 'milky-way',
    'ngc-147': 'local-group',
    'ngc-185': 'local-group',
    'ngc-2403': 'cosmic-neighborhood'
};
for (const [id, atlasMap] of Object.entries(atlasBoost4Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing atlas boost-4 target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
}

const atlasBoost5Maps = {
    'yz-ceti': 'neighborhood',
    'l-98-59': 'neighborhood',
    'ngc-7000-north-america': 'milky-way',
    'm22-globular-cluster': 'milky-way',
    'leo-a': 'local-group',
    'sagittarius-dwarf-irregular': 'local-group',
    'm83-southern-pinwheel': 'cosmic-neighborhood',
    'm94-canes-venatici': 'cosmic-neighborhood'
};
for (const [id, atlasMap] of Object.entries(atlasBoost5Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing atlas boost-5 target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
}

const expectedLayerCounts = {
    neighborhood: 12505,
    'milky-way': 12518,
    'local-group': 12490,
    'cosmic-neighborhood': 12487
};
if (CELESTIAL_CATALOG.length !== 50000) {
    errors.push(`expected 50000 catalog entries, got ${CELESTIAL_CATALOG.length}`);
}
for (const [atlasMap, expectedCount] of Object.entries(expectedLayerCounts)) {
    const actualCount = CELESTIAL_CATALOG.filter((entry) => entry.atlasMap === atlasMap).length;
    if (actualCount !== expectedCount) errors.push(`${atlasMap}: expected ${expectedCount}, got ${actualCount}`);
}

const expectedBulkRenderCounts = {
    neighborhood: 12375,
    'milky-way': 12375,
    'local-group': 12375,
    'cosmic-neighborhood': 12375
};
for (const [atlasMap, expectedCount] of Object.entries(expectedBulkRenderCounts)) {
    const actualCount = CELESTIAL_CATALOG.filter((entry) => entry.atlasMap === atlasMap && entry.renderTier === 'bulk').length;
    if (actualCount !== expectedCount) errors.push(`${atlasMap}: expected ${expectedCount} bulk-render entries, got ${actualCount}`);
}

const atlasBoostTo200Maps = {
    'epsilon-indi': 'neighborhood',
    '82-g-eridani': 'neighborhood',
    'horsehead-nebula': 'milky-way',
    'california-nebula': 'milky-way',
    'sagittarius-dwarf-spheroidal': 'local-group',
    'sextans-a': 'local-group',
    'ngc-300': 'cosmic-neighborhood',
    'ngc-55': 'cosmic-neighborhood',
    'delta-pavonis': 'neighborhood',
    'gliese-832': 'neighborhood',
    'heart-nebula': 'milky-way',
    'soul-nebula': 'milky-way',
    'sextans-b': 'local-group',
    'phoenix-dwarf': 'local-group',
    'ic-342': 'cosmic-neighborhood',
    'ngc-6946': 'cosmic-neighborhood',
    'gj-15-a': 'neighborhood',
    'gj-1002': 'neighborhood',
    'omega-nebula': 'milky-way',
    'm6-butterfly-cluster': 'milky-way',
    'tucana-dwarf': 'local-group',
    'cetus-dwarf': 'local-group',
    'm64-black-eye': 'cosmic-neighborhood',
    'm63-sunflower': 'cosmic-neighborhood',
    'gj-887': 'neighborhood',
    'gj-251': 'neighborhood',
    'm7-ptolemy-cluster': 'milky-way',
    'm35-open-cluster': 'milky-way',
    'aquarius-dwarf': 'local-group',
    'pegasus-dwarf': 'local-group',
    'm106': 'cosmic-neighborhood',
    'ngc-2903': 'cosmic-neighborhood',
    'gj-486': 'neighborhood',
    '55-cancri': 'neighborhood',
    'm37-open-cluster': 'milky-way',
    'm41-open-cluster': 'milky-way',
    'ngc-3109': 'local-group',
    'antlia-dwarf': 'local-group',
    'ngc-2841': 'cosmic-neighborhood',
    'm104-sombrero': 'cosmic-neighborhood',
    'hd-20794': 'neighborhood',
    'hd-40307': 'neighborhood',
    'm5-globular-cluster': 'milky-way',
    'm15-globular-cluster': 'milky-way',
    'andromeda-i': 'local-group',
    'andromeda-v': 'local-group',
    'm65': 'cosmic-neighborhood',
    'm66': 'cosmic-neighborhood',
    'hd-85512': 'neighborhood',
    'hd-69830': 'neighborhood',
    'm2-globular-cluster': 'milky-way',
    'ngc-6397': 'milky-way',
    'andromeda-vi': 'local-group',
    'andromeda-vii': 'local-group',
    'ngc-3628': 'cosmic-neighborhood',
    'ngc-1316': 'cosmic-neighborhood',
    'k2-18': 'neighborhood',
    'toi-700': 'neighborhood',
    'ic-443': 'milky-way',
    'tycho-supernova-remnant': 'milky-way',
    'andromeda-x': 'local-group',
    'lgs-3': 'local-group',
    'ngc-1097': 'cosmic-neighborhood',
    'ngc-891': 'cosmic-neighborhood',
    'gj-357': 'neighborhood',
    'sn-1006-remnant': 'milky-way',
    'leo-t': 'local-group',
    'ngc-7331': 'cosmic-neighborhood'
};
for (const [id, atlasMap] of Object.entries(atlasBoostTo200Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing 200-item expansion target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
}

const atlasBoostTo300Maps = {
    "luhman-16": "neighborhood",
    "wise-0855-0714": "neighborhood",
    "scr-1845-6357": "neighborhood",
    "denis-1048-3956": "neighborhood",
    "gliese-1005": "neighborhood",
    "flame-nebula": "milky-way",
    "running-man-nebula": "milky-way",
    "messier-78": "milky-way",
    "barnards-loop": "milky-way",
    "elephant-trunk-nebula": "milky-way",
    "carina-dwarf": "local-group",
    "carina-ii": "local-group",
    "carina-iii": "local-group",
    "bootes-i": "local-group",
    "bootes-ii": "local-group",
    "messier-74": "cosmic-neighborhood",
    "messier-77": "cosmic-neighborhood",
    "messier-95": "cosmic-neighborhood",
    "messier-96": "cosmic-neighborhood",
    "messier-98": "cosmic-neighborhood",
    "gliese-1111": "neighborhood",
    "gliese-1245": "neighborhood",
    "lhs-292": "neighborhood",
    "lp-944-20": "neighborhood",
    "gliese-570": "neighborhood",
    "cocoon-nebula": "milky-way",
    "bubble-nebula": "milky-way",
    "crescent-nebula": "milky-way",
    "thors-helmet": "milky-way",
    "medusa-nebula": "milky-way",
    "canes-venatici-i": "local-group",
    "canes-venatici-ii": "local-group",
    "coma-berenices-dwarf": "local-group",
    "hercules-dwarf": "local-group",
    "segue-1": "local-group",
    "messier-99": "cosmic-neighborhood",
    "messier-100": "cosmic-neighborhood",
    "messier-108": "cosmic-neighborhood",
    "ngc-1055": "cosmic-neighborhood",
    "ngc-1365": "cosmic-neighborhood",
    "gliese-569": "neighborhood",
    "gliese-445": "neighborhood",
    "gliese-412": "neighborhood",
    "61-virginis": "neighborhood",
    "70-ophiuchi": "neighborhood",
    "ngc-2264": "milky-way",
    "messier-36": "milky-way",
    "messier-38": "milky-way",
    "messier-46": "milky-way",
    "messier-47": "milky-way",
    "segue-2": "local-group",
    "ursa-major-i": "local-group",
    "ursa-major-ii": "local-group",
    "willman-1": "local-group",
    "crater-ii": "local-group",
    "ngc-1399": "cosmic-neighborhood",
    "ngc-1512": "cosmic-neighborhood",
    "ngc-1566": "cosmic-neighborhood",
    "ngc-1672": "cosmic-neighborhood",
    "ngc-1808": "cosmic-neighborhood",
    "36-ophiuchi": "neighborhood",
    "40-eridani-a": "neighborhood",
    "gliese-22": "neighborhood",
    "gliese-86": "neighborhood",
    "51-pegasi": "neighborhood",
    "messier-48": "milky-way",
    "messier-50": "milky-way",
    "messier-52": "milky-way",
    "messier-67": "milky-way",
    "messier-93": "milky-way",
    "reticulum-ii": "local-group",
    "horologium-i": "local-group",
    "eridanus-ii": "local-group",
    "hydrus-i": "local-group",
    "triangulum-ii": "local-group",
    "ngc-2146": "cosmic-neighborhood",
    "ngc-2683": "cosmic-neighborhood",
    "ngc-2997": "cosmic-neighborhood",
    "ngc-3077": "cosmic-neighborhood",
    "ngc-3521": "cosmic-neighborhood",
    "47-ursa-majoris": "neighborhood",
    "rho-coronae-borealis": "neighborhood",
    "gj-1214": "neighborhood",
    "gliese-849": "neighborhood",
    "hd-260655": "neighborhood",
    "messier-4": "milky-way",
    "messier-10": "milky-way",
    "messier-12": "milky-way",
    "messier-28": "milky-way",
    "messier-92": "milky-way",
    "andromeda-ix": "local-group",
    "andromeda-xi": "local-group",
    "andromeda-xii": "local-group",
    "andromeda-xiii": "local-group",
    "andromeda-xiv": "local-group",
    "antennae-galaxies": "cosmic-neighborhood",
    "ngc-4565": "cosmic-neighborhood",
    "ngc-4631": "cosmic-neighborhood",
    "ngc-4945": "cosmic-neighborhood",
    "ngc-5238": "cosmic-neighborhood"
};
for (const [id, atlasMap] of Object.entries(atlasBoostTo300Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing 300-item expansion target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
}

const atlasBoostTo500Maps = {
    "wise-0720-0846": "neighborhood",
    "wise-1541-2250": "neighborhood",
    "wise-0350-5658": "neighborhood",
    "2mass-0415-0935": "neighborhood",
    "2mass-0036-1821": "neighborhood",
    "ic-405": "milky-way",
    "ic-410": "milky-way",
    "ngc-281": "milky-way",
    "sh2-101": "milky-way",
    "sh2-155": "milky-way",
    "antlia-ii": "local-group",
    "aquarius-ii": "local-group",
    "bootes-iii": "local-group",
    "centaurus-i": "local-group",
    "cetus-ii": "local-group",
    "messier-60": "cosmic-neighborhood",
    "messier-61": "cosmic-neighborhood",
    "messier-84": "cosmic-neighborhood",
    "messier-85": "cosmic-neighborhood",
    "messier-86": "cosmic-neighborhood",
    "2mass-0559-1404": "neighborhood",
    "2mass-0939-2448": "neighborhood",
    "2mass-1507-1627": "neighborhood",
    "2mass-1503-2525": "neighborhood",
    "2mass-1047-2124": "neighborhood",
    "ngc-2467": "milky-way",
    "ngc-3576": "milky-way",
    "ngc-6188": "milky-way",
    "ngc-6357": "milky-way",
    "ngc-6334": "milky-way",
    "columba-i": "local-group",
    "delve-1": "local-group",
    "delve-2": "local-group",
    "draco-ii": "local-group",
    "grus-i": "local-group",
    "messier-88": "cosmic-neighborhood",
    "messier-89": "cosmic-neighborhood",
    "messier-90": "cosmic-neighborhood",
    "messier-91": "cosmic-neighborhood",
    "messier-102": "cosmic-neighborhood",
    "gliese-54": "neighborhood",
    "gliese-166-c": "neighborhood",
    "gliese-2066": "neighborhood",
    "gliese-3020": "neighborhood",
    "gliese-3305": "neighborhood",
    "ngc-6559": "milky-way",
    "ngc-6604": "milky-way",
    "ngc-6820": "milky-way",
    "ngc-7380": "milky-way",
    "ic-1795": "milky-way",
    "grus-ii": "local-group",
    "hydra-ii": "local-group",
    "indus-i": "local-group",
    "leo-iv": "local-group",
    "leo-v": "local-group",
    "messier-105": "cosmic-neighborhood",
    "messier-109": "cosmic-neighborhood",
    "ngc-1023": "cosmic-neighborhood",
    "ngc-1275": "cosmic-neighborhood",
    "ngc-1386": "cosmic-neighborhood",
    "gliese-3379": "neighborhood",
    "gliese-380": "neighborhood",
    "gliese-388": "neighborhood",
    "gliese-436": "neighborhood",
    "gliese-480": "neighborhood",
    "sh2-132": "milky-way",
    "sh2-157": "milky-way",
    "ngc-6543": "milky-way",
    "ngc-7662": "milky-way",
    "ngc-2392": "milky-way",
    "pegasus-iii": "local-group",
    "phoenix-ii": "local-group",
    "pictor-i": "local-group",
    "pisces-ii": "local-group",
    "reticulum-iii": "local-group",
    "ngc-1404": "cosmic-neighborhood",
    "ngc-1427": "cosmic-neighborhood",
    "ngc-1448": "cosmic-neighborhood",
    "ngc-1553": "cosmic-neighborhood",
    "ngc-1961": "cosmic-neighborhood",
    "gliese-514": "neighborhood",
    "gliese-617-a": "neighborhood",
    "gliese-649": "neighborhood",
    "gliese-674": "neighborhood",
    "gliese-687": "neighborhood",
    "messier-76": "milky-way",
    "messier-97": "milky-way",
    "ngc-3242": "milky-way",
    "ngc-3132": "milky-way",
    "ngc-2022": "milky-way",
    "sagittarius-ii": "local-group",
    "sculptor-ii": "local-group",
    "tucana-ii": "local-group",
    "tucana-iii": "local-group",
    "tucana-iv": "local-group",
    "ngc-2276": "cosmic-neighborhood",
    "ngc-2537": "cosmic-neighborhood",
    "ngc-2787": "cosmic-neighborhood",
    "ngc-2976": "cosmic-neighborhood",
    "ngc-3184": "cosmic-neighborhood",
    "gliese-710": "neighborhood",
    "gliese-682": "neighborhood",
    "gliese-686": "neighborhood",
    "gliese-725-a": "neighborhood",
    "gliese-725-b": "neighborhood",
    "messier-23": "milky-way",
    "messier-25": "milky-way",
    "messier-26": "milky-way",
    "messier-29": "milky-way",
    "messier-34": "milky-way",
    "tucana-v": "local-group",
    "virgo-i": "local-group",
    "virgo-ii": "local-group",
    "horologium-ii": "local-group",
    "cassiopeia-ii": "local-group",
    "ngc-3198": "cosmic-neighborhood",
    "ngc-3310": "cosmic-neighborhood",
    "ngc-3344": "cosmic-neighborhood",
    "ngc-3370": "cosmic-neighborhood",
    "ngc-3377": "cosmic-neighborhood",
    "gliese-740": "neighborhood",
    "gliese-754": "neighborhood",
    "gliese-784": "neighborhood",
    "gliese-785": "neighborhood",
    "gliese-905": "neighborhood",
    "messier-39": "milky-way",
    "messier-103": "milky-way",
    "ngc-457": "milky-way",
    "ngc-663": "milky-way",
    "ngc-7789": "milky-way",
    "cassiopeia-iii": "local-group",
    "lacerta-i": "local-group",
    "andromeda-xv": "local-group",
    "andromeda-xvi": "local-group",
    "andromeda-xvii": "local-group",
    "ngc-3384": "cosmic-neighborhood",
    "ngc-3486": "cosmic-neighborhood",
    "ngc-3556": "cosmic-neighborhood",
    "ngc-3593": "cosmic-neighborhood",
    "ngc-3621": "cosmic-neighborhood",
    "gliese-908": "neighborhood",
    "ltt-1445-a": "neighborhood",
    "ltt-3780": "neighborhood",
    "ltt-9779": "neighborhood",
    "toi-1231": "neighborhood",
    "messier-9": "milky-way",
    "messier-14": "milky-way",
    "messier-19": "milky-way",
    "messier-30": "milky-way",
    "messier-53": "milky-way",
    "andromeda-xviii": "local-group",
    "andromeda-xix": "local-group",
    "andromeda-xx": "local-group",
    "andromeda-xxi": "local-group",
    "andromeda-xxii": "local-group",
    "ngc-3810": "cosmic-neighborhood",
    "ngc-3953": "cosmic-neighborhood",
    "ngc-4013": "cosmic-neighborhood",
    "ngc-4088": "cosmic-neighborhood",
    "ngc-4214": "cosmic-neighborhood",
    "toi-1695": "neighborhood",
    "toi-1749": "neighborhood",
    "toi-1759": "neighborhood",
    "toi-2095": "neighborhood",
    "toi-2136": "neighborhood",
    "messier-54": "milky-way",
    "messier-55": "milky-way",
    "messier-56": "milky-way",
    "messier-62": "milky-way",
    "messier-68": "milky-way",
    "andromeda-xxiii": "local-group",
    "andromeda-xxiv": "local-group",
    "andromeda-xxv": "local-group",
    "andromeda-xxvi": "local-group",
    "andromeda-xxvii": "local-group",
    "ngc-4236": "cosmic-neighborhood",
    "ngc-4278": "cosmic-neighborhood",
    "ngc-4303": "cosmic-neighborhood",
    "ngc-4314": "cosmic-neighborhood",
    "ngc-4388": "cosmic-neighborhood",
    "toi-2285": "neighborhood",
    "hd-97658": "neighborhood",
    "hd-3167": "neighborhood",
    "hd-15337": "neighborhood",
    "pi-mensae": "neighborhood",
    "messier-69": "milky-way",
    "messier-70": "milky-way",
    "messier-71": "milky-way",
    "messier-79": "milky-way",
    "messier-80": "milky-way",
    "andromeda-xxviii": "local-group",
    "andromeda-xxix": "local-group",
    "andromeda-xxx": "local-group",
    "andromeda-xxxii": "local-group",
    "andromeda-xxxiii": "local-group",
    "ngc-4438": "cosmic-neighborhood",
    "ngc-4449": "cosmic-neighborhood",
    "ngc-4490": "cosmic-neighborhood",
    "ngc-4526": "cosmic-neighborhood",
    "ngc-4559": "cosmic-neighborhood"
};
for (const [id, atlasMap] of Object.entries(atlasBoostTo500Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing 500-item expansion target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
}

const atlasBoostTo1000Maps = Object.fromEntries([
    ...Array.from({ length: 125 }, (_, index) => [`lhs-${1001 + index}`, 'neighborhood']),
    ...Array.from({ length: 126 }, (_, index) => index + 1)
        .filter((number) => number !== 101)
        .map((number) => [`sharpless-2-${String(number).padStart(3, '0')}`, 'milky-way']),
    ...Array.from({ length: 125 }, (_, index) => [
        `m31-globular-b${String(index + 1).padStart(3, '0')}`,
        'local-group'
    ]),
    ...Array.from({ length: 125 }, (_, index) => [`ngc-${5600 + index}`, 'cosmic-neighborhood'])
]);
for (const [id, atlasMap] of Object.entries(atlasBoostTo1000Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing 1000-item expansion target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
}



const atlasBoostTo2000Maps = Object.fromEntries([
    ...Array.from({ length: 250 }, (_, index) => [`lhs-${1376 + index}`, 'neighborhood']),
    ...Array.from({ length: 250 }, (_, index) => [
        `sharpless-2-${String(127 + index).padStart(3, '0')}`,
        'milky-way'
    ]),
    ...Array.from({ length: 250 }, (_, index) => [
        `m31-globular-b${String(126 + index).padStart(3, '0')}`,
        'local-group'
    ]),
    ...Array.from({ length: 250 }, (_, index) => [`ngc-${5725 + index}`, 'cosmic-neighborhood'])
]);
for (const [id, atlasMap] of Object.entries(atlasBoostTo2000Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing 2000-item expansion target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
    else if (entry.renderTier !== 'bulk') errors.push(`${id}: expected bulk render tier, got ${entry.renderTier || 'default'}`);
}



const atlasBoostTo5000Maps = Object.fromEntries([
    ...Array.from({ length: 750 }, (_, index) => [`lhs-${1626 + index}`, 'neighborhood']),
    ...Array.from({ length: 750 }, (_, index) => [
        `wise-hii-w${String(index + 1).padStart(4, '0')}`,
        'milky-way'
    ]),
    ...Array.from({ length: 750 }, (_, index) => [
        `m31-candidate-cluster-c${String(index + 1).padStart(4, '0')}`,
        'local-group'
    ]),
    ...Array.from({ length: 750 }, (_, index) => [`ugc-${10001 + index}`, 'cosmic-neighborhood'])
]);
for (const [id, atlasMap] of Object.entries(atlasBoostTo5000Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(`${id}: missing 5000-item expansion target`);
    else if (entry.atlasMap !== atlasMap) errors.push(`${id}: expected ${atlasMap}, got ${entry.atlasMap}`);
    else if (entry.renderTier !== 'bulk') errors.push(`${id}: expected bulk render tier, got ${entry.renderTier || 'default'}`);
}


const atlasBoostTo10000Maps = Object.fromEntries([
    ...Array.from({ length: 1250 }, (_, index) => ['lhs-' + (2376 + index), 'neighborhood']),
    ...Array.from({ length: 1250 }, (_, index) => [
        'wise-hii-w' + String(751 + index).padStart(4, '0'),
        'milky-way'
    ]),
    ...Array.from({ length: 1250 }, (_, index) => [
        'm31-candidate-cluster-c' + String(751 + index).padStart(4, '0'),
        'local-group'
    ]),
    ...Array.from({ length: 1250 }, (_, index) => ['ugc-' + (10751 + index), 'cosmic-neighborhood'])
]);
for (const [id, atlasMap] of Object.entries(atlasBoostTo10000Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(id + ': missing 10000-item expansion target');
    else if (entry.atlasMap !== atlasMap) errors.push(id + ': expected ' + atlasMap + ', got ' + entry.atlasMap);
    else if (entry.renderTier !== 'bulk') errors.push(id + ': expected bulk render tier, got ' + (entry.renderTier || 'default'));
}

const atlasBoostTo20000Maps = Object.fromEntries([
    ...Array.from({ length: 2500 }, (_, index) => ['lhs-' + (3626 + index), 'neighborhood']),
    ...Array.from({ length: 2500 }, (_, index) => [
        'wise-hii-w' + String(2001 + index).padStart(4, '0'),
        'milky-way'
    ]),
    ...Array.from({ length: 2500 }, (_, index) => [
        'm31-candidate-cluster-c' + String(2001 + index).padStart(4, '0'),
        'local-group'
    ]),
    ...Array.from({ length: 2500 }, (_, index) => ['ugc-' + (12001 + index), 'cosmic-neighborhood'])
]);
for (const [id, atlasMap] of Object.entries(atlasBoostTo20000Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(id + ': missing 20000-item expansion target');
    else if (entry.atlasMap !== atlasMap) errors.push(id + ': expected ' + atlasMap + ', got ' + entry.atlasMap);
    else if (entry.renderTier !== 'bulk') errors.push(id + ': expected bulk render tier, got ' + (entry.renderTier || 'default'));
}


const atlasBoostTo30000Maps = Object.fromEntries([
    ...Array.from({ length: 2500 }, (_, index) => ['lhs-' + (6126 + index), 'neighborhood']),
    ...Array.from({ length: 2500 }, (_, index) => [
        'wise-hii-w' + String(4501 + index).padStart(4, '0'),
        'milky-way'
    ]),
    ...Array.from({ length: 2500 }, (_, index) => [
        'm31-candidate-cluster-c' + String(4501 + index).padStart(4, '0'),
        'local-group'
    ]),
    ...Array.from({ length: 2500 }, (_, index) => ['ugc-' + (14501 + index), 'cosmic-neighborhood'])
]);
for (const [id, atlasMap] of Object.entries(atlasBoostTo30000Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(id + ': missing 30000-item expansion target');
    else if (entry.atlasMap !== atlasMap) errors.push(id + ': expected ' + atlasMap + ', got ' + entry.atlasMap);
    else if (entry.renderTier !== 'bulk') errors.push(id + ': expected bulk render tier, got ' + (entry.renderTier || 'default'));
}


const atlasBoostTo50000Maps = Object.fromEntries([
    ...Array.from({ length: 5000 }, (_, index) => ['lhs-' + (8626 + index), 'neighborhood']),
    ...Array.from({ length: 5000 }, (_, index) => [
        'wise-hii-w' + String(7001 + index).padStart(4, '0'),
        'milky-way'
    ]),
    ...Array.from({ length: 5000 }, (_, index) => [
        'm31-candidate-cluster-c' + String(7001 + index).padStart(4, '0'),
        'local-group'
    ]),
    ...Array.from({ length: 5000 }, (_, index) => ['ugc-' + (17001 + index), 'cosmic-neighborhood'])
]);
for (const [id, atlasMap] of Object.entries(atlasBoostTo50000Maps)) {
    const entry = catalogById.get(id);
    if (!entry) errors.push(id + ': missing 50000-item expansion target');
    else if (entry.atlasMap !== atlasMap) errors.push(id + ': expected ' + atlasMap + ', got ' + entry.atlasMap);
    else if (entry.renderTier !== 'bulk') errors.push(id + ': expected bulk render tier, got ' + (entry.renderTier || 'default'));
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
