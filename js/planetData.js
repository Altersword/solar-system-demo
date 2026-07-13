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
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AU_KM, LIGHT_YEAR_KM, SIMULATION, PLANET_DATA, PLANET_ORDER, CELESTIAL_CATALOG };
}
