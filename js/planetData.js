/**
 * 太阳系天体数据。
 * 物理数据使用真实单位；渲染缩放只在 SolarSystemRenderer 中处理。
 */

const AU_KM = 149597870.7;

const SIMULATION = {
    epoch: 'J2000 approximate elements',
    defaultDaysPerSecond: 1,
    timeScales: [0, 0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000],
    displayModes: {
        balanced: {
            name: '观赏比例',
            description: '距离压缩，半径放大，适合观察整体结构',
            orbitBase: 34,
            orbitScale: 57,
            orbitExponent: 0.72,
            radiusScale: 3.25,
            radiusExponent: 0.45,
            minPlanetRadius: 1.25,
            sunRadius: 18,
            moonDistanceScale: 0.000018,
            moonRadiusScale: 0.0012,
            minMoonRadius: 0.45
        },
        compact: {
            name: '真实距离感',
            description: '轨道间距更接近真实差异，内行星会更拥挤',
            orbitBase: 26,
            orbitScale: 34,
            orbitExponent: 0.88,
            radiusScale: 2.7,
            radiusExponent: 0.42,
            minPlanetRadius: 0.9,
            sunRadius: 14,
            moonDistanceScale: 0.000014,
            moonRadiusScale: 0.001,
            minMoonRadius: 0.35
        }
    }
};

const PLANET_DATA = {
    sun: {
        id: 'sun',
        name: '太阳',
        nameEn: 'Sun',
        type: 'G2V型主序星',
        radiusKm: 696340,
        massKg: 1.9885e30,
        rotationPeriodHours: 648,
        surfaceTemperature: '约 5778 K',
        composition: '氢约73%，氦约25%，少量重元素',
        feature: '太阳系中心天体，能量来自核心氢核聚变。',
        visual: {
            color: 0xffc65a,
            glow: 0xff9f1c
        }
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
        surfaceTemperature: '白天约430°C，夜间约-180°C',
        composition: '大型金属核，硅酸盐地幔和撞击坑密布的岩质表面',
        feature: '太阳系最小行星，轨道偏心率最大。',
        orbit: {
            semiMajorAxisKm: 0.387098 * AU_KM,
            eccentricity: 0.20563,
            inclinationDeg: 7.005,
            longitudeAscendingNodeDeg: 48.331,
            argumentPeriapsisDeg: 29.124,
            meanAnomalyDeg: 174.796,
            orbitalPeriodDays: 87.969
        },
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
        surfaceTemperature: '表面平均约462°C',
        composition: '岩质行星，厚二氧化碳大气和硫酸云层',
        atmosphere: '二氧化碳约96.5%，氮约3.5%',
        feature: '浓厚温室大气，逆向自转。',
        orbit: {
            semiMajorAxisKm: 0.723332 * AU_KM,
            eccentricity: 0.00677,
            inclinationDeg: 3.3947,
            longitudeAscendingNodeDeg: 76.680,
            argumentPeriapsisDeg: 54.884,
            meanAnomalyDeg: 50.115,
            orbitalPeriodDays: 224.701
        },
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
        surfaceTemperature: '表面平均约15°C',
        composition: '铁镍核心，硅酸盐地幔，液态水海洋和大陆地壳',
        atmosphere: '氮约78%，氧约21%，氩约0.93%',
        feature: '目前已知唯一拥有稳定液态水海洋和生命的行星。',
        orbit: {
            semiMajorAxisKm: 1.000000 * AU_KM,
            eccentricity: 0.01671,
            inclinationDeg: 0.000,
            longitudeAscendingNodeDeg: -11.260,
            argumentPeriapsisDeg: 102.947,
            meanAnomalyDeg: 357.529,
            orbitalPeriodDays: 365.256
        },
        visual: { color: 0x2d66bd, secondaryColor: 0x4f8b4b, cloudColor: 0xffffff, roughness: 0.56, pattern: 'earth' },
        moons: [
            {
                id: 'moon',
                name: '月球',
                nameEn: 'Moon',
                radiusKm: 1737.4,
                massKg: 7.342e22,
                orbit: {
                    semiMajorAxisKm: 384400,
                    eccentricity: 0.0549,
                    inclinationDeg: 5.145,
                    longitudeAscendingNodeDeg: 125.08,
                    argumentPeriapsisDeg: 318.15,
                    meanAnomalyDeg: 115.37,
                    orbitalPeriodDays: 27.3217
                },
                visual: { color: 0xb8b5aa, pattern: 'moon' },
                feature: '潮汐锁定，稳定地球自转轴并驱动潮汐。'
            }
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
        surfaceTemperature: '表面平均约-63°C',
        composition: '富含氧化铁的岩质表面，薄二氧化碳大气',
        atmosphere: '二氧化碳约95.3%，氮约2.7%，氩约1.6%',
        feature: '拥有奥林帕斯山和水活动遗迹。',
        orbit: {
            semiMajorAxisKm: 1.523679 * AU_KM,
            eccentricity: 0.0934,
            inclinationDeg: 1.850,
            longitudeAscendingNodeDeg: 49.558,
            argumentPeriapsisDeg: 286.502,
            meanAnomalyDeg: 19.373,
            orbitalPeriodDays: 686.980
        },
        visual: { color: 0xb95b31, secondaryColor: 0x7f3b23, roughness: 0.92, pattern: 'mars' },
        moons: [
            {
                id: 'phobos',
                name: '火卫一',
                nameEn: 'Phobos',
                radiusKm: 11.1,
                massKg: 1.066e16,
                orbit: { semiMajorAxisKm: 9376, eccentricity: 0.0151, inclinationDeg: 1.08, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 40, orbitalPeriodDays: 0.3189 },
                visual: { color: 0x77706a, pattern: 'rocky' },
                feature: '靠近火星，轨道正在缓慢衰减。'
            },
            {
                id: 'deimos',
                name: '火卫二',
                nameEn: 'Deimos',
                radiusKm: 6.2,
                massKg: 1.476e15,
                orbit: { semiMajorAxisKm: 23463, eccentricity: 0.0002, inclinationDeg: 1.79, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 210, orbitalPeriodDays: 1.2624 },
                visual: { color: 0x68625f, pattern: 'rocky' },
                feature: '小型不规则卫星，表面覆盖尘埃。'
            }
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
        surfaceTemperature: '云顶约-145°C',
        composition: '主要由氢和氦构成，可能拥有岩冰核心',
        atmosphere: '氢约90%，氦约10%，含氨、甲烷、水汽等微量成分',
        feature: '太阳系最大行星，拥有强磁场和大红斑。',
        orbit: {
            semiMajorAxisKm: 5.2044 * AU_KM,
            eccentricity: 0.0489,
            inclinationDeg: 1.303,
            longitudeAscendingNodeDeg: 100.464,
            argumentPeriapsisDeg: 273.867,
            meanAnomalyDeg: 20.020,
            orbitalPeriodDays: 4332.59
        },
        visual: { color: 0xd6b07e, secondaryColor: 0x9c6b45, roughness: 0.7, pattern: 'jupiter' },
        moons: [
            { id: 'io', name: '木卫一', nameEn: 'Io', radiusKm: 1821.6, massKg: 8.932e22, orbit: { semiMajorAxisKm: 421700, eccentricity: 0.0041, inclinationDeg: 0.04, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 20, orbitalPeriodDays: 1.769 }, visual: { color: 0xdcc967, pattern: 'io' }, feature: '火山活动最活跃的天体之一。' },
            { id: 'europa', name: '木卫二', nameEn: 'Europa', radiusKm: 1560.8, massKg: 4.800e22, orbit: { semiMajorAxisKm: 671100, eccentricity: 0.009, inclinationDeg: 0.47, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 90, orbitalPeriodDays: 3.551 }, visual: { color: 0xc8c1a9, pattern: 'ice' }, feature: '冰壳下可能存在全球海洋。' },
            { id: 'ganymede', name: '木卫三', nameEn: 'Ganymede', radiusKm: 2634.1, massKg: 1.482e23, orbit: { semiMajorAxisKm: 1070400, eccentricity: 0.0013, inclinationDeg: 0.20, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 180, orbitalPeriodDays: 7.155 }, visual: { color: 0x8f8880, pattern: 'moon' }, feature: '太阳系最大卫星。' },
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
        surfaceTemperature: '云顶约-178°C',
        composition: '以氢和氦为主，密度低于水',
        atmosphere: '氢约96%，氦约3%，少量甲烷和氨',
        feature: '拥有太阳系最醒目的环系统。',
        orbit: {
            semiMajorAxisKm: 9.5826 * AU_KM,
            eccentricity: 0.0565,
            inclinationDeg: 2.485,
            longitudeAscendingNodeDeg: 113.665,
            argumentPeriapsisDeg: 339.392,
            meanAnomalyDeg: 317.020,
            orbitalPeriodDays: 10759.22
        },
        rings: { innerRadiusKm: 74658, outerRadiusKm: 136775, color: 0xd7c08c },
        visual: { color: 0xe3c987, secondaryColor: 0xbfa66f, roughness: 0.75, pattern: 'saturn' },
        moons: [
            { id: 'titan', name: '土卫六', nameEn: 'Titan', radiusKm: 2574.7, massKg: 1.345e23, orbit: { semiMajorAxisKm: 1221870, eccentricity: 0.0288, inclinationDeg: 0.35, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 40, orbitalPeriodDays: 15.945 }, visual: { color: 0xc69f61, pattern: 'cloud' }, feature: '拥有浓厚氮气大气和甲烷循环。' },
            { id: 'enceladus', name: '土卫二', nameEn: 'Enceladus', radiusKm: 252.1, massKg: 1.080e20, orbit: { semiMajorAxisKm: 238042, eccentricity: 0.0047, inclinationDeg: 0.02, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 160, orbitalPeriodDays: 1.370 }, visual: { color: 0xf2f2ec, pattern: 'ice' }, feature: '南极喷流暗示地下海洋。' },
            { id: 'mimas', name: '土卫一', nameEn: 'Mimas', radiusKm: 198.2, massKg: 3.750e19, orbit: { semiMajorAxisKm: 185404, eccentricity: 0.0196, inclinationDeg: 1.57, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 280, orbitalPeriodDays: 0.942 }, visual: { color: 0xaaa59b, pattern: 'moon' }, feature: '赫歇尔撞击坑极为醒目。' }
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
        surfaceTemperature: '云顶约-224°C',
        composition: '氢、氦和富含水/氨/甲烷的冰质物质',
        atmosphere: '氢约82.5%，氦约15.2%，甲烷约2.3%',
        feature: '自转轴几乎躺倒，呈淡青色。',
        orbit: {
            semiMajorAxisKm: 19.2184 * AU_KM,
            eccentricity: 0.0463,
            inclinationDeg: 0.773,
            longitudeAscendingNodeDeg: 74.006,
            argumentPeriapsisDeg: 96.998,
            meanAnomalyDeg: 142.238,
            orbitalPeriodDays: 30685.4
        },
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
        surfaceTemperature: '云顶约-214°C',
        composition: '氢、氦、甲烷和深层水/氨/甲烷冰质物质',
        atmosphere: '氢约80%，氦约19%，甲烷约1%',
        feature: '拥有太阳系最快的行星风。',
        orbit: {
            semiMajorAxisKm: 30.1104 * AU_KM,
            eccentricity: 0.00946,
            inclinationDeg: 1.770,
            longitudeAscendingNodeDeg: 131.784,
            argumentPeriapsisDeg: 276.336,
            meanAnomalyDeg: 256.228,
            orbitalPeriodDays: 60190
        },
        visual: { color: 0x3459d4, secondaryColor: 0x2440a0, roughness: 0.6, pattern: 'iceGiant' },
        moons: [
            {
                id: 'triton',
                name: '海卫一',
                nameEn: 'Triton',
                radiusKm: 1353.4,
                massKg: 2.140e22,
                orbit: { semiMajorAxisKm: 354759, eccentricity: 0.000016, inclinationDeg: 156.9, longitudeAscendingNodeDeg: 0, argumentPeriapsisDeg: 0, meanAnomalyDeg: 130, orbitalPeriodDays: -5.877 },
                visual: { color: 0xb6b0aa, pattern: 'ice' },
                feature: '逆行轨道，可能是被捕获的柯伊伯带天体。'
            }
        ]
    }
};

const PLANET_ORDER = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AU_KM, SIMULATION, PLANET_DATA, PLANET_ORDER };
}
