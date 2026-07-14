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
        visual: { color: 0xffc65a, glow: 0xff9f1c, spectral: 'G' }
    },
    mercury: {
        id: 'mercury',
        name: '水星',
        nameEn: 'Mercury',
        type: '类地行星',
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
            { id: 'moon', name: '月球', nameEn: 'Moon', radiusKm: 1737.4, massKg: 7.342e22, orbit: { semiMajorAxisKm: 384400, eccentricity: 0.0549, inclinationDeg: 5.145, longitudeAscendingNodeDeg: 125.08, argumentPeriapsisDeg: 318.15, meanAnomalyDeg: 115.37, orbitalPeriodDays: 27.3217 }, visual: { color: 0xb8b5aa, pattern: 'moon' }, feature: '潮汐锁定，稳定地球自转轴并驱动潮汐。' }
        ]
    },
    mars: {
        id: 'mars',
        name: '火星',
        nameEn: 'Mars',
        type: '类地行星',
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
            { id: 'phobos', name: '火卫一', nameEn: 'Phobos', radiusKm: 11.1, massKg: 1.066e16, orbit: { semiMajorAxisKm: 9376, eccentricity: 0.0151, inclinationDeg: 1.08, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 40, orbitalPeriodDays: 0.3189 }, visual: { color: 0x77706a, pattern: 'rocky' }, feature: '靠近火星，轨道正在缓慢衰减。' },
            { id: 'deimos', name: '火卫二', nameEn: 'Deimos', radiusKm: 6.2, massKg: 1.476e15, orbit: { semiMajorAxisKm: 23463, eccentricity: 0.0002, inclinationDeg: 1.79, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 210, orbitalPeriodDays: 1.2624 }, visual: { color: 0x68625f, pattern: 'rocky' }, feature: '小型不规则卫星，表面覆盖尘埃。' }
        ]
    },
    jupiter: {
        id: 'jupiter',
        name: '木星',
        nameEn: 'Jupiter',
        type: '气态巨行星',
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
            { id: 'io', name: '木卫一', nameEn: 'Io', radiusKm: 1821.6, massKg: 8.932e22, orbit: { semiMajorAxisKm: 421700, eccentricity: 0.0041, inclinationDeg: 0.04, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 20, orbitalPeriodDays: 1.769 }, visual: { color: 0xdcc967, pattern: 'io' }, feature: '太阳系火山活动最活跃的天体之一。' },
            { id: 'europa', name: '木卫二', nameEn: 'Europa', radiusKm: 1560.8, massKg: 4.800e22, orbit: { semiMajorAxisKm: 671100, eccentricity: 0.009, inclinationDeg: 0.47, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 90, orbitalPeriodDays: 3.551 }, visual: { color: 0xc8c1a9, pattern: 'ice' }, feature: '冰壳下可能存在全球海洋。' },
            { id: 'ganymede', name: '木卫三', nameEn: 'Ganymede', radiusKm: 2634.1, massKg: 1.482e23, orbit: { semiMajorAxisKm: 1070400, eccentricity: 0.0013, inclinationDeg: 0.20, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 180, orbitalPeriodDays: 7.155 }, visual: { color: 0x8f8880, pattern: 'moon' }, feature: '太阳系最大卫星，比水星还大。' },
            { id: 'callisto', name: '木卫四', nameEn: 'Callisto', radiusKm: 2410.3, massKg: 1.076e23, orbit: { semiMajorAxisKm: 1882700, eccentricity: 0.0074, inclinationDeg: 0.28, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 270, orbitalPeriodDays: 16.689 }, visual: { color: 0x6f6860, pattern: 'moon' }, feature: '古老且陨坑密布。' }
        ]
    },
    saturn: {
        id: 'saturn',
        name: '土星',
        nameEn: 'Saturn',
        type: '气态巨行星',
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
            { id: 'titan', name: '土卫六', nameEn: 'Titan', radiusKm: 2574.7, massKg: 1.345e23, orbit: { semiMajorAxisKm: 1221870, eccentricity: 0.0288, inclinationDeg: 0.35, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 40, orbitalPeriodDays: 15.945 }, visual: { color: 0xc69f61, pattern: 'cloud' }, feature: '拥有浓厚氮气大气和甲烷循环。' },
            { id: 'enceladus', name: '土卫二', nameEn: 'Enceladus', radiusKm: 252.1, massKg: 1.080e20, orbit: { semiMajorAxisKm: 238042, eccentricity: 0.0047, inclinationDeg: 0.02, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 160, orbitalPeriodDays: 1.370 }, visual: { color: 0xf2f2ec, pattern: 'ice' }, feature: '南极喷流暗示地下海洋。' },
            { id: 'mimas', name: '土卫一', nameEn: 'Mimas', radiusKm: 198.2, massKg: 3.750e19, orbit: { semiMajorAxisKm: 185404, eccentricity: 0.0196, inclinationDeg: 1.57, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 280, orbitalPeriodDays: 0.942 }, visual: { color: 0xaaa59b, pattern: 'moon' }, feature: '赫歇尔撞击坑非常醒目。' }
        ]
    },
    uranus: {
        id: 'uranus',
        name: '天王星',
        nameEn: 'Uranus',
        type: '冰巨行星',
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
            { id: 'titania', name: '天卫三', nameEn: 'Titania', radiusKm: 788.4, massKg: 3.420e21, orbit: { semiMajorAxisKm: 435910, eccentricity: 0.0011, inclinationDeg: 0.34, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 75, orbitalPeriodDays: 8.706 }, visual: { color: 0x918b86, pattern: 'moon' }, feature: '天王星最大卫星。' },
            { id: 'oberon', name: '天卫四', nameEn: 'Oberon', radiusKm: 761.4, massKg: 3.010e21, orbit: { semiMajorAxisKm: 583520, eccentricity: 0.0014, inclinationDeg: 0.06, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 230, orbitalPeriodDays: 13.463 }, visual: { color: 0x716b68, pattern: 'moon' }, feature: '外侧大卫星，表面较暗。' }
        ]
    },
    neptune: {
        id: 'neptune',
        name: '海王星',
        nameEn: 'Neptune',
        type: '冰巨行星',
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
            { id: 'triton', name: '海卫一', nameEn: 'Triton', radiusKm: 1353.4, massKg: 2.140e22, orbit: { semiMajorAxisKm: 354759, eccentricity: 0.000016, inclinationDeg: 156.9, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 130, orbitalPeriodDays: -5.877 }, visual: { color: 0xb6b0aa, pattern: 'ice' }, feature: '逆行轨道，可能是被捕获的柯伊伯带天体。' }
        ]
    },
    ceres: {
        id: 'ceres',
        name: '谷神星',
        nameEn: 'Ceres',
        type: '矮行星 / 小行星带最大天体',
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
            { id: 'charon', name: '卡戎', nameEn: 'Charon', radiusKm: 606, massKg: 1.586e21, orbit: { semiMajorAxisKm: 19591, eccentricity: 0.0002, inclinationDeg: 0.08, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 60, orbitalPeriodDays: 6.387 }, visual: { color: 0x9a958d, pattern: 'moon' }, feature: '与冥王星组成双天体系统，二者共同绕质心运动。' }
        ]
    },
    eris: {
        id: 'eris',
        name: '阋神星',
        nameEn: 'Eris',
        type: '矮行星 / 离散盘天体',
        radiusKm: 1163,
        massKg: 1.6466e22,
        rotationPeriodHours: 25.9,
        surfaceTemperature: '约 -243°C',
        composition: '高反照率甲烷冰表面，岩冰内部',
        feature: '质量略大于冥王星，发现后推动了行星定义的重新讨论。',
        orbit: { semiMajorAxisKm: 67.78 * AU_KM, eccentricity: 0.44, inclinationDeg: 44.04, longitudeAscendingNodeDeg: 35.95, argumentPeriapsisDeg: 150.8, meanAnomalyDeg: 204.2, orbitalPeriodDays: 203830 },
        visual: { color: 0xdad7cc, roughness: 0.9, pattern: 'ice' },
        moons: [
            { id: 'dysnomia', name: '迪丝诺美亚', nameEn: 'Dysnomia', radiusKm: 350, orbit: { semiMajorAxisKm: 37300, eccentricity: 0.01, inclinationDeg: 0, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 120, orbitalPeriodDays: 15.77 }, visual: { color: 0xb8b6ae, pattern: 'moon' }, feature: '阋神星唯一已知卫星。' }
        ]
    },
    halley: {
        id: 'halley',
        name: '哈雷彗星',
        nameEn: '1P/Halley',
        type: '周期彗星',
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
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AU_KM, LIGHT_YEAR_KM, SIMULATION, PLANET_DATA, PLANET_ORDER, CELESTIAL_CATALOG };
}
