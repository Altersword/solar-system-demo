/**
 * Astronomical data used by the renderer.
 * Physical values stay in real units; every visual scale is applied in solarSystem.js.
 */

const AU_KM = 149597870.7;
const LIGHT_YEAR_KM = 9460730472580.8;

const SIMULATION = {
    epoch: 'J2000 approximate elements',
    defaultDaysPerSecond: 1,
    timeScales: [0, 0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000],
    atlasMaps: {
        neighborhood: {
            name: '太阳邻域',
            description: '约 50 光年内的近邻恒星系统和重点系外行星目标。',
            rangeLabel: '约 50 光年'
        },
        'milky-way': {
            name: '银河地标',
            description: '银河系内的星团、星云和银心方向标。',
            rangeLabel: '约 1,500 光年 + 银心方向'
        },
        'local-group': {
            name: '本星系群',
            description: '银河系周边的卫星星系和主要近邻星系方向。',
            rangeLabel: '约 300 万光年'
        },
        'cosmic-neighborhood': {
            name: '宇宙近邻',
            description: '本星系群之外的近邻星系群、星系团和超星系团方向。',
            rangeLabel: '约 1,200 万 - 5 亿光年'
        }
    },
    displayModes: {
        balanced: {
            name: '观测比例',
            description: '距离压缩、半径放大，适合观察太阳系整体结构。',
            orbitBase: 34,
            orbitScale: 57,
            orbitExponent: 0.72,
            radiusScale: 3.25,
            radiusExponent: 0.45,
            minPlanetRadius: 1.05,
            sunRadius: 18,
            moonDistanceScale: 0.000018,
            moonRadiusScale: 0.0012,
            minMoonRadius: 0.42,
            stellarBase: 620,
            stellarScale: 70,
            stellarExponent: 0.55,
            deepSkyScale: 92,
            deepSkyExponent: 0.32,
            cameraPosition: [-120, 115, 270],
            maxDistance: 2200
        },
        compact: {
            name: '真实距离感',
            description: '轨道间距更接近真实差异，内行星会更拥挤。',
            orbitBase: 26,
            orbitScale: 34,
            orbitExponent: 0.88,
            radiusScale: 2.7,
            radiusExponent: 0.42,
            minPlanetRadius: 0.8,
            sunRadius: 14,
            moonDistanceScale: 0.000014,
            moonRadiusScale: 0.001,
            minMoonRadius: 0.32,
            stellarBase: 700,
            stellarScale: 78,
            stellarExponent: 0.56,
            deepSkyScale: 96,
            deepSkyExponent: 0.31,
            cameraPosition: [-170, 120, 390],
            maxDistance: 2600
        },
        atlas: {
            name: '近邻星图',
            description: '太阳系被压缩到中央，突出几十光年内恒星系与银河系地标方向。',
            orbitBase: 12,
            orbitScale: 20,
            orbitExponent: 0.55,
            radiusScale: 1.7,
            radiusExponent: 0.36,
            minPlanetRadius: 0.55,
            sunRadius: 9,
            moonDistanceScale: 0.00001,
            moonRadiusScale: 0.0008,
            minMoonRadius: 0.24,
            stellarBase: 170,
            stellarScale: 112,
            stellarExponent: 0.64,
            deepSkyScale: 120,
            deepSkyExponent: 0.34,
            cameraPosition: [-520, 360, 920],
            maxDistance: 4200
        }
    }
};

const PLANET_DATA = {
    sun: {
        id: 'sun',
        name: '太阳',
        nameEn: 'Sun',
        type: 'G2V 型主序星',
        radiusKm: 696340,
        massKg: 1.9885e30,
        rotationPeriodHours: 648,
        surfaceTemperature: '约 5778 K',
        composition: '氢约 73%，氦约 25%，少量重元素',
        feature: '太阳系中心天体，能量来自核心氢核聚变。',
        effectType: 'sun',
        visual: { color: 0xffc65a, glow: 0xff9f1c, spectral: 'G' }
    },
    mercury: {
        id: 'mercury',
        name: '水星',
        nameEn: 'Mercury',
        type: '类地行星',
        effectType: 'planet-terrestrial',
        radiusKm: 2439.7,
        massKg: 3.3011e23,
        rotationPeriodHours: 1407.6,
        axialTiltDeg: 0.034,
        surfaceTemperature: '白天约 430°C，夜间约 -180°C',
        composition: '大型金属核、硅酸盐地幔和密集撞击坑表面',
        feature: '太阳系最小行星，轨道偏心率在八大行星中最大。',
        orbit: { semiMajorAxisKm: 0.387098 * AU_KM, eccentricity: 0.20563, inclinationDeg: 7.005, longitudeAscendingNodeDeg: 48.331, argumentPeriapsisDeg: 29.124, meanAnomalyDeg: 174.796, orbitalPeriodDays: 87.969, relativisticPrecessionArcsecPerCentury: 43 },
        visual: { color: 0x8c8175, roughness: 0.95, pattern: 'rocky' },
        moons: []
    },
    venus: {
        id: 'venus',
        name: '金星',
        nameEn: 'Venus',
        type: '类地行星',
        effectType: 'planet-terrestrial',
        radiusKm: 6051.8,
        massKg: 4.8675e24,
        rotationPeriodHours: -5832.5,
        axialTiltDeg: 177.4,
        surfaceTemperature: '表面平均约 462°C',
        composition: '岩质行星，厚二氧化碳大气和硫酸云层',
        atmosphere: '二氧化碳约 96.5%，氮约 3.5%',
        feature: '浓厚温室大气，逆向自转。',
        orbit: { semiMajorAxisKm: 0.723332 * AU_KM, eccentricity: 0.00677, inclinationDeg: 3.3947, longitudeAscendingNodeDeg: 76.680, argumentPeriapsisDeg: 54.884, meanAnomalyDeg: 50.115, orbitalPeriodDays: 224.701 },
        visual: { color: 0xd8bd72, cloudColor: 0xf3d89b, roughness: 0.8, pattern: 'cloud' },
        moons: []
    },
    earth: {
        id: 'earth',
        name: '地球',
        nameEn: 'Earth',
        type: '类地行星',
        effectType: 'planet-terrestrial',
        radiusKm: 6371,
        massKg: 5.97237e24,
        rotationPeriodHours: 23.934,
        axialTiltDeg: 23.44,
        surfaceTemperature: '表面平均约 15°C',
        composition: '铁镍核心、硅酸盐地幔、液态水海洋和大陆地壳',
        atmosphere: '氮约 78%，氧约 21%，氩约 0.93%',
        feature: '目前已知唯一拥有稳定液态水海洋和生命的行星。',
        orbit: { semiMajorAxisKm: 1.000000 * AU_KM, eccentricity: 0.01671, inclinationDeg: 0.000, longitudeAscendingNodeDeg: -11.260, argumentPeriapsisDeg: 102.947, meanAnomalyDeg: 357.529, orbitalPeriodDays: 365.256 },
        visual: { color: 0x2d66bd, secondaryColor: 0x4f8b4b, cloudColor: 0xffffff, roughness: 0.56, pattern: 'earth' },
        moons: [
            { id: 'moon', effectType: 'moon', name: '月球', nameEn: 'Moon', radiusKm: 1737.4, massKg: 7.342e22, orbit: { semiMajorAxisKm: 384400, eccentricity: 0.0549, inclinationDeg: 5.145, longitudeAscendingNodeDeg: 125.08, argumentPeriapsisDeg: 318.15, meanAnomalyDeg: 115.37, orbitalPeriodDays: 27.3217 }, visual: { color: 0xb8b5aa, pattern: 'moon' }, feature: '潮汐锁定，稳定地球自转轴并驱动潮汐。' }
        ]
    },
    mars: {
        id: 'mars',
        name: '火星',
        nameEn: 'Mars',
        type: '类地行星',
        effectType: 'planet-terrestrial',
        radiusKm: 3389.5,
        massKg: 6.4171e23,
        rotationPeriodHours: 24.623,
        axialTiltDeg: 25.19,
        surfaceTemperature: '表面平均约 -63°C',
        composition: '富含氧化铁的岩质表面，薄二氧化碳大气',
        atmosphere: '二氧化碳约 95.3%，氮约 2.7%，氩约 1.6%',
        feature: '拥有奥林帕斯山、峡谷系统和古代水活动遗迹。',
        orbit: { semiMajorAxisKm: 1.523679 * AU_KM, eccentricity: 0.0934, inclinationDeg: 1.850, longitudeAscendingNodeDeg: 49.558, argumentPeriapsisDeg: 286.502, meanAnomalyDeg: 19.373, orbitalPeriodDays: 686.980 },
        visual: { color: 0xb95b31, secondaryColor: 0x7f3b23, roughness: 0.92, pattern: 'mars' },
        moons: [
            { id: 'phobos', effectType: 'moon', name: '火卫一', nameEn: 'Phobos', radiusKm: 11.1, massKg: 1.066e16, orbit: { semiMajorAxisKm: 9376, eccentricity: 0.0151, inclinationDeg: 1.08, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 40, orbitalPeriodDays: 0.3189 }, visual: { color: 0x77706a, pattern: 'rocky' }, feature: '靠近火星，轨道正在缓慢衰减。' },
            { id: 'deimos', effectType: 'moon', name: '火卫二', nameEn: 'Deimos', radiusKm: 6.2, massKg: 1.476e15, orbit: { semiMajorAxisKm: 23463, eccentricity: 0.0002, inclinationDeg: 1.79, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 210, orbitalPeriodDays: 1.2624 }, visual: { color: 0x68625f, pattern: 'rocky' }, feature: '小型不规则卫星，表面覆盖尘埃。' }
        ]
    },
    jupiter: {
        id: 'jupiter',
        name: '木星',
        nameEn: 'Jupiter',
        type: '气态巨行星',
        effectType: 'planet-gas',
        radiusKm: 69911,
        massKg: 1.8982e27,
        rotationPeriodHours: 9.925,
        axialTiltDeg: 3.13,
        surfaceTemperature: '云顶约 -145°C',
        composition: '主要由氢和氦构成，可能拥有岩冰核心',
        atmosphere: '氢约 90%，氦约 10%，含氨、甲烷、水汽等微量成分',
        feature: '太阳系最大行星，拥有强磁场和大红斑。',
        orbit: { semiMajorAxisKm: 5.2044 * AU_KM, eccentricity: 0.0489, inclinationDeg: 1.303, longitudeAscendingNodeDeg: 100.464, argumentPeriapsisDeg: 273.867, meanAnomalyDeg: 20.020, orbitalPeriodDays: 4332.59 },
        visual: { color: 0xd6b07e, secondaryColor: 0x9c6b45, roughness: 0.7, pattern: 'jupiter' },
        moons: [
            { id: 'io', effectType: 'moon', name: '木卫一', nameEn: 'Io', radiusKm: 1821.6, massKg: 8.932e22, orbit: { semiMajorAxisKm: 421700, eccentricity: 0.0041, inclinationDeg: 0.04, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 20, orbitalPeriodDays: 1.769 }, visual: { color: 0xdcc967, pattern: 'io' }, feature: '太阳系火山活动最活跃的天体之一。' },
            { id: 'europa', effectType: 'moon', name: '木卫二', nameEn: 'Europa', radiusKm: 1560.8, massKg: 4.800e22, orbit: { semiMajorAxisKm: 671100, eccentricity: 0.009, inclinationDeg: 0.47, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 90, orbitalPeriodDays: 3.551 }, visual: { color: 0xc8c1a9, pattern: 'ice' }, feature: '冰壳下可能存在全球海洋。' },
            { id: 'ganymede', effectType: 'moon', name: '木卫三', nameEn: 'Ganymede', radiusKm: 2634.1, massKg: 1.482e23, orbit: { semiMajorAxisKm: 1070400, eccentricity: 0.0013, inclinationDeg: 0.20, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 180, orbitalPeriodDays: 7.155 }, visual: { color: 0x8f8880, pattern: 'moon' }, feature: '太阳系最大卫星，比水星还大。' },
            { id: 'callisto', effectType: 'moon', name: '木卫四', nameEn: 'Callisto', radiusKm: 2410.3, massKg: 1.076e23, orbit: { semiMajorAxisKm: 1882700, eccentricity: 0.0074, inclinationDeg: 0.28, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 270, orbitalPeriodDays: 16.689 }, visual: { color: 0x6f6860, pattern: 'moon' }, feature: '古老且陨坑密布。' }
        ]
    },
    saturn: {
        id: 'saturn',
        name: '土星',
        nameEn: 'Saturn',
        type: '气态巨行星',
        effectType: 'planet-gas',
        radiusKm: 58232,
        massKg: 5.6834e26,
        rotationPeriodHours: 10.656,
        axialTiltDeg: 26.73,
        surfaceTemperature: '云顶约 -178°C',
        composition: '以氢和氦为主，平均密度低于水',
        atmosphere: '氢约 96%，氦约 3%，少量甲烷和氨',
        feature: '拥有太阳系最醒目的环系统。',
        orbit: { semiMajorAxisKm: 9.5826 * AU_KM, eccentricity: 0.0565, inclinationDeg: 2.485, longitudeAscendingNodeDeg: 113.665, argumentPeriapsisDeg: 339.392, meanAnomalyDeg: 317.020, orbitalPeriodDays: 10759.22 },
        rings: { innerRadiusKm: 74658, outerRadiusKm: 136775, color: 0xd7c08c },
        visual: { color: 0xe3c987, secondaryColor: 0xbfa66f, roughness: 0.75, pattern: 'saturn' },
        moons: [
            { id: 'titan', effectType: 'moon', name: '土卫六', nameEn: 'Titan', radiusKm: 2574.7, massKg: 1.345e23, orbit: { semiMajorAxisKm: 1221870, eccentricity: 0.0288, inclinationDeg: 0.35, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 40, orbitalPeriodDays: 15.945 }, visual: { color: 0xc69f61, pattern: 'cloud' }, feature: '拥有浓厚氮气大气和甲烷循环。' },
            { id: 'enceladus', effectType: 'moon', name: '土卫二', nameEn: 'Enceladus', radiusKm: 252.1, massKg: 1.080e20, orbit: { semiMajorAxisKm: 238042, eccentricity: 0.0047, inclinationDeg: 0.02, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 160, orbitalPeriodDays: 1.370 }, visual: { color: 0xf2f2ec, pattern: 'ice' }, feature: '南极喷流暗示地下海洋。' },
            { id: 'mimas', effectType: 'moon', name: '土卫一', nameEn: 'Mimas', radiusKm: 198.2, massKg: 3.750e19, orbit: { semiMajorAxisKm: 185404, eccentricity: 0.0196, inclinationDeg: 1.57, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 280, orbitalPeriodDays: 0.942 }, visual: { color: 0xaaa59b, pattern: 'moon' }, feature: '赫歇尔撞击坑非常醒目。' }
        ]
    },
    uranus: {
        id: 'uranus',
        name: '天王星',
        nameEn: 'Uranus',
        type: '冰巨行星',
        effectType: 'planet-ice',
        radiusKm: 25362,
        massKg: 8.6810e25,
        rotationPeriodHours: -17.24,
        axialTiltDeg: 97.77,
        surfaceTemperature: '云顶约 -224°C',
        composition: '氢、氦和富含水/氨/甲烷的冰质物质',
        atmosphere: '氢约 82.5%，氦约 15.2%，甲烷约 2.3%',
        feature: '自转轴几乎躺倒，呈淡青色。',
        orbit: { semiMajorAxisKm: 19.2184 * AU_KM, eccentricity: 0.0463, inclinationDeg: 0.773, longitudeAscendingNodeDeg: 74.006, argumentPeriapsisDeg: 96.998, meanAnomalyDeg: 142.238, orbitalPeriodDays: 30685.4 },
        rings: { innerRadiusKm: 51149, outerRadiusKm: 122600, color: 0x8ba0aa },
        visual: { color: 0x9bd3dc, roughness: 0.65, pattern: 'iceGiant' },
        moons: [
            { id: 'titania', effectType: 'moon', name: '天卫三', nameEn: 'Titania', radiusKm: 788.4, massKg: 3.420e21, orbit: { semiMajorAxisKm: 435910, eccentricity: 0.0011, inclinationDeg: 0.34, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 75, orbitalPeriodDays: 8.706 }, visual: { color: 0x918b86, pattern: 'moon' }, feature: '天王星最大卫星。' },
            { id: 'oberon', effectType: 'moon', name: '天卫四', nameEn: 'Oberon', radiusKm: 761.4, massKg: 3.010e21, orbit: { semiMajorAxisKm: 583520, eccentricity: 0.0014, inclinationDeg: 0.06, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 230, orbitalPeriodDays: 13.463 }, visual: { color: 0x716b68, pattern: 'moon' }, feature: '外侧大卫星，表面较暗。' }
        ]
    },
    neptune: {
        id: 'neptune',
        name: '海王星',
        nameEn: 'Neptune',
        type: '冰巨行星',
        effectType: 'planet-ice',
        radiusKm: 24622,
        massKg: 1.02413e26,
        rotationPeriodHours: 16.11,
        axialTiltDeg: 28.32,
        surfaceTemperature: '云顶约 -214°C',
        composition: '氢、氦、甲烷和深层水/氨/甲烷冰质物质',
        atmosphere: '氢约 80%，氦约 19%，甲烷约 1%',
        feature: '拥有太阳系最快的行星风。',
        orbit: { semiMajorAxisKm: 30.1104 * AU_KM, eccentricity: 0.00946, inclinationDeg: 1.770, longitudeAscendingNodeDeg: 131.784, argumentPeriapsisDeg: 276.336, meanAnomalyDeg: 256.228, orbitalPeriodDays: 60190 },
        visual: { color: 0x3459d4, secondaryColor: 0x2440a0, roughness: 0.6, pattern: 'iceGiant' },
        moons: [
            { id: 'triton', effectType: 'moon', name: '海卫一', nameEn: 'Triton', radiusKm: 1353.4, massKg: 2.140e22, orbit: { semiMajorAxisKm: 354759, eccentricity: 0.000016, inclinationDeg: 156.9, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 130, orbitalPeriodDays: -5.877 }, visual: { color: 0xb6b0aa, pattern: 'ice' }, feature: '逆行轨道，可能是被捕获的柯伊伯带天体。' }
        ]
    },
    ceres: {
        id: 'ceres',
        name: '谷神星',
        nameEn: 'Ceres',
        type: '矮行星 / 小行星带最大天体',
        effectType: 'dwarf-planet',
        radiusKm: 469.7,
        massKg: 9.3835e20,
        rotationPeriodHours: 9.074,
        surfaceTemperature: '平均约 -105°C',
        composition: '含水矿物、冰和岩石混合体',
        feature: '小行星带内唯一被正式归类为矮行星的天体。',
        orbit: { semiMajorAxisKm: 2.7675 * AU_KM, eccentricity: 0.0758, inclinationDeg: 10.59, longitudeAscendingNodeDeg: 80.31, argumentPeriapsisDeg: 73.6, meanAnomalyDeg: 95.99, orbitalPeriodDays: 1680.5 },
        visual: { color: 0x8d8a82, roughness: 0.94, pattern: 'moon' },
        moons: []
    },
    pluto: {
        id: 'pluto',
        name: '冥王星',
        nameEn: 'Pluto',
        type: '矮行星 / 柯伊伯带天体',
        effectType: 'dwarf-planet',
        radiusKm: 1188.3,
        massKg: 1.303e22,
        rotationPeriodHours: -153.3,
        axialTiltDeg: 119.6,
        surfaceTemperature: '约 -229°C',
        composition: '氮冰、甲烷冰、一氧化碳冰和岩冰内部',
        feature: '轨道倾角和偏心率较高，与海王星有 3:2 轨道共振。',
        orbit: { semiMajorAxisKm: 39.482 * AU_KM, eccentricity: 0.2488, inclinationDeg: 17.16, longitudeAscendingNodeDeg: 110.30, argumentPeriapsisDeg: 113.76, meanAnomalyDeg: 14.53, orbitalPeriodDays: 90560 },
        visual: { color: 0xc3a98f, secondaryColor: 0x8c6d59, roughness: 0.88, pattern: 'pluto' },
        moons: [
            { id: 'charon', effectType: 'moon', name: '卡戎', nameEn: 'Charon', radiusKm: 606, massKg: 1.586e21, orbit: { semiMajorAxisKm: 19591, eccentricity: 0.0002, inclinationDeg: 0.08, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 60, orbitalPeriodDays: 6.387 }, visual: { color: 0x9a958d, pattern: 'moon' }, feature: '与冥王星组成双天体系统，二者共同绕质心运动。' }
        ]
    },
    eris: {
        id: 'eris',
        name: '阋神星',
        nameEn: 'Eris',
        type: '矮行星 / 离散盘天体',
        effectType: 'dwarf-planet',
        radiusKm: 1163,
        massKg: 1.6466e22,
        rotationPeriodHours: 25.9,
        surfaceTemperature: '约 -243°C',
        composition: '高反照率甲烷冰表面，岩冰内部',
        feature: '质量略大于冥王星，发现后推动了行星定义的重新讨论。',
        orbit: { semiMajorAxisKm: 67.78 * AU_KM, eccentricity: 0.44, inclinationDeg: 44.04, longitudeAscendingNodeDeg: 35.95, argumentPeriapsisDeg: 150.8, meanAnomalyDeg: 204.2, orbitalPeriodDays: 203830 },
        visual: { color: 0xdad7cc, roughness: 0.9, pattern: 'ice' },
        moons: [
            { id: 'dysnomia', effectType: 'moon', name: '迪丝诺美亚', nameEn: 'Dysnomia', radiusKm: 350, orbit: { semiMajorAxisKm: 37300, eccentricity: 0.01, inclinationDeg: 0, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 120, orbitalPeriodDays: 15.77 }, visual: { color: 0xb8b6ae, pattern: 'moon' }, feature: '阋神星唯一已知卫星。' }
        ]
    },
    halley: {
        id: 'halley',
        name: '哈雷彗星',
        nameEn: '1P/Halley',
        type: '周期彗星',
        effectType: 'comet',
        radiusKm: 5.5,
        massKg: 2.2e14,
        rotationPeriodHours: 52.8,
        surfaceTemperature: '随日距剧烈变化',
        composition: '尘埃、岩屑、水冰和挥发性冰',
        feature: '约 76 年回归一次，最近一次近日点在 1986 年。',
        orbit: { semiMajorAxisKm: 17.834 * AU_KM, eccentricity: 0.967, inclinationDeg: 162.26, longitudeAscendingNodeDeg: 58.42, argumentPeriapsisDeg: 111.33, meanAnomalyDeg: 38.38, orbitalPeriodDays: 27509 },
        visual: { color: 0xbfdcff, roughness: 0.86, pattern: 'ice' },
        comet: true,
        moons: []
    }
};

const PLANET_ORDER = [
    'mercury',
    'venus',
    'earth',
    'mars',
    'ceres',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
    'eris',
    'halley'
];

const CELESTIAL_CATALOG = [
    {
        id: 'alpha-centauri',
        name: '半人马座 α 星系',
        nameEn: 'Alpha Centauri',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '三合星系统',
        distanceLy: 4.37,
        galactic: { lDeg: 315.7, bDeg: -0.7 },
        spectralClass: 'G2V + K1V + M5.5Ve',
        color: 0xfff2ba,
        size: 5.2,
        temperature: 'A/B 星接近太阳型；比邻星为红矮星',
        feature: '离太阳最近的恒星系统；比邻星拥有已确认行星比邻星 b。',
        systemLayout: {
            sceneScale: 1.15,
            cameraDistance: 170,
            note: '微缩图不是真实比例：α A/B 双星与远处比邻星相隔很远，这里压缩到同一视图中。',
            bodies: [
                { name: 'α Cen A', kind: 'star', color: 0xfff2ba, size: 14, x: 46, y: 50, detail: 'G2V，太阳相似星' },
                { name: 'α Cen B', kind: 'star', color: 0xffc278, size: 12, x: 58, y: 47, detail: 'K1V，双星伴星' },
                { name: '比邻星', kind: 'star', color: 0xff7a61, size: 9, x: 24, y: 64, detail: 'M5.5Ve 红矮星' },
                { name: 'Proxima b', kind: 'planet', color: 0x74b8ff, orbit: 12, orbitCenter: '比邻星', angleDeg: 220, detail: '已确认；周期约 11.2 天；最低质量约 1.1 地球质量' }
            ]
        },
        related: [
            { title: '半人马座 α A', detail: 'G2V 主序星，和太阳非常相似，是双星主成员之一。' },
            { title: '半人马座 α B', detail: 'K1V 主序星，与 α A 绕共同质心运行。' },
            { title: '比邻星', detail: 'M 型红矮星，是当前已知离太阳最近的恒星。' },
            { title: '比邻星 b', detail: '已确认系外行星，最低质量接近地球，位于红矮星宜居带附近。' }
        ]
    },
    {
        id: 'barnards-star',
        name: '巴纳德星',
        nameEn: "Barnard's Star",
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '红矮星',
        distanceLy: 5.96,
        galactic: { lDeg: 31.0, bDeg: 14.1 },
        spectralClass: 'M4V',
        color: 0xff8d69,
        size: 3.2,
        temperature: '约 3100 K',
        feature: '自行运动非常快，是距离太阳最近的单恒星之一。',
        systemLayout: {
            sceneScale: 1.25,
            cameraDistance: 165,
            note: '目前不渲染确认行星；历史候选信号仍需谨慎对待。',
            bodies: [
                { name: '巴纳德星', kind: 'star', color: 0xff8d69, size: 13, x: 50, y: 50, detail: 'M4V 红矮星' },
                { name: '候选信号', kind: 'candidate', color: 0x8fb2ff, orbit: 34, angleDeg: 135, detail: '候选/争议，不作为确认行星' }
            ]
        },
        related: [
            { title: '红矮星本体', detail: '低质量、低亮度、寿命极长的 M 型主序星。' },
            { title: '高自行运动', detail: '在天空背景上的视运动很快，是近距离恒星的经典案例。' },
            { title: '行星研究状态', detail: '曾有行星候选报告，后续研究仍在持续修正；这里不把它渲染为确认行星。' }
        ]
    },
    {
        id: 'sirius',
        name: '天狼星',
        nameEn: 'Sirius',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '双星系统',
        distanceLy: 8.6,
        galactic: { lDeg: 227.2, bDeg: -8.9 },
        spectralClass: 'A1V + DA2',
        color: 0xeaf4ff,
        size: 6.0,
        temperature: '主星约 9940 K',
        feature: '夜空最亮恒星；伴星天狼星 B 是白矮星。',
        systemLayout: {
            sceneScale: 1.18,
            cameraDistance: 175,
            note: '天狼星 B 是白矮星伴星；不是行星，因此用伴星轨道表示。',
            bodies: [
                { name: '天狼星 A', kind: 'star', color: 0xeaf4ff, size: 16, x: 50, y: 50, detail: 'A1V 主序星' },
                { name: '天狼星 B', kind: 'white-dwarf', color: 0xf8fbff, orbit: 42, angleDeg: 40, detail: '白矮星；轨道周期约 50 年' }
            ]
        },
        related: [
            { title: '天狼星 A', detail: 'A1V 主序星，亮度高，是夜空视星等最亮恒星。' },
            { title: '天狼星 B', detail: '白矮星，曾是较大质量恒星，现为致密残骸。' }
        ]
    },
    {
        id: 'epsilon-eridani',
        name: '波江座 ε',
        nameEn: 'Epsilon Eridani',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: 'K 型主序星',
        distanceLy: 10.5,
        galactic: { lDeg: 195.8, bDeg: -48.0 },
        spectralClass: 'K2V',
        color: 0xffc37c,
        size: 4.2,
        temperature: '约 5080 K',
        feature: '年轻近邻恒星，拥有尘埃盘，是行星系统研究的重要目标。',
        systemLayout: {
            sceneScale: 1.1,
            cameraDistance: 185,
            note: '尘埃盘和巨行星轨道均为压缩示意，用于表达系统结构而非真实角大小。',
            bodies: [
                { name: 'ε Eri', kind: 'star', color: 0xffc37c, size: 14, x: 50, y: 50, detail: 'K2V 年轻恒星' },
                { name: 'ε Eri b', kind: 'planet', color: 0xd6b07e, orbit: 30, angleDeg: 300, detail: '巨行星级；常见目录列为确认/研究目标' },
                { name: '冷尘埃盘', kind: 'debris-disk', color: 0x9ebfff, orbit: 48, angleDeg: 0, detail: '红外尘埃盘' }
            ]
        },
        related: [
            { title: 'K2V 主星', detail: '比太阳更冷、更橙，年龄也更年轻。' },
            { title: '尘埃盘', detail: '红外观测显示周围有冷尘埃结构，类似早期太阳系残留盘。' },
            { title: '波江座 ε b', detail: '常见目录中列为巨行星级系外行星，但轨道和参数仍是研究对象。' }
        ]
    },
    {
        id: 'procyon',
        name: '南河三',
        nameEn: 'Procyon',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '双星系统',
        distanceLy: 11.46,
        galactic: { lDeg: 213.7, bDeg: 13.0 },
        spectralClass: 'F5IV-V + DQZ',
        color: 0xfff0d0,
        size: 5.1,
        temperature: '主星约 6530 K',
        feature: '明亮近邻星，伴星为白矮星。',
        related: [
            { title: '南河三 A', detail: 'F 型恒星，处在主序星到次巨星的演化阶段附近。' },
            { title: '南河三 B', detail: '白矮星伴星，轨道周期约数十年量级。' }
        ]
    },
    {
        id: 'tau-ceti',
        name: '天仓五',
        nameEn: 'Tau Ceti',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: 'G 型主序星',
        distanceLy: 11.9,
        galactic: { lDeg: 173.1, bDeg: -73.4 },
        spectralClass: 'G8V',
        color: 0xffdf9d,
        size: 4.5,
        temperature: '约 5344 K',
        feature: '太阳相似近邻星，常用于宜居行星和尘埃盘研究。',
        systemLayout: {
            sceneScale: 1.08,
            cameraDistance: 185,
            note: '天仓五的低质量行星多为候选/待进一步确认；这里用虚线候选轨道表达不确定性。',
            bodies: [
                { name: '天仓五', kind: 'star', color: 0xffdf9d, size: 14, x: 50, y: 50, detail: 'G8V 主序星' },
                { name: '候选 e', kind: 'candidate', color: 0x8fd6ff, orbit: 22, angleDeg: 15, detail: '候选低质量行星' },
                { name: '候选 f', kind: 'candidate', color: 0x94d39b, orbit: 31, angleDeg: 190, detail: '候选低质量行星' },
                { name: '尘埃盘', kind: 'debris-disk', color: 0xb8cffd, orbit: 48, angleDeg: 0, detail: '碎屑盘信号' }
            ]
        },
        related: [
            { title: 'G8V 主星', detail: '比太阳略冷、略暗，是长期 SETI 和宜居性讨论中的近邻目标。' },
            { title: '尘埃盘', detail: '周围存在较强尘埃盘信号，暗示小天体碰撞碎屑丰富。' },
            { title: '行星候选', detail: '有多个低质量行星候选被报告，确认状态和参数仍依赖后续观测。' }
        ]
    },
    {
        id: 'vega',
        name: '织女星',
        nameEn: 'Vega',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: 'A 型主序星',
        distanceLy: 25.0,
        galactic: { lDeg: 67.5, bDeg: 19.2 },
        spectralClass: 'A0V',
        color: 0xdcecff,
        size: 6.4,
        temperature: '约 9600 K',
        feature: '夏季大三角亮星之一，拥有红外尘埃盘。',
        related: [
            { title: 'A0V 主星', detail: '蓝白色明亮恒星，历史上曾作为光度校准基准。' },
            { title: '快速自转', detail: '自转很快，导致赤道鼓起和表面温度分布差异。' },
            { title: '尘埃盘', detail: '红外过量显示周围存在碎屑盘，可能由小天体碰撞供给。' }
        ]
    },
    {
        id: 'trappist-1',
        name: 'TRAPPIST-1',
        nameEn: 'TRAPPIST-1',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '超冷红矮星',
        distanceLy: 40.7,
        galactic: { lDeg: 69.7, bDeg: -56.6 },
        spectralClass: 'M8V',
        color: 0xff6f55,
        size: 3.0,
        temperature: '约 2550 K',
        feature: '拥有七颗地球大小行星，其中多颗位于传统宜居带附近。',
        systemLayout: {
            sceneScale: 1.28,
            cameraDistance: 215,
            note: '七颗行星轨道极紧凑，周期约 1.5 到 18.8 天；为了可读性已大幅拉开间距。',
            bodies: [
                { name: 'TRAPPIST-1', kind: 'star', color: 0xff6f55, size: 12, x: 50, y: 50, detail: 'M8V 超冷红矮星' },
                { name: 'b', kind: 'planet', color: 0xb9a492, orbit: 14, angleDeg: 10, detail: '约 1.5 天' },
                { name: 'c', kind: 'planet', color: 0xc6b7a4, orbit: 19, angleDeg: 70, detail: '约 2.4 天' },
                { name: 'd', kind: 'planet', color: 0x9fb8d8, orbit: 24, angleDeg: 132, detail: '约 4.0 天' },
                { name: 'e', kind: 'planet', color: 0x84c99f, orbit: 29, angleDeg: 190, detail: '约 6.1 天；宜居带重点目标' },
                { name: 'f', kind: 'planet', color: 0x7bb5d8, orbit: 35, angleDeg: 245, detail: '约 9.2 天；宜居带附近' },
                { name: 'g', kind: 'planet', color: 0x6fa5d6, orbit: 41, angleDeg: 304, detail: '约 12.4 天；宜居带附近' },
                { name: 'h', kind: 'planet', color: 0xb0bccb, orbit: 47, angleDeg: 340, detail: '约 18.8 天' }
            ]
        },
        related: [
            { title: '超冷红矮星', detail: '主星非常小且暗，行星轨道全部非常紧凑。' },
            { title: '七颗地球大小行星', detail: 'TRAPPIST-1 b、c、d、e、f、g、h 的半径都接近地球尺度。' },
            { title: '宜居带候选', detail: 'e、f、g 常被列为传统宜居带附近重点研究目标。' },
            { title: '同步自转可能性', detail: '因为轨道很近，部分行星可能潮汐锁定。' }
        ]
    },
    {
        id: 'alpha-centauri-b',
        name: '半人马座 α B',
        nameEn: 'Alpha Centauri B',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: 'K 型伴星',
        distanceLy: 4.37,
        galactic: { lDeg: 315.7, bDeg: -0.7 },
        spectralClass: 'K1V',
        color: 0xffc278,
        size: 3.4,
        temperature: '约 5200 K',
        feature: '半人马座 α 三合星系统中的 K 型成员。',
        related: [
            { title: '双星成员', detail: '与半人马座 α A 绕共同质心运行。' },
            { title: '近邻系统', detail: '与比邻星共同构成离太阳最近的恒星系统。' }
        ]
    },
    {
        id: 'luyten-726-8', name: '鲁坦 726-8', nameEn: 'Luyten 726-8', atlasMap: 'neighborhood', category: 'nearby-star',
        type: '双红矮星系统', distanceLy: 8.73, galactic: { lDeg: 5.0, bDeg: -16.0 }, spectralClass: 'M5.5V + M6V', color: 0xff765f, size: 2.8,
        temperature: '约 2600 到 3000 K', feature: '由两颗红矮星组成的近邻耀星系统，UV Ceti 是其中的耀斑代表。'
    },
    {
        id: 'ross-128', name: '罗斯 128', nameEn: 'Ross 128', atlasMap: 'neighborhood', category: 'nearby-star',
        type: '红矮星', distanceLy: 11.0, galactic: { lDeg: 271.0, bDeg: 48.0 }, spectralClass: 'M4V', color: 0xff896f, size: 2.9,
        temperature: '约 3200 K', feature: '相对安静的近邻红矮星，拥有已确认系外行星 Ross 128 b。',
        systemLayout: {
            sceneScale: 1.12, cameraDistance: 175, note: '行星轨道经过压缩，仅用于表达系统结构。',
            bodies: [
                { name: 'Ross 128', kind: 'star', color: 0xff896f, size: 13, x: 50, y: 50, detail: 'M4V 红矮星' },
                { name: 'Ross 128 b', kind: 'planet', color: 0x83b8d8, orbit: 25, angleDeg: 220, detail: '已确认；约 9.9 天轨道周期' }
            ]
        }
    },
    {
        id: 'teegarden-star', name: '蒂加登星', nameEn: "Teegarden's Star", atlasMap: 'neighborhood', category: 'nearby-star',
        type: '超冷红矮星', distanceLy: 12.5, galactic: { lDeg: 197.0, bDeg: -22.0 }, spectralClass: 'M7V', color: 0xff6d60, size: 2.7,
        temperature: '约 2700 K', feature: '拥有 Teegarden b、c 等近地球质量行星的近邻红矮星系统。',
        systemLayout: {
            sceneScale: 1.16, cameraDistance: 180, note: '两颗行星轨道按可读性拉开。',
            bodies: [
                { name: '蒂加登星', kind: 'star', color: 0xff6d60, size: 12, x: 50, y: 50, detail: 'M7V 超冷红矮星' },
                { name: 'Teegarden b', kind: 'planet', color: 0x75c6a0, orbit: 21, angleDeg: 30, detail: '已确认；约 4.9 天轨道周期' },
                { name: 'Teegarden c', kind: 'planet', color: 0x76a9d6, orbit: 31, angleDeg: 185, detail: '已确认；约 11.4 天轨道周期' }
            ]
        }
    },
    {
        id: 'gj-667', name: '格利泽 667', nameEn: 'Gliese 667', atlasMap: 'neighborhood', category: 'nearby-star',
        type: '三合星系统', distanceLy: 23.6, galactic: { lDeg: 332.0, bDeg: -12.0 }, spectralClass: 'M1.5V + M3V + M3V', color: 0xff946e, size: 3.5,
        temperature: '多颗红矮星成员', feature: '多星系统；格利泽 667 C 曾被报告拥有多个系外行星候选。',
        systemLayout: {
            sceneScale: 1.18, cameraDistance: 185, note: '多星成员和候选行星均为压缩结构示意。',
            bodies: [
                { name: 'Gliese 667 C', kind: 'star', color: 0xff946e, size: 13, x: 50, y: 50, detail: 'M3V 红矮星' },
                { name: 'Gliese 667 A/B', kind: 'star', color: 0xffb184, size: 9, x: 28, y: 40, detail: '远处双星成员' },
                { name: '候选行星区', kind: 'candidate', color: 0x91b8e9, orbit: 28, angleDeg: 215, detail: '候选/研究目标，参数仍在修正' }
            ]
        }
    },
    {
        id: 'kepler-186', name: '开普勒-186', nameEn: 'Kepler-186', atlasMap: 'neighborhood', category: 'nearby-star',
        type: '系外行星系统', distanceLy: 492.0, galactic: { lDeg: 76.0, bDeg: 13.0 }, spectralClass: 'M1V', color: 0xff956f, size: 3.0,
        temperature: '红矮星', feature: '拥有五颗已确认行星，Kepler-186 f 是早期地球大小宜居带候选代表。',
        systemLayout: {
            sceneScale: 1.2, cameraDistance: 195, note: '距离较远但仍归入邻域层，用压缩距离表达系外行星研究路线。',
            bodies: [
                { name: 'Kepler-186', kind: 'star', color: 0xff956f, size: 12, x: 50, y: 50, detail: 'M1V 红矮星' },
                { name: 'Kepler-186 b', kind: 'planet', color: 0xb7a18d, orbit: 14, angleDeg: 15, detail: '已确认行星' },
                { name: 'Kepler-186 c', kind: 'planet', color: 0x9daabf, orbit: 21, angleDeg: 80, detail: '已确认行星' },
                { name: 'Kepler-186 d', kind: 'planet', color: 0x9cae9e, orbit: 28, angleDeg: 145, detail: '已确认行星' },
                { name: 'Kepler-186 e', kind: 'planet', color: 0x87a9c6, orbit: 35, angleDeg: 220, detail: '已确认行星' },
                { name: 'Kepler-186 f', kind: 'planet', color: 0x78c49c, orbit: 43, angleDeg: 300, detail: '地球大小；宜居带候选代表' }
            ]
        }
    },
    {
        id: 'kepler-452', name: '开普勒-452', nameEn: 'Kepler-452', atlasMap: 'neighborhood', category: 'nearby-star',
        type: '太阳相似恒星系统', distanceLy: 1800.0, galactic: { lDeg: 76.0, bDeg: 6.0 }, spectralClass: 'G2V', color: 0xffe1a0, size: 3.2,
        temperature: '约 5750 K', feature: '拥有位于宜居带附近的 Kepler-452 b，是太阳相似系统研究的代表目标。',
        systemLayout: {
            sceneScale: 1.12, cameraDistance: 190, note: 'Kepler-452 b 的性质仍需谨慎表述，轨道为压缩示意。',
            bodies: [
                { name: 'Kepler-452', kind: 'star', color: 0xffe1a0, size: 13, x: 50, y: 50, detail: 'G2V 太阳相似恒星' },
                { name: 'Kepler-452 b', kind: 'candidate', color: 0x76b98e, orbit: 34, angleDeg: 160, detail: '确认状态和物理性质仍需后续观测约束' }
            ]
        }
    },
    {
        id: 'lhs-1140', name: 'LHS 1140', nameEn: 'LHS 1140', atlasMap: 'neighborhood', category: 'nearby-star',
        type: '红矮星系统', distanceLy: 49.0, galactic: { lDeg: 204.0, bDeg: -55.0 }, spectralClass: 'M4.5V', color: 0xff806b, size: 2.9,
        temperature: '约 3130 K', feature: 'LHS 1140 b 是近距离、适合大气研究的岩质行星候选。',
        systemLayout: {
            sceneScale: 1.14, cameraDistance: 185, note: '行星轨道和大小不是同一真实比例。',
            bodies: [
                { name: 'LHS 1140', kind: 'star', color: 0xff806b, size: 12, x: 50, y: 50, detail: 'M4.5V 红矮星' },
                { name: 'LHS 1140 b', kind: 'planet', color: 0x7eb5c5, orbit: 29, angleDeg: 250, detail: '岩质行星；宜居带大气研究重点' }
            ]
        }
    },
    {
        id: 'gj-1132', name: '格利泽 1132', nameEn: 'GJ 1132', atlasMap: 'neighborhood', category: 'nearby-star',
        type: '红矮星系统', distanceLy: 41.0, galactic: { lDeg: 295.0, bDeg: -59.0 }, spectralClass: 'M4.5V', color: 0xff7c63, size: 2.9,
        temperature: '约 3270 K', feature: '近邻红矮星系统，GJ 1132 b 是大气观测的重要岩质行星目标。',
        systemLayout: {
            sceneScale: 1.1, cameraDistance: 180, note: '只展示代表性行星，轨道为压缩示意。',
            bodies: [
                { name: 'GJ 1132', kind: 'star', color: 0xff7c63, size: 12, x: 50, y: 50, detail: 'M4.5V 红矮星' },
                { name: 'GJ 1132 b', kind: 'planet', color: 0xb27f72, orbit: 23, angleDeg: 55, detail: '岩质行星；大气观测目标' }
            ]
        }
    },
    {
        id: 'hd-219134', name: 'HD 219134', nameEn: 'HD 219134', atlasMap: 'neighborhood', category: 'nearby-star',
        type: '多行星系统', distanceLy: 21.3, galactic: { lDeg: 92.0, bDeg: 2.0 }, spectralClass: 'K3V', color: 0xffc889, size: 3.4,
        temperature: '约 4690 K', feature: '距离较近的 K 型多行星系统，包含已确认的岩质行星。',
        systemLayout: {
            sceneScale: 1.16, cameraDistance: 180, note: '多颗行星轨道按可读性压缩。',
            bodies: [
                { name: 'HD 219134', kind: 'star', color: 0xffc889, size: 13, x: 50, y: 50, detail: 'K3V 主序星' },
                { name: 'b', kind: 'planet', color: 0xb99478, orbit: 15, angleDeg: 10, detail: '已确认岩质行星' },
                { name: 'c', kind: 'planet', color: 0x8faac1, orbit: 24, angleDeg: 100, detail: '已确认行星' },
                { name: 'f', kind: 'planet', color: 0x9bc59d, orbit: 35, angleDeg: 215, detail: '已确认行星' }
            ]
        }
    },
    {
        id: 'pleiades',
        name: '昴星团',
        nameEn: 'Pleiades / M45',
        atlasMap: 'milky-way',
        category: 'deep-sky',
        type: '疏散星团',
        distanceLy: 444,
        galactic: { lDeg: 166.6, bDeg: -23.5 },
        color: 0x9ec9ff,
        size: 16,
        temperature: '以年轻蓝白色恒星为主',
        feature: '年轻疏散星团，肉眼可见，多尘埃反射星云。',
        related: [
            { title: '疏散星团', detail: '由同一分子云诞生的一批年轻恒星组成。' },
            { title: '反射星云', detail: '蓝色云气主要来自尘埃反射附近蓝白恒星光。' },
            { title: 'M45', detail: '梅西耶星表编号，中文常称七姐妹星团。' }
        ]
    },
    {
        id: 'orion-nebula',
        name: '猎户座大星云',
        nameEn: 'Orion Nebula / M42',
        atlasMap: 'milky-way',
        category: 'deep-sky',
        type: '恒星形成区 / 发射星云',
        distanceLy: 1500,
        galactic: { lDeg: 209.0, bDeg: -19.4 },
        color: 0xff8fb3,
        size: 22,
        temperature: '电离氢区，局部温度约万 K 量级',
        feature: '距离太阳较近的大质量恒星形成区之一。',
        related: [
            { title: '恒星形成区', detail: '大量新生恒星正在从气体和尘埃中形成。' },
            { title: '猎户座分子云', detail: '大星云是更大分子云复合体的一部分。' },
            { title: 'M42', detail: '肉眼可见的明亮发射星云。' }
        ]
    },
    {
        id: 'galactic-center',
        name: '银河系中心方向',
        nameEn: 'Galactic Center',
        atlasMap: 'milky-way',
        category: 'galactic-landmark',
        type: '银河系核心方向标',
        distanceLy: 26670,
        galactic: { lDeg: 0, bDeg: 0 },
        color: 0xffd078,
        size: 24,
        temperature: '非单一天体',
        feature: '指向银心和人马座 A* 附近；此处作为方向标，不按真实比例显示距离。',
        related: [
            { title: '人马座 A*', detail: '银河系中心超大质量黑洞的电波源位置。' },
            { title: '银河系核球', detail: '恒星密集、尘埃遮蔽严重的银河中心区域。' },
            { title: '方向标说明', detail: '银心距离远大于本模型范围，因此只作为方向参考。' }
        ]
    },
    {
        id: 'crab-nebula',
        name: '蟹状星云',
        nameEn: 'Crab Nebula / M1',
        atlasMap: 'milky-way',
        category: 'nebula',
        type: '超新星遗迹 / 脉冲星风星云',
        distanceLy: 6500,
        galactic: { lDeg: 184.6, bDeg: -5.8 },
        color: 0xff9c78,
        size: 19,
        temperature: '非单一天体',
        feature: '1054 年超新星爆发留下的遗迹，中心有快速旋转的蟹状星云脉冲星。',
        related: [
            { title: 'M1', detail: '梅西耶星表第一号天体，位于金牛座方向。' },
            { title: '蟹状星云脉冲星', detail: '中心中子星每秒自转约 30 次，驱动高能辐射和星云结构。' },
            { title: '距离说明', detail: '距离约 6500 光年，是研究超新星遗迹的重要目标。' }
        ]
    },
    {
        id: 'eagle-nebula',
        name: '鹰状星云',
        nameEn: 'Eagle Nebula / M16',
        atlasMap: 'milky-way',
        category: 'nebula',
        type: '发射星云 / 恒星形成区',
        distanceLy: 6500,
        galactic: { lDeg: 17.0, bDeg: 0.8 },
        color: 0x9fd7ff,
        size: 24,
        temperature: '电离氢区',
        feature: '著名的“创生之柱”位于其中，是恒星形成与尘埃侵蚀的经典图像。',
        related: [
            { title: '创生之柱', detail: '由冷气体和尘埃构成的柱状结构，被年轻恒星辐射雕刻。' },
            { title: 'M16', detail: '星云与疏散星团共同构成的恒星形成区域。' }
        ]
    },
    {
        id: 'lagoon-nebula',
        name: '礁湖星云',
        nameEn: 'Lagoon Nebula / M8',
        atlasMap: 'milky-way',
        category: 'nebula',
        type: '发射星云 / 恒星形成区',
        distanceLy: 5200,
        galactic: { lDeg: 6.0, bDeg: -1.2 },
        color: 0xff8fb3,
        size: 26,
        temperature: '电离氢区',
        feature: '位于人马座方向的大型恒星形成区，包含年轻星团 NGC 6530。',
        related: [
            { title: 'M8 / NGC 6523', detail: '明亮发射星云，适合小型望远镜观测。' },
            { title: '沙漏区域', detail: 'Hubble 曾拍摄星云中被强烈辐射塑形的小区域。' }
        ]
    },
    {
        id: 'trifid-nebula',
        name: '三裂星云',
        nameEn: 'Trifid Nebula / M20',
        atlasMap: 'milky-way',
        category: 'nebula',
        type: '发射/反射/暗星云复合体',
        distanceLy: 5500,
        galactic: { lDeg: 7.0, bDeg: -0.3 },
        color: 0xc09cff,
        size: 22,
        temperature: '恒星形成区',
        feature: '由明亮发射星云、蓝色反射星云和暗尘埃带组成，呈现三裂外观。',
        related: [
            { title: 'M20', detail: '位于人马座方向，靠近礁湖星云。' },
            { title: '复合星云', detail: '同一区域同时呈现发射、反射和暗星云特征。' }
        ]
    },
    {
        id: 'carina-nebula',
        name: '船底座星云',
        nameEn: 'Carina Nebula',
        atlasMap: 'milky-way',
        category: 'nebula',
        type: '大型恒星形成区',
        distanceLy: 7500,
        galactic: { lDeg: 287.6, bDeg: -0.6 },
        color: 0xffb06f,
        size: 32,
        temperature: '电离氢区',
        feature: '银河系内最宏大的恒星形成区之一，包含海山二等极亮大质量恒星。',
        related: [
            { title: '宇宙悬崖', detail: 'Webb 首批图像之一展示了 NGC 3324 区域的气体边缘。' },
            { title: '海山二', detail: '极端大质量恒星系统，曾发生剧烈爆发。' }
        ]
    },
    {
        id: 'rosette-nebula',
        name: '玫瑰星云',
        nameEn: 'Rosette Nebula',
        atlasMap: 'milky-way',
        category: 'nebula',
        type: '发射星云 / 恒星育婴室',
        distanceLy: 5000,
        galactic: { lDeg: 206.3, bDeg: -2.1 },
        color: 0xff7fa8,
        size: 25,
        temperature: '电离氢区',
        feature: '麒麟座方向的大型发射星云，中心星团吹出近似玫瑰状空腔。',
        related: [
            { title: 'NGC 2237-2239', detail: '玫瑰星云常包含多个 NGC 编号区域。' },
            { title: '中心星团', detail: '年轻热星的辐射与恒星风雕刻出中央空洞。' }
        ]
    },
    {
        id: 'helix-nebula',
        name: '螺旋星云',
        nameEn: 'Helix Nebula / NGC 7293',
        atlasMap: 'milky-way',
        category: 'nebula',
        type: '行星状星云',
        distanceLy: 650,
        galactic: { lDeg: 36.2, bDeg: -57.1 },
        color: 0x62d8ff,
        size: 20,
        temperature: '濒死恒星外抛气壳',
        feature: '距离太阳较近的行星状星云之一，展示类太阳恒星晚期演化的外抛气体。',
        related: [
            { title: '中心白矮星', detail: '恒星外层被抛入太空后，核心残留为白矮星。' },
            { title: '“上帝之眼”外观', detail: '环状结构来自三维气体壳投影，并非真正的眼睛形状。' }
        ]
    },
    {
        id: 'ring-nebula',
        name: '环状星云',
        nameEn: 'Ring Nebula / M57',
        atlasMap: 'milky-way',
        category: 'nebula',
        type: '行星状星云',
        distanceLy: 2000,
        galactic: { lDeg: 63.2, bDeg: 13.9 },
        color: 0x7fffd4,
        size: 18,
        temperature: '濒死恒星外抛气壳',
        feature: '天琴座方向著名行星状星云，视觉上呈明亮环状。',
        related: [
            { title: 'M57', detail: '小型望远镜中的经典目标。' },
            { title: '真实形状', detail: 'Hubble/Webb 观测显示其三维结构比简单圆环更复杂。' }
        ]
    },
    {
        id: 'betelgeuse',
        name: '参宿四',
        nameEn: 'Betelgeuse / Alpha Orionis',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '红超巨星',
        distanceLy: 550,
        galactic: { lDeg: 199.8, bDeg: -8.9 },
        color: 0xff6f3c,
        size: 18,
        effectType: 'red-giant',
        temperature: '约 3500 K 量级',
        feature: '猎户座肩部的红超巨星，半径巨大，处在恒星演化晚期。',
        related: [
            { title: '红超巨星', detail: '外层大幅膨胀、表面温度较低，因此呈橙红色。' },
            { title: '变星行为', detail: '亮度会随大气脉动和尘埃活动变化。' },
            { title: '物理近似', detail: '动画以缓慢脉动和外层物质流表示红超巨星不稳定外壳。' }
        ]
    },
    {
        id: 'proxima-centauri',
        name: '比邻星',
        nameEn: 'Proxima Centauri',
        atlasMap: 'neighborhood',
        category: 'stellar-object',
        type: '红矮星 / 耀星',
        distanceLy: 4.24,
        galactic: { lDeg: 313.9, bDeg: -1.9 },
        color: 0xff6d55,
        size: 10,
        effectType: 'red-dwarf',
        temperature: '约 3000 K',
        feature: '距离太阳最近的恒星，属于活跃红矮星，已知拥有比邻星 b。',
        related: [
            { title: '红矮星', detail: '质量低、亮度低、寿命极长，是银河系最常见恒星类型。' },
            { title: '恒星耀斑', detail: '磁活动可产生强耀斑，对近距离行星环境影响显著。' },
            { title: '比邻星 b', detail: '已确认近地质量行星，轨道很近，可能受潮汐锁定和耀斑影响。' }
        ]
    },
    {
        id: 'sirius-b',
        name: '天狼星 B',
        nameEn: 'Sirius B',
        atlasMap: 'neighborhood',
        category: 'stellar-remnant',
        type: '白矮星',
        distanceLy: 8.6,
        galactic: { lDeg: 227.2, bDeg: -8.9 },
        color: 0xf8fbff,
        size: 10,
        effectType: 'white-dwarf',
        temperature: '约 25000 K 量级',
        feature: '天狼星系统中的白矮星伴星，是致密恒星残骸。',
        related: [
            { title: '白矮星', detail: '类太阳恒星耗尽核燃料后留下的高密度核心。' },
            { title: '高密度', detail: '质量接近太阳但半径接近地球尺度，主要由电子简并压支撑。' },
            { title: '物理近似', detail: '动画以小半径、高亮蓝白光晕表示高温致密残骸。' }
        ]
    },
    {
        id: 'van-maanen-star',
        name: '范马南星',
        nameEn: "Van Maanen's Star",
        atlasMap: 'neighborhood',
        category: 'stellar-remnant',
        type: '白矮星',
        distanceLy: 14.1,
        galactic: { lDeg: 91.7, bDeg: -56.0 },
        spectralClass: 'DZ8',
        color: 0xeef7ff,
        size: 9,
        effectType: 'white-dwarf',
        temperature: '约 6000 K 量级',
        feature: '距离太阳最近的孤立白矮星之一，是近邻致密残骸的经典样本。',
        related: [
            { title: '孤立白矮星', detail: '不在明亮双星系统中，便于单独研究冷却白矮星。' },
            { title: '近邻残骸', detail: '距离约 14 光年，是太阳邻域中的重要致密天体。' }
        ]
    },
    {
        id: '40-eridani-b',
        name: '波江座 40 B',
        nameEn: '40 Eridani B',
        atlasMap: 'neighborhood',
        category: 'stellar-remnant',
        type: '白矮星',
        distanceLy: 16.3,
        galactic: { lDeg: 200.8, bDeg: -38.0 },
        spectralClass: 'DA4',
        color: 0xf4f9ff,
        size: 9,
        effectType: 'white-dwarf',
        temperature: '约 17000 K 量级',
        feature: '波江座 40 三合星系统中的白矮星成员，是历史上最早被确认的白矮星之一。',
        related: [
            { title: '三合星系统', detail: '主星是 K 型恒星，另有一颗红矮星伴星。' },
            { title: '白矮星历史', detail: '对理解恒星晚期演化与电子简并压具有重要意义。' }
        ]
    },
    {
        id: 'kapteyns-star',
        name: '卡普坦星',
        nameEn: "Kapteyn's Star",
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '晕族红矮星',
        distanceLy: 12.8,
        galactic: { lDeg: 250.5, bDeg: -36.0 },
        spectralClass: 'sdM1',
        color: 0xff7a52,
        size: 3.1,
        temperature: '约 3500 K',
        feature: '自行很高的近邻红矮星，属于银河晕古老恒星族，是研究近邻晕星的经典目标。',
        related: [
            { title: '高自行', detail: '在天空中的视运动非常快，说明空间速度很高。' },
            { title: '晕族恒星', detail: '化学丰度和运动学特征更接近银河晕，而非薄盘年轻恒星。' }
        ]
    },
    {
        id: 'gliese-876',
        name: '格利泽 876',
        nameEn: 'Gliese 876',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '多行星红矮星系统',
        distanceLy: 15.3,
        galactic: { lDeg: 31.0, bDeg: -51.0 },
        spectralClass: 'M4V',
        color: 0xff835c,
        size: 3.6,
        temperature: '约 3200 K',
        feature: '近邻红矮星多行星系统，包含共振轨道中的巨行星和低质量行星。',
        systemLayout: {
            sceneScale: 1.18,
            cameraDistance: 170,
            note: '轨道间距经过压缩，仅用于表达系统结构。',
            bodies: [
                { name: 'Gl 876', kind: 'star', color: 0xff835c, size: 12, x: 50, y: 50, detail: 'M4V 红矮星' },
                { name: 'd', kind: 'planet', color: 0xb89478, orbit: 15, angleDeg: 30, detail: '内层低质量行星' },
                { name: 'c', kind: 'planet', color: 0xd2a56d, orbit: 26, angleDeg: 140, detail: '巨行星；共振轨道成员' },
                { name: 'b', kind: 'planet', color: 0xc8965c, orbit: 36, angleDeg: 250, detail: '外侧巨行星；共振轨道成员' }
            ]
        },
        related: [
            { title: '轨道共振', detail: '外侧两颗巨行星接近 2:1 共振，是动力学研究的重要样本。' },
            { title: '红矮星行星系统', detail: '说明即便是低质量恒星也可形成多颗行星。' }
        ]
    },
    {
        id: 'luytens-star',
        name: '鲁伊顿星',
        nameEn: "Luyten's Star",
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '红矮星',
        distanceLy: 12.4,
        galactic: { lDeg: 212.3, bDeg: 10.4 },
        spectralClass: 'M3.5V',
        color: 0xff7f58,
        size: 3.0,
        temperature: '约 3150 K',
        feature: '近邻红矮星，已知拥有两颗超级地球级行星候选，是太阳邻域宜居带研究目标之一。',
        related: [
            { title: '近邻红矮星', detail: '距离约 12 光年，属于太阳邻域常见低质量恒星。' },
            { title: '行星系统', detail: '外侧行星落在保守宜居带附近，常被列为大气观测候选。' }
        ]
    },
    {
        id: 'groombridge-34',
        name: '格鲁姆布里奇 34',
        nameEn: 'Groombridge 34',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '双红矮星系统',
        distanceLy: 11.6,
        galactic: { lDeg: 127.0, bDeg: -16.0 },
        spectralClass: 'M1.5V + M3.5V',
        color: 0xff8860,
        size: 3.4,
        temperature: '约 3400 / 3100 K',
        feature: '近邻双红矮星系统，主星周围有已确认巨行星，是研究双星环境行星形成的样本。',
        systemLayout: {
            sceneScale: 1.12,
            cameraDistance: 165,
            note: '双星间距与行星轨道均经压缩示意。',
            bodies: [
                { name: 'GX And', kind: 'star', color: 0xff8860, size: 12, x: 44, y: 50, detail: 'M1.5V 主星' },
                { name: 'GQ And', kind: 'star', color: 0xff6f55, size: 9, x: 60, y: 47, detail: 'M3.5V 伴星' },
                { name: 'b', kind: 'planet', color: 0xd2a56d, orbit: 28, angleDeg: 210, detail: '主星周围已确认巨行星' }
            ]
        },
        related: [
            { title: '双红矮星', detail: '两颗低质量恒星绕共同质心运行。' },
            { title: '行星环境', detail: '双星扰动会改变行星轨道稳定性，是理论与观测交叉点。' }
        ]
    },
    {
        id: 'ross-248',
        name: '罗斯 248',
        nameEn: 'Ross 248',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '红矮星 / 耀星',
        distanceLy: 10.3,
        galactic: { lDeg: 110.0, bDeg: -16.9 },
        spectralClass: 'M6V',
        color: 0xff6f55,
        size: 2.9,
        temperature: '约 2800 K',
        feature: '距离太阳很近的红矮星，磁活动活跃，是太阳邻域低质量恒星的经典样本。',
        related: [
            { title: '近邻红矮星', detail: '距离约 10 光年，属于最近恒星之列。' },
            { title: '耀星活动', detail: '表面磁活动可产生耀斑，改变近距空间环境。' }
        ]
    },
    {
        id: 'lacaille-9352',
        name: '拉卡伊 9352',
        nameEn: 'Lacaille 9352',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '红矮星',
        distanceLy: 10.7,
        galactic: { lDeg: 5.1, bDeg: -48.0 },
        spectralClass: 'M2V',
        color: 0xff835c,
        size: 3.1,
        temperature: '约 3600 K',
        feature: '南天近邻红矮星，自行较大，周围有已确认的超级地球级行星系统。',
        related: [
            { title: '高自行', detail: '在天空中的视运动较快，是近邻恒星的典型特征。' },
            { title: '行星系统', detail: '已知多颗低质量行星，是红矮星宜居带研究样本。' }
        ]
    },
    {
        id: 'vela-pulsar',
        name: '船帆座脉冲星',
        nameEn: 'Vela Pulsar',
        atlasMap: 'milky-way',
        category: 'stellar-remnant',
        type: '脉冲星 / 中子星',
        distanceLy: 960,
        galactic: { lDeg: 263.6, bDeg: -2.8 },
        color: 0x8fd8ff,
        size: 12,
        effectType: 'pulsar',
        temperature: '中子星表面温度随年龄冷却',
        feature: '船帆座超新星遗迹中的年轻脉冲星，快速自转并发出周期性辐射。',
        related: [
            { title: '中子星', detail: '大质量恒星超新星后留下的极端致密残骸。' },
            { title: '脉冲机制', detail: '磁轴与自转轴不重合，辐射束扫过视线时形成脉冲。' },
            { title: '动画说明', detail: '双极射束绕自转轴旋转，模拟灯塔效应。' }
        ]
    },
    {
        id: 'cygnus-x-1',
        name: '天鹅座 X-1',
        nameEn: 'Cygnus X-1',
        atlasMap: 'milky-way',
        category: 'compact-object',
        type: '恒星级黑洞 X 射线双星',
        distanceLy: 7200,
        galactic: { lDeg: 71.3, bDeg: 3.1 },
        color: 0xffd18a,
        size: 20,
        effectType: 'black-hole',
        temperature: '吸积盘高温辐射，黑洞本身无表面温度',
        feature: '最早被广泛接受的恒星级黑洞候选之一，与大质量伴星构成 X 射线双星。',
        related: [
            { title: '黑洞', detail: '逃逸速度超过光速的紧致天体，事件视界内信息无法返回。' },
            { title: '吸积盘', detail: '来自伴星的气体落入黑洞前被加热并发出强 X 射线。' },
            { title: '物理近似', detail: '场景用暗核心、旋转吸积盘和喷流表示黑洞环境，不追踪真实 GR 光线。' }
        ]
    },
    {
        id: 'sagittarius-a-star',
        name: '人马座 A*',
        nameEn: 'Sagittarius A*',
        atlasMap: 'milky-way',
        category: 'compact-object',
        type: '超大质量黑洞',
        distanceLy: 26670,
        galactic: { lDeg: 0, bDeg: 0 },
        color: 0xffb15c,
        size: 24,
        effectType: 'black-hole',
        temperature: '黑洞本身无表面温度；周围等离子体辐射',
        feature: '银河系中心的超大质量黑洞，质量约四百万个太阳质量量级。',
        related: [
            { title: '银心黑洞', detail: '通过恒星轨道和事件视界望远镜成像得到强证据。' },
            { title: '相对论环境', detail: '近事件视界区域需要广义相对论描述。' },
            { title: '显示限制', detail: '本模型仅用吸积环和光晕做方向性示意，不进行 GRMHD 模拟。' }
        ]
    },
    {
        id: 'orion-arm-landmark', name: '猎户臂方向', nameEn: 'Orion Arm Direction', atlasMap: 'milky-way', category: 'galactic-landmark',
        type: '银河旋臂方向标', distanceLy: 26000, galactic: { lDeg: 80, bDeg: 0 }, color: 0x8eb8ff, size: 18,
        temperature: '银河盘恒星形成区的综合方向', feature: '太阳所在猎户臂（本地臂）的代表性方向标，不是单独的实体天体。',
        related: [{ title: '本地臂', detail: '太阳位于猎户臂中的本地支臂，夹在主要旋臂之间。' }, { title: '显示方式', detail: '项目用方向和尺度参照表达旋臂位置，不构造旋臂实体模型。' }]
    },
    {
        id: 'scutum-centaurus-arm', name: '盾牌-半人马臂方向', nameEn: 'Scutum-Centaurus Arm Direction', atlasMap: 'milky-way', category: 'galactic-landmark',
        type: '银河旋臂方向标', distanceLy: 50000, galactic: { lDeg: 30, bDeg: 0 }, color: 0xffb36f, size: 20,
        temperature: '银河内盘高密度恒星区域的综合方向', feature: '银河系主要旋臂之一的方向标，沿视线可见大量恒星形成和尘埃结构。',
        related: [{ title: '内盘结构', detail: '盾牌-半人马臂延伸经过银河系内盘，观测距离和形态受尘埃遮挡影响。' }]
    },
    {
        id: 'galactic-bulge-landmark', name: '银河系核球方向', nameEn: 'Galactic Bulge Direction', atlasMap: 'milky-way', category: 'galactic-landmark',
        type: '银河核球方向标', distanceLy: 26000, galactic: { lDeg: 0, bDeg: 0 }, color: 0xffc27d, size: 22,
        temperature: '老年恒星密集区域', feature: '银河系中心核球的尺度参照；人马座 A* 位于其核心方向。',
        related: [{ title: '核球', detail: '由高密度老年恒星组成的中央隆起结构。' }, { title: '尘埃遮挡', detail: '可见光观测受到银河盘尘埃强烈影响，红外观测更适合研究银心。' }]
    },
    {
        id: 'm13-great-cluster', name: '武仙座球状星团 M13', nameEn: 'Hercules Globular Cluster / M13', atlasMap: 'milky-way', category: 'deep-sky',
        type: '球状星团', distanceLy: 22200, galactic: { lDeg: 59.0, bDeg: 40.9 }, color: 0xffd7a2, size: 19,
        temperature: '以低金属丰度老年恒星为主', feature: '北天著名球状星团，包含数十万颗受引力束缚的恒星。',
        related: [{ title: '银河晕', detail: '球状星团主要分布在银河盘外的晕部，是银河系早期演化的遗迹。' }, { title: 'M13', detail: '梅西耶星表第 13 号目标，常用于球状星团观测和恒星演化研究。' }]
    },
    {
        id: 'm3-globular-cluster', name: '猎犬座球状星团 M3', nameEn: 'Globular Cluster M3', atlasMap: 'milky-way', category: 'deep-sky',
        type: '球状星团', distanceLy: 33900, galactic: { lDeg: 42.2, bDeg: 78.7 }, color: 0xffc790, size: 18,
        temperature: '老年恒星与变星群', feature: '富含天琴座 RR 型变星的球状星团，是测量银河系尺度的重要目标。',
        related: [{ title: '变星', detail: '团内 RR Lyrae 变星可作为距离指示器。' }, { title: '银河晕', detail: '高银纬位置使它成为银河晕恒星系统的代表。' }]
    },
    {
        id: 'ngc-604', name: 'NGC 604', nameEn: 'NGC 604', atlasMap: 'milky-way', category: 'nebula',
        type: '巨型恒星形成区', distanceLy: 2700000, galactic: { lDeg: 133.6, bDeg: -31.0 }, color: 0xff7fb7, size: 23,
        temperature: '电离气体与年轻大质量恒星', feature: '三角座星系中的大型恒星形成区，用于对照本星系巨型星云的恒星形成活动。',
        related: [{ title: '恒星形成', detail: '区域内有大量年轻大质量恒星和被电离的氢气。' }, { title: '尺度说明', detail: '虽位于本星系群外部，阶段 B 将其作为银河系观测路线中的深空对照地标。' }]
    },
    {
        id: 'ngc-3603', name: 'NGC 3603', nameEn: 'NGC 3603', atlasMap: 'milky-way', category: 'nebula',
        type: '银河系恒星形成区', distanceLy: 20000, galactic: { lDeg: 291.6, bDeg: -0.5 }, color: 0xff8ab8, size: 22,
        temperature: '高温电离气体与年轻星团', feature: '银河系内最明亮、最致密的恒星形成区之一，包含年轻大质量星团。',
        related: [{ title: '星团核心', detail: '年轻恒星集中在紧凑核心中，适合研究大质量恒星的早期演化。' }, { title: '尘埃环境', detail: '周围分子云和尘埃让可见光图像呈现复杂的层次。' }]
    },
    {
        id: 'wr-104', name: 'WR 104', nameEn: 'WR 104', atlasMap: 'milky-way', category: 'stellar-object',
        type: 'Wolf-Rayet 双星', distanceLy: 8000, galactic: { lDeg: 10.2, bDeg: -0.4 }, color: 0xbbe8ff, size: 12,
        temperature: '高温恒星风与电离气体', feature: '拥有尘埃风车结构的 Wolf-Rayet 双星，展示大质量恒星晚期强烈质量损失。',
        related: [{ title: '尘埃风车', detail: '双星轨道运动和恒星风碰撞可形成螺旋状尘埃结构。' }, { title: '阶段示意', detail: '目录只表达恒星和风结构的观测意义，不模拟真实尘埃螺旋几何。' }]
    },
    {
        id: 'pistol-star', name: '手枪星', nameEn: 'Pistol Star', atlasMap: 'milky-way', category: 'stellar-object',
        type: '高光度蓝变星候选', distanceLy: 25000, galactic: { lDeg: 0.2, bDeg: -0.1 }, color: 0xafd8ff, size: 15,
        temperature: '高温蓝色超亮恒星', feature: '银河中心附近的极高光度恒星，周围有显著的喷出物和尘埃环境。',
        related: [{ title: '高光度', detail: '它的辐射和恒星风对周围气体产生强烈影响。' }, { title: '观测限制', detail: '银心方向尘埃浓厚，距离和演化阶段存在测量不确定性。' }]
    },
    {
        id: 'vela-supernova-remnant', name: '船帆座超新星遗迹', nameEn: 'Vela Supernova Remnant', atlasMap: 'milky-way', category: 'supernova-remnant',
        type: '超新星遗迹 / 脉冲星风环境', distanceLy: 815, galactic: { lDeg: 263.6, bDeg: -3.0 }, color: 0x8fbaff, size: 25,
        effectType: 'supernova', temperature: '激波加热的稀薄等离子体', feature: '距离较近的大型超新星遗迹，中心包含船帆座脉冲星。',
        related: [{ title: '激波壳层', detail: '爆炸抛射物与星际介质相互作用，形成丝状 X 射线和射电结构。' }, { title: '脉冲星', detail: '遗迹中心的船帆座脉冲星是快速自转中子星。' }]
    },
    {
        id: 'sn-1987a',
        name: 'SN 1987A',
        nameEn: 'Supernova 1987A',
        atlasMap: 'local-group',
        category: 'supernova-remnant',
        type: '超新星遗迹',
        distanceLy: 168000,
        galactic: { lDeg: 279.7, bDeg: -31.9 },
        color: 0xff7f6e,
        size: 24,
        effectType: 'supernova',
        temperature: '激波加热气体，温度分布复杂',
        feature: '位于大麦哲伦云的近代超新星遗迹，是研究恒星爆炸演化的关键目标。',
        related: [
            { title: '1987 年爆发', detail: '近现代最重要的肉眼可见超新星之一。' },
            { title: '环状结构', detail: '爆炸激波与早期恒星风形成的环相互作用并逐渐点亮。' },
            { title: '动画说明', detail: '粒子壳层缓慢膨胀，表示超新星抛射物与周围介质相互作用。' }
        ]
    },
    {
        id: 'large-magellanic-cloud',
        name: '大麦哲伦云',
        nameEn: 'Large Magellanic Cloud',
        atlasMap: 'local-group',
        category: 'galaxy',
        type: '银河系卫星星系 / 不规则星系',
        distanceLy: 160000,
        galactic: { lDeg: 280.5, bDeg: -32.9 },
        color: 0x9fc7ff,
        size: 28,
        temperature: '非单一天体',
        feature: '银河系最大的卫星星系之一，拥有活跃恒星形成区 30 Doradus。',
        related: [
            { title: '30 Doradus / 蜘蛛星云', detail: '本星系群内最活跃的大质量恒星形成区之一。' },
            { title: '卫星星系', detail: '与银河系发生潮汐相互作用，并与小麦哲伦云相关联。' },
            { title: '距离说明', detail: '约 16 万光年，属于银河系近邻星系尺度。' }
        ]
    },
    {
        id: 'small-magellanic-cloud',
        name: '小麦哲伦云',
        nameEn: 'Small Magellanic Cloud',
        atlasMap: 'local-group',
        category: 'galaxy',
        type: '银河系卫星星系 / 矮不规则星系',
        distanceLy: 200000,
        galactic: { lDeg: 302.8, bDeg: -44.3 },
        color: 0xbfd7ff,
        size: 22,
        temperature: '非单一天体',
        feature: '邻近银河系的矮星系，与大麦哲伦云和银河系存在潮汐联系。',
        related: [
            { title: '低金属丰度环境', detail: '常用于研究早期宇宙类似条件下的恒星形成。' },
            { title: '麦哲伦流', detail: '与麦哲伦云系统相关的长条气体结构延伸在银河系周围。' }
        ]
    },
    {
        id: 'andromeda-galaxy',
        name: '仙女座星系',
        nameEn: 'Andromeda Galaxy / M31',
        atlasMap: 'local-group',
        category: 'galaxy',
        type: '大型旋涡星系',
        distanceLy: 2500000,
        galactic: { lDeg: 121.2, bDeg: -21.6 },
        color: 0xffd49a,
        size: 34,
        temperature: '非单一天体',
        feature: '距离银河系最近的大型旋涡星系，未来将与银河系发生并合。',
        related: [
            { title: 'M31', detail: '本星系群最大成员之一，肉眼在暗夜条件下可见。' },
            { title: '卫星星系', detail: '拥有 M32、M110 等伴星系。' },
            { title: '未来并合', detail: '数十亿年后预计会与银河系发生大尺度并合。' }
        ]
    },
    {
        id: 'triangulum-galaxy',
        name: '三角座星系',
        nameEn: 'Triangulum Galaxy / M33',
        atlasMap: 'local-group',
        category: 'galaxy',
        type: '旋涡星系',
        distanceLy: 2730000,
        galactic: { lDeg: 133.6, bDeg: -31.3 },
        color: 0xffe1b8,
        size: 26,
        temperature: '非单一天体',
        feature: '本星系群主要旋涡星系之一，可能与仙女座星系存在引力联系。',
        related: [
            { title: 'M33', detail: '比银河系和仙女座小，但恒星形成活动明显。' },
            { title: 'H II 区 NGC 604', detail: '巨大的电离氢区，是 M33 中非常醒目的恒星形成区。' }
        ]
    },
    {
        id: 'm81-group',
        name: 'M81 星系群',
        nameEn: 'M81 Group',
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy-group',
        type: '近邻星系群',
        distanceLy: 12000000,
        galactic: { lDeg: 142.1, bDeg: 40.9 },
        color: 0xffd6a1,
        size: 30,
        temperature: '非单一天体',
        feature: '本星系群之外最醒目的近邻星系群之一，包含 M81、M82、NGC 3077 等相互作用星系。',
        related: [
            { title: 'M81 / 波德星系', detail: '大型旋涡星系，是该星系群的主要成员。' },
            { title: 'M82 / 雪茄星系', detail: '星暴星系，恒星形成活动强烈，可能受近邻相互作用触发。' },
            { title: '距离说明', detail: '距离约 1200 万光年，已明显超出本星系群尺度。' }
        ]
    },
    {
        id: 'sculptor-group',
        name: '雕刻室星系群',
        nameEn: 'Sculptor Group',
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy-group',
        type: '松散近邻星系群',
        distanceLy: 13000000,
        galactic: { lDeg: 97.4, bDeg: -87.9 },
        color: 0x9fd5ff,
        size: 28,
        temperature: '非单一天体',
        feature: '银河系附近较松散的星系群，代表成员 NGC 253 是明亮星暴旋涡星系。',
        related: [
            { title: 'NGC 253 / 银币星系', detail: '明亮星暴星系，是雕刻室方向最著名的深空目标之一。' },
            { title: '松散结构', detail: '成员分布较分散，更像一条近邻星系丝状结构。' }
        ]
    },
    {
        id: 'centaurus-a-m83-group',
        name: '半人马座 A / M83 星系群',
        nameEn: 'Centaurus A / M83 Group',
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy-group',
        type: '近邻星系群复合体',
        distanceLy: 12000000,
        galactic: { lDeg: 309.5, bDeg: 19.4 },
        color: 0xffbb8d,
        size: 32,
        temperature: '非单一天体',
        feature: '包含活动星系半人马座 A 与明亮旋涡星系 M83，是本星系群附近的重要星系群复合体。',
        related: [
            { title: '半人马座 A / NGC 5128', detail: '近邻活动星系，拥有显著尘埃带和射电喷流。' },
            { title: 'M83 / 南风车星系', detail: '棒旋星系，恒星形成活跃。' },
            { title: '尺度说明', detail: '这一层表达星系群方向和近似距离，不展示成员星系真实三维位置。' }
        ]
    },
    {
        id: 'virgo-cluster',
        name: '室女座星系团',
        nameEn: 'Virgo Cluster',
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy-cluster',
        type: '近邻大型星系团',
        distanceLy: 54000000,
        galactic: { lDeg: 283.8, bDeg: 74.5 },
        color: 0xffe3a8,
        size: 42,
        temperature: '非单一天体',
        feature: '距离银河系最近的大型星系团，是室女座超星系团的重要核心区域。',
        related: [
            { title: 'M87', detail: '巨型椭圆星系，中心黑洞曾被事件视界望远镜成像。' },
            { title: 'M49、M86 等', detail: '星系团内包含大量椭圆星系、透镜星系和旋涡星系。' },
            { title: '距离说明', detail: '约 5400 万光年，已进入星系团尺度。' }
        ]
    },
    {
        id: 'laniakea-direction',
        name: '拉尼亚凯亚方向',
        nameEn: 'Laniakea Supercluster',
        atlasMap: 'cosmic-neighborhood',
        category: 'supercluster',
        type: '超星系团方向标',
        distanceLy: 520000000,
        galactic: { lDeg: 307, bDeg: 9 },
        color: 0xff9f7f,
        size: 48,
        temperature: '非单一天体',
        feature: '银河系所属的大尺度超星系团结构方向示意；这里作为宇宙网节点，不按真实体积显示。',
        related: [
            { title: '大尺度结构', detail: '由许多星系群和星系团沿宇宙网分布构成。' },
            { title: '巨引源方向', detail: '拉尼亚凯亚定义与星系运动流场和引力汇聚方向有关。' },
            { title: '显示限制', detail: '该节点是方向与概念标记，不代表一个边界清晰的球状天体。' }
        ]
    },

    // ── Neighborhood expansions ───────────────────────────────────────────
    {
        id: 'lalande-21185',
        name: '拉兰德 21185',
        nameEn: 'Lalande 21185',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '红矮星',
        distanceLy: 8.3,
        galactic: { lDeg: 185.1, bDeg: 65.4 },
        spectralClass: 'M2V',
        color: 0xff8a62,
        size: 3.4,
        temperature: '约 3500 K',
        feature: '北天最亮红矮星之一，离太阳很近，历史上多次被作为近邻恒星研究目标。',
        related: [
            { title: '近邻红矮星', detail: '质量与亮度都远低于太阳，寿命极长。' },
            { title: '自行', detail: '在天空中有较大自行，是近邻恒星的典型特征。' }
        ]
    },
    {
        id: 'wolf-359',
        name: '沃尔夫 359',
        nameEn: 'Wolf 359',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '红矮星 / 耀星',
        distanceLy: 7.9,
        galactic: { lDeg: 244.1, bDeg: 56.1 },
        spectralClass: 'M6V',
        color: 0xff6b4a,
        size: 2.8,
        temperature: '约 2800 K',
        feature: '距离太阳最近的恒星之一，极暗、极冷，常作为近邻红矮星样本。',
        related: [
            { title: '极低光度', detail: '即便很近，肉眼也完全看不见。' },
            { title: '磁活动', detail: '可出现耀斑，说明红矮星表面磁活动活跃。' }
        ]
    },
    {
        id: 'ross-154',
        name: '罗斯 154',
        nameEn: 'Ross 154',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '红矮星',
        distanceLy: 9.7,
        galactic: { lDeg: 11.3, bDeg: -10.3 },
        spectralClass: 'M3.5V',
        color: 0xff7f58,
        size: 3.0,
        temperature: '约 3200 K',
        feature: '南天近邻红矮星，属于银河系本地恒星群体中的典型 M 型主序星。',
        related: [
            { title: '近邻样本', detail: '常用于研究红矮星活动与本地恒星密度。' }
        ]
    },
    {
        id: 'gliese-581',
        name: '格利泽 581',
        nameEn: 'Gliese 581',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '红矮星行星系统',
        distanceLy: 20.5,
        galactic: { lDeg: 348.0, bDeg: 48.1 },
        spectralClass: 'M3V',
        color: 0xff8860,
        size: 4.0,
        temperature: '约 3500 K',
        feature: '著名近邻红矮星系统，曾推动“红矮星宜居带行星”讨论。',
        systemLayout: {
            sceneScale: 1.25,
            cameraDistance: 160,
            note: '轨道为示意压缩，不代表真实半长轴比例。',
            bodies: [
                { name: 'Gl 581', kind: 'star', color: 0xff8860, size: 12, x: 50, y: 50, detail: 'M3V 红矮星' },
                { name: 'b', kind: 'planet', color: 0xd6a574, orbit: 16, angleDeg: 40, detail: '热海王星级' },
                { name: 'c', kind: 'planet', color: 0x84c99f, orbit: 24, angleDeg: 150, detail: '宜居带讨论目标' },
                { name: 'e', kind: 'planet', color: 0x8fb2ff, orbit: 32, angleDeg: 260, detail: '低质量行星候选/确认研究目标' }
            ]
        },
        related: [
            { title: '系外行星系统', detail: '多颗低质量行星候选使它成为早期宜居带研究焦点。' },
            { title: '红矮星宜居性', detail: '近距离轨道、潮汐锁定和耀斑是关键争论点。' }
        ]
    },
    {
        id: '61-cygni',
        name: '天鹅座 61',
        nameEn: '61 Cygni',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '双星系统',
        distanceLy: 11.4,
        galactic: { lDeg: 82.3, bDeg: -5.8 },
        spectralClass: 'K5V + K7V',
        color: 0xffb478,
        size: 4.4,
        temperature: '约 4400 / 4100 K',
        feature: '历史上首批被精确测量视差的近邻双星之一，常被称为“飞行双星”。',
        systemLayout: {
            sceneScale: 1.1,
            cameraDistance: 150,
            note: '双星间距被压缩以便同屏观察。',
            bodies: [
                { name: '61 Cyg A', kind: 'star', color: 0xffb478, size: 13, x: 44, y: 50, detail: 'K5V' },
                { name: '61 Cyg B', kind: 'star', color: 0xff9d62, size: 11, x: 58, y: 48, detail: 'K7V' }
            ]
        },
        related: [
            { title: '历史意义', detail: '视差测量帮助确立恒星距离标尺。' },
            { title: 'K 型主序星', detail: '比太阳更冷、更暗、寿命更长。' }
        ]
    },
    {
        id: 'altair',
        name: '牛郎星',
        nameEn: 'Altair / Alpha Aquilae',
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        type: '快速自转 A 型星',
        distanceLy: 16.7,
        galactic: { lDeg: 47.7, bDeg: -8.9 },
        spectralClass: 'A7V',
        color: 0xeef6ff,
        size: 5.6,
        temperature: '约 7500 K',
        feature: '夏季大三角成员，快速自转导致赤道显著扁化。',
        related: [
            { title: '快速自转', detail: '自转周期约数小时量级，赤道半径明显大于两极。' },
            { title: '夏季大三角', detail: '与织女星、天津四构成北天著名星群。' }
        ]
    },

    // ── Milky Way expansions ──────────────────────────────────────────────
    {
        id: 'antares',
        name: '心宿二',
        nameEn: 'Antares / Alpha Scorpii',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '红超巨星',
        distanceLy: 550,
        galactic: { lDeg: 351.9, bDeg: 15.1 },
        color: 0xff5a2e,
        size: 18,
        effectType: 'red-giant',
        temperature: '约 3400 K',
        feature: '天蝎座心脏位置的红超巨星，颜色深橙，是银河平面附近醒目的晚期恒星。',
        related: [
            { title: '红超巨星', detail: '外层膨胀、温度较低，光度极高。' },
            { title: '伴星', detail: '有较热伴星，形成对比鲜明的双星系统。' }
        ]
    },
    {
        id: 'aldebaran',
        name: '毕宿五',
        nameEn: 'Aldebaran / Alpha Tauri',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '橙巨星',
        distanceLy: 65,
        galactic: { lDeg: 180.0, bDeg: -20.2 },
        spectralClass: 'K5III',
        color: 0xff8a3d,
        size: 16,
        effectType: 'red-giant',
        temperature: '约 3900 K',
        feature: '金牛座亮星，橙红色巨星，是北天最容易辨认的晚期恒星之一。',
        related: [
            { title: '橙巨星', detail: '比红超巨星更常见，外层已明显膨胀、温度下降。' },
            { title: '毕星团前景', detail: '视觉上靠近毕星团，但并非该星团成员。' }
        ]
    },
    {
        id: 'arcturus',
        name: '大角星',
        nameEn: 'Arcturus / Alpha Boötis',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '橙巨星',
        distanceLy: 37,
        galactic: { lDeg: 15.1, bDeg: 69.1 },
        spectralClass: 'K1.5III',
        color: 0xff9a45,
        size: 16,
        effectType: 'red-giant',
        temperature: '约 4300 K',
        feature: '牧夫座主星，北半天球最亮恒星之一，是明亮的 K 型巨星。',
        related: [
            { title: '高自行', detail: '在天空中的视运动较快，是近邻明亮巨星的代表。' },
            { title: '演化阶段', detail: '已离开主序，外层膨胀成橙红色巨星。' }
        ]
    },
    {
        id: 'mira',
        name: '米拉',
        nameEn: 'Mira / Omicron Ceti',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '脉动红巨星',
        distanceLy: 300,
        galactic: { lDeg: 168.0, bDeg: -58.0 },
        spectralClass: 'M5-9IIIe',
        color: 0xff5f38,
        size: 17,
        effectType: 'red-giant',
        temperature: '约 3000 K 量级，随脉动变化',
        feature: '经典长周期变星，亮度可在数月尺度上显著变化，外层物质损失明显。',
        related: [
            { title: '脉动变星', detail: '外层周期性膨胀收缩，导致亮度和颜色变化。' },
            { title: '恒星风', detail: '晚期巨星可抛出大量气体和尘埃，形成延伸包层。' }
        ]
    },
    {
        id: 'capella',
        name: '五车二',
        nameEn: 'Capella / Alpha Aurigae',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '四合星系统 / 巨星',
        distanceLy: 42.9,
        galactic: { lDeg: 162.6, bDeg: 4.6 },
        spectralClass: 'G8III + G0III',
        color: 0xffd28a,
        size: 15,
        temperature: '约 4900 到 5700 K',
        feature: '御夫座主星，由两颗明亮巨星组成的近邻四合星系统，是北天最亮恒星之一。',
        related: [
            { title: '双巨星', detail: '主对是两颗黄巨星，轨道周期约 100 天量级。' },
            { title: '四合星', detail: '外侧还有一对红矮星，共同构成四合系统。' }
        ]
    },
    {
        id: 'pollux',
        name: '北河三',
        nameEn: 'Pollux / Beta Geminorum',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '橙巨星',
        distanceLy: 33.8,
        galactic: { lDeg: 192.2, bDeg: 23.4 },
        spectralClass: 'K0III',
        color: 0xffa055,
        size: 15,
        temperature: '约 4600 K',
        feature: '双子座最亮恒星，是近邻明亮橙巨星，周围有已确认的巨行星候选。',
        related: [
            { title: '橙巨星', detail: '已离开主序，外层膨胀，表面温度低于太阳。' },
            { title: '行星研究', detail: '北河三 b 是围绕巨星的巨行星研究样本。' }
        ]
    },
    {
        id: 'spica',
        name: '角宿一',
        nameEn: 'Spica / Alpha Virginis',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '热双星 / B 型巨星',
        distanceLy: 250,
        galactic: { lDeg: 316.1, bDeg: 50.8 },
        spectralClass: 'B1III-IV + B2V',
        color: 0xb7d8ff,
        size: 14,
        temperature: '约 22000 K 量级',
        feature: '室女座主星，是明亮的热双星系统，光谱偏蓝白，是春夜星空重要地标。',
        related: [
            { title: '热双星', detail: '两颗高温恒星互相绕转，辐射强紫外线。' },
            { title: '春夜亮星', detail: '与轩辕十四、五车二等共同构成北天季节亮星网络。' }
        ]
    },
    {
        id: 'regulus',
        name: '轩辕十四',
        nameEn: 'Regulus / Alpha Leonis',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '快速自转 B 型星',
        distanceLy: 79,
        galactic: { lDeg: 226.4, bDeg: 48.9 },
        spectralClass: 'B7V',
        color: 0xcfe4ff,
        size: 13,
        temperature: '约 12000 K',
        feature: '狮子座主星，快速自转导致赤道显著扁化，是北天著名蓝白亮星。',
        related: [
            { title: '快速自转', detail: '自转接近临界速度，赤道半径大于两极。' },
            { title: '多星系统', detail: '主星周围还有较暗伴星，构成更复杂系统。' }
        ]
    },
    {
        id: 'castor',
        name: '北河二',
        nameEn: 'Castor / Alpha Geminorum',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '六合星系统',
        distanceLy: 51,
        galactic: { lDeg: 187.4, bDeg: 22.6 },
        spectralClass: 'A1V + A2Vm + ...',
        color: 0xe8f2ff,
        size: 13,
        temperature: '约 9000 K 量级',
        feature: '双子座亮星，实际是复杂的六合星系统，是恒星多重系统研究的经典案例。',
        related: [
            { title: '多重系统', detail: '至少包含三对双星，视觉上仍呈现为单一亮星。' },
            { title: '与北河三', detail: '双子座两颗主星一白一橙，形成鲜明对比。' }
        ]
    },
    {
        id: 'veil-nebula',
        name: '面纱星云',
        nameEn: 'Veil Nebula / Cygnus Loop',
        atlasMap: 'milky-way',
        category: 'supernova-remnant',
        type: '超新星遗迹',
        distanceLy: 2400,
        galactic: { lDeg: 74.0, bDeg: -8.6 },
        color: 0x7fd0ff,
        size: 22,
        effectType: 'supernova',
        temperature: '激波加热气体，局部可达百万 K 量级',
        feature: '天鹅座方向著名超新星遗迹，丝状结构清晰，是中年 SNR 的代表性目标。',
        related: [
            { title: '天鹅环', detail: '面纱星云是更大天鹅环超新星遗迹的一部分。' },
            { title: '丝状激波', detail: '可见光中呈现复杂的纤维状气体结构。' }
        ]
    },
    {
        id: 'rigel',
        name: '参宿七',
        nameEn: 'Rigel / Beta Orionis',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '蓝超巨星',
        distanceLy: 860,
        galactic: { lDeg: 209.2, bDeg: -25.2 },
        color: 0xb7d8ff,
        size: 16,
        temperature: '约 12000 K',
        feature: '猎户座足部的蓝超巨星，光度极高，是年轻恒星形成区的明亮示踪。',
        related: [
            { title: '蓝超巨星', detail: '质量大、演化快、辐射强紫外线。' },
            { title: '猎户座复合体', detail: '位于银河系本地螺旋臂的重要恒星形成区域附近。' }
        ]
    },
    {
        id: 'fomalhaut',
        name: '北落师门',
        nameEn: 'Fomalhaut / Alpha Piscis Austrini',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: 'A 型主序星 / 碎屑盘系统',
        distanceLy: 25,
        galactic: { lDeg: 20.5, bDeg: -64.9 },
        spectralClass: 'A3V',
        color: 0xeaf4ff,
        size: 13,
        temperature: '约 8600 K',
        feature: '南鱼座主星，拥有显著碎屑盘，是近邻行星形成与尘埃盘研究的重要目标。',
        related: [
            { title: '碎屑盘', detail: '红外观测显示外围存在冷尘埃结构。' },
            { title: '行星候选', detail: '历史上曾报告过盘内行星信号，后续研究持续修正。' }
        ]
    },
    {
        id: 'albireo',
        name: '辇道增七',
        nameEn: 'Albireo / Beta Cygni',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '双星系统',
        distanceLy: 430,
        galactic: { lDeg: 62.1, bDeg: 4.6 },
        spectralClass: 'K3II + B8V',
        color: 0xffc878,
        size: 14,
        temperature: '橙巨星 + 蓝白伴星',
        feature: '天鹅座著名双星，橙金与蓝白对比强烈，是目视双星观测的经典对象。',
        related: [
            { title: '颜色对比', detail: '主星偏橙、伴星偏蓝，小望远镜中极为醒目。' },
            { title: '多重系统', detail: '系统结构比肉眼所见更复杂，包含更近的子双星。' }
        ]
    },
    {
        id: 'dumbbell-nebula',
        name: '哑铃星云',
        nameEn: 'Dumbbell Nebula / M27',
        atlasMap: 'milky-way',
        category: 'nebula',
        type: '行星状星云',
        distanceLy: 1360,
        galactic: { lDeg: 60.8, bDeg: -3.7 },
        color: 0x8dffc2,
        size: 18,
        temperature: '中心白矮星高温，气壳被电离',
        feature: '狐狸座著名行星状星云，是小望远镜中最容易观测的行星状星云之一。',
        related: [
            { title: '行星状星云', detail: '中低质量恒星晚期抛出的电离气壳。' },
            { title: '中心白矮星', detail: '气壳中心残留高温致密核心。' }
        ]
    },
    {
        id: 'deneb',
        name: '天津四',
        nameEn: 'Deneb / Alpha Cygni',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '白超巨星',
        distanceLy: 2600,
        galactic: { lDeg: 84.3, bDeg: 2.0 },
        color: 0xdcecff,
        size: 17,
        temperature: '约 8500 K',
        feature: '夏季大三角最远顶点之一，绝对光度极高的白超巨星。',
        related: [
            { title: '距离与光度', detail: '距离远但仍明亮，说明真实光度非常巨大。' },
            { title: '天鹅座区域', detail: '位于银河带明亮区，附近有丰富星云与年轻星族。' }
        ]
    },
    {
        id: 'polaris',
        name: '北极星',
        nameEn: 'Polaris / Alpha Ursae Minoris',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '造父变星 / 北极指示星',
        distanceLy: 430,
        galactic: { lDeg: 123.3, bDeg: 26.5 },
        color: 0xfff0c8,
        size: 14,
        temperature: '约 6000 K',
        feature: '接近北天极的明亮黄超巨星/造父变星，是导航与天极指示的经典标志。',
        related: [
            { title: '造父变星', detail: '亮度周期变化，可用于距离标定。' },
            { title: '天极指示', detail: '当前靠近北天极，因此成为“北极星”。' }
        ]
    },
    {
        id: 'omega-centauri',
        name: '半人马座 ω 球状星团',
        nameEn: 'Omega Centauri / NGC 5139',
        atlasMap: 'milky-way',
        category: 'deep-sky',
        type: '球状星团',
        distanceLy: 15800,
        galactic: { lDeg: 309.1, bDeg: 15.0 },
        color: 0xffe8b5,
        size: 28,
        temperature: '非单一天体',
        feature: '银河系最亮、最大的球状星团之一，可能是被潮汐剥离的矮星系残骸核心。',
        related: [
            { title: '球状星团', detail: '由数十万颗老年恒星组成的致密球状系统。' },
            { title: '可能的矮星系核心', detail: '化学组成和动力学暗示它不同于普通星团。' }
        ]
    },
    {
        id: '47-tucanae',
        name: '杜鹃座 47',
        nameEn: '47 Tucanae / NGC 104',
        atlasMap: 'milky-way',
        category: 'deep-sky',
        type: '球状星团',
        distanceLy: 13000,
        galactic: { lDeg: 305.9, bDeg: -44.9 },
        color: 0xffd9a0,
        size: 24,
        temperature: '非单一天体',
        feature: '南天最亮球状星团之一，核心致密，常用于研究致密星族与毫秒脉冲星。',
        related: [
            { title: '致密核心', detail: '中心恒星密度极高。' },
            { title: '脉冲星实验室', detail: '星团内发现大量毫秒脉冲星。' }
        ]
    },
    {
        id: 'hyades',
        name: '毕星团',
        nameEn: 'Hyades',
        atlasMap: 'milky-way',
        category: 'deep-sky',
        type: '疏散星团',
        distanceLy: 153,
        galactic: { lDeg: 180.1, bDeg: -22.3 },
        color: 0xffd28a,
        size: 22,
        temperature: '非单一天体',
        feature: '最近的疏散星团之一，是恒星年龄与距离标定的重要基准。',
        related: [
            { title: '距离基准', detail: '因距离近、成员多，常用于校准恒星演化模型。' },
            { title: '金牛座头部', detail: '肉眼可见的 V 字形恒星群与毕宿五相邻。' }
        ]
    },
    {
        id: 'cassiopeia-a',
        name: '仙后座 A',
        nameEn: 'Cassiopeia A',
        atlasMap: 'milky-way',
        category: 'supernova-remnant',
        type: '年轻超新星遗迹',
        distanceLy: 11000,
        galactic: { lDeg: 111.7, bDeg: -2.1 },
        color: 0x9ad0ff,
        size: 20,
        effectType: 'supernova',
        temperature: '激波加热等离子体可达数百万 K',
        feature: '银河系中最年轻、最强的射电超新星遗迹之一，展示爆炸后的高速膨胀壳。',
        related: [
            { title: '年轻 SNR', detail: '爆发时间约在 300 多年前。' },
            { title: '多波段目标', detail: 'X 射线、射电和光学都显示复杂丝状结构。' }
        ]
    },
    {
        id: 'eta-carinae',
        name: '船底座 η',
        nameEn: 'Eta Carinae',
        atlasMap: 'milky-way',
        category: 'stellar-object',
        type: '高光度蓝变星系统',
        distanceLy: 7500,
        galactic: { lDeg: 287.6, bDeg: -0.6 },
        color: 0xffb07a,
        size: 19,
        temperature: '外层喷流与尘埃温度复杂',
        feature: '极端大质量恒星系统，19 世纪大爆发留下双瓣星云，是恒星演化晚期的关键样本。',
        related: [
            { title: '大爆发', detail: '19 世纪曾短暂成为全天最亮恒星之一。' },
            { title: '双瓣星云', detail: 'Homunculus 星云记录了质量抛射历史。' }
        ]
    },

    // ── Local Group expansions ────────────────────────────────────────────
    {
        id: 'm32',
        name: '仙女座伴星系 M32',
        nameEn: 'M32 / NGC 221',
        atlasMap: 'local-group',
        category: 'galaxy',
        type: '致密椭圆矮星系',
        distanceLy: 2490000,
        galactic: { lDeg: 121.2, bDeg: -22.0 },
        color: 0xffd7a8,
        size: 18,
        temperature: '非单一天体',
        feature: '仙女座星系的致密椭圆伴星系，核心密度高，是近邻相互作用的重要样本。',
        related: [
            { title: 'M31 伴星系', detail: '与仙女座星系有明显空间关联。' },
            { title: '致密核心', detail: '中心恒星密度极高，可能含有中等质量黑洞候选。' }
        ]
    },
    {
        id: 'ngc-205',
        name: '仙女座伴星系 M110',
        nameEn: 'M110 / NGC 205',
        atlasMap: 'local-group',
        category: 'galaxy',
        type: '矮椭圆星系',
        distanceLy: 2690000,
        galactic: { lDeg: 120.7, bDeg: -21.1 },
        color: 0xffc994,
        size: 20,
        temperature: '非单一天体',
        feature: '仙女座另一主要伴星系，外形比 M32 更延展，内部仍有年轻恒星形成迹象。',
        related: [
            { title: '矮椭圆星系', detail: '比巨型椭圆星系更暗、更小，是星系演化研究重点。' }
        ]
    },
    {
        id: 'ic-10',
        name: 'IC 10',
        nameEn: 'IC 10',
        atlasMap: 'local-group',
        category: 'galaxy',
        type: '不规则星暴矮星系',
        distanceLy: 2500000,
        galactic: { lDeg: 119.0, bDeg: -3.3 },
        color: 0x9fe0ff,
        size: 17,
        temperature: '非单一天体',
        feature: '本星系群中最近的星暴矮星系之一，富含气体与年轻恒星。',
        related: [
            { title: '星暴活动', detail: '当前恒星形成率相对其质量非常高。' },
            { title: '本星系群成员', detail: '位于银河系附近，是近邻不规则星系样本。' }
        ]
    },
    {
        id: 'fornax-dwarf',
        name: '天炉座矮星系',
        nameEn: 'Fornax Dwarf Spheroidal',
        atlasMap: 'local-group',
        category: 'galaxy',
        type: '球状矮星系',
        distanceLy: 460000,
        galactic: { lDeg: 237.1, bDeg: -65.7 },
        color: 0xffc8a0,
        size: 16,
        temperature: '非单一天体',
        feature: '银河系卫星矮星系，含多个球状星团，是暗物质与矮星系演化研究的经典目标。',
        related: [
            { title: '银河卫星', detail: '围绕银河系运动的暗弱伴星系。' },
            { title: '球状星团宿主', detail: '在矮星系中拥有异常丰富的球状星团系统。' }
        ]
    },
    {
        id: 'leo-i',
        name: '狮子座 I 矮星系',
        nameEn: 'Leo I',
        atlasMap: 'local-group',
        category: 'galaxy',
        type: '球状矮星系',
        distanceLy: 820000,
        galactic: { lDeg: 226.0, bDeg: 49.1 },
        color: 0xffb98a,
        size: 15,
        temperature: '非单一天体',
        feature: '银河系较远的卫星矮星系之一，恒星形成历史较晚结束。',
        related: [
            { title: '较远卫星', detail: '比大麦哲伦云更远，但仍属本星系群内银河伴星系。' }
        ]
    },
    {
        id: 'sculptor-dwarf',
        name: '玉夫座矮星系',
        nameEn: 'Sculptor Dwarf Spheroidal',
        atlasMap: 'local-group',
        category: 'galaxy',
        type: '球状矮星系',
        distanceLy: 290000,
        galactic: { lDeg: 287.5, bDeg: -83.2 },
        color: 0xffc3a0,
        size: 15,
        temperature: '非单一天体',
        feature: '银河系经典卫星矮星系之一，富含老年恒星，是暗物质与矮星系演化研究的重要目标。',
        related: [
            { title: '银河卫星', detail: '距离约 29 万光年，属于本星系群内的银河伴星系。' },
            { title: '老年恒星系统', detail: '几乎没有正在进行的恒星形成，化学演化历史较简单。' }
        ]
    },
    {
        id: 'draco-dwarf',
        name: '天龙座矮星系',
        nameEn: 'Draco Dwarf Spheroidal',
        atlasMap: 'local-group',
        category: 'galaxy',
        type: '球状矮星系',
        distanceLy: 260000,
        galactic: { lDeg: 86.4, bDeg: 34.7 },
        color: 0xffc8a8,
        size: 14,
        temperature: '非单一天体',
        feature: '银河系卫星矮星系，暗物质主导、几乎无气体，是研究极暗星系的重要样本。',
        related: [
            { title: '极暗星系', detail: '恒星质量很低，动力学质量却很高，常被用于暗物质研究。' },
            { title: '银河卫星', detail: '距离约 26 万光年，属于本星系群内的银河伴星系。' }
        ]
    },
    {
        id: 'leo-ii',
        name: '狮子座 II 矮星系',
        nameEn: 'Leo II',
        atlasMap: 'local-group',
        category: 'galaxy',
        type: '球状矮星系',
        distanceLy: 690000,
        galactic: { lDeg: 220.2, bDeg: 67.2 },
        color: 0xffc29a,
        size: 14,
        temperature: '非单一天体',
        feature: '银河系卫星矮星系，以老年恒星为主，是研究银河晕卫星族群的样本。',
        related: [
            { title: '银河卫星', detail: '距离约 69 万光年，比大麦哲伦云更远。' },
            { title: '老年恒星', detail: '几乎没有正在进行的恒星形成。' }
        ]
    },
    {
        id: 'ursa-minor-dwarf',
        name: '小熊座矮星系',
        nameEn: 'Ursa Minor Dwarf',
        atlasMap: 'local-group',
        category: 'galaxy',
        type: '球状矮星系',
        distanceLy: 225000,
        galactic: { lDeg: 105.0, bDeg: 44.8 },
        color: 0xffd0aa,
        size: 14,
        temperature: '非单一天体',
        feature: '银河系近距卫星矮星系，暗物质主导，是极暗星系与晕卫星研究的经典目标。',
        related: [
            { title: '极暗星系', detail: '恒星含量很低，动力学却显示有大量不可见质量。' },
            { title: '近距卫星', detail: '距离约 22.5 万光年，属于银河伴星系系统。' }
        ]
    },
    {
        id: 'ic-1613', name: 'IC 1613', nameEn: 'IC 1613', atlasMap: 'local-group', category: 'galaxy',
        type: '不规则矮星系', distanceLy: 2380000, galactic: { lDeg: 129.7, bDeg: -60.6 }, color: 0x9ec9ff, size: 16,
        temperature: '由多代恒星与星际介质组成', feature: '本星系群中尘埃较少的不规则矮星系，是造父变星距离标尺的重要校准目标。',
        related: [{ title: '低尘埃环境', detail: '内部消光较弱，便于研究恒星形成历史和距离标尺。' }, { title: '本星系群成员', detail: '位于银河系和仙女座主要子群之间的较孤立区域。' }]
    },
    {
        id: 'ngc-6822', name: '巴纳德星系', nameEn: "Barnard's Galaxy / NGC 6822", atlasMap: 'local-group', category: 'galaxy',
        type: '不规则矮星系', distanceLy: 1630000, galactic: { lDeg: 25.3, bDeg: -18.4 }, color: 0xffc58c, size: 17,
        temperature: '恒星形成区与老年恒星并存', feature: '距离较近的本星系群不规则矮星系，包含活跃恒星形成区和丰富恒星族群。',
        related: [{ title: '恒星形成', detail: '局部 H II 区显示近期恒星形成活动。' }, { title: '距离研究', detail: '造父变星观测使其成为河外距离尺度研究的经典目标。' }]
    },
    {
        id: 'wolf-lundmark-melotte', name: 'WLM 星系', nameEn: 'Wolf-Lundmark-Melotte / WLM', atlasMap: 'local-group', category: 'galaxy',
        type: '孤立不规则矮星系', distanceLy: 3040000, galactic: { lDeg: 75.9, bDeg: -73.6 }, color: 0x9fbce8, size: 15,
        temperature: '低金属丰度恒星系统', feature: '本星系群边缘较孤立的不规则矮星系，适合研究弱环境作用下的星系演化。',
        related: [{ title: '孤立环境', detail: '与大型星系距离较远，潮汐扰动相对较弱。' }, { title: '低金属丰度', detail: '恒星和气体保留了矮星系化学演化的信息。' }]
    },
    {
        id: 'andromeda-ii', name: '仙女座 II 矮星系', nameEn: 'Andromeda II', atlasMap: 'local-group', category: 'galaxy',
        type: '球状矮星系', distanceLy: 2220000, galactic: { lDeg: 128.9, bDeg: -29.2 }, color: 0xd0b7e8, size: 14,
        temperature: '老年恒星族群为主', feature: '仙女座星系的卫星矮星系，内部运动学保留了并合和潮汐演化线索。',
        related: [{ title: '仙女座卫星', detail: '受 M31 引力环境影响的低亮度卫星星系。' }, { title: '恒星运动', detail: '复杂的恒星运动结构可能记录早期小型并合事件。' }]
    },
    {
        id: 'andromeda-iii', name: '仙女座 III 矮星系', nameEn: 'Andromeda III', atlasMap: 'local-group', category: 'galaxy',
        type: '球状矮星系', distanceLy: 2450000, galactic: { lDeg: 119.3, bDeg: -26.2 }, color: 0xc5afe0, size: 13,
        temperature: '低亮度老年恒星系统', feature: '仙女座星系的低亮度卫星矮星系，用于研究大型星系卫星族群和暗物质环境。',
        related: [{ title: '低表面亮度', detail: '恒星分布稀疏，观测依赖深度巡天。' }, { title: '卫星族群', detail: '与其他 M31 矮卫星共同约束本星系群形成历史。' }]
    },

    // ── Cosmic neighborhood expansions ────────────────────────────────────
    {
        id: 'fornax-cluster',
        name: '天炉座星系团',
        nameEn: 'Fornax Cluster',
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy-cluster',
        type: '近邻星系团',
        distanceLy: 62000000,
        galactic: { lDeg: 236.7, bDeg: -53.6 },
        color: 0xffe0a8,
        size: 36,
        temperature: '非单一天体',
        feature: '南天近邻星系团，比室女座更致密，是近邻宇宙结构研究的重要节点。',
        related: [
            { title: 'NGC 1399', detail: '星系团中心巨型椭圆星系。' },
            { title: '近邻团尺度', detail: '距离约 6200 万光年。' }
        ]
    },
    {
        id: 'coma-cluster',
        name: '后发座星系团',
        nameEn: 'Coma Cluster',
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy-cluster',
        type: '富星系团',
        distanceLy: 321000000,
        galactic: { lDeg: 58.1, bDeg: 88.0 },
        color: 0xffd9a0,
        size: 44,
        temperature: '非单一天体',
        feature: '著名富星系团，历史上帮助确立暗物质存在证据，是大尺度结构研究经典对象。',
        related: [
            { title: '暗物质证据', detail: '成员星系速度弥散远超可见物质所能束缚。' },
            { title: '富团环境', detail: '以椭圆星系和热气体主导的致密环境。' }
        ]
    },
    {
        id: 'perseus-cluster',
        name: '英仙座星系团',
        nameEn: 'Perseus Cluster / Abell 426',
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy-cluster',
        type: 'X 射线亮星系团',
        distanceLy: 240000000,
        galactic: { lDeg: 150.6, bDeg: -13.3 },
        color: 0xb8d8ff,
        size: 40,
        temperature: '团内热气体可达数千万 K',
        feature: '最近、最亮的 X 射线星系团之一，中心有活动星系 NGC 1275。',
        related: [
            { title: 'NGC 1275', detail: '中心 cD 星系，伴随复杂射电与丝状气体结构。' },
            { title: '团内介质', detail: '热气体发出强 X 射线，可研究反馈与冷却流。' }
        ]
    },
    {
        id: 'hydra-centaurus',
        name: '长蛇-半人马超星系团方向',
        nameEn: 'Hydra-Centaurus Supercluster',
        atlasMap: 'cosmic-neighborhood',
        category: 'supercluster',
        type: '超星系团方向标',
        distanceLy: 190000000,
        galactic: { lDeg: 302, bDeg: 21 },
        color: 0xffb28a,
        size: 46,
        temperature: '非单一天体',
        feature: '指向近邻超星系团复合体，与巨引源和拉尼亚凯亚流场研究密切相关。',
        related: [
            { title: '大尺度流', detail: '星系 peculiar velocity 在该方向表现出明显汇聚趋势。' },
            { title: '与拉尼亚凯亚', detail: '属于更大宇宙网节点网络的一部分。' }
        ]
    },
    {
        id: 'great-attractor',
        name: '巨引源方向',
        nameEn: 'Great Attractor',
        atlasMap: 'cosmic-neighborhood',
        category: 'supercluster',
        type: '引力汇聚方向标',
        distanceLy: 250000000,
        galactic: { lDeg: 307, bDeg: 9 },
        color: 0xff8f6a,
        size: 50,
        temperature: '非单一天体',
        feature: '本星系群参与的大尺度运动所指向的引力汇聚方向；因位于银盘遮挡区，观测困难。',
        related: [
            { title: '银盘遮挡', detail: '大量尘埃使该方向光学巡天受限。' },
            { title: '流场示意', detail: '这里只标方向与尺度概念，不表示单一天体实体。' }
        ]
    },
    {
        id: 'ngc-253', name: '雕刻室星系 NGC 253', nameEn: 'Sculptor Galaxy / NGC 253', atlasMap: 'cosmic-neighborhood', category: 'galaxy',
        type: '星暴旋涡星系', distanceLy: 11400000, galactic: { lDeg: 97.4, bDeg: -88.0 }, color: 0xffb57d, size: 25,
        temperature: '星暴核心含热气体与尘埃', feature: '雕刻室星系群中最明亮的成员之一，核心区域正在经历强烈恒星形成。',
        related: [{ title: '星暴核心', detail: '高密度恒星形成驱动强烈红外、射电和 X 射线辐射。' }, { title: '雕刻室星系群', detail: '为现有星系群目录提供单星系观测节点。' }]
    },
    {
        id: 'm82-starburst', name: 'M82 星暴星系', nameEn: 'Cigar Galaxy / M82', atlasMap: 'cosmic-neighborhood', category: 'galaxy',
        type: '星暴星系', distanceLy: 12000000, galactic: { lDeg: 141.4, bDeg: 40.6 }, color: 0xff8b67, size: 24,
        temperature: '星暴风中的高温气体', feature: 'M81 星系群中的星暴星系，中央恒星形成活动驱动双极超风。',
        related: [{ title: '潮汐相互作用', detail: '与 M81 的引力相互作用可能触发了强烈星暴。' }, { title: '星系超风', detail: '大量超新星和恒星风将热气体推出星系盘。' }]
    },
    {
        id: 'centaurus-a-galaxy', name: '半人马座 A', nameEn: 'Centaurus A / NGC 5128', atlasMap: 'cosmic-neighborhood', category: 'galaxy',
        type: '活动椭圆星系', distanceLy: 12000000, galactic: { lDeg: 309.5, bDeg: 19.4 }, color: 0xe0b18b, size: 27,
        temperature: '活动核、射电喷流与尘埃带', feature: '距离最近的强射电星系之一，显著尘埃带横穿椭圆星系主体。',
        related: [{ title: '活动星系核', detail: '中心超大质量黑洞驱动大尺度射电喷流和叶状结构。' }, { title: '并合痕迹', detail: '尘埃带可能来自过去吞并的富气体星系。' }]
    },
    {
        id: 'm87-galaxy', name: 'M87 星系', nameEn: 'Messier 87 / Virgo A', atlasMap: 'cosmic-neighborhood', category: 'galaxy',
        type: '巨型椭圆活动星系', distanceLy: 53500000, galactic: { lDeg: 283.8, bDeg: 74.5 }, color: 0xffd0a0, size: 31,
        temperature: '热气体晕与相对论喷流', feature: '室女座星系团中心附近的巨型椭圆星系，拥有著名相对论喷流和已成像黑洞。',
        related: [{ title: 'M87*', detail: '事件视界望远镜首次发布黑洞阴影图像的目标。' }, { title: '室女座星系团', detail: '为现有室女座星系团目录提供中心代表星系节点。' }]
    },
    {
        id: 'local-supercluster-direction', name: '本超星系团方向', nameEn: 'Local Supercluster Direction', atlasMap: 'cosmic-neighborhood', category: 'supercluster',
        type: '超星系团尺度方向标', distanceLy: 110000000, galactic: { lDeg: 284, bDeg: 74 }, color: 0xaab7ff, size: 45,
        temperature: '非单一天体', feature: '室女座超星系团/本超星系团的尺度与方向参照，不表示精确实体边界。',
        related: [{ title: '层级结构', detail: '本星系群位于室女座超星系团的一部分，并嵌入更大的拉尼亚凯亚流域。' }, { title: '显示限制', detail: '这里只表达方向和尺度概念，不绘制固定边界或均匀实体。' }]
    },
    {
        id: 'm51-whirlpool',
        name: '涡状星系 M51',
        nameEn: 'Whirlpool Galaxy / M51',
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy',
        type: '相互作用旋涡星系',
        distanceLy: 23000000,
        galactic: { lDeg: 104.9, bDeg: 68.6 },
        color: 0xffd6a8,
        size: 28,
        temperature: '非单一天体',
        feature: '著名的面对面旋涡星系，正在与伴星系 NGC 5195 相互作用，是近邻宇宙经典观测目标。',
        related: [
            { title: '旋臂结构', detail: '清晰的旋臂使它成为星系结构教学与成像的标准对象。' },
            { title: '潮汐相互作用', detail: '伴星系扰动激发了恒星形成并扭曲了外盘。' }
        ]
    },
    {
        id: 'm101-pinwheel',
        name: '风车星系 M101',
        nameEn: 'Pinwheel Galaxy / M101',
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy',
        type: '巨型旋涡星系',
        distanceLy: 21000000,
        galactic: { lDeg: 102.0, bDeg: 59.8 },
        color: 0xffe0b0,
        size: 30,
        temperature: '非单一天体',
        feature: '大熊座方向著名的面对面旋涡星系，旋臂宽阔，富含恒星形成区。',
        related: [
            { title: '旋臂与 H II 区', detail: '外盘分布大量明亮恒星形成复合体。' },
            { title: '近邻宇宙', detail: '是本超星系团范围内最常被成像的旋涡星系之一。' }
        ]
    },

    {
        id: 'gj-1061',
        name: "格利泽 1061",
        'nameEn': "GJ 1061",
        'atlasMap': "neighborhood",
        'category': "nearby-star",
        'type': "多行星红矮星系统",
        'distanceLy': 12,
        'galactic': {
            'lDeg': 313,
            'bDeg': -46.8
        },
        'spectralClass': "M5.5V",
        'color': 16735567,
        'size': 3.1,
        'temperature': "约 2950 K",
        'feature': "距离太阳约 12 光年的近邻红矮星，拥有紧凑的多行星系统。",
        'systemLayout': {
            'sceneScale': 1.18,
            'cameraDistance': 172,
            'note': "轨道经过压缩与拉开，仅用于表达系统层次。",
            'bodies': [
                {
                    'name': "GJ 1061",
                    'kind': "star",
                    'color': 16735567,
                    'size': 12,
                    'x': 50,
                    'y': 50,
                    'detail': "M5.5V 红矮星"
                },
                {
                    'name': "b",
                    'kind': "planet",
                    'color': 9286873,
                    'size': 4,
                    'orbit': 18,
                    'angleDeg': 18,
                    'detail': "内侧行星"
                },
                {
                    'name': "c",
                    'kind': "planet",
                    'color': 7521955,
                    'size': 4.5,
                    'orbit': 28,
                    'angleDeg': 142,
                    'detail': "中间轨道行星"
                },
                {
                    'name': "d",
                    'kind': "planet",
                    'color': 13935978,
                    'size': 5,
                    'orbit': 38,
                    'angleDeg': 258,
                    'detail': "外侧行星"
                }
            ]
        },
        'related': [
            {
                'title': "近邻红矮星",
                'detail': "适合用于比较低质量恒星的行星形成环境。"
            },
            {
                'title': "紧凑轨道",
                'detail': "多颗行星都在靠近主星的轨道上运行。"
            }
        ]
    },
    {
        'id': "wolf-1061",
        'name': "沃尔夫 1061",
        'nameEn': "Wolf 1061",
        'atlasMap': "neighborhood",
        'category': "nearby-star",
        'type': "多行星红矮星系统",
        'distanceLy': 13.8,
        'galactic': {
            'lDeg': 352.9,
            'bDeg': -13.4
        },
        'spectralClass': "M3V",
        'color': 16740440,
        'size': 3.2,
        'temperature': "约 3350 K",
        'feature': "距离太阳约 14 光年的活跃红矮星，拥有紧凑的多行星系统。",
        'systemLayout': {
            'sceneScale': 1.16,
            'cameraDistance': 176,
            'note': "轨道按可读性重新排布，不代表真实比例。",
            'bodies': [
                {
                    'name': "Wolf 1061",
                    'kind': "star",
                    'color': 16740440,
                    'size': 12,
                    'x': 50,
                    'y': 50,
                    'detail': "M3V 红矮星"
                },
                {
                    'name': "b",
                    'kind': "planet",
                    'color': 10469079,
                    'size': 4,
                    'orbit': 17,
                    'angleDeg': 35,
                    'detail': "内侧行星"
                },
                {
                    'name': "c",
                    'kind': "planet",
                    'color': 7849898,
                    'size': 4.5,
                    'orbit': 27,
                    'angleDeg': 158,
                    'detail': "宜居带附近重点目标"
                },
                {
                    'name': "d",
                    'kind': "planet",
                    'color': 14067564,
                    'size': 5,
                    'orbit': 37,
                    'angleDeg': 276,
                    'detail': "外侧行星"
                }
            ]
        },
        'related': [
            {
                'title': "近邻多行星系统",
                'detail': "数颗行星围绕低质量红矮星运行。"
            },
            {
                'title': "宜居带研究",
                'detail': "中间轨道行星可用于讨论红矮星的大气保持。"
            }
        ]
    },
    {
        'id': "m44-beehive",
        'name': "M44 蜂巢星团",
        'nameEn': "Beehive Cluster / M44",
        'atlasMap': "milky-way",
        'category': "deep-sky",
        'type': "疏散星团",
        'distanceLy': 610,
        'galactic': {
            'lDeg': 205.9,
            'bDeg': 3
        },
        'color': 16770733,
        'size': 20,
        'temperature': "年轻至中年轻恒星群",
        'feature': "巨蟹座方向的明亮疏散星团，是银河层中适合与单颗恒星对照的星团目标。",
        'related': [
            {
                'title': "疏散星团",
                'detail': "成员星由共同分子云形成。"
            },
            {
                'title': "银河盘面",
                'detail': "位于银河盘附近，适合作为银河层的方向标志。"
            }
        ]
    },
    {
        'id': "double-cluster-perseus",
        'name': "英仙座双星团 h + χ",
        'nameEn': "Double Cluster h and Chi Persei",
        'atlasMap': "milky-way",
        'category': "deep-sky",
        'type': "双疏散星团",
        'distanceLy': 7500,
        'galactic': {
            'lDeg': 134.7,
            'bDeg': -3.7
        },
        'color': 12179967,
        'size': 24,
        'temperature': "富含蓝白色年轻恒星",
        'feature': "英仙座方向紧邻的两个年轻疏散星团，适合表现银河盘内成团恒星的密集尺度。",
        'related': [
            {
                'title': "h Persei 与 χ Persei",
                'detail': "两个星团在视线上相互接近，形成极具辨识度的双团结构。"
            },
            {
                'title': "年轻恒星",
                'detail': "成员中包含大量明亮的蓝白色恒星。"
            }
        ]
    },
    {
        'id': "rho-ophiuchi-cloud",
        'name': "蛇夫座 ρ 星云复合体",
        'nameEn': "Rho Ophiuchi Cloud Complex",
        'atlasMap': "milky-way",
        'category': "nebula",
        'type': "恒星形成区 / 分子云",
        'distanceLy': 460,
        'galactic': {
            'lDeg': 353,
            'bDeg': 17
        },
        'color': 16748456,
        'size': 23,
        'temperature': "冷分子云与年轻恒星",
        'feature': "蛇夫座方向的近邻恒星形成区，尘埃、反射星云与年轻恒星交织。",
        'related': [
            {
                'title': "恒星形成区",
                'detail': "致密分子云正在孕育新生恒星。"
            },
            {
                'title': "尘埃消光",
                'detail': "复杂尘埃结构会遮挡背景恒星。"
            }
        ]
    },
    {
        'id': "ngc-147",
        'name': "NGC 147 矮椭圆星系",
        'nameEn': "NGC 147",
        'atlasMap': "local-group",
        'category': "galaxy",
        'type': "卫星矮椭圆星系",
        'distanceLy': 2400000,
        'galactic': {
            'lDeg': 119.8,
            'bDeg': -14.3
        },
        'color': 16762530,
        'size': 16,
        'temperature': "老年恒星为主",
        'feature': "仙女座星系的卫星矮椭圆星系，与 NGC 185 构成一对适合并置观察的伴星系。",
        'related': [
            {
                'title': "M31 卫星星系",
                'detail': "属于本星系群内的矮星系成员。"
            },
            {
                'title': "老年恒星",
                'detail': "恒星形成活动较弱，色调偏红黄。"
            }
        ]
    },
    {
        'id': "ngc-185",
        'name': "NGC 185 矮椭圆星系",
        'nameEn': "NGC 185",
        'atlasMap': "local-group",
        'category': "galaxy",
        'type': "卫星矮椭圆星系",
        'distanceLy': 2300000,
        'galactic': {
            'lDeg': 120.8,
            'bDeg': -14.5
        },
        'color': 16765098,
        'size': 16,
        'temperature': "老年恒星与少量恒星形成区",
        'feature': "仙女座星系的近邻卫星矮椭圆星系，展示本星系群中小型星系的多样性。",
        'related': [
            {
                'title': "NGC 147 的伴星系",
                'detail': "两者在天空中方向相近，常被作为卫星星系对来研究。"
            },
            {
                'title': "残余恒星形成",
                'detail': "内部仍可见少量较年轻恒星与尘埃。"
            }
        ]
    },
    {
        'id': "ngc-2403",
        'name': "NGC 2403",
        'nameEn': "NGC 2403",
        'atlasMap': "cosmic-neighborhood",
        'category': "galaxy",
        'type': "近邻旋涡星系",
        'distanceLy': 8000000,
        'galactic': {
            'lDeg': 150.6,
            'bDeg': 29.2
        },
        'color': 16766632,
        'size': 26,
        'temperature': "恒星形成活跃的旋涡盘",
        'feature': "长颈鹿座方向的近邻旋涡星系，是宇宙近邻层中连接银河与外部星系的自然入口。",
        'related': [
            {
                'title': "M81 群周边",
                'detail': "常与 M81、M82 等近邻星系放在同一片天区观察。"
            },
            {
                'title': "恒星形成区",
                'detail': "旋臂中分布多个明亮 H II 区。"
            }
        ]
    },
    {
        'id': "yz-ceti",
        'name': "YZ 天坛座",
        'nameEn': "YZ Ceti",
        'atlasMap': "neighborhood",
        'category': "nearby-star",
        'type': "多行星红矮星系统",
        'distanceLy': 12.1,
        'galactic': { 'lDeg': 149.7, 'bDeg': -78.8 },
        'color': 16741989,
        'size': 13,
        'temperature': "约 3150 K",
        'feature': "距离太阳约十二光年的低质量红矮星；三颗近轨道行星使它成为近邻紧凑行星系统的代表。",
        'systemLayout': {
            'sceneScale': 1.18,
            'cameraDistance': 170,
            'note': "轨道为压缩示意，用于呈现紧凑多行星系统的层次。",
            'bodies': [
                { 'name': "YZ Ceti", 'kind': "star", 'color': 16741989, 'size': 12, 'x': 50, 'y': 50, 'detail': "M 型红矮星" },
                { 'name': "b", 'kind': "planet", 'color': 11119017, 'size': 4, 'orbit': 17, 'angleDeg': 28, 'detail': "内侧岩质行星" },
                { 'name': "c", 'kind': "planet", 'color': 8750462, 'size': 4.5, 'orbit': 27, 'angleDeg': 148, 'detail': "中间轨道行星" },
                { 'name': "d", 'kind': "planet", 'color': 14073664, 'size': 5, 'orbit': 37, 'angleDeg': 264, 'detail': "外侧行星" }
            ]
        },
        'related': [
            { 'title': "近邻红矮星", 'detail': "低质量恒星的活动性与行星大气演化是重要研究主题。" },
            { 'title': "紧凑行星系统", 'detail': "多颗行星都在靠近主星的区域运行。" }
        ]
    },
    {
        'id': "l-98-59",
        'name': "L 98-59",
        'nameEn': "L 98-59",
        'atlasMap': "neighborhood",
        'category': "nearby-star",
        'type': "多行星红矮星系统",
        'distanceLy': 35,
        'galactic': { 'lDeg': 281.8, 'bDeg': -17.6 },
        'color': 16744288,
        'size': 14,
        'temperature': "约 3360 K",
        'feature': "约三十五光年外的近邻红矮星，拥有多颗尺寸接近地球的短周期行星，是比较行星密度与潮汐环境的紧凑样本。",
        'systemLayout': {
            'sceneScale': 1.2,
            'cameraDistance': 174,
            'note': "轨道按可读性拉开，不表示真实半长轴比例。",
            'bodies': [
                { 'name': "L 98-59", 'kind': "star", 'color': 16744288, 'size': 12, 'x': 50, 'y': 50, 'detail': "M 型红矮星" },
                { 'name': "b", 'kind': "planet", 'color': 11245506, 'size': 4, 'orbit': 17, 'angleDeg': 42, 'detail': "内侧地球大小行星" },
                { 'name': "c", 'kind': "planet", 'color': 8102397, 'size': 4.5, 'orbit': 28, 'angleDeg': 166, 'detail': "中间轨道行星" },
                { 'name': "d", 'kind': "planet", 'color': 13927890, 'size': 5, 'orbit': 39, 'angleDeg': 282, 'detail': "外侧行星" }
            ]
        },
        'related': [
            { 'title': "地球大小行星", 'detail': "该系统为低质量行星的质量、半径与组成比较提供样本。" },
            { 'title': "红矮星宜居性", 'detail': "短周期轨道有助于研究潮汐锁定与恒星活动的影响。" }
        ]
    },
    {
        'id': "ngc-7000-north-america",
        'name': "NGC 7000 北美星云",
        'nameEn': "North America Nebula / NGC 7000",
        'atlasMap': "milky-way",
        'category': "nebula",
        'type': "发射星云 / 电离氢区",
        'distanceLy': 2590,
        'galactic': { 'lDeg': 85.5, 'bDeg': -1 },
        'color': 16745878,
        'size': 30,
        'temperature': "电离氢气体、尘埃与年轻恒星",
        'feature': "天鹅座方向的大尺度发射星云，明亮氢气与暗尘埃共同勾勒出极具辨识度的轮廓。",
        'related': [
            { 'title': "天鹅座 X 区域", 'detail': "位于银河盘面附近，邻近丰富的气体与恒星形成结构。" },
            { 'title': "电离氢发射", 'detail': "高能恒星辐射使氢气发出红色发射线。" }
        ]
    },
    {
        'id': "m22-globular-cluster",
        'name': "M22 人马座球状星团",
        'nameEn': "Messier 22 / NGC 6656",
        'atlasMap': "milky-way",
        'category': "deep-sky",
        'type': "球状星团",
        'distanceLy': 10600,
        'galactic': { 'lDeg': 9.9, 'bDeg': -7.6 },
        'color': 16770481,
        'size': 22,
        'temperature': "以老年低金属丰度恒星为主",
        'feature': "朝向银河核球方向的明亮球状星团，适合补足盘面星云之外的古老致密恒星群。",
        'related': [
            { 'title': "银河晕成员", 'detail': "球状星团保存着银河系早期形成阶段的恒星族群。" },
            { 'title': "人马座方向", 'detail': "视线接近银河中心区域，背景恒星与尘埃更为密集。" }
        ]
    },
    {
        'id': "leo-a",
        'name': "狮子座 A",
        'nameEn': "Leo A",
        'atlasMap': "local-group",
        'category': "galaxy",
        'type': "孤立矮不规则星系",
        'distanceLy': 2600000,
        'galactic': { 'lDeg': 196.9, 'bDeg': 52.4 },
        'color': 12184158,
        'size': 17,
        'temperature': "低金属丰度气体与年轻、老年恒星并存",
        'feature': "本星系群外围较为孤立的矮不规则星系，可用于观察弱环境作用下的小星系缓慢演化。",
        'related': [
            { 'title': "本星系群外围", 'detail': "相对远离银河系与仙女座星系的大型卫星体系。" },
            { 'title': "恒星形成历史", 'detail': "稀疏气体与多代恒星记录了延续较久的演化过程。" }
        ]
    },
    {
        'id': "sagittarius-dwarf-irregular",
        'name': "人马座矮不规则星系",
        'nameEn': "Sagittarius Dwarf Irregular Galaxy / SagDIG",
        'atlasMap': "local-group",
        'category': "galaxy",
        'type': "矮不规则星系",
        'distanceLy': 3500000,
        'galactic': { 'lDeg': 21.1, 'bDeg': -16.3 },
        'color': 11006519,
        'size': 16,
        'temperature': "富气体的低金属丰度恒星系统",
        'feature': "位于本星系群边缘的气体丰富矮星系，为银河与仙女座卫星之外的低质量星系提供对照。",
        'related': [
            { 'title': "本星系群边缘", 'detail': "距离主要大星系较远，受到的潮汐影响相对有限。" },
            { 'title': "低质量星系演化", 'detail': "气体储量和稀疏恒星形成可与卫星矮星系比较。" }
        ]
    },
    {
        'id': "m83-southern-pinwheel",
        'name': "M83 南风车星系",
        'nameEn': "Southern Pinwheel Galaxy / M83",
        'atlasMap': "cosmic-neighborhood",
        'category': "galaxy",
        'type': "棒旋星系",
        'distanceLy': 14700000,
        'galactic': { 'lDeg': 314.6, 'bDeg': 32 },
        'color': 16755745,
        'size': 30,
        'temperature': "旋臂中富含年轻蓝星与电离气体",
        'feature': "半人马座 A / M83 星系群中的正面旋涡星系；单独列出后，能将原有群组方向细化为可观察的恒星形成盘。",
        'related': [
            { 'title': "半人马座 A / M83 星系群", 'detail': "与半人马座 A 共同构成近邻宇宙中的重要星系群方向。" },
            { 'title': "恒星形成旋臂", 'detail': "盘面中遍布年轻星团、H II 区与明亮旋臂结构。" }
        ]
    },
    {
        'id': "m94-canes-venatici",
        'name': "M94 猎犬座星系",
        'nameEn': "Cat's Eye Galaxy / M94",
        'atlasMap': "cosmic-neighborhood",
        'category': "galaxy",
        'type': "环状旋涡星系",
        'distanceLy': 16000000,
        'galactic': { 'lDeg': 123.4, 'bDeg': 76 },
        'color': 16768111,
        'size': 25,
        'temperature': "中心恒星形成环与较老外盘恒星",
        'feature': "猎犬座 I 星系群中的近邻旋涡星系，醒目的内环使它适合作为盘星系结构演化的补充目标。",
        'related': [
            { 'title': "猎犬座 I 星系群", 'detail': "是太阳系附近若干松散星系群之一。" },
            { 'title': "环状结构", 'detail': "中心区域的环状恒星形成与外盘形成鲜明层次。" }
        ]
    }
,
    // 克制扩充批次 1
    {
        "id": "epsilon-indi",
        "name": "印第安座 ε",
        "nameEn": "Epsilon Indi",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻 K 型恒星系统",
        "distanceLy": 11.8,
        "galactic": {
            "lDeg": 336.2,
            "bDeg": -48
        },
        "color": 16767372,
        "size": 14,
        "temperature": "约 4600 K",
        "feature": "印第安座 ε 是近邻 K 型恒星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "82-g-eridani",
        "name": "波江座 82",
        "nameEn": "82 G. Eridani",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻 G 型恒星系统",
        "distanceLy": 19.7,
        "galactic": {
            "lDeg": 201,
            "bDeg": -46
        },
        "color": 16772765,
        "size": 13,
        "temperature": "约 5400 K",
        "feature": "波江座 82 是近邻 G 型恒星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "horsehead-nebula",
        "name": "马头星云",
        "nameEn": "Horsehead Nebula / Barnard 33",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "暗星云与发射星云复合体",
        "distanceLy": 1500,
        "galactic": {
            "lDeg": 207,
            "bDeg": -2
        },
        "color": 10618879,
        "size": 26,
        "temperature": "尘埃、分子气体与电离氢区",
        "feature": "马头星云 是暗星云与发射星云复合体，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "california-nebula",
        "name": "加州星云",
        "nameEn": "California Nebula / NGC 1499",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "大尺度发射星云",
        "distanceLy": 1000,
        "galactic": {
            "lDeg": 160,
            "bDeg": -7
        },
        "color": 16749976,
        "size": 27,
        "temperature": "电离氢气体与尘埃",
        "feature": "加州星云 是大尺度发射星云，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "sagittarius-dwarf-spheroidal",
        "name": "人马座矮椭球星系",
        "nameEn": "Sagittarius Dwarf Spheroidal Galaxy",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "银河系卫星矮椭球星系",
        "distanceLy": 78000,
        "galactic": {
            "lDeg": 5.6,
            "bDeg": -14.2
        },
        "color": 16762530,
        "size": 17,
        "temperature": "以老年恒星为主",
        "feature": "人马座矮椭球星系 是银河系卫星矮椭球星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "sextans-a",
        "name": "六分仪座 A",
        "nameEn": "Sextans A",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "矮不规则星系",
        "distanceLy": 4300000,
        "galactic": {
            "lDeg": 246,
            "bDeg": 40
        },
        "color": 11006519,
        "size": 17,
        "temperature": "富气体的年轻恒星系统",
        "feature": "六分仪座 A 是矮不规则星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "ngc-300",
        "name": "NGC 300",
        "nameEn": "Sculptor Galaxy / NGC 300",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "近邻旋涡星系",
        "distanceLy": 6100000,
        "galactic": {
            "lDeg": 300,
            "bDeg": -79
        },
        "color": 16755745,
        "size": 25,
        "temperature": "年轻蓝星与电离气体",
        "feature": "NGC 300 是近邻旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    {
        "id": "ngc-55",
        "name": "NGC 55",
        "nameEn": "NGC 55",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "侧向不规则旋涡星系",
        "distanceLy": 6500000,
        "galactic": {
            "lDeg": 333,
            "bDeg": -76
        },
        "color": 12184158,
        "size": 24,
        "temperature": "恒星形成盘与尘埃带",
        "feature": "NGC 55 是侧向不规则旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    // 克制扩充批次 2
    {
        "id": "delta-pavonis",
        "name": "孔雀座 δ",
        "nameEn": "Delta Pavonis",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻太阳型恒星",
        "distanceLy": 19.9,
        "galactic": {
            "lDeg": 329,
            "bDeg": -31
        },
        "color": 16772765,
        "size": 13,
        "temperature": "约 5600 K",
        "feature": "孔雀座 δ 是近邻太阳型恒星，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "gliese-832",
        "name": "格利泽 832",
        "nameEn": "Gliese 832",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "多行星红矮星系统",
        "distanceLy": 16.1,
        "galactic": {
            "lDeg": 346,
            "bDeg": -46
        },
        "color": 16744288,
        "size": 12,
        "temperature": "约 3600 K",
        "feature": "格利泽 832 是多行星红矮星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "heart-nebula",
        "name": "心脏星云",
        "nameEn": "Heart Nebula / IC 1805",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "发射星云与恒星形成区",
        "distanceLy": 7500,
        "galactic": {
            "lDeg": 134,
            "bDeg": 1
        },
        "color": 16745878,
        "size": 29,
        "temperature": "电离氢气体与年轻星团",
        "feature": "心脏星云 是发射星云与恒星形成区，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "soul-nebula",
        "name": "灵魂星云",
        "nameEn": "Soul Nebula / IC 1848",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "发射星云与恒星形成区",
        "distanceLy": 7500,
        "galactic": {
            "lDeg": 135,
            "bDeg": 1
        },
        "color": 16749976,
        "size": 29,
        "temperature": "电离氢气体与年轻星团",
        "feature": "灵魂星云 是发射星云与恒星形成区，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "sextans-b",
        "name": "六分仪座 B",
        "nameEn": "Sextans B",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "矮不规则星系",
        "distanceLy": 4500000,
        "galactic": {
            "lDeg": 233,
            "bDeg": 43
        },
        "color": 11006519,
        "size": 17,
        "temperature": "低金属丰度气体与恒星",
        "feature": "六分仪座 B 是矮不规则星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "phoenix-dwarf",
        "name": "凤凰座矮星系",
        "nameEn": "Phoenix Dwarf Galaxy",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "过渡型矮星系",
        "distanceLy": 1400000,
        "galactic": {
            "lDeg": 272,
            "bDeg": -68
        },
        "color": 16762530,
        "size": 16,
        "temperature": "老年恒星与残余气体",
        "feature": "凤凰座矮星系 是过渡型矮星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "ic-342",
        "name": "IC 342",
        "nameEn": "IC 342",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "近邻正面旋涡星系",
        "distanceLy": 10700000,
        "galactic": {
            "lDeg": 138,
            "bDeg": 10
        },
        "color": 16768111,
        "size": 26,
        "temperature": "恒星形成活跃的旋臂",
        "feature": "IC 342 是近邻正面旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    {
        "id": "ngc-6946",
        "name": "NGC 6946",
        "nameEn": "Fireworks Galaxy / NGC 6946",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "恒星形成活跃的旋涡星系",
        "distanceLy": 22000000,
        "galactic": {
            "lDeg": 95,
            "bDeg": 12
        },
        "color": 16755745,
        "size": 28,
        "temperature": "年轻星团与超新星遗迹丰富",
        "feature": "NGC 6946 是恒星形成活跃的旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    // 克制扩充批次 3
    {
        "id": "gj-15-a",
        "name": "格利泽 15 A",
        "nameEn": "Gliese 15 A",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻红矮星系统",
        "distanceLy": 11.7,
        "galactic": {
            "lDeg": 108,
            "bDeg": -26
        },
        "color": 16741989,
        "size": 12,
        "temperature": "约 3600 K",
        "feature": "格利泽 15 A 是近邻红矮星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "gj-1002",
        "name": "格利泽 1002",
        "nameEn": "Gliese 1002",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "多行星红矮星系统",
        "distanceLy": 15.8,
        "galactic": {
            "lDeg": 203,
            "bDeg": -33
        },
        "color": 16735567,
        "size": 12,
        "temperature": "约 3000 K",
        "feature": "格利泽 1002 是多行星红矮星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "omega-nebula",
        "name": "M17 牡马座星云",
        "nameEn": "Omega Nebula / M17",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "发射星云与恒星形成区",
        "distanceLy": 5500,
        "galactic": {
            "lDeg": 15,
            "bDeg": -0.7
        },
        "color": 16749976,
        "size": 28,
        "temperature": "电离氢气体与年轻恒星",
        "feature": "M17 牡马座星云 是发射星云与恒星形成区，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "m6-butterfly-cluster",
        "name": "M6 蝶形星团",
        "nameEn": "Butterfly Cluster / M6",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "疏散星团",
        "distanceLy": 1600,
        "galactic": {
            "lDeg": 353,
            "bDeg": -0.6
        },
        "color": 12179967,
        "size": 20,
        "temperature": "年轻蓝白恒星群",
        "feature": "M6 蝶形星团 是疏散星团，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "tucana-dwarf",
        "name": "杜鹃座矮星系",
        "nameEn": "Tucana Dwarf Galaxy",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "孤立矮椭球星系",
        "distanceLy": 2800000,
        "galactic": {
            "lDeg": 323,
            "bDeg": -47
        },
        "color": 16762530,
        "size": 16,
        "temperature": "以老年低金属丰度恒星为主",
        "feature": "杜鹃座矮星系 是孤立矮椭球星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "cetus-dwarf",
        "name": "鲸鱼座矮星系",
        "nameEn": "Cetus Dwarf Galaxy",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "孤立矮椭球星系",
        "distanceLy": 2500000,
        "galactic": {
            "lDeg": 101,
            "bDeg": -72
        },
        "color": 16762530,
        "size": 16,
        "temperature": "老年恒星族群",
        "feature": "鲸鱼座矮星系 是孤立矮椭球星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "m64-black-eye",
        "name": "M64 黑眼星系",
        "nameEn": "Black Eye Galaxy / M64",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "尘埃丰富的旋涡星系",
        "distanceLy": 17000000,
        "galactic": {
            "lDeg": 315,
            "bDeg": 84
        },
        "color": 16768111,
        "size": 25,
        "temperature": "中心尘埃带与旋涡盘",
        "feature": "M64 黑眼星系 是尘埃丰富的旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    {
        "id": "m63-sunflower",
        "name": "M63 向日葵星系",
        "nameEn": "Sunflower Galaxy / M63",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "絮状旋涡星系",
        "distanceLy": 29000000,
        "galactic": {
            "lDeg": 100,
            "bDeg": 78
        },
        "color": 16755745,
        "size": 26,
        "temperature": "盘面恒星形成与细碎旋臂",
        "feature": "M63 向日葵星系 是絮状旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    // 克制扩充批次 4
    {
        "id": "gj-887",
        "name": "格利泽 887",
        "nameEn": "Gliese 887",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻红矮星系统",
        "distanceLy": 10.7,
        "galactic": {
            "lDeg": 349,
            "bDeg": -65
        },
        "color": 16741989,
        "size": 12,
        "temperature": "约 3700 K",
        "feature": "格利泽 887 是近邻红矮星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "gj-251",
        "name": "格利泽 251",
        "nameEn": "Gliese 251",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻红矮星系统",
        "distanceLy": 18.2,
        "galactic": {
            "lDeg": 213,
            "bDeg": -18
        },
        "color": 16741989,
        "size": 12,
        "temperature": "约 3500 K",
        "feature": "格利泽 251 是近邻红矮星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "m7-ptolemy-cluster",
        "name": "M7 托勒密星团",
        "nameEn": "Ptolemy Cluster / M7",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "疏散星团",
        "distanceLy": 980,
        "galactic": {
            "lDeg": 356,
            "bDeg": -5
        },
        "color": 12179967,
        "size": 20,
        "temperature": "年轻至中年轻恒星群",
        "feature": "M7 托勒密星团 是疏散星团，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "m35-open-cluster",
        "name": "M35 双子座星团",
        "nameEn": "Messier 35",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "疏散星团",
        "distanceLy": 2800,
        "galactic": {
            "lDeg": 186,
            "bDeg": 2
        },
        "color": 12179967,
        "size": 21,
        "temperature": "年轻蓝白恒星群",
        "feature": "M35 双子座星团 是疏散星团，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "aquarius-dwarf",
        "name": "宝瓶座矮星系",
        "nameEn": "Aquarius Dwarf Galaxy / DDO 210",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "矮不规则星系",
        "distanceLy": 3100000,
        "galactic": {
            "lDeg": 34,
            "bDeg": -31
        },
        "color": 11006519,
        "size": 16,
        "temperature": "低金属丰度气体与恒星",
        "feature": "宝瓶座矮星系 是矮不规则星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "pegasus-dwarf",
        "name": "飞马座矮不规则星系",
        "nameEn": "Pegasus Dwarf Irregular Galaxy",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "矮不规则星系",
        "distanceLy": 3600000,
        "galactic": {
            "lDeg": 94,
            "bDeg": -43
        },
        "color": 11006519,
        "size": 16,
        "temperature": "稀疏气体与年轻恒星",
        "feature": "飞马座矮不规则星系 是矮不规则星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "m106",
        "name": "M106",
        "nameEn": "Messier 106 / NGC 4258",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "活动核旋涡星系",
        "distanceLy": 24000000,
        "galactic": {
            "lDeg": 139,
            "bDeg": 68
        },
        "color": 16768111,
        "size": 27,
        "temperature": "旋涡盘与活跃星系核",
        "feature": "M106 是活动核旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    {
        "id": "ngc-2903",
        "name": "NGC 2903",
        "nameEn": "NGC 2903",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "棒旋星系",
        "distanceLy": 30000000,
        "galactic": {
            "lDeg": 210,
            "bDeg": 44
        },
        "color": 16755745,
        "size": 26,
        "temperature": "明亮棒结构与恒星形成旋臂",
        "feature": "NGC 2903 是棒旋星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    // 克制扩充批次 5
    {
        "id": "gj-486",
        "name": "格利泽 486",
        "nameEn": "Gliese 486",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "行星凌日红矮星系统",
        "distanceLy": 26.3,
        "galactic": {
            "lDeg": 88,
            "bDeg": 19
        },
        "color": 16741989,
        "size": 12,
        "temperature": "约 3300 K",
        "feature": "格利泽 486 是行星凌日红矮星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "55-cancri",
        "name": "巨蟹座 55",
        "nameEn": "55 Cancri",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "多行星太阳型恒星系统",
        "distanceLy": 41,
        "galactic": {
            "lDeg": 184,
            "bDeg": 31
        },
        "color": 16772765,
        "size": 14,
        "temperature": "约 5200 K",
        "feature": "巨蟹座 55 是多行星太阳型恒星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "m37-open-cluster",
        "name": "M37 御夫座星团",
        "nameEn": "Messier 37",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "疏散星团",
        "distanceLy": 4400,
        "galactic": {
            "lDeg": 177,
            "bDeg": 3
        },
        "color": 12179967,
        "size": 21,
        "temperature": "中年轻恒星群",
        "feature": "M37 御夫座星团 是疏散星团，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "m41-open-cluster",
        "name": "M41 大犬座星团",
        "nameEn": "Messier 41",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "疏散星团",
        "distanceLy": 2300,
        "galactic": {
            "lDeg": 230,
            "bDeg": -20
        },
        "color": 12179967,
        "size": 20,
        "temperature": "年轻至中年轻恒星群",
        "feature": "M41 大犬座星团 是疏散星团，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "ngc-3109",
        "name": "NGC 3109",
        "nameEn": "NGC 3109",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "棒状矮不规则星系",
        "distanceLy": 4300000,
        "galactic": {
            "lDeg": 262,
            "bDeg": 23
        },
        "color": 11006519,
        "size": 18,
        "temperature": "富气体的低质量星系",
        "feature": "NGC 3109 是棒状矮不规则星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "antlia-dwarf",
        "name": "蚂蚁座矮星系",
        "nameEn": "Antlia Dwarf Galaxy",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "过渡型矮星系",
        "distanceLy": 4300000,
        "galactic": {
            "lDeg": 263,
            "bDeg": 22
        },
        "color": 16762530,
        "size": 16,
        "temperature": "老年恒星与残余气体",
        "feature": "蚂蚁座矮星系 是过渡型矮星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "ngc-2841",
        "name": "NGC 2841",
        "nameEn": "NGC 2841",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "大质量旋涡星系",
        "distanceLy": 46000000,
        "galactic": {
            "lDeg": 150,
            "bDeg": 38
        },
        "color": 16768111,
        "size": 27,
        "temperature": "较老恒星盘与紧密旋臂",
        "feature": "NGC 2841 是大质量旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    {
        "id": "m104-sombrero",
        "name": "M104 草帽星系",
        "nameEn": "Sombrero Galaxy / M104",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "尘埃带显著的旋涡星系",
        "distanceLy": 31000000,
        "galactic": {
            "lDeg": 298,
            "bDeg": 51
        },
        "color": 16770481,
        "size": 27,
        "temperature": "明亮核球与暗尘埃带",
        "feature": "M104 草帽星系 是尘埃带显著的旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    // 克制扩充批次 6
    {
        "id": "hd-20794",
        "name": "HD 20794",
        "nameEn": "82 G. Eridani / HD 20794",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻太阳型行星系统",
        "distanceLy": 19.7,
        "galactic": {
            "lDeg": 282,
            "bDeg": -60
        },
        "color": 16772765,
        "size": 13,
        "temperature": "约 5400 K",
        "feature": "HD 20794 是近邻太阳型行星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "hd-40307",
        "name": "HD 40307",
        "nameEn": "HD 40307",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "多行星 K 型恒星系统",
        "distanceLy": 42,
        "galactic": {
            "lDeg": 222,
            "bDeg": -28
        },
        "color": 16767372,
        "size": 13,
        "temperature": "约 5000 K",
        "feature": "HD 40307 是多行星 K 型恒星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "m5-globular-cluster",
        "name": "M5 球状星团",
        "nameEn": "Messier 5",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "球状星团",
        "distanceLy": 24500,
        "galactic": {
            "lDeg": 4,
            "bDeg": 47
        },
        "color": 16770481,
        "size": 22,
        "temperature": "老年低金属丰度恒星",
        "feature": "M5 球状星团 是球状星团，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "m15-globular-cluster",
        "name": "M15 球状星团",
        "nameEn": "Messier 15",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "球状星团",
        "distanceLy": 33600,
        "galactic": {
            "lDeg": 65,
            "bDeg": -27
        },
        "color": 16770481,
        "size": 22,
        "temperature": "致密老年恒星群",
        "feature": "M15 球状星团 是球状星团，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "andromeda-i",
        "name": "仙女座 I",
        "nameEn": "Andromeda I",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "仙女座卫星矮椭球星系",
        "distanceLy": 2500000,
        "galactic": {
            "lDeg": 122,
            "bDeg": -24
        },
        "color": 16762530,
        "size": 16,
        "temperature": "以老年恒星为主",
        "feature": "仙女座 I 是仙女座卫星矮椭球星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "andromeda-v",
        "name": "仙女座 V",
        "nameEn": "Andromeda V",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "仙女座卫星矮椭球星系",
        "distanceLy": 2500000,
        "galactic": {
            "lDeg": 126,
            "bDeg": -15
        },
        "color": 16762530,
        "size": 16,
        "temperature": "以老年恒星为主",
        "feature": "仙女座 V 是仙女座卫星矮椭球星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "m65",
        "name": "M65",
        "nameEn": "Messier 65 / NGC 3623",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "旋涡星系",
        "distanceLy": 35000000,
        "galactic": {
            "lDeg": 234,
            "bDeg": 56
        },
        "color": 16768111,
        "size": 25,
        "temperature": "盘面尘埃与恒星形成结构",
        "feature": "M65 是旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    {
        "id": "m66",
        "name": "M66",
        "nameEn": "Messier 66 / NGC 3627",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "受相互作用影响的旋涡星系",
        "distanceLy": 35000000,
        "galactic": {
            "lDeg": 233,
            "bDeg": 55
        },
        "color": 16755745,
        "size": 26,
        "temperature": "不对称旋臂与尘埃结构",
        "feature": "M66 是受相互作用影响的旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    // 克制扩充批次 7
    {
        "id": "hd-85512",
        "name": "HD 85512",
        "nameEn": "HD 85512",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻 K 型行星系统",
        "distanceLy": 36,
        "galactic": {
            "lDeg": 283,
            "bDeg": -10
        },
        "color": 16767372,
        "size": 13,
        "temperature": "约 4700 K",
        "feature": "HD 85512 是近邻 K 型行星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "hd-69830",
        "name": "HD 69830",
        "nameEn": "HD 69830",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "多行星 K 型恒星系统",
        "distanceLy": 41,
        "galactic": {
            "lDeg": 242,
            "bDeg": -5
        },
        "color": 16767372,
        "size": 13,
        "temperature": "约 5400 K",
        "feature": "HD 69830 是多行星 K 型恒星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "m2-globular-cluster",
        "name": "M2 球状星团",
        "nameEn": "Messier 2",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "球状星团",
        "distanceLy": 37500,
        "galactic": {
            "lDeg": 54,
            "bDeg": -36
        },
        "color": 16770481,
        "size": 22,
        "temperature": "老年低金属丰度恒星",
        "feature": "M2 球状星团 是球状星团，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "ngc-6397",
        "name": "NGC 6397",
        "nameEn": "NGC 6397",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "近邻球状星团",
        "distanceLy": 7800,
        "galactic": {
            "lDeg": 338,
            "bDeg": -12
        },
        "color": 16770481,
        "size": 21,
        "temperature": "老年恒星与白矮星族群",
        "feature": "NGC 6397 是近邻球状星团，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "andromeda-vi",
        "name": "仙女座 VI",
        "nameEn": "Andromeda VI / Pegasus Dwarf Spheroidal",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "仙女座卫星矮椭球星系",
        "distanceLy": 2700000,
        "galactic": {
            "lDeg": 109,
            "bDeg": -36
        },
        "color": 16762530,
        "size": 16,
        "temperature": "以老年恒星为主",
        "feature": "仙女座 VI 是仙女座卫星矮椭球星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "andromeda-vii",
        "name": "仙女座 VII",
        "nameEn": "Andromeda VII / Cassiopeia Dwarf",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "仙女座卫星矮椭球星系",
        "distanceLy": 2500000,
        "galactic": {
            "lDeg": 109,
            "bDeg": -10
        },
        "color": 16762530,
        "size": 16,
        "temperature": "以老年恒星为主",
        "feature": "仙女座 VII 是仙女座卫星矮椭球星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "ngc-3628",
        "name": "NGC 3628",
        "nameEn": "Hamburger Galaxy / NGC 3628",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "侧向旋涡星系",
        "distanceLy": 35000000,
        "galactic": {
            "lDeg": 240,
            "bDeg": 64
        },
        "color": 16768111,
        "size": 26,
        "temperature": "长尘埃带与受相互作用的外盘",
        "feature": "NGC 3628 是侧向旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    {
        "id": "ngc-1316",
        "name": "NGC 1316",
        "nameEn": "Fornax A / NGC 1316",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "射电透镜星系",
        "distanceLy": 62000000,
        "galactic": {
            "lDeg": 240,
            "bDeg": -57
        },
        "color": 16762530,
        "size": 27,
        "temperature": "并合残余与活跃射电结构",
        "feature": "NGC 1316 是射电透镜星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    // 克制扩充批次 8
    {
        "id": "k2-18",
        "name": "K2-18",
        "nameEn": "K2-18",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "行星凌日红矮星系统",
        "distanceLy": 124,
        "galactic": {
            "lDeg": 260,
            "bDeg": 64
        },
        "color": 16741989,
        "size": 12,
        "temperature": "约 3500 K",
        "feature": "K2-18 是行星凌日红矮星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "toi-700",
        "name": "TOI-700",
        "nameEn": "TOI-700",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "多行星红矮星系统",
        "distanceLy": 101,
        "galactic": {
            "lDeg": 272,
            "bDeg": -25
        },
        "color": 16741989,
        "size": 12,
        "temperature": "约 3500 K",
        "feature": "TOI-700 是多行星红矮星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "ic-443",
        "name": "IC 443 水母星云",
        "nameEn": "IC 443 / Jellyfish Nebula",
        "atlasMap": "milky-way",
        "category": "supernova-remnant",
        "type": "超新星遗迹与分子云复合体",
        "distanceLy": 5000,
        "galactic": {
            "lDeg": 189,
            "bDeg": 3
        },
        "color": 12192434,
        "size": 25,
        "temperature": "激波加热气体与分子云",
        "feature": "IC 443 水母星云 是超新星遗迹与分子云复合体，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "tycho-supernova-remnant",
        "name": "第谷超新星遗迹",
        "nameEn": "Tycho's Supernova Remnant",
        "atlasMap": "milky-way",
        "category": "supernova-remnant",
        "type": "Ia 型超新星遗迹",
        "distanceLy": 7500,
        "galactic": {
            "lDeg": 120,
            "bDeg": 1.4
        },
        "color": 12192434,
        "size": 24,
        "temperature": "高速膨胀的激波壳层",
        "feature": "第谷超新星遗迹 是Ia 型超新星遗迹，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "andromeda-x",
        "name": "仙女座 X",
        "nameEn": "Andromeda X",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "仙女座卫星矮椭球星系",
        "distanceLy": 2400000,
        "galactic": {
            "lDeg": 115,
            "bDeg": -20
        },
        "color": 16762530,
        "size": 15,
        "temperature": "以老年恒星为主",
        "feature": "仙女座 X 是仙女座卫星矮椭球星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "lgs-3",
        "name": "LGS 3",
        "nameEn": "LGS 3 / Pisces Dwarf",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "过渡型矮星系",
        "distanceLy": 2000000,
        "galactic": {
            "lDeg": 127,
            "bDeg": -40
        },
        "color": 16762530,
        "size": 15,
        "temperature": "老年恒星与稀疏气体",
        "feature": "LGS 3 是过渡型矮星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "ngc-1097",
        "name": "NGC 1097",
        "nameEn": "NGC 1097",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "棒旋星系与活动星系核",
        "distanceLy": 45000000,
        "galactic": {
            "lDeg": 291,
            "bDeg": -54
        },
        "color": 16755745,
        "size": 27,
        "temperature": "核环恒星形成与长旋臂",
        "feature": "NGC 1097 是棒旋星系与活动星系核，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    {
        "id": "ngc-891",
        "name": "NGC 891",
        "nameEn": "NGC 891",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "侧向旋涡星系",
        "distanceLy": 30000000,
        "galactic": {
            "lDeg": 140,
            "bDeg": -17
        },
        "color": 16768111,
        "size": 26,
        "temperature": "薄盘尘埃带与扩展恒星晕",
        "feature": "NGC 891 是侧向旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },
    // 克制扩充批次 9
    {
        "id": "gj-357",
        "name": "格利泽 357",
        "nameEn": "Gliese 357",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "多行星红矮星系统",
        "distanceLy": 31,
        "galactic": {
            "lDeg": 249,
            "bDeg": 16
        },
        "color": 16741989,
        "size": 12,
        "temperature": "约 3500 K",
        "feature": "格利泽 357 是多行星红矮星系统，作为太阳邻域层的恒星与行星系统样本纳入目录。",
        "related": [
            {
                "title": "近邻恒星研究",
                "detail": "用于比较不同质量恒星及其行星系统。"
            }
        ]
    },
    {
        "id": "sn-1006-remnant",
        "name": "SN 1006 超新星遗迹",
        "nameEn": "SN 1006 Supernova Remnant",
        "atlasMap": "milky-way",
        "category": "supernova-remnant",
        "type": "Ia 型超新星遗迹",
        "distanceLy": 6500,
        "galactic": {
            "lDeg": 327,
            "bDeg": 14.6
        },
        "color": 12192434,
        "size": 24,
        "temperature": "高速膨胀的稀薄激波壳层",
        "feature": "SN 1006 超新星遗迹 是Ia 型超新星遗迹，作为银河地标层的深空结构样本纳入目录。",
        "related": [
            {
                "title": "银河结构",
                "detail": "用于补充银河盘面、星团和激波遗迹的空间层次。"
            }
        ]
    },
    {
        "id": "leo-t",
        "name": "狮子座 T",
        "nameEn": "Leo T",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "富气体超微弱矮星系",
        "distanceLy": 1400000,
        "galactic": {
            "lDeg": 214,
            "bDeg": 43
        },
        "color": 11006519,
        "size": 15,
        "temperature": "老年恒星与中性氢气体",
        "feature": "狮子座 T 是富气体超微弱矮星系，作为本星系群层的低质量星系样本纳入目录。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "可与银河系和仙女座星系的卫星系统进行对照。"
            }
        ]
    },
    {
        "id": "ngc-7331",
        "name": "NGC 7331",
        "nameEn": "NGC 7331",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "近邻旋涡星系",
        "distanceLy": 40000000,
        "galactic": {
            "lDeg": 94,
            "bDeg": -21
        },
        "color": 16768111,
        "size": 27,
        "temperature": "明亮核球与恒星形成盘",
        "feature": "NGC 7331 是近邻旋涡星系，作为宇宙近邻层的代表性星系样本纳入目录。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于观察星系盘、尘埃、恒星形成与环境效应的差异。"
            }
        ]
    },

    // 克制扩充至 300 项：五个小批次，每批四层各增加 5 项
    {
        "id": "luhman-16",
        "name": "卢曼 16",
        "nameEn": "Luhman 16",
        "atlasMap": "neighborhood",
        "category": "stellar-object",
        "type": "近邻棕矮星双星",
        "distanceLy": 6.5,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "卢曼 16位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 315,
            "bDeg": 5
        }
    },
    {
        "id": "wise-0855-0714",
        "name": "WISE 0855−0714",
        "nameEn": "WISE 0855−0714",
        "atlasMap": "neighborhood",
        "category": "stellar-object",
        "type": "超冷棕矮星",
        "distanceLy": 7.4,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "WISE 0855−0714位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 237,
            "bDeg": 21
        }
    },
    {
        "id": "scr-1845-6357",
        "name": "SCR 1845−6357",
        "nameEn": "SCR 1845−6357",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "红矮星—棕矮星双星",
        "distanceLy": 13,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "SCR 1845−6357位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 329,
            "bDeg": -24
        }
    },
    {
        "id": "denis-1048-3956",
        "name": "DENIS 1048−3956",
        "nameEn": "DENIS 1048−3956",
        "atlasMap": "neighborhood",
        "category": "stellar-object",
        "type": "超冷红矮星",
        "distanceLy": 13,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "DENIS 1048−3956位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 278,
            "bDeg": 17
        }
    },
    {
        "id": "gliese-1005",
        "name": "格利泽 1005",
        "nameEn": "Gliese 1005",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻红矮星双星",
        "distanceLy": 19,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "格利泽 1005位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 35,
            "bDeg": -52
        }
    },
    {
        "id": "flame-nebula",
        "name": "火焰星云",
        "nameEn": "Flame Nebula (NGC 2024)",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "发射与反射星云复合体",
        "distanceLy": 1400,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "火焰星云是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 207,
            "bDeg": -19
        }
    },
    {
        "id": "running-man-nebula",
        "name": "奔跑人星云",
        "nameEn": "Running Man Nebula (NGC 1977)",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "反射星云",
        "distanceLy": 1500,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "奔跑人星云是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 209,
            "bDeg": -19
        }
    },
    {
        "id": "messier-78",
        "name": "M78 星云",
        "nameEn": "Messier 78",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "猎户座反射星云",
        "distanceLy": 1600,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M78 星云是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 207,
            "bDeg": -17
        }
    },
    {
        "id": "barnards-loop",
        "name": "巴纳德环",
        "nameEn": "Barnard's Loop",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "巨大电离氢弧",
        "distanceLy": 1500,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "巴纳德环是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 207,
            "bDeg": -19
        }
    },
    {
        "id": "elephant-trunk-nebula",
        "name": "象鼻星云",
        "nameEn": "Elephant’s Trunk Nebula",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "暗星云与恒星形成区",
        "distanceLy": 2400,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "象鼻星云是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 99,
            "bDeg": 4
        }
    },
    {
        "id": "carina-dwarf",
        "name": "船底座矮星系",
        "nameEn": "Carina Dwarf Galaxy",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "银河系矮椭球卫星",
        "distanceLy": 330000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "船底座矮星系是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 260,
            "bDeg": -22
        }
    },
    {
        "id": "carina-ii",
        "name": "船底座 II",
        "nameEn": "Carina II",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 120000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "船底座 II是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 270,
            "bDeg": -18
        }
    },
    {
        "id": "carina-iii",
        "name": "船底座 III",
        "nameEn": "Carina III",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 90000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "船底座 III是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 269,
            "bDeg": -17
        }
    },
    {
        "id": "bootes-i",
        "name": "牧夫座 I",
        "nameEn": "Boötes I",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 197000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "牧夫座 I是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 358,
            "bDeg": 70
        }
    },
    {
        "id": "bootes-ii",
        "name": "牧夫座 II",
        "nameEn": "Boötes II",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 140000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "牧夫座 II是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 340,
            "bDeg": 66
        }
    },
    {
        "id": "messier-74",
        "name": "M74 幽灵星系",
        "nameEn": "Messier 74",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "正面旋涡星系",
        "distanceLy": 32000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "M74 幽灵星系位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 138,
            "bDeg": -45
        }
    },
    {
        "id": "messier-77",
        "name": "M77",
        "nameEn": "Messier 77",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "活动核棒旋星系",
        "distanceLy": 47000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "M77位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 173,
            "bDeg": -52
        }
    },
    {
        "id": "messier-95",
        "name": "M95",
        "nameEn": "Messier 95",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "棒旋星系",
        "distanceLy": 33000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "M95位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 233,
            "bDeg": 55
        }
    },
    {
        "id": "messier-96",
        "name": "M96",
        "nameEn": "Messier 96",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "狮子座 I 星系群旋涡星系",
        "distanceLy": 35000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "M96位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 234,
            "bDeg": 57
        }
    },
    {
        "id": "messier-98",
        "name": "M98",
        "nameEn": "Messier 98",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "室女座方向旋涡星系",
        "distanceLy": 44000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "M98位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 280,
            "bDeg": 75
        }
    },
    {
        "id": "gliese-1111",
        "name": "格利泽 1111",
        "nameEn": "Gliese 1111",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻红矮星",
        "distanceLy": 19,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "格利泽 1111位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 192,
            "bDeg": 65
        }
    },
    {
        "id": "gliese-1245",
        "name": "格利泽 1245",
        "nameEn": "Gliese 1245",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "耀斑红矮星三合星系统",
        "distanceLy": 14,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "格利泽 1245位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 123,
            "bDeg": 58
        }
    },
    {
        "id": "lhs-292",
        "name": "LHS 292",
        "nameEn": "LHS 292",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "超冷红矮星",
        "distanceLy": 14,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "LHS 292位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 202,
            "bDeg": 55
        }
    },
    {
        "id": "lp-944-20",
        "name": "LP 944−20",
        "nameEn": "LP 944−20",
        "atlasMap": "neighborhood",
        "category": "stellar-object",
        "type": "近邻棕矮星",
        "distanceLy": 21,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "LP 944−20位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 289,
            "bDeg": -29
        }
    },
    {
        "id": "gliese-570",
        "name": "格利泽 570",
        "nameEn": "Gliese 570",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "多星与棕矮星系统",
        "distanceLy": 19,
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "格利泽 570位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 336,
            "bDeg": -58
        }
    },
    {
        "id": "cocoon-nebula",
        "name": "茧星云",
        "nameEn": "Cocoon Nebula (IC 5146)",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "发射与反射星云",
        "distanceLy": 2500,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "茧星云是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 94,
            "bDeg": -5
        }
    },
    {
        "id": "bubble-nebula",
        "name": "气泡星云",
        "nameEn": "Bubble Nebula (NGC 7635)",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "恒星风吹出的发射星云",
        "distanceLy": 7100,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "气泡星云是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 117,
            "bDeg": 0
        }
    },
    {
        "id": "crescent-nebula",
        "name": "新月星云",
        "nameEn": "Crescent Nebula (NGC 6888)",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "沃尔夫—瑞叶星云",
        "distanceLy": 4700,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "新月星云是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 76,
            "bDeg": 1
        }
    },
    {
        "id": "thors-helmet",
        "name": "托尔头盔星云",
        "nameEn": "Thor’s Helmet (NGC 2359)",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "沃尔夫—瑞叶气泡星云",
        "distanceLy": 12000,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "托尔头盔星云是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 224,
            "bDeg": -2
        }
    },
    {
        "id": "medusa-nebula",
        "name": "水母星云",
        "nameEn": "Medusa Nebula (Abell 21)",
        "atlasMap": "milky-way",
        "category": "nebula",
        "type": "行星状星云",
        "distanceLy": 5000,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "水母星云是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 205,
            "bDeg": 12
        }
    },
    {
        "id": "canes-venatici-i",
        "name": "猎犬座 I",
        "nameEn": "Canes Venatici I",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "银河系矮椭球卫星",
        "distanceLy": 710000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "猎犬座 I是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 74,
            "bDeg": 80
        }
    },
    {
        "id": "canes-venatici-ii",
        "name": "猎犬座 II",
        "nameEn": "Canes Venatici II",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 520000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "猎犬座 II是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 113,
            "bDeg": 83
        }
    },
    {
        "id": "coma-berenices-dwarf",
        "name": "后发座矮星系",
        "nameEn": "Coma Berenices Dwarf",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 144000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "后发座矮星系是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 242,
            "bDeg": 84
        }
    },
    {
        "id": "hercules-dwarf",
        "name": "武仙座矮星系",
        "nameEn": "Hercules Dwarf Galaxy",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 430000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "武仙座矮星系是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 28,
            "bDeg": 37
        }
    },
    {
        "id": "segue-1",
        "name": "赛格 1",
        "nameEn": "Segue 1",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "极暗矮星系",
        "distanceLy": 75000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "赛格 1是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 221,
            "bDeg": 50
        }
    },
    {
        "id": "messier-99",
        "name": "M99",
        "nameEn": "Messier 99",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "不对称旋涡星系",
        "distanceLy": 55000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "M99位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 286,
            "bDeg": 76
        }
    },
    {
        "id": "messier-100",
        "name": "M100",
        "nameEn": "Messier 100",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "大设计旋涡星系",
        "distanceLy": 55000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "M100位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 283,
            "bDeg": 74
        }
    },
    {
        "id": "messier-108",
        "name": "M108 冲浪板星系",
        "nameEn": "Messier 108",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "侧向棒旋星系",
        "distanceLy": 46000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "M108 冲浪板星系位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 142,
            "bDeg": 61
        }
    },
    {
        "id": "ngc-1055",
        "name": "NGC 1055",
        "nameEn": "NGC 1055",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "侧向旋涡星系",
        "distanceLy": 52000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 1055位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 172,
            "bDeg": -51
        }
    },
    {
        "id": "ngc-1365",
        "name": "NGC 1365",
        "nameEn": "NGC 1365",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "大棒旋星系",
        "distanceLy": 56000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 1365位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 238,
            "bDeg": -54
        }
    },
    {
        "id": "gliese-569",
        "name": "格利泽 569",
        "nameEn": "Gliese 569",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "红矮星与棕矮星伴星系统",
        "distanceLy": 32,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "格利泽 569位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 87,
            "bDeg": 55
        }
    },
    {
        "id": "gliese-445",
        "name": "格利泽 445",
        "nameEn": "Gliese 445",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "高速近邻红矮星",
        "distanceLy": 17,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "格利泽 445位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 134,
            "bDeg": 3
        }
    },
    {
        "id": "gliese-412",
        "name": "格利泽 412",
        "nameEn": "Gliese 412",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "宽双星红矮星系统",
        "distanceLy": 16,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "格利泽 412位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 154,
            "bDeg": 63
        }
    },
    {
        "id": "61-virginis",
        "name": "室女座 61",
        "nameEn": "61 Virginis",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻 G 型多行星系统",
        "distanceLy": 27,
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "室女座 61位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 303,
            "bDeg": 64
        }
    },
    {
        "id": "70-ophiuchi",
        "name": "蛇夫座 70",
        "nameEn": "70 Ophiuchi",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻 K 型双星",
        "distanceLy": 17,
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "蛇夫座 70位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 29,
            "bDeg": 12
        }
    },
    {
        "id": "ngc-2264",
        "name": "NGC 2264 圣诞树星团",
        "nameEn": "NGC 2264",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "年轻疏散星团与星云复合体",
        "distanceLy": 2500,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "NGC 2264 圣诞树星团是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 202,
            "bDeg": 2
        }
    },
    {
        "id": "messier-36",
        "name": "M36",
        "nameEn": "Messier 36",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "御夫座疏散星团",
        "distanceLy": 4100,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M36是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 174,
            "bDeg": 0
        }
    },
    {
        "id": "messier-38",
        "name": "M38",
        "nameEn": "Messier 38",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "御夫座疏散星团",
        "distanceLy": 4200,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M38是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 172,
            "bDeg": 1
        }
    },
    {
        "id": "messier-46",
        "name": "M46",
        "nameEn": "Messier 46",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "船尾座疏散星团",
        "distanceLy": 5400,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M46是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 231,
            "bDeg": -1
        }
    },
    {
        "id": "messier-47",
        "name": "M47",
        "nameEn": "Messier 47",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "年轻疏散星团",
        "distanceLy": 1600,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M47是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 231,
            "bDeg": -4
        }
    },
    {
        "id": "segue-2",
        "name": "赛格 2",
        "nameEn": "Segue 2",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 114000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "赛格 2是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 149,
            "bDeg": -38
        }
    },
    {
        "id": "ursa-major-i",
        "name": "大熊座 I",
        "nameEn": "Ursa Major I",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 330000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "大熊座 I是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 159,
            "bDeg": 54
        }
    },
    {
        "id": "ursa-major-ii",
        "name": "大熊座 II",
        "nameEn": "Ursa Major II",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 100000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "大熊座 II是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 152,
            "bDeg": 38
        }
    },
    {
        "id": "willman-1",
        "name": "威尔曼 1",
        "nameEn": "Willman 1",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "极暗矮星系",
        "distanceLy": 120000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "威尔曼 1是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 158,
            "bDeg": 57
        }
    },
    {
        "id": "crater-ii",
        "name": "巨爵座 II",
        "nameEn": "Crater II",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "扩展型矮星系",
        "distanceLy": 390000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "巨爵座 II是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 282,
            "bDeg": 42
        }
    },
    {
        "id": "ngc-1399",
        "name": "NGC 1399",
        "nameEn": "NGC 1399",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "天炉座星系团中心椭圆星系",
        "distanceLy": 65000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 1399位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 236,
            "bDeg": -54
        }
    },
    {
        "id": "ngc-1512",
        "name": "NGC 1512",
        "nameEn": "NGC 1512",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "环状棒旋星系",
        "distanceLy": 38000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 1512位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 270,
            "bDeg": -48
        }
    },
    {
        "id": "ngc-1566",
        "name": "NGC 1566",
        "nameEn": "NGC 1566",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "大设计旋涡星系",
        "distanceLy": 60000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 1566位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 253,
            "bDeg": -49
        }
    },
    {
        "id": "ngc-1672",
        "name": "NGC 1672",
        "nameEn": "NGC 1672",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "棒旋与核环星系",
        "distanceLy": 60000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 1672位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 277,
            "bDeg": -30
        }
    },
    {
        "id": "ngc-1808",
        "name": "NGC 1808",
        "nameEn": "NGC 1808",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "恒星暴发棒旋星系",
        "distanceLy": 40000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 1808位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 276,
            "bDeg": -16
        }
    },
    {
        "id": "36-ophiuchi",
        "name": "蛇夫座 36",
        "nameEn": "36 Ophiuchi",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻 K 型三合星系统",
        "distanceLy": 19,
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "蛇夫座 36位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 358,
            "bDeg": -10
        }
    },
    {
        "id": "40-eridani-a",
        "name": "波江座 40 A",
        "nameEn": "40 Eridani A",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻 K 型主序星",
        "distanceLy": 16,
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "波江座 40 A位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 200,
            "bDeg": -39
        }
    },
    {
        "id": "gliese-22",
        "name": "格利泽 22",
        "nameEn": "Gliese 22",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻红矮星多星系统",
        "distanceLy": 33,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "格利泽 22位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 126,
            "bDeg": -47
        }
    },
    {
        "id": "gliese-86",
        "name": "格利泽 86",
        "nameEn": "Gliese 86",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "行星宿主 K 型恒星",
        "distanceLy": 35,
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "格利泽 86位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 280,
            "bDeg": -49
        }
    },
    {
        "id": "51-pegasi",
        "name": "飞马座 51",
        "nameEn": "51 Pegasi",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "首批热木星宿主恒星",
        "distanceLy": 51,
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "飞马座 51位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 91,
            "bDeg": -34
        }
    },
    {
        "id": "messier-48",
        "name": "M48",
        "nameEn": "Messier 48",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "长蛇座疏散星团",
        "distanceLy": 1500,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M48是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 227,
            "bDeg": -2
        }
    },
    {
        "id": "messier-50",
        "name": "M50",
        "nameEn": "Messier 50",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "麒麟座疏散星团",
        "distanceLy": 3200,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M50是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 226,
            "bDeg": -2
        }
    },
    {
        "id": "messier-52",
        "name": "M52",
        "nameEn": "Messier 52",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "仙后座疏散星团",
        "distanceLy": 4600,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M52是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 112,
            "bDeg": 0
        }
    },
    {
        "id": "messier-67",
        "name": "M67",
        "nameEn": "Messier 67",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "老年疏散星团",
        "distanceLy": 2700,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M67是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 216,
            "bDeg": 32
        }
    },
    {
        "id": "messier-93",
        "name": "M93",
        "nameEn": "Messier 93",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "船尾座疏散星团",
        "distanceLy": 3600,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M93是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 248,
            "bDeg": -7
        }
    },
    {
        "id": "reticulum-ii",
        "name": "网罟座 II",
        "nameEn": "Reticulum II",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 105000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "网罟座 II是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 266,
            "bDeg": -49
        }
    },
    {
        "id": "horologium-i",
        "name": "时钟座 I",
        "nameEn": "Horologium I",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 260000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "时钟座 I是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 271,
            "bDeg": -54
        }
    },
    {
        "id": "eridanus-ii",
        "name": "波江座 II",
        "nameEn": "Eridanus II",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "孤立超微弱矮星系",
        "distanceLy": 1200000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "波江座 II是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 249,
            "bDeg": -52
        }
    },
    {
        "id": "hydrus-i",
        "name": "水蛇座 I",
        "nameEn": "Hydrus I",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 90000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "水蛇座 I是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 291,
            "bDeg": -34
        }
    },
    {
        "id": "triangulum-ii",
        "name": "三角座 II",
        "nameEn": "Triangulum II",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "超微弱矮星系",
        "distanceLy": 100000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "三角座 II是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 141,
            "bDeg": -24
        }
    },
    {
        "id": "ngc-2146",
        "name": "NGC 2146",
        "nameEn": "NGC 2146",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "相互作用恒星暴发星系",
        "distanceLy": 70000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 2146位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 160,
            "bDeg": 11
        }
    },
    {
        "id": "ngc-2683",
        "name": "NGC 2683",
        "nameEn": "NGC 2683",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "侧向旋涡星系",
        "distanceLy": 30000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 2683位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 240,
            "bDeg": 30
        }
    },
    {
        "id": "ngc-2997",
        "name": "NGC 2997",
        "nameEn": "NGC 2997",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "南天旋涡星系",
        "distanceLy": 40000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 2997位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 254,
            "bDeg": -32
        }
    },
    {
        "id": "ngc-3077",
        "name": "NGC 3077",
        "nameEn": "NGC 3077",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "M81 星系群相互作用成员",
        "distanceLy": 12000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 3077位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 142,
            "bDeg": 40
        }
    },
    {
        "id": "ngc-3521",
        "name": "NGC 3521",
        "nameEn": "NGC 3521",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "尘埃丰富旋涡星系",
        "distanceLy": 35000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 3521位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 232,
            "bDeg": 57
        }
    },
    {
        "id": "47-ursa-majoris",
        "name": "大熊座 47",
        "nameEn": "47 Ursae Majoris",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "多行星 G 型恒星系统",
        "distanceLy": 46,
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "大熊座 47位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 155,
            "bDeg": 59
        }
    },
    {
        "id": "rho-coronae-borealis",
        "name": "北冕座ρ",
        "nameEn": "Rho Coronae Borealis",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "近邻行星宿主恒星",
        "distanceLy": 57,
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "北冕座ρ位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 41,
            "bDeg": 48
        }
    },
    {
        "id": "gj-1214",
        "name": "格利泽 1214",
        "nameEn": "GJ 1214",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "超级地球宿主红矮星",
        "distanceLy": 48,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "格利泽 1214位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 29,
            "bDeg": 66
        }
    },
    {
        "id": "gliese-849",
        "name": "格利泽 849",
        "nameEn": "Gliese 849",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "长周期巨行星宿主红矮星",
        "distanceLy": 29,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "格利泽 849位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 300,
            "bDeg": 10
        }
    },
    {
        "id": "hd-260655",
        "name": "HD 260655",
        "nameEn": "HD 260655",
        "atlasMap": "neighborhood",
        "category": "nearby-star",
        "type": "双岩质行星宿主红矮星",
        "distanceLy": 33,
        "effectType": "red-dwarf",
        "color": 16765120,
        "size": 12,
        "temperature": "近邻恒星与行星系统",
        "feature": "HD 260655位于太阳邻域，用于比较近邻恒星、褐矮星及行星系统的空间分布。",
        "related": [
            {
                "title": "观测意义",
                "detail": "补充太阳附近低质量恒星、多星系统与行星宿主的样本。"
            }
        ],
        "galactic": {
            "lDeg": 219,
            "bDeg": 20
        }
    },
    {
        "id": "messier-4",
        "name": "M4",
        "nameEn": "Messier 4",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "天蝎座球状星团",
        "distanceLy": 7200,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M4是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 351,
            "bDeg": 15
        }
    },
    {
        "id": "messier-10",
        "name": "M10",
        "nameEn": "Messier 10",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "蛇夫座球状星团",
        "distanceLy": 14000,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M10是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 15,
            "bDeg": 23
        }
    },
    {
        "id": "messier-12",
        "name": "M12",
        "nameEn": "Messier 12",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "蛇夫座球状星团",
        "distanceLy": 16000,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M12是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 15,
            "bDeg": 26
        }
    },
    {
        "id": "messier-28",
        "name": "M28",
        "nameEn": "Messier 28",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "银心方向球状星团",
        "distanceLy": 18000,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M28是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 8,
            "bDeg": -5
        }
    },
    {
        "id": "messier-92",
        "name": "M92",
        "nameEn": "Messier 92",
        "atlasMap": "milky-way",
        "category": "deep-sky",
        "type": "古老球状星团",
        "distanceLy": 27000,
        "color": 11193599,
        "size": 22,
        "temperature": "星际介质、恒星演化与星团结构",
        "feature": "M92是银河系内的代表性深空目标，补强星云、星团与恒星演化遗迹的观测层次。",
        "related": [
            {
                "title": "银河地标",
                "detail": "用于补充银河盘面中的恒星形成区、星团和星际介质结构。"
            }
        ],
        "galactic": {
            "lDeg": 69,
            "bDeg": 35
        }
    },
    {
        "id": "andromeda-ix",
        "name": "仙女座 IX",
        "nameEn": "Andromeda IX",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "仙女座卫星矮椭球星系",
        "distanceLy": 2500000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "仙女座 IX是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 121,
            "bDeg": -22
        }
    },
    {
        "id": "andromeda-xi",
        "name": "仙女座 XI",
        "nameEn": "Andromeda XI",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "仙女座超微弱卫星星系",
        "distanceLy": 2500000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "仙女座 XI是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 122,
            "bDeg": -22
        }
    },
    {
        "id": "andromeda-xii",
        "name": "仙女座 XII",
        "nameEn": "Andromeda XII",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "仙女座矮椭球卫星星系",
        "distanceLy": 2500000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "仙女座 XII是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 120,
            "bDeg": -20
        }
    },
    {
        "id": "andromeda-xiii",
        "name": "仙女座 XIII",
        "nameEn": "Andromeda XIII",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "仙女座矮椭球卫星星系",
        "distanceLy": 2500000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "仙女座 XIII是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 123,
            "bDeg": -23
        }
    },
    {
        "id": "andromeda-xiv",
        "name": "仙女座 XIV",
        "nameEn": "Andromeda XIV",
        "atlasMap": "local-group",
        "category": "galaxy",
        "type": "仙女座矮椭球卫星星系",
        "distanceLy": 2500000,
        "color": 8433919,
        "size": 17,
        "temperature": "低表面亮度恒星族群",
        "feature": "仙女座 XIV是本星系群的低质量成员，可与银河系、仙女座星系的卫星系统进行对照。",
        "related": [
            {
                "title": "本星系群成员",
                "detail": "用于呈现卫星星系、超微弱矮星系与孤立矮星系的分布。"
            }
        ],
        "galactic": {
            "lDeg": 121,
            "bDeg": -24
        }
    },
    {
        "id": "antennae-galaxies",
        "name": "触角星系",
        "nameEn": "Antennae Galaxies (NGC 4038/4039)",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "相互作用星系对",
        "distanceLy": 45000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "触角星系位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 308,
            "bDeg": 42
        }
    },
    {
        "id": "ngc-4565",
        "name": "NGC 4565 针状星系",
        "nameEn": "NGC 4565",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "侧向旋涡星系",
        "distanceLy": 30000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 4565 针状星系位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 230,
            "bDeg": 86
        }
    },
    {
        "id": "ngc-4631",
        "name": "NGC 4631 鲸鱼星系",
        "nameEn": "NGC 4631",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "侧向相互作用旋涡星系",
        "distanceLy": 25000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 4631 鲸鱼星系位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 142,
            "bDeg": 84
        }
    },
    {
        "id": "ngc-4945",
        "name": "NGC 4945",
        "nameEn": "NGC 4945",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "侧向活动星系",
        "distanceLy": 13000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 4945位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 305,
            "bDeg": 13
        }
    },
    {
        "id": "ngc-5238",
        "name": "NGC 5238",
        "nameEn": "NGC 5238",
        "atlasMap": "cosmic-neighborhood",
        "category": "galaxy",
        "type": "近邻矮不规则星系",
        "distanceLy": 15000000,
        "color": 16762477,
        "size": 27,
        "temperature": "星系盘、核球与环境演化",
        "feature": "NGC 5238位于本星系群之外的近邻宇宙，扩充旋涡、活动核与相互作用星系的观测样本。",
        "related": [
            {
                "title": "近邻宇宙",
                "detail": "用于对照星系盘、尘埃、恒星形成和星系环境的差异。"
            }
        ],
        "galactic": {
            "lDeg": 307,
            "bDeg": 31
        }
    }
];


// 500 项目录里程碑：10 个小批次，每批为四层星图各补 5 个代表目标。
// 坐标使用各图层独立的均匀采样带，避免新增目标在压缩星图中重叠。
const ATLAS_EXPANSION_TO_500 = [
    {"id":"wise-0720-0846","name":"WISE 0720−0846","nameEn":"WISE 0720−0846","type":"T 型棕矮星双星","distanceLy":22,"atlasMap":"neighborhood","category":"stellar-object","effectType":"red-dwarf"},
    {"id":"wise-1541-2250","name":"WISE 1541−2250","nameEn":"WISE 1541−2250","type":"超冷 Y 型棕矮星","distanceLy":18,"atlasMap":"neighborhood","category":"stellar-object","effectType":"red-dwarf"},
    {"id":"wise-0350-5658","name":"WISE 0350−5658","nameEn":"WISE 0350−5658","type":"Y 型棕矮星","distanceLy":20,"atlasMap":"neighborhood","category":"stellar-object","effectType":"red-dwarf"},
    {"id":"2mass-0415-0935","name":"2MASS 0415−0935","nameEn":"2MASS J0415−0935","type":"T 型棕矮星","distanceLy":19,"atlasMap":"neighborhood","category":"stellar-object","effectType":"red-dwarf"},
    {"id":"2mass-0036-1821","name":"2MASS 0036+1821","nameEn":"2MASS J0036+1821","type":"L 型棕矮星","distanceLy":28,"atlasMap":"neighborhood","category":"stellar-object","effectType":"red-dwarf"},
    {"id":"ic-405","name":"火焰之星星云","nameEn":"Flaming Star Nebula (IC 405)","type":"反射与发射星云","distanceLy":1500,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ic-410","name":"蝌蚪星云","nameEn":"Tadpoles Nebula (IC 410)","type":"发射星云与年轻星团","distanceLy":12000,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ngc-281","name":"吃豆人星云","nameEn":"Pacman Nebula (NGC 281)","type":"发射星云与星团","distanceLy":9200,"atlasMap":"milky-way","category":"nebula"},
    {"id":"sh2-101","name":"郁金香星云","nameEn":"Tulip Nebula (Sh2-101)","type":"发射星云","distanceLy":6000,"atlasMap":"milky-way","category":"nebula"},
    {"id":"sh2-155","name":"洞穴星云","nameEn":"Cave Nebula (Sh2-155)","type":"发射星云","distanceLy":2400,"atlasMap":"milky-way","category":"nebula"},
    {"id":"antlia-ii","name":"蚁蜒座 II","nameEn":"Antlia II","type":"极扩散矮星系","distanceLy":430000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"aquarius-ii","name":"宝瓶座 II","nameEn":"Aquarius II","type":"超微弱矮星系","distanceLy":350000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"bootes-iii","name":"牧夫座 III","nameEn":"Boötes III","type":"潮汐扰动矮星系","distanceLy":150000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"centaurus-i","name":"半人马座 I","nameEn":"Centaurus I","type":"超微弱矮星系","distanceLy":380000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"cetus-ii","name":"鲸鱼座 II","nameEn":"Cetus II","type":"超微弱矮星系","distanceLy":100000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"messier-60","name":"M60","nameEn":"Messier 60","type":"室女座椭圆星系","distanceLy":55000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"messier-61","name":"M61","nameEn":"Messier 61","type":"室女座正面棒旋星系","distanceLy":53000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"messier-84","name":"M84","nameEn":"Messier 84","type":"室女座椭圆星系","distanceLy":55000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"messier-85","name":"M85","nameEn":"Messier 85","type":"透镜状星系","distanceLy":60000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"messier-86","name":"M86","nameEn":"Messier 86","type":"室女座椭圆星系","distanceLy":52000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"2mass-0559-1404","name":"2MASS 0559−1404","nameEn":"2MASS J0559−1404","type":"T 型棕矮星","distanceLy":18,"atlasMap":"neighborhood","category":"stellar-object","effectType":"red-dwarf"},
    {"id":"2mass-0939-2448","name":"2MASS 0939−2448","nameEn":"2MASS J0939−2448","type":"金属贫乏 T 型棕矮星","distanceLy":17,"atlasMap":"neighborhood","category":"stellar-object","effectType":"red-dwarf"},
    {"id":"2mass-1507-1627","name":"2MASS 1507−1627","nameEn":"2MASS J1507−1627","type":"L 型棕矮星","distanceLy":24,"atlasMap":"neighborhood","category":"stellar-object","effectType":"red-dwarf"},
    {"id":"2mass-1503-2525","name":"2MASS 1503+2525","nameEn":"2MASS J1503+2525","type":"L 型棕矮星","distanceLy":25,"atlasMap":"neighborhood","category":"stellar-object","effectType":"red-dwarf"},
    {"id":"2mass-1047-2124","name":"2MASS 1047+2124","nameEn":"2MASS J1047+2124","type":"射电 T 型棕矮星","distanceLy":35,"atlasMap":"neighborhood","category":"stellar-object","effectType":"red-dwarf"},
    {"id":"ngc-2467","name":"骷髅与十字星云","nameEn":"NGC 2467","type":"恒星形成复合体","distanceLy":13000,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ngc-3576","name":"自由女神星云","nameEn":"NGC 3576","type":"大质量恒星形成区","distanceLy":9000,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ngc-6188","name":"斗龙星云","nameEn":"NGC 6188","type":"大尺度发射星云","distanceLy":4000,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ngc-6357","name":"龙虾星云","nameEn":"Lobster Nebula (NGC 6357)","type":"恒星形成区","distanceLy":5500,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ngc-6334","name":"猫爪星云","nameEn":"Cat’s Paw Nebula (NGC 6334)","type":"发射星云","distanceLy":5500,"atlasMap":"milky-way","category":"nebula"},
    {"id":"columba-i","name":"天鸽座 I","nameEn":"Columba I","type":"超微弱矮星系","distanceLy":600000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"delve-1","name":"DElve 1","nameEn":"DElve 1","type":"超微弱矮星系","distanceLy":110000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"delve-2","name":"DElve 2","nameEn":"DElve 2","type":"超微弱矮星系","distanceLy":370000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"draco-ii","name":"天龙座 II","nameEn":"Draco II","type":"超微弱矮星系","distanceLy":70000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"grus-i","name":"天鹤座 I","nameEn":"Grus I","type":"超微弱矮星系","distanceLy":400000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"messier-88","name":"M88","nameEn":"Messier 88","type":"大设计旋涡星系","distanceLy":54000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"messier-89","name":"M89","nameEn":"Messier 89","type":"近圆形椭圆星系","distanceLy":55000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"messier-90","name":"M90","nameEn":"Messier 90","type":"室女座旋涡星系","distanceLy":60000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"messier-91","name":"M91","nameEn":"Messier 91","type":"棒旋星系","distanceLy":52000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"messier-102","name":"M102 纺锤星系","nameEn":"Messier 102 (NGC 5866)","type":"透镜状星系","distanceLy":44000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"gliese-54","name":"格利泽 54","nameEn":"Gliese 54","type":"近邻红矮星","distanceLy":30,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-166-c","name":"格利泽 166 C","nameEn":"Gliese 166 C","type":"近邻红矮星","distanceLy":17,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-2066","name":"格利泽 2066","nameEn":"Gliese 2066","type":"近邻红矮星系统","distanceLy":25,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-3020","name":"格利泽 3020","nameEn":"Gliese 3020","type":"近邻红矮星","distanceLy":31,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-3305","name":"格利泽 3305","nameEn":"Gliese 3305","type":"红矮星双星系统","distanceLy":29,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"ngc-6559","name":"NGC 6559","nameEn":"NGC 6559","type":"暗星云、反射星云与发射星云复合体","distanceLy":5000,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ngc-6604","name":"NGC 6604","nameEn":"NGC 6604","type":"人马座疏散星团","distanceLy":5500,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"ngc-6820","name":"NGC 6820","nameEn":"NGC 6820","type":"天鹰座发射星云","distanceLy":6000,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ngc-7380","name":"巫师星云","nameEn":"Wizard Nebula (NGC 7380)","type":"疏散星团与发射星云","distanceLy":7000,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ic-1795","name":"鱼头星云","nameEn":"Fishhead Nebula (IC 1795)","type":"发射星云","distanceLy":6000,"atlasMap":"milky-way","category":"nebula"},
    {"id":"grus-ii","name":"天鹤座 II","nameEn":"Grus II","type":"超微弱矮星系","distanceLy":180000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"hydra-ii","name":"长蛇座 II","nameEn":"Hydra II","type":"超微弱矮星系","distanceLy":440000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"indus-i","name":"印第安座 I","nameEn":"Indus I","type":"超微弱矮星系","distanceLy":230000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"leo-iv","name":"狮子座 IV","nameEn":"Leo IV","type":"超微弱矮星系","distanceLy":500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"leo-v","name":"狮子座 V","nameEn":"Leo V","type":"超微弱矮星系","distanceLy":580000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"messier-105","name":"M105","nameEn":"Messier 105","type":"狮子座 I 星系群椭圆星系","distanceLy":35000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"messier-109","name":"M109","nameEn":"Messier 109","type":"棒旋星系","distanceLy":67000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-1023","name":"NGC 1023","nameEn":"NGC 1023","type":"透镜状星系与卫星群","distanceLy":36000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-1275","name":"NGC 1275","nameEn":"NGC 1275","type":"英仙座星系团中心活动星系","distanceLy":240000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-1386","name":"NGC 1386","nameEn":"NGC 1386","type":"活动核透镜状星系","distanceLy":53000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"gliese-3379","name":"格利泽 3379","nameEn":"Gliese 3379","type":"近邻红矮星","distanceLy":18,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-380","name":"格利泽 380","nameEn":"Gliese 380","type":"耀斑红矮星","distanceLy":15,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-388","name":"格利泽 388","nameEn":"Gliese 388 (AD Leonis)","type":"耀斑红矮星","distanceLy":16,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-436","name":"格利泽 436","nameEn":"Gliese 436","type":"热海王星宿主红矮星","distanceLy":33,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-480","name":"格利泽 480","nameEn":"Gliese 480","type":"近邻红矮星","distanceLy":46,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"sh2-132","name":"狮子星云","nameEn":"Lion Nebula (Sh2-132)","type":"发射星云","distanceLy":10000,"atlasMap":"milky-way","category":"nebula"},
    {"id":"sh2-157","name":"龙虾钳星云","nameEn":"Lobster Claw Nebula (Sh2-157)","type":"发射星云","distanceLy":7000,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ngc-6543","name":"猫眼星云","nameEn":"Cat’s Eye Nebula (NGC 6543)","type":"行星状星云","distanceLy":3300,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ngc-7662","name":"蓝雪球星云","nameEn":"Blue Snowball Nebula (NGC 7662)","type":"行星状星云","distanceLy":2500,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ngc-2392","name":"爱斯基摩星云","nameEn":"Eskimo Nebula (NGC 2392)","type":"行星状星云","distanceLy":2900,"atlasMap":"milky-way","category":"nebula"},
    {"id":"pegasus-iii","name":"飞马座 III","nameEn":"Pegasus III","type":"超微弱矮星系","distanceLy":700000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"phoenix-ii","name":"凤凰座 II","nameEn":"Phoenix II","type":"超微弱矮星系","distanceLy":260000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"pictor-i","name":"绘架座 I","nameEn":"Pictor I","type":"超微弱矮星系","distanceLy":370000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"pisces-ii","name":"双鱼座 II","nameEn":"Pisces II","type":"超微弱矮星系","distanceLy":600000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"reticulum-iii","name":"网罟座 III","nameEn":"Reticulum III","type":"超微弱矮星系","distanceLy":300000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"ngc-1404","name":"NGC 1404","nameEn":"NGC 1404","type":"天炉座星系团椭圆星系","distanceLy":65000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-1427","name":"NGC 1427","nameEn":"NGC 1427","type":"天炉座星系团椭圆星系","distanceLy":65000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-1448","name":"NGC 1448","nameEn":"NGC 1448","type":"近邻旋涡星系","distanceLy":56000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-1553","name":"NGC 1553","nameEn":"NGC 1553","type":"透镜状星系","distanceLy":60000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-1961","name":"NGC 1961","nameEn":"NGC 1961","type":"大质量旋涡星系","distanceLy":180000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"gliese-514","name":"格利泽 514","nameEn":"Gliese 514","type":"多行星候选红矮星","distanceLy":25,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-617-a","name":"格利泽 617 A","nameEn":"Gliese 617 A","type":"近邻红矮星","distanceLy":34,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-649","name":"格利泽 649","nameEn":"Gliese 649","type":"巨行星宿主红矮星","distanceLy":34,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-674","name":"格利泽 674","nameEn":"Gliese 674","type":"近邻行星宿主红矮星","distanceLy":15,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-687","name":"格利泽 687","nameEn":"Gliese 687","type":"超级地球宿主红矮星","distanceLy":15,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"messier-76","name":"M76 小哑铃星云","nameEn":"Messier 76","type":"行星状星云","distanceLy":2500,"atlasMap":"milky-way","category":"nebula"},
    {"id":"messier-97","name":"M97 猫头鹰星云","nameEn":"Messier 97","type":"行星状星云","distanceLy":2600,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ngc-3242","name":"木星幽灵星云","nameEn":"Ghost of Jupiter (NGC 3242)","type":"行星状星云","distanceLy":1400,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ngc-3132","name":"南环星云","nameEn":"Southern Ring Nebula (NGC 3132)","type":"行星状星云","distanceLy":2500,"atlasMap":"milky-way","category":"nebula"},
    {"id":"ngc-2022","name":"NGC 2022","nameEn":"NGC 2022","type":"行星状星云","distanceLy":8000,"atlasMap":"milky-way","category":"nebula"},
    {"id":"sagittarius-ii","name":"人马座 II","nameEn":"Sagittarius II","type":"超微弱矮星系","distanceLy":220000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"sculptor-ii","name":"玉夫座 II","nameEn":"Sculptor II","type":"超微弱矮星系","distanceLy":280000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"tucana-ii","name":"杜鹃座 II","nameEn":"Tucana II","type":"超微弱矮星系","distanceLy":190000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"tucana-iii","name":"杜鹃座 III","nameEn":"Tucana III","type":"潮汐受扰超微弱矮星系","distanceLy":70000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"tucana-iv","name":"杜鹃座 IV","nameEn":"Tucana IV","type":"超微弱矮星系","distanceLy":160000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"ngc-2276","name":"NGC 2276","nameEn":"NGC 2276","type":"相互作用旋涡星系","distanceLy":120000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-2537","name":"NGC 2537 熊掌星系","nameEn":"NGC 2537","type":"矮不规则星系","distanceLy":23000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-2787","name":"NGC 2787","nameEn":"NGC 2787","type":"核环透镜状星系","distanceLy":24000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-2976","name":"NGC 2976","nameEn":"NGC 2976","type":"M81 星系群矮旋涡星系","distanceLy":12000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-3184","name":"NGC 3184","nameEn":"NGC 3184","type":"正面旋涡星系","distanceLy":40000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"gliese-710","name":"格利泽 710","nameEn":"Gliese 710","type":"未来近距离掠过太阳的恒星","distanceLy":63,"atlasMap":"neighborhood","category":"nearby-star"},
    {"id":"gliese-682","name":"格利泽 682","nameEn":"Gliese 682","type":"近邻红矮星","distanceLy":17,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-686","name":"格利泽 686","nameEn":"Gliese 686","type":"行星宿主红矮星","distanceLy":27,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-725-a","name":"格利泽 725 A","nameEn":"Gliese 725 A","type":"近邻红矮星双星成员","distanceLy":11,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-725-b","name":"格利泽 725 B","nameEn":"Gliese 725 B","type":"近邻红矮星双星成员","distanceLy":11,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"messier-23","name":"M23","nameEn":"Messier 23","type":"人马座疏散星团","distanceLy":2200,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-25","name":"M25","nameEn":"Messier 25","type":"人马座疏散星团","distanceLy":2000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-26","name":"M26","nameEn":"Messier 26","type":"盾牌座疏散星团","distanceLy":5000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-29","name":"M29","nameEn":"Messier 29","type":"天鹅座疏散星团","distanceLy":4000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-34","name":"M34","nameEn":"Messier 34","type":"英仙座疏散星团","distanceLy":1500,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"tucana-v","name":"杜鹃座 V","nameEn":"Tucana V","type":"超微弱矮星系","distanceLy":180000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"virgo-i","name":"室女座 I","nameEn":"Virgo I","type":"超微弱矮星系","distanceLy":280000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"virgo-ii","name":"室女座 II","nameEn":"Virgo II","type":"超微弱矮星系","distanceLy":550000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"horologium-ii","name":"时钟座 II","nameEn":"Horologium II","type":"超微弱矮星系","distanceLy":250000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"cassiopeia-ii","name":"仙后座 II","nameEn":"Cassiopeia II","type":"仙女座卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"ngc-3198","name":"NGC 3198","nameEn":"NGC 3198","type":"暗物质旋转曲线代表星系","distanceLy":46000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-3310","name":"NGC 3310","nameEn":"NGC 3310","type":"恒星暴发旋涡星系","distanceLy":50000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-3344","name":"NGC 3344","nameEn":"NGC 3344","type":"正面旋涡星系","distanceLy":22000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-3370","name":"NGC 3370","nameEn":"NGC 3370","type":"超新星距离标尺旋涡星系","distanceLy":100000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-3377","name":"NGC 3377","nameEn":"NGC 3377","type":"狮子座 I 星系群椭圆星系","distanceLy":35000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"gliese-740","name":"格利泽 740","nameEn":"Gliese 740","type":"近邻红矮星","distanceLy":37,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-754","name":"格利泽 754","nameEn":"Gliese 754","type":"近邻红矮星","distanceLy":19,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-784","name":"格利泽 784","nameEn":"Gliese 784","type":"近邻红矮星","distanceLy":22,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-785","name":"格利泽 785","nameEn":"Gliese 785","type":"近邻红矮星","distanceLy":26,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"gliese-905","name":"格利泽 905","nameEn":"Gliese 905","type":"近邻红矮星","distanceLy":18,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"messier-39","name":"M39","nameEn":"Messier 39","type":"天鹅座疏散星团","distanceLy":800,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-103","name":"M103","nameEn":"Messier 103","type":"仙后座疏散星团","distanceLy":8500,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"ngc-457","name":"NGC 457 ET 星团","nameEn":"NGC 457","type":"仙后座疏散星团","distanceLy":8000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"ngc-663","name":"NGC 663","nameEn":"NGC 663","type":"仙后座疏散星团","distanceLy":7000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"ngc-7789","name":"NGC 7789 白玫瑰星团","nameEn":"NGC 7789","type":"老年疏散星团","distanceLy":8000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"cassiopeia-iii","name":"仙后座 III","nameEn":"Cassiopeia III","type":"仙女座卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"lacerta-i","name":"蝎虎座 I","nameEn":"Lacerta I","type":"仙女座外围矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xv","name":"仙女座 XV","nameEn":"Andromeda XV","type":"仙女座卫星矮椭球星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xvi","name":"仙女座 XVI","nameEn":"Andromeda XVI","type":"仙女座卫星矮椭球星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xvii","name":"仙女座 XVII","nameEn":"Andromeda XVII","type":"仙女座卫星矮椭球星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"ngc-3384","name":"NGC 3384","nameEn":"NGC 3384","type":"狮子座 I 星系群透镜状星系","distanceLy":35000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-3486","name":"NGC 3486","nameEn":"NGC 3486","type":"低亮度旋涡星系","distanceLy":28000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-3556","name":"NGC 3556","nameEn":"NGC 3556","type":"侧向旋涡星系","distanceLy":40000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-3593","name":"NGC 3593","nameEn":"NGC 3593","type":"反向旋转盘星系","distanceLy":20000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-3621","name":"NGC 3621","nameEn":"NGC 3621","type":"无核球旋涡星系","distanceLy":22000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"gliese-908","name":"格利泽 908","nameEn":"Gliese 908","type":"近邻红矮星","distanceLy":17,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"ltt-1445-a","name":"LTT 1445 A","nameEn":"LTT 1445 A","type":"多岩质行星宿主红矮星","distanceLy":22,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"ltt-3780","name":"LTT 3780","nameEn":"LTT 3780","type":"双行星宿主红矮星","distanceLy":72,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"ltt-9779","name":"LTT 9779","nameEn":"LTT 9779","type":"超热海王星宿主恒星","distanceLy":260,"atlasMap":"neighborhood","category":"nearby-star"},
    {"id":"toi-1231","name":"TOI-1231","nameEn":"TOI-1231","type":"温暖海王星宿主红矮星","distanceLy":90,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"messier-9","name":"M9","nameEn":"Messier 9","type":"蛇夫座球状星团","distanceLy":26000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-14","name":"M14","nameEn":"Messier 14","type":"蛇夫座球状星团","distanceLy":30000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-19","name":"M19","nameEn":"Messier 19","type":"蛇夫座球状星团","distanceLy":28000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-30","name":"M30","nameEn":"Messier 30","type":"摩羯座球状星团","distanceLy":41000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-53","name":"M53","nameEn":"Messier 53","type":"后发座球状星团","distanceLy":58000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"andromeda-xviii","name":"仙女座 XVIII","nameEn":"Andromeda XVIII","type":"仙女座外围矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xix","name":"仙女座 XIX","nameEn":"Andromeda XIX","type":"超扩散卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xx","name":"仙女座 XX","nameEn":"Andromeda XX","type":"仙女座卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xxi","name":"仙女座 XXI","nameEn":"Andromeda XXI","type":"仙女座卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xxii","name":"仙女座 XXII","nameEn":"Andromeda XXII","type":"仙女座卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"ngc-3810","name":"NGC 3810","nameEn":"NGC 3810","type":"正面旋涡星系","distanceLy":50000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-3953","name":"NGC 3953","nameEn":"NGC 3953","type":"大设计棒旋星系","distanceLy":55000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-4013","name":"NGC 4013","nameEn":"NGC 4013","type":"侧向翘曲盘旋涡星系","distanceLy":55000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-4088","name":"NGC 4088","nameEn":"NGC 4088","type":"M109 星系群旋涡星系","distanceLy":55000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-4214","name":"NGC 4214","nameEn":"NGC 4214","type":"近邻恒星暴发矮星系","distanceLy":10000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"toi-1695","name":"TOI-1695","nameEn":"TOI-1695","type":"低质量行星宿主红矮星","distanceLy":145,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"toi-1749","name":"TOI-1749","nameEn":"TOI-1749","type":"多行星红矮星系统","distanceLy":325,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"toi-1759","name":"TOI-1759","nameEn":"TOI-1759","type":"温暖超级地球宿主红矮星","distanceLy":110,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"toi-2095","name":"TOI-2095","nameEn":"TOI-2095","type":"多行星红矮星系统","distanceLy":135,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"toi-2136","name":"TOI-2136","nameEn":"TOI-2136","type":"温暖亚海王星宿主恒星","distanceLy":110,"atlasMap":"neighborhood","category":"nearby-star"},
    {"id":"messier-54","name":"M54","nameEn":"Messier 54","type":"人马座矮星系核心球状星团","distanceLy":87000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-55","name":"M55","nameEn":"Messier 55","type":"人马座球状星团","distanceLy":18000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-56","name":"M56","nameEn":"Messier 56","type":"天琴座球状星团","distanceLy":33000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-62","name":"M62","nameEn":"Messier 62","type":"蛇夫座球状星团","distanceLy":22000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-68","name":"M68","nameEn":"Messier 68","type":"长蛇座球状星团","distanceLy":33000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"andromeda-xxiii","name":"仙女座 XXIII","nameEn":"Andromeda XXIII","type":"仙女座卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xxiv","name":"仙女座 XXIV","nameEn":"Andromeda XXIV","type":"仙女座卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xxv","name":"仙女座 XXV","nameEn":"Andromeda XXV","type":"仙女座卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xxvi","name":"仙女座 XXVI","nameEn":"Andromeda XXVI","type":"仙女座卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xxvii","name":"仙女座 XXVII","nameEn":"Andromeda XXVII","type":"受潮汐扰动的卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"ngc-4236","name":"NGC 4236","nameEn":"NGC 4236","type":"低表面亮度棒旋星系","distanceLy":14000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-4278","name":"NGC 4278","nameEn":"NGC 4278","type":"活动核椭圆星系","distanceLy":50000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-4303","name":"NGC 4303","nameEn":"NGC 4303","type":"室女座棒旋星系","distanceLy":55000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-4314","name":"NGC 4314","nameEn":"NGC 4314","type":"核环棒旋星系","distanceLy":40000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-4388","name":"NGC 4388","nameEn":"NGC 4388","type":"室女座活动旋涡星系","distanceLy":55000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"toi-2285","name":"TOI-2285","nameEn":"TOI-2285","type":"温暖超级地球宿主红矮星","distanceLy":150,"atlasMap":"neighborhood","category":"nearby-star","effectType":"red-dwarf"},
    {"id":"hd-97658","name":"HD 97658","nameEn":"HD 97658","type":"超级地球宿主 K 型恒星","distanceLy":70,"atlasMap":"neighborhood","category":"nearby-star"},
    {"id":"hd-3167","name":"HD 3167","nameEn":"HD 3167","type":"紧凑多行星系统","distanceLy":150,"atlasMap":"neighborhood","category":"nearby-star"},
    {"id":"hd-15337","name":"HD 15337","nameEn":"HD 15337","type":"双行星宿主恒星","distanceLy":145,"atlasMap":"neighborhood","category":"nearby-star"},
    {"id":"pi-mensae","name":"山案座π","nameEn":"Pi Mensae","type":"巨行星与超级地球宿主恒星","distanceLy":60,"atlasMap":"neighborhood","category":"nearby-star"},
    {"id":"messier-69","name":"M69","nameEn":"Messier 69","type":"人马座球状星团","distanceLy":29000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-70","name":"M70","nameEn":"Messier 70","type":"人马座球状星团","distanceLy":29000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-71","name":"M71","nameEn":"Messier 71","type":"天箭座球状星团","distanceLy":12000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-79","name":"M79","nameEn":"Messier 79","type":"天兔座球状星团","distanceLy":41000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"messier-80","name":"M80","nameEn":"Messier 80","type":"天蝎座球状星团","distanceLy":33000,"atlasMap":"milky-way","category":"deep-sky"},
    {"id":"andromeda-xxviii","name":"仙女座 XXVIII","nameEn":"Andromeda XXVIII","type":"仙女座外围矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xxix","name":"仙女座 XXIX","nameEn":"Andromeda XXIX","type":"仙女座卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xxx","name":"仙女座 XXX","nameEn":"Andromeda XXX","type":"仙女座卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xxxii","name":"仙女座 XXXII","nameEn":"Andromeda XXXII","type":"仙女座卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"andromeda-xxxiii","name":"仙女座 XXXIII","nameEn":"Andromeda XXXIII","type":"仙女座卫星矮星系","distanceLy":2500000,"atlasMap":"local-group","category":"galaxy"},
    {"id":"ngc-4438","name":"NGC 4438","nameEn":"NGC 4438","type":"受环境扰动的星系","distanceLy":55000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-4449","name":"NGC 4449","nameEn":"NGC 4449","type":"恒星暴发矮不规则星系","distanceLy":12000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-4490","name":"NGC 4490 茧状星系","nameEn":"NGC 4490","type":"相互作用旋涡星系","distanceLy":30000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-4526","name":"NGC 4526","nameEn":"NGC 4526","type":"透镜状星系","distanceLy":55000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"},
    {"id":"ngc-4559","name":"NGC 4559","nameEn":"NGC 4559","type":"大盘旋涡星系","distanceLy":30000000,"atlasMap":"cosmic-neighborhood","category":"galaxy"}
];

const ATLAS_EXPANSION_TO_500_PROFILES = {
    neighborhood: {
        color: 0xff765c,
        size: 8,
        temperature: '近邻恒星、褐矮星与系外行星系统',
        related: {
            title: '太阳邻域',
            detail: '用于补充太阳附近的低质量恒星、褐矮星和行星宿主样本。'
        },
        coordinate: { lStart: 13, lStep: 47, latitudes: [-64, -42, -28, -15, -5, 8, 21, 35, 50, 65] }
    },
    'milky-way': {
        color: 0xa9c6ff,
        size: 19,
        temperature: '星际介质、恒星形成与星团演化',
        related: {
            title: '银河地标',
            detail: '用于补充银河盘面中的星云、星团、行星状星云与恒星演化遗迹。'
        },
        coordinate: { lStart: 17, lStep: 31, latitudes: [-8, -5, -3, -1, 0, 1, 3, 5, 8] }
    },
    'local-group': {
        color: 0x7ebdff,
        size: 18,
        temperature: '低表面亮度恒星族群与卫星星系演化',
        related: {
            title: '本星系群成员',
            detail: '用于呈现银河系、仙女座及其周边的卫星和超微弱矮星系。'
        },
        coordinate: { lStart: 72, lStep: 47, latitudes: [-55, -38, -25, -15, -5, 5, 15, 25, 38, 55] }
    },
    'cosmic-neighborhood': {
        color: 0xffc27d,
        size: 24,
        temperature: '星系盘、活动核与星系环境演化',
        related: {
            title: '近邻宇宙',
            detail: '用于对照旋涡、椭圆、透镜状、相互作用与恒星暴发星系。'
        },
        coordinate: { lStart: 141, lStep: 53, latitudes: [-70, -52, -37, -25, -13, 0, 13, 25, 37, 52, 70] }
    }
};

const atlasExpansionTo500LayerIndices = {
    neighborhood: 0,
    'milky-way': 0,
    'local-group': 0,
    'cosmic-neighborhood': 0
};

CELESTIAL_CATALOG.push(...ATLAS_EXPANSION_TO_500.map((entry) => {
    const profile = ATLAS_EXPANSION_TO_500_PROFILES[entry.atlasMap];
    const layerIndex = atlasExpansionTo500LayerIndices[entry.atlasMap]++;
    const coordinate = profile.coordinate;
    const isBrownDwarf = entry.type.includes('棕矮星');
    const isNebula = entry.category === 'nebula';
    const isRemnant = entry.category === 'stellar-remnant' || entry.category === 'supernova-remnant';

    return {
        ...entry,
        color: isNebula ? 0xd89cff : isRemnant ? 0xaee8ff : profile.color,
        size: entry.atlasMap === 'neighborhood'
            ? (isBrownDwarf ? 6 : profile.size)
            : isNebula ? 22 : profile.size,
        temperature: profile.temperature,
        feature: `${entry.name}（${entry.nameEn}）为${entry.type}，作为本轮均衡扩充的一员，补充${profile.related.title}的观测样本。`,
        related: [{ ...profile.related }],
        galactic: {
            lDeg: (coordinate.lStart + layerIndex * coordinate.lStep) % 360,
            bDeg: coordinate.latitudes[layerIndex % coordinate.latitudes.length]
        }
    };
}));


// Bulk points use a golden-angle longitude and stable latitude jitter to avoid periodic direction overlap.
const BULK_GOLDEN_ANGLE_DEG = 137.50776405003785;
const BULK_LATITUDE_PHASE = 0.7548776662466927;

function createBulkGalacticCoordinate(layerIndex, coordinate) {
    const latitudes = coordinate.latitudes;
    const latitudeIndex = (layerIndex * 7) % latitudes.length;
    const baseLatitude = latitudes[latitudeIndex];
    const neighborGaps = [];

    if (latitudeIndex > 0) neighborGaps.push(Math.abs(baseLatitude - latitudes[latitudeIndex - 1]));
    if (latitudeIndex < latitudes.length - 1) neighborGaps.push(Math.abs(latitudes[latitudeIndex + 1] - baseLatitude));

    const nearestGap = neighborGaps.length ? Math.min(...neighborGaps) : 0;
    const jitterRange = Math.min(4, nearestGap * 0.32);
    const jitterPhase = ((layerIndex + 1) * BULK_LATITUDE_PHASE) % 1;

    return {
        lDeg: (coordinate.lStart + layerIndex * BULK_GOLDEN_ANGLE_DEG) % 360,
        bDeg: Math.max(-89.5, Math.min(89.5, baseLatitude + (jitterPhase - 0.5) * 2 * jitterRange))
    };
}

// 1000 项目录里程碑：25 个小批次，每批 20 项、四层星图各补 5 项。
// 采用 LHS、Sharpless、M31 球状星团与 NGC 编号目录的代表性序列，保证批次均衡且便于后续校验。
const ATLAS_EXPANSION_TO_1000_NEIGHBORHOOD = Array.from({ length: 125 }, (_, index) => {
    const number = 1001 + index;
    const types = ['近邻红矮星', '高自行近邻红矮星', '耀斑红矮星', '低质量恒星系统', '候选行星宿主红矮星'];
    return {
        id: `lhs-${number}`,
        name: `LHS ${number}`,
        nameEn: `LHS ${number}`,
        type: types[index % types.length],
        distanceLy: 18 + ((index * 7) % 78),
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        effectType: 'red-dwarf'
    };
});

const ATLAS_EXPANSION_TO_1000_MILKY_WAY = Array.from({ length: 126 }, (_, index) => index + 1)
    .filter((number) => number !== 101)
    .map((number, index) => {
        const types = ['发射星云', '电离氢区', '恒星形成区', '反射与发射复合星云', '银河盘面电离云'];
        const padded = String(number).padStart(3, '0');
        return {
            id: `sharpless-2-${padded}`,
            name: `沙普利斯 2-${padded}`,
            nameEn: `Sharpless 2-${number}`,
            type: types[index % types.length],
            distanceLy: 900 + ((number * 137) % 12800),
            atlasMap: 'milky-way',
            category: 'nebula'
        };
    });

const ATLAS_EXPANSION_TO_1000_LOCAL_GROUP = Array.from({ length: 125 }, (_, index) => {
    const number = index + 1;
    const code = `B${String(number).padStart(3, '0')}`;
    return {
        id: `m31-globular-${code.toLowerCase()}`,
        name: `M31 球状星团 ${code}`,
        nameEn: `M31 Globular Cluster ${code}`,
        type: '仙女座星系球状星团',
        distanceLy: 2500000,
        atlasMap: 'local-group',
        category: 'deep-sky'
    };
});

const ATLAS_EXPANSION_TO_1000_COSMIC_NEIGHBORHOOD = Array.from({ length: 125 }, (_, index) => {
    const number = 5600 + index;
    const types = ['近邻旋涡星系', '棒旋星系', '侧向旋涡星系', '透镜状星系', '恒星形成星系'];
    return {
        id: `ngc-${number}`,
        name: `NGC ${number}`,
        nameEn: `NGC ${number}`,
        type: types[index % types.length],
        distanceLy: 18000000 + ((index * 4100000) % 142000000),
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy'
    };
});

const ATLAS_EXPANSION_TO_1000_BATCHES = Array.from({ length: 25 }, (_, batchIndex) => [
    ...ATLAS_EXPANSION_TO_1000_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_1000_MILKY_WAY.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_1000_LOCAL_GROUP.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_1000_COSMIC_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5)
]);

// Bulk feature descriptions share seven prototype getters instead of allocating
// 49,500 long strings or 49,500 closure-backed getter functions at startup.
const BULK_FEATURE_PROTOTYPES = Object.freeze({
    to1000: Object.freeze({
        get feature() { return `${this.name}\uff08${this.nameEn}\uff09\u4e3a${this.type}\uff0c\u5f52\u5165 1000 \u9879\u76ee\u5f55\u8ba1\u5212\u7684\u7b2c ${this.bulkBatchNumber} \u4e2a\u5747\u8861\u6269\u5bb9\u6279\u6b21\u3002`; }
    }),
    to2000: Object.freeze({
        get feature() { return `${this.name}\uff08${this.nameEn}\uff09\u4e3a${this.type}\uff0c\u5f52\u5165 2000 \u9879\u76ee\u5f55\u538b\u529b\u6d4b\u8bd5\u7684\u7b2c ${this.bulkBatchNumber} \u4e2a\u5747\u8861\u6269\u5bb9\u6279\u6b21\u3002`; }
    }),
    to5000: Object.freeze({
        get feature() { return `${this.name}\uff08${this.nameEn}\uff09\u4e3a${this.type}\uff0c\u5f52\u5165 5000 \u9879\u76ee\u5f55\u538b\u529b\u6d4b\u8bd5\u7684\u7b2c ${this.bulkBatchNumber} \u4e2a\u5747\u8861\u6269\u5bb9\u6279\u6b21\u3002`; }
    }),
    to10000: Object.freeze({
        get feature() { return `${this.name}\uff08${this.nameEn}\uff09\u4e3a${this.type}\uff0c\u5f52\u5165 10000 \u9879\u76ee\u5f55\u538b\u529b\u6d4b\u8bd5\u7684\u7b2c ${this.bulkBatchNumber} \u4e2a\u5747\u8861\u6269\u5bb9\u6279\u6b21\u3002`; }
    }),
    to20000: Object.freeze({
        get feature() { return `${this.name}\uff08${this.nameEn}\uff09\u4e3a${this.type}\uff0c\u5f52\u5165 20000 \u9879\u76ee\u5f55\u538b\u529b\u6d4b\u8bd5\u7684\u7b2c ${this.bulkBatchNumber} \u4e2a\u5747\u8861\u6269\u5bb9\u6279\u6b21\u3002`; }
    }),
    to30000: Object.freeze({
        get feature() { return `${this.name}\uff08${this.nameEn}\uff09\u4e3a${this.type}\uff0c\u5f52\u5165 30000 \u9879\u76ee\u5f55\u538b\u529b\u6d4b\u8bd5\u7684\u7b2c ${this.bulkBatchNumber} \u4e2a\u5747\u8861\u6269\u5bb9\u6279\u6b21\u3002`; }
    }),
    to50000: Object.freeze({
        get feature() { return `${this.name}\uff08${this.nameEn}\uff09\u4e3a${this.type}\uff0c\u5f52\u5165 50000 \u9879\u76ee\u5f55\u538b\u529b\u6d4b\u8bd5\u7684\u7b2c ${this.bulkBatchNumber} \u4e2a\u5747\u8861\u6269\u5bb9\u6279\u6b21\u3002`; }
    })
});

function createBulkCatalogEntry(data, featurePrototype, batchNumber) {
    Object.defineProperty(data, 'bulkBatchNumber', { value: batchNumber });
    return Object.setPrototypeOf(data, featurePrototype);
}

const ATLAS_EXPANSION_TO_1000_PROFILES = {
    neighborhood: {
        color: 0xff765c,
        size: 7,
        temperature: '近邻红矮星、恒星活动与行星宿主系统',
        related: Object.freeze([Object.freeze({ title: '太阳邻域', detail: 'LHS 高自行恒星序列，用于细化太阳附近低质量恒星的覆盖。' })]),
        coordinate: { lStart: 29, lStep: 73, latitudes: [-75, -56, -39, -24, -10, 4, 18, 33, 48, 64, 76] }
    },
    'milky-way': {
        color: 0xc794ff,
        size: 20,
        temperature: '星际介质、电离氢区与恒星形成',
        related: Object.freeze([Object.freeze({ title: '银河地标', detail: 'Sharpless 电离氢区序列，补充银河盘面中的星云与恒星形成区。' })]),
        coordinate: { lStart: 7, lStep: 37, latitudes: [-9, -6, -4, -2, -1, 0, 1, 2, 4, 6, 9] }
    },
    'local-group': {
        color: 0x8ecbff,
        size: 15,
        temperature: '球状星团恒星族群与本星系群结构',
        related: Object.freeze([Object.freeze({ title: '本星系群成员', detail: 'M31 球状星团编号序列，用于呈现仙女座星系的伴生恒星系统。' })]),
        coordinate: { lStart: 117, lStep: 43, latitudes: [-62, -46, -31, -18, -7, 4, 15, 28, 42, 58, 70] }
    },
    'cosmic-neighborhood': {
        color: 0xffc27d,
        size: 22,
        temperature: '星系盘、棒结构、尘埃与恒星形成',
        related: Object.freeze([Object.freeze({ title: '近邻宇宙', detail: 'NGC 星系序列，补充近邻宇宙中的不同盘星系与星系环境。' })]),
        coordinate: { lStart: 163, lStep: 59, latitudes: [-73, -57, -43, -30, -18, -6, 7, 19, 32, 46, 60, 74] }
    }
};

const atlasExpansionTo1000LayerIndices = {
    neighborhood: 0,
    'milky-way': 0,
    'local-group': 0,
    'cosmic-neighborhood': 0
};

CELESTIAL_CATALOG.push(...ATLAS_EXPANSION_TO_1000_BATCHES.flat().map((entry, index) => {
    const profile = ATLAS_EXPANSION_TO_1000_PROFILES[entry.atlasMap];
    const layerIndex = atlasExpansionTo1000LayerIndices[entry.atlasMap]++;
    const coordinate = profile.coordinate;
    const batchNumber = Math.floor(index / 20) + 1;

    return createBulkCatalogEntry({
        ...entry,
        color: profile.color,
        size: profile.size,
        renderTier: 'bulk',
        temperature: profile.temperature,
        related: profile.related,
        dataQuality: 'synthetic',
        source: 'generated-stress-test',
        galactic: createBulkGalacticCoordinate(layerIndex, coordinate)
    }, BULK_FEATURE_PROTOTYPES.to1000, batchNumber);
}));



// 2000 项目录压力测试：50 个小批次，每批 20 项、四层星图各补 5 项。
// 新增 1000 项继续全部进入批量渲染层，用于验证目录增长时的启动与交互成本。
const ATLAS_EXPANSION_TO_2000_NEIGHBORHOOD = Array.from({ length: 250 }, (_, index) => {
    const number = 1376 + index;
    const types = ['近邻红矮星', '高自行近邻红矮星', '耀斑红矮星', '低质量恒星系统', '候选行星宿主红矮星'];
    return {
        id: `lhs-${number}`,
        name: `LHS ${number}`,
        nameEn: `LHS ${number}`,
        type: types[index % types.length],
        distanceLy: 20 + ((index * 11) % 110),
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        effectType: 'red-dwarf'
    };
});

const ATLAS_EXPANSION_TO_2000_MILKY_WAY = Array.from({ length: 250 }, (_, index) => {
    const number = 127 + index;
    const types = ['发射星云', '电离氢区', '恒星形成区', '反射与发射复合星云', '银河盘面电离云'];
    const padded = String(number).padStart(3, '0');
    return {
        id: `sharpless-2-${padded}`,
        name: `沙普利斯 2-${padded}`,
        nameEn: `Sharpless 2-${number}`,
        type: types[index % types.length],
        distanceLy: 1100 + ((number * 101) % 19800),
        atlasMap: 'milky-way',
        category: 'nebula'
    };
});

const ATLAS_EXPANSION_TO_2000_LOCAL_GROUP = Array.from({ length: 250 }, (_, index) => {
    const number = 126 + index;
    const code = `B${String(number).padStart(3, '0')}`;
    return {
        id: `m31-globular-${code.toLowerCase()}`,
        name: `M31 球状星团 ${code}`,
        nameEn: `M31 Globular Cluster ${code}`,
        type: '仙女座星系球状星团',
        distanceLy: 2500000,
        atlasMap: 'local-group',
        category: 'deep-sky'
    };
});

const ATLAS_EXPANSION_TO_2000_COSMIC_NEIGHBORHOOD = Array.from({ length: 250 }, (_, index) => {
    const number = 5725 + index;
    const types = ['近邻旋涡星系', '棒旋星系', '侧向旋涡星系', '透镜状星系', '恒星形成星系'];
    return {
        id: `ngc-${number}`,
        name: `NGC ${number}`,
        nameEn: `NGC ${number}`,
        type: types[index % types.length],
        distanceLy: 22000000 + ((index * 5300000) % 178000000),
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy'
    };
});

const ATLAS_EXPANSION_TO_2000_BATCHES = Array.from({ length: 50 }, (_, batchIndex) => [
    ...ATLAS_EXPANSION_TO_2000_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_2000_MILKY_WAY.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_2000_LOCAL_GROUP.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_2000_COSMIC_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5)
]);

const atlasExpansionTo2000LayerIndices = {
    neighborhood: 125,
    'milky-way': 125,
    'local-group': 125,
    'cosmic-neighborhood': 125
};

CELESTIAL_CATALOG.push(...ATLAS_EXPANSION_TO_2000_BATCHES.flat().map((entry, index) => {
    const profile = ATLAS_EXPANSION_TO_1000_PROFILES[entry.atlasMap];
    const layerIndex = atlasExpansionTo2000LayerIndices[entry.atlasMap]++;
    const coordinate = profile.coordinate;
    const batchNumber = Math.floor(index / 20) + 26;

    return createBulkCatalogEntry({
        ...entry,
        color: profile.color,
        size: profile.size,
        renderTier: 'bulk',
        temperature: profile.temperature,
        related: profile.related,
        dataQuality: 'synthetic',
        source: 'generated-stress-test',
        galactic: createBulkGalacticCoordinate(layerIndex, coordinate)
    }, BULK_FEATURE_PROTOTYPES.to2000, batchNumber);
}));



// 5000 项目录压力测试：150 个小批次，每批 20 项、四层星图各补 5 项。
// 继续把新增目标纳入批量点渲染，以检验 5000 项目录的启动、搜索和按需细节提升路径。
const ATLAS_EXPANSION_TO_5000_NEIGHBORHOOD = Array.from({ length: 750 }, (_, index) => {
    const number = 1626 + index;
    const types = ['近邻红矮星', '高自行近邻红矮星', '耀斑红矮星', '低质量恒星系统', '候选行星宿主红矮星'];
    return {
        id: `lhs-${number}`,
        name: `LHS ${number}`,
        nameEn: `LHS ${number}`,
        type: types[index % types.length],
        distanceLy: 16 + ((index * 13) % 164),
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        effectType: 'red-dwarf'
    };
});

const ATLAS_EXPANSION_TO_5000_MILKY_WAY = Array.from({ length: 750 }, (_, index) => {
    const number = index + 1;
    const code = `W${String(number).padStart(4, '0')}`;
    const types = ['电离氢区候选体', '恒星形成区候选体', '红外银河云区', '发射星云候选体', '银河盘面电离云'];
    return {
        id: `wise-hii-${code.toLowerCase()}`,
        name: `WISE 电离氢区 ${code}`,
        nameEn: `WISE H II Region ${code}`,
        type: types[index % types.length],
        distanceLy: 900 + ((index * 173) % 25500),
        atlasMap: 'milky-way',
        category: 'nebula'
    };
});

const ATLAS_EXPANSION_TO_5000_LOCAL_GROUP = Array.from({ length: 750 }, (_, index) => {
    const number = index + 1;
    const code = `C${String(number).padStart(4, '0')}`;
    return {
        id: `m31-candidate-cluster-${code.toLowerCase()}`,
        name: `M31 候选星团 ${code}`,
        nameEn: `M31 Candidate Cluster ${code}`,
        type: '仙女座星系候选星团',
        distanceLy: 2500000,
        atlasMap: 'local-group',
        category: 'deep-sky'
    };
});

const ATLAS_EXPANSION_TO_5000_COSMIC_NEIGHBORHOOD = Array.from({ length: 750 }, (_, index) => {
    const number = 10001 + index;
    const types = ['近邻盘星系', '棒旋星系', '侧向盘星系', '透镜状星系', '恒星形成星系'];
    return {
        id: `ugc-${number}`,
        name: `UGC ${number}`,
        nameEn: `UGC ${number}`,
        type: types[index % types.length],
        distanceLy: 26000000 + ((index * 6100000) % 214000000),
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy'
    };
});

const ATLAS_EXPANSION_TO_5000_BATCHES = Array.from({ length: 150 }, (_, batchIndex) => [
    ...ATLAS_EXPANSION_TO_5000_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_5000_MILKY_WAY.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_5000_LOCAL_GROUP.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_5000_COSMIC_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5)
]);

const ATLAS_EXPANSION_TO_5000_PROFILES = {
    neighborhood: {
        ...ATLAS_EXPANSION_TO_1000_PROFILES.neighborhood,
        related: Object.freeze([Object.freeze({ title: '太阳邻域', detail: 'LHS 近邻恒星编号序列，用于进行五千项目录下的轻量星点压力测试。' })])
    },
    'milky-way': {
        ...ATLAS_EXPANSION_TO_1000_PROFILES['milky-way'],
        related: Object.freeze([Object.freeze({ title: '银河地标', detail: 'WISE 电离氢区候选序列，用于扩展银河盘面星云与恒星形成区域的索引覆盖。' })])
    },
    'local-group': {
        ...ATLAS_EXPANSION_TO_1000_PROFILES['local-group'],
        related: Object.freeze([Object.freeze({ title: '本星系群成员', detail: 'M31 候选星团索引序列，用于在远距离层保留可搜索的星团样本。' })])
    },
    'cosmic-neighborhood': {
        ...ATLAS_EXPANSION_TO_1000_PROFILES['cosmic-neighborhood'],
        related: Object.freeze([Object.freeze({ title: '近邻宇宙', detail: 'UGC 星系编号序列，用于补充不同盘星系与星系环境的批量索引。' })])
    }
};

const atlasExpansionTo5000LayerIndices = {
    neighborhood: 375,
    'milky-way': 375,
    'local-group': 375,
    'cosmic-neighborhood': 375
};

CELESTIAL_CATALOG.push(...ATLAS_EXPANSION_TO_5000_BATCHES.flat().map((entry, index) => {
    const profile = ATLAS_EXPANSION_TO_5000_PROFILES[entry.atlasMap];
    const layerIndex = atlasExpansionTo5000LayerIndices[entry.atlasMap]++;
    const coordinate = profile.coordinate;
    const batchNumber = Math.floor(index / 20) + 76;

    return createBulkCatalogEntry({
        ...entry,
        color: profile.color,
        size: profile.size,
        renderTier: 'bulk',
        temperature: profile.temperature,
        related: profile.related,
        dataQuality: 'synthetic',
        source: 'generated-stress-test',
        galactic: createBulkGalacticCoordinate(layerIndex, coordinate)
    }, BULK_FEATURE_PROTOTYPES.to5000, batchNumber);
}));


const ATLAS_EXPANSION_TO_10000_NEIGHBORHOOD = Array.from({ length: 1250 }, (_, index) => {
    const number = 2376 + index;
    const types = ['\u8fd1\u90bb\u7ea2\u77ee\u661f', '\u9ad8\u81ea\u884c\u8fd1\u90bb\u7ea2\u77ee\u661f', '\u8000\u65a5\u7ea2\u77ee\u661f', '\u4f4e\u8d28\u91cf\u6052\u661f\u7cfb\u7edf', '\u5019\u9009\u884c\u661f\u5bbf\u4e3b\u7ea2\u77ee\u661f'];
    return {
        id: 'lhs-' + number,
        name: 'LHS ' + number,
        nameEn: 'LHS ' + number,
        type: types[index % types.length],
        distanceLy: 18 + ((index * 17) % 182),
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        effectType: 'red-dwarf'
    };
});

const ATLAS_EXPANSION_TO_10000_MILKY_WAY = Array.from({ length: 1250 }, (_, index) => {
    const number = 751 + index;
    const code = 'W' + String(number).padStart(4, '0');
    const types = ['\u7535\u79bb\u6c22\u533a\u5019\u9009\u4f53', '\u6052\u661f\u5f62\u6210\u533a\u5019\u9009\u4f53', '\u7ea2\u5916\u94f6\u6cb3\u4e91\u533a', '\u53d1\u5c04\u661f\u4e91\u5019\u9009\u4f53', '\u94f6\u6cb3\u76d8\u9762\u7535\u79bb\u4e91'];
    return {
        id: 'wise-hii-' + code.toLowerCase(),
        name: 'WISE \u7535\u79bb\u6c22\u533a ' + code,
        nameEn: 'WISE H II Region ' + code,
        type: types[index % types.length],
        distanceLy: 1000 + ((index * 191) % 26800),
        atlasMap: 'milky-way',
        category: 'nebula'
    };
});

const ATLAS_EXPANSION_TO_10000_LOCAL_GROUP = Array.from({ length: 1250 }, (_, index) => {
    const number = 751 + index;
    const code = 'C' + String(number).padStart(4, '0');
    return {
        id: 'm31-candidate-cluster-' + code.toLowerCase(),
        name: 'M31 \u5019\u9009\u661f\u56e2 ' + code,
        nameEn: 'M31 Candidate Cluster ' + code,
        type: '\u4ed9\u5973\u5ea7\u661f\u7cfb\u5019\u9009\u661f\u56e2',
        distanceLy: 2500000,
        atlasMap: 'local-group',
        category: 'deep-sky'
    };
});

const ATLAS_EXPANSION_TO_10000_COSMIC_NEIGHBORHOOD = Array.from({ length: 1250 }, (_, index) => {
    const number = 10751 + index;
    const types = ['\u8fd1\u90bb\u76d8\u661f\u7cfb', '\u68d2\u65cb\u661f\u7cfb', '\u4fa7\u5411\u76d8\u661f\u7cfb', '\u900f\u955c\u72b6\u661f\u7cfb', '\u6052\u661f\u5f62\u6210\u661f\u7cfb'];
    return {
        id: 'ugc-' + number,
        name: 'UGC ' + number,
        nameEn: 'UGC ' + number,
        type: types[index % types.length],
        distanceLy: 28000000 + ((index * 6700000) % 232000000),
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy'
    };
});

const ATLAS_EXPANSION_TO_10000_BATCHES = Array.from({ length: 250 }, (_, batchIndex) => [
    ...ATLAS_EXPANSION_TO_10000_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_10000_MILKY_WAY.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_10000_LOCAL_GROUP.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_10000_COSMIC_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5)
]);

const ATLAS_EXPANSION_TO_10000_PROFILES = {
    neighborhood: {
        ...ATLAS_EXPANSION_TO_5000_PROFILES.neighborhood,
        related: Object.freeze([Object.freeze({ title: '\u592a\u9633\u90bb\u57df', detail: 'LHS \u8fd1\u90bb\u6052\u661f\u7f16\u53f7\u5ef6\u5c55\u5e8f\u5217\uff0c\u7528\u4e8e\u4e07\u9879\u76ee\u5f55\u4e0b\u7684\u8f7b\u91cf\u661f\u70b9\u538b\u529b\u6d4b\u8bd5\u3002' })])
    },
    'milky-way': {
        ...ATLAS_EXPANSION_TO_5000_PROFILES['milky-way'],
        related: Object.freeze([Object.freeze({ title: '\u94f6\u6cb3\u5730\u6807', detail: 'WISE \u7535\u79bb\u6c22\u533a\u5019\u9009\u5ef6\u5c55\u5e8f\u5217\uff0c\u7528\u4e8e\u7ec6\u5316\u94f6\u6cb3\u76d8\u9762\u661f\u4e91\u4e0e\u6052\u661f\u5f62\u6210\u533a\u57df\u7684\u7d22\u5f15\u8986\u76d6\u3002' })])
    },
    'local-group': {
        ...ATLAS_EXPANSION_TO_5000_PROFILES['local-group'],
        related: Object.freeze([Object.freeze({ title: '\u672c\u661f\u7cfb\u7fa4\u6210\u5458', detail: 'M31 \u5019\u9009\u661f\u56e2\u5ef6\u5c55\u7d22\u5f15\uff0c\u7528\u4e8e\u5728\u8fdc\u8ddd\u79bb\u5c42\u4fdd\u7559\u53ef\u641c\u7d22\u7684\u661f\u56e2\u6837\u672c\u3002' })])
    },
    'cosmic-neighborhood': {
        ...ATLAS_EXPANSION_TO_5000_PROFILES['cosmic-neighborhood'],
        related: Object.freeze([Object.freeze({ title: '\u8fd1\u90bb\u5b87\u5b99', detail: 'UGC \u661f\u7cfb\u7f16\u53f7\u5ef6\u5c55\u5e8f\u5217\uff0c\u7528\u4e8e\u8865\u5145\u4e0d\u540c\u76d8\u661f\u7cfb\u4e0e\u661f\u7cfb\u73af\u5883\u7684\u6279\u91cf\u7d22\u5f15\u3002' })])
    }
};

const atlasExpansionTo10000LayerIndices = {
    neighborhood: 1125,
    'milky-way': 1125,
    'local-group': 1125,
    'cosmic-neighborhood': 1125
};

CELESTIAL_CATALOG.push(...ATLAS_EXPANSION_TO_10000_BATCHES.flat().map((entry, index) => {
    const profile = ATLAS_EXPANSION_TO_10000_PROFILES[entry.atlasMap];
    const layerIndex = atlasExpansionTo10000LayerIndices[entry.atlasMap]++;
    const coordinate = profile.coordinate;
    const batchNumber = Math.floor(index / 20) + 226;

    return createBulkCatalogEntry({
        ...entry,
        color: profile.color,
        size: profile.size,
        renderTier: 'bulk',
        temperature: profile.temperature,
        related: profile.related,
        dataQuality: 'synthetic',
        source: 'generated-stress-test',
        galactic: createBulkGalacticCoordinate(layerIndex, coordinate)
    }, BULK_FEATURE_PROTOTYPES.to10000, batchNumber);
}));

const ATLAS_EXPANSION_TO_20000_NEIGHBORHOOD = Array.from({ length: 2500 }, (_, index) => {
    const number = 3626 + index;
    const types = ['\u8fd1\u90bb\u7ea2\u77ee\u661f', '\u9ad8\u81ea\u884c\u8fd1\u90bb\u7ea2\u77ee\u661f', '\u8000\u65a5\u7ea2\u77ee\u661f', '\u4f4e\u8d28\u91cf\u6052\u661f\u7cfb\u7edf', '\u5019\u9009\u884c\u661f\u5bbf\u4e3b\u7ea2\u77ee\u661f'];
    return {
        id: 'lhs-' + number,
        name: 'LHS ' + number,
        nameEn: 'LHS ' + number,
        type: types[index % types.length],
        distanceLy: 18 + ((index * 19) % 182),
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        effectType: 'red-dwarf'
    };
});

const ATLAS_EXPANSION_TO_20000_MILKY_WAY = Array.from({ length: 2500 }, (_, index) => {
    const number = 2001 + index;
    const code = 'W' + String(number).padStart(4, '0');
    const types = ['\u7535\u79bb\u6c22\u533a\u5019\u9009\u4f53', '\u6052\u661f\u5f62\u6210\u533a\u5019\u9009\u4f53', '\u7ea2\u5916\u94f6\u6cb3\u4e91\u533a', '\u53d1\u5c04\u661f\u4e91\u5019\u9009\u4f53', '\u94f6\u6cb3\u76d8\u9762\u7535\u79bb\u4e91'];
    return {
        id: 'wise-hii-' + code.toLowerCase(),
        name: 'WISE \u7535\u79bb\u6c22\u533a ' + code,
        nameEn: 'WISE H II Region ' + code,
        type: types[index % types.length],
        distanceLy: 1000 + ((index * 211) % 26800),
        atlasMap: 'milky-way',
        category: 'nebula'
    };
});

const ATLAS_EXPANSION_TO_20000_LOCAL_GROUP = Array.from({ length: 2500 }, (_, index) => {
    const number = 2001 + index;
    const code = 'C' + String(number).padStart(4, '0');
    return {
        id: 'm31-candidate-cluster-' + code.toLowerCase(),
        name: 'M31 \u5019\u9009\u661f\u56e2 ' + code,
        nameEn: 'M31 Candidate Cluster ' + code,
        type: '\u4ed9\u5973\u5ea7\u661f\u7cfb\u5019\u9009\u661f\u56e2',
        distanceLy: 2500000,
        atlasMap: 'local-group',
        category: 'deep-sky'
    };
});

const ATLAS_EXPANSION_TO_20000_COSMIC_NEIGHBORHOOD = Array.from({ length: 2500 }, (_, index) => {
    const number = 12001 + index;
    const types = ['\u8fd1\u90bb\u76d8\u661f\u7cfb', '\u68d2\u65cb\u661f\u7cfb', '\u4fa7\u5411\u76d8\u661f\u7cfb', '\u900f\u955c\u72b6\u661f\u7cfb', '\u6052\u661f\u5f62\u6210\u661f\u7cfb'];
    return {
        id: 'ugc-' + number,
        name: 'UGC ' + number,
        nameEn: 'UGC ' + number,
        type: types[index % types.length],
        distanceLy: 28000000 + ((index * 7100000) % 232000000),
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy'
    };
});

const ATLAS_EXPANSION_TO_20000_BATCHES = Array.from({ length: 500 }, (_, batchIndex) => [
    ...ATLAS_EXPANSION_TO_20000_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_20000_MILKY_WAY.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_20000_LOCAL_GROUP.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_20000_COSMIC_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5)
]);

const ATLAS_EXPANSION_TO_20000_PROFILES = {
    neighborhood: {
        ...ATLAS_EXPANSION_TO_10000_PROFILES.neighborhood,
        related: Object.freeze([Object.freeze({ title: '\u592a\u9633\u90bb\u57df', detail: 'LHS \u8fd1\u90bb\u6052\u661f\u7f16\u53f7\u518d\u6269\u5c55\u5e8f\u5217\uff0c\u7528\u4e8e 20000 \u9879\u76ee\u5f55\u4e0b\u7684\u8f7b\u91cf\u661f\u70b9\u538b\u529b\u6d4b\u8bd5\u3002' })])
    },
    'milky-way': {
        ...ATLAS_EXPANSION_TO_10000_PROFILES['milky-way'],
        related: Object.freeze([Object.freeze({ title: '\u94f6\u6cb3\u5730\u6807', detail: 'WISE \u7535\u79bb\u6c22\u533a\u5019\u9009\u5ef6\u5c55\u5e8f\u5217\uff0c\u7528\u4e8e 20000 \u9879\u76ee\u5f55\u4e0b\u7684\u94f6\u6cb3\u76d8\u9762\u6279\u91cf\u7d22\u5f15\u3002' })])
    },
    'local-group': {
        ...ATLAS_EXPANSION_TO_10000_PROFILES['local-group'],
        related: Object.freeze([Object.freeze({ title: '\u672c\u661f\u7cfb\u7fa4\u6210\u5458', detail: 'M31 \u5019\u9009\u661f\u56e2\u518d\u6269\u5c55\u7d22\u5f15\uff0c\u7528\u4e8e 20000 \u9879\u76ee\u5f55\u4e2d\u4fdd\u7559\u5747\u8861\u7684\u8fdc\u8ddd\u79bb\u661f\u56e2\u6837\u672c\u3002' })])
    },
    'cosmic-neighborhood': {
        ...ATLAS_EXPANSION_TO_10000_PROFILES['cosmic-neighborhood'],
        related: Object.freeze([Object.freeze({ title: '\u8fd1\u90bb\u5b87\u5b99', detail: 'UGC \u661f\u7cfb\u7f16\u53f7\u518d\u6269\u5c55\u5e8f\u5217\uff0c\u7528\u4e8e 20000 \u9879\u76ee\u5f55\u4e0b\u7684\u8f7b\u91cf\u661f\u7cfb\u70b9\u5c42\u538b\u529b\u6d4b\u8bd5\u3002' })])
    }
};

const atlasExpansionTo20000LayerIndices = {
    neighborhood: 2375,
    'milky-way': 2375,
    'local-group': 2375,
    'cosmic-neighborhood': 2375
};

CELESTIAL_CATALOG.push(...ATLAS_EXPANSION_TO_20000_BATCHES.flat().map((entry, index) => {
    const profile = ATLAS_EXPANSION_TO_20000_PROFILES[entry.atlasMap];
    const layerIndex = atlasExpansionTo20000LayerIndices[entry.atlasMap]++;
    const coordinate = profile.coordinate;
    const batchNumber = Math.floor(index / 20) + 476;

    return createBulkCatalogEntry({
        ...entry,
        color: profile.color,
        size: profile.size,
        renderTier: 'bulk',
        temperature: profile.temperature,
        related: profile.related,
        dataQuality: 'synthetic',
        source: 'generated-stress-test',
        galactic: createBulkGalacticCoordinate(layerIndex, coordinate)
    }, BULK_FEATURE_PROTOTYPES.to20000, batchNumber);
}));


const ATLAS_EXPANSION_TO_30000_NEIGHBORHOOD = Array.from({ length: 2500 }, (_, index) => {
    const number = 6126 + index;
    const types = ['\u8fd1\u90bb\u7ea2\u77ee\u661f', '\u9ad8\u81ea\u884c\u8fd1\u90bb\u7ea2\u77ee\u661f', '\u8000\u65a5\u7ea2\u77ee\u661f', '\u4f4e\u8d28\u91cf\u6052\u661f\u7cfb\u7edf', '\u5019\u9009\u884c\u661f\u5bbf\u4e3b\u7ea2\u77ee\u661f'];
    return {
        id: 'lhs-' + number,
        name: 'LHS ' + number,
        nameEn: 'LHS ' + number,
        type: types[index % types.length],
        distanceLy: 18 + ((index * 23) % 182),
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        effectType: 'red-dwarf'
    };
});

const ATLAS_EXPANSION_TO_30000_MILKY_WAY = Array.from({ length: 2500 }, (_, index) => {
    const number = 4501 + index;
    const code = 'W' + String(number).padStart(4, '0');
    const types = ['\u7535\u79bb\u6c22\u533a\u5019\u9009\u4f53', '\u6052\u661f\u5f62\u6210\u533a\u5019\u9009\u4f53', '\u7ea2\u5916\u94f6\u6cb3\u4e91\u533a', '\u53d1\u5c04\u661f\u4e91\u5019\u9009\u4f53', '\u94f6\u6cb3\u76d8\u9762\u7535\u79bb\u4e91'];
    return {
        id: 'wise-hii-' + code.toLowerCase(),
        name: 'WISE \u7535\u79bb\u6c22\u533a ' + code,
        nameEn: 'WISE H II Region ' + code,
        type: types[index % types.length],
        distanceLy: 1000 + ((index * 223) % 26800),
        atlasMap: 'milky-way',
        category: 'nebula'
    };
});

const ATLAS_EXPANSION_TO_30000_LOCAL_GROUP = Array.from({ length: 2500 }, (_, index) => {
    const number = 4501 + index;
    const code = 'C' + String(number).padStart(4, '0');
    return {
        id: 'm31-candidate-cluster-' + code.toLowerCase(),
        name: 'M31 \u5019\u9009\u661f\u56e2 ' + code,
        nameEn: 'M31 Candidate Cluster ' + code,
        type: '\u4ed9\u5973\u5ea7\u661f\u7cfb\u5019\u9009\u661f\u56e2',
        distanceLy: 2500000,
        atlasMap: 'local-group',
        category: 'deep-sky'
    };
});

const ATLAS_EXPANSION_TO_30000_COSMIC_NEIGHBORHOOD = Array.from({ length: 2500 }, (_, index) => {
    const number = 14501 + index;
    const types = ['\u8fd1\u90bb\u76d8\u661f\u7cfb', '\u68d2\u65cb\u661f\u7cfb', '\u4fa7\u5411\u76d8\u661f\u7cfb', '\u900f\u955c\u72b6\u661f\u7cfb', '\u6052\u661f\u5f62\u6210\u661f\u7cfb'];
    return {
        id: 'ugc-' + number,
        name: 'UGC ' + number,
        nameEn: 'UGC ' + number,
        type: types[index % types.length],
        distanceLy: 28000000 + ((index * 7300000) % 232000000),
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy'
    };
});

const ATLAS_EXPANSION_TO_30000_BATCHES = Array.from({ length: 500 }, (_, batchIndex) => [
    ...ATLAS_EXPANSION_TO_30000_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_30000_MILKY_WAY.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_30000_LOCAL_GROUP.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_30000_COSMIC_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5)
]);

const ATLAS_EXPANSION_TO_30000_PROFILES = {
    neighborhood: {
        ...ATLAS_EXPANSION_TO_20000_PROFILES.neighborhood,
        related: Object.freeze([Object.freeze({ title: '\u592a\u9633\u90bb\u57df', detail: 'LHS \u8fd1\u90bb\u6052\u661f\u7f16\u53f7\u7b2c\u4e09\u8f6e\u6269\u5c55\u5e8f\u5217\uff0c\u7528\u4e8e 30000 \u9879\u76ee\u5f55\u7684\u8f7b\u91cf\u661f\u70b9\u538b\u529b\u6d4b\u8bd5\u3002' })])
    },
    'milky-way': {
        ...ATLAS_EXPANSION_TO_20000_PROFILES['milky-way'],
        related: Object.freeze([Object.freeze({ title: '\u94f6\u6cb3\u5730\u6807', detail: 'WISE \u7535\u79bb\u6c22\u533a\u5019\u9009\u7b2c\u4e09\u8f6e\u6269\u5c55\u5e8f\u5217\uff0c\u7528\u4e8e 30000 \u9879\u76ee\u5f55\u4e0b\u7684\u94f6\u6cb3\u76d8\u9762\u6279\u91cf\u7d22\u5f15\u3002' })])
    },
    'local-group': {
        ...ATLAS_EXPANSION_TO_20000_PROFILES['local-group'],
        related: Object.freeze([Object.freeze({ title: '\u672c\u661f\u7cfb\u7fa4\u6210\u5458', detail: 'M31 \u5019\u9009\u661f\u56e2\u7b2c\u4e09\u8f6e\u6269\u5c55\u7d22\u5f15\uff0c\u7528\u4e8e 30000 \u9879\u76ee\u5f55\u4e2d\u4fdd\u7559\u5747\u8861\u7684\u8fdc\u8ddd\u79bb\u6837\u672c\u3002' })])
    },
    'cosmic-neighborhood': {
        ...ATLAS_EXPANSION_TO_20000_PROFILES['cosmic-neighborhood'],
        related: Object.freeze([Object.freeze({ title: '\u8fd1\u90bb\u5b87\u5b99', detail: 'UGC \u661f\u7cfb\u7f16\u53f7\u7b2c\u4e09\u8f6e\u6269\u5c55\u5e8f\u5217\uff0c\u7528\u4e8e 30000 \u9879\u76ee\u5f55\u4e0b\u7684\u8f7b\u91cf\u661f\u7cfb\u70b9\u5c42\u538b\u529b\u6d4b\u8bd5\u3002' })])
    }
};

const atlasExpansionTo30000LayerIndices = {
    neighborhood: 4875,
    'milky-way': 4875,
    'local-group': 4875,
    'cosmic-neighborhood': 4875
};

CELESTIAL_CATALOG.push(...ATLAS_EXPANSION_TO_30000_BATCHES.flat().map((entry, index) => {
    const profile = ATLAS_EXPANSION_TO_30000_PROFILES[entry.atlasMap];
    const layerIndex = atlasExpansionTo30000LayerIndices[entry.atlasMap]++;
    const coordinate = profile.coordinate;
    const batchNumber = Math.floor(index / 20) + 976;

    return createBulkCatalogEntry({
        ...entry,
        color: profile.color,
        size: profile.size,
        renderTier: 'bulk',
        temperature: profile.temperature,
        related: profile.related,
        dataQuality: 'synthetic',
        source: 'generated-stress-test',
        galactic: createBulkGalacticCoordinate(layerIndex, coordinate)
    }, BULK_FEATURE_PROTOTYPES.to30000, batchNumber);
}));


const ATLAS_EXPANSION_TO_50000_NEIGHBORHOOD = Array.from({ length: 5000 }, (_, index) => {
    const number = 8626 + index;
    const types = ['\u8fd1\u90bb\u7ea2\u77ee\u661f', '\u9ad8\u81ea\u884c\u8fd1\u90bb\u7ea2\u77ee\u661f', '\u8000\u65a5\u7ea2\u77ee\u661f', '\u4f4e\u8d28\u91cf\u6052\u661f\u7cfb\u7edf', '\u5019\u9009\u884c\u661f\u5bbf\u4e3b\u7ea2\u77ee\u661f'];
    return {
        id: 'lhs-' + number,
        name: 'LHS ' + number,
        nameEn: 'LHS ' + number,
        type: types[index % types.length],
        distanceLy: 18 + ((index * 29) % 182),
        atlasMap: 'neighborhood',
        category: 'nearby-star',
        effectType: 'red-dwarf'
    };
});

const ATLAS_EXPANSION_TO_50000_MILKY_WAY = Array.from({ length: 5000 }, (_, index) => {
    const number = 7001 + index;
    const code = 'W' + String(number).padStart(4, '0');
    const types = ['\u7535\u79bb\u6c22\u533a\u5019\u9009\u4f53', '\u6052\u661f\u5f62\u6210\u533a\u5019\u9009\u4f53', '\u7ea2\u5916\u94f6\u6cb3\u4e91\u533a', '\u53d1\u5c04\u661f\u4e91\u5019\u9009\u4f53', '\u94f6\u6cb3\u76d8\u9762\u7535\u79bb\u4e91'];
    return {
        id: 'wise-hii-' + code.toLowerCase(),
        name: 'WISE \u7535\u79bb\u6c22\u533a ' + code,
        nameEn: 'WISE H II Region ' + code,
        type: types[index % types.length],
        distanceLy: 1000 + ((index * 227) % 26800),
        atlasMap: 'milky-way',
        category: 'nebula'
    };
});

const ATLAS_EXPANSION_TO_50000_LOCAL_GROUP = Array.from({ length: 5000 }, (_, index) => {
    const number = 7001 + index;
    const code = 'C' + String(number).padStart(4, '0');
    return {
        id: 'm31-candidate-cluster-' + code.toLowerCase(),
        name: 'M31 \u5019\u9009\u661f\u56e2 ' + code,
        nameEn: 'M31 Candidate Cluster ' + code,
        type: '\u4ed9\u5973\u5ea7\u661f\u7cfb\u5019\u9009\u661f\u56e2',
        distanceLy: 2500000,
        atlasMap: 'local-group',
        category: 'deep-sky'
    };
});

const ATLAS_EXPANSION_TO_50000_COSMIC_NEIGHBORHOOD = Array.from({ length: 5000 }, (_, index) => {
    const number = 17001 + index;
    const types = ['\u8fd1\u90bb\u76d8\u661f\u7cfb', '\u68d2\u65cb\u661f\u7cfb', '\u4fa7\u5411\u76d8\u661f\u7cfb', '\u900f\u955c\u72b6\u661f\u7cfb', '\u6052\u661f\u5f62\u6210\u661f\u7cfb'];
    return {
        id: 'ugc-' + number,
        name: 'UGC ' + number,
        nameEn: 'UGC ' + number,
        type: types[index % types.length],
        distanceLy: 28000000 + ((index * 7700000) % 232000000),
        atlasMap: 'cosmic-neighborhood',
        category: 'galaxy'
    };
});

const ATLAS_EXPANSION_TO_50000_BATCHES = Array.from({ length: 1000 }, (_, batchIndex) => [
    ...ATLAS_EXPANSION_TO_50000_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_50000_MILKY_WAY.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_50000_LOCAL_GROUP.slice(batchIndex * 5, batchIndex * 5 + 5),
    ...ATLAS_EXPANSION_TO_50000_COSMIC_NEIGHBORHOOD.slice(batchIndex * 5, batchIndex * 5 + 5)
]);

const ATLAS_EXPANSION_TO_50000_PROFILES = {
    neighborhood: {
        ...ATLAS_EXPANSION_TO_30000_PROFILES.neighborhood,
        related: Object.freeze([Object.freeze({ title: '\u592a\u9633\u90bb\u57df', detail: 'LHS \u8fd1\u90bb\u6052\u661f\u7f16\u53f7\u4e94\u4e07\u7ea7\u6269\u5c55\u5e8f\u5217\uff0c\u7528\u4e8e 50000 \u9879\u76ee\u5f55\u7684\u8f7b\u91cf\u661f\u70b9\u538b\u529b\u6d4b\u8bd5\u3002' })])
    },
    'milky-way': {
        ...ATLAS_EXPANSION_TO_30000_PROFILES['milky-way'],
        related: Object.freeze([Object.freeze({ title: '\u94f6\u6cb3\u5730\u6807', detail: 'WISE \u7535\u79bb\u6c22\u533a\u5019\u9009\u4e94\u4e07\u7ea7\u6269\u5c55\u5e8f\u5217\uff0c\u7528\u4e8e\u94f6\u6cb3\u76d8\u9762\u7684\u5927\u89c4\u6a21\u6279\u91cf\u7d22\u5f15\u3002' })])
    },
    'local-group': {
        ...ATLAS_EXPANSION_TO_30000_PROFILES['local-group'],
        related: Object.freeze([Object.freeze({ title: '\u672c\u661f\u7cfb\u7fa4\u6210\u5458', detail: 'M31 \u5019\u9009\u661f\u56e2\u4e94\u4e07\u7ea7\u6269\u5c55\u7d22\u5f15\uff0c\u7528\u4e8e\u4fdd\u7559\u5747\u8861\u7684\u8fdc\u8ddd\u79bb\u661f\u56e2\u6837\u672c\u3002' })])
    },
    'cosmic-neighborhood': {
        ...ATLAS_EXPANSION_TO_30000_PROFILES['cosmic-neighborhood'],
        related: Object.freeze([Object.freeze({ title: '\u8fd1\u90bb\u5b87\u5b99', detail: 'UGC \u661f\u7cfb\u7f16\u53f7\u4e94\u4e07\u7ea7\u6269\u5c55\u5e8f\u5217\uff0c\u7528\u4e8e\u8f7b\u91cf\u661f\u7cfb\u70b9\u5c42\u7684\u5927\u89c4\u6a21\u538b\u529b\u6d4b\u8bd5\u3002' })])
    }
};

const atlasExpansionTo50000LayerIndices = {
    neighborhood: 7375,
    'milky-way': 7375,
    'local-group': 7375,
    'cosmic-neighborhood': 7375
};

CELESTIAL_CATALOG.push(...ATLAS_EXPANSION_TO_50000_BATCHES.flat().map((entry, index) => {
    const profile = ATLAS_EXPANSION_TO_50000_PROFILES[entry.atlasMap];
    const layerIndex = atlasExpansionTo50000LayerIndices[entry.atlasMap]++;
    const coordinate = profile.coordinate;
    const batchNumber = Math.floor(index / 20) + 1476;

    return createBulkCatalogEntry({
        ...entry,
        color: profile.color,
        size: profile.size,
        renderTier: 'bulk',
        temperature: profile.temperature,
        related: profile.related,
        dataQuality: 'synthetic',
        source: 'generated-stress-test',
        galactic: createBulkGalacticCoordinate(layerIndex, coordinate)
    }, BULK_FEATURE_PROTOTYPES.to50000, batchNumber);
}));

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AU_KM, LIGHT_YEAR_KM, SIMULATION, PLANET_DATA, PLANET_ORDER, CELESTIAL_CATALOG };
}
