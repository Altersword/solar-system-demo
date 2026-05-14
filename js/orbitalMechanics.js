/**
 * 开普勒轨道计算工具。
 * 输入为真实轨道元素，输出为右手坐标系中的 3D 位置。
 */

const DEG_TO_RAD = Math.PI / 180;
const TWO_PI = Math.PI * 2;

function normalizeRadians(value) {
    return ((value % TWO_PI) + TWO_PI) % TWO_PI;
}

function solveKepler(meanAnomaly, eccentricity) {
    const M = normalizeRadians(meanAnomaly);
    let E = eccentricity < 0.8 ? M : Math.PI;

    for (let i = 0; i < 8; i += 1) {
        const f = E - eccentricity * Math.sin(E) - M;
        const fp = 1 - eccentricity * Math.cos(E);
        E -= f / fp;
    }

    return E;
}

function getOrbitPosition(orbit, elapsedDays, distanceScaleFn) {
    const period = Math.abs(orbit.orbitalPeriodDays);
    const direction = orbit.orbitalPeriodDays < 0 ? -1 : 1;
    const meanMotion = direction * TWO_PI / period;
    const meanAnomaly = (orbit.meanAnomalyDeg || 0) * DEG_TO_RAD + elapsedDays * meanMotion;
    const e = orbit.eccentricity || 0;
    const E = solveKepler(meanAnomaly, e);

    const cosE = Math.cos(E);
    const sinE = Math.sin(E);
    const trueAnomaly = Math.atan2(Math.sqrt(1 - e * e) * sinE, cosE - e);
    const radiusKm = orbit.semiMajorAxisKm * (1 - e * cosE);
    const radius = distanceScaleFn(radiusKm);

    const omega = (orbit.argumentPeriapsisDeg || 0) * DEG_TO_RAD;
    const node = (orbit.longitudeAscendingNodeDeg || 0) * DEG_TO_RAD;
    const inc = (orbit.inclinationDeg || 0) * DEG_TO_RAD;
    const u = trueAnomaly + omega;

    const cosNode = Math.cos(node);
    const sinNode = Math.sin(node);
    const cosInc = Math.cos(inc);
    const sinInc = Math.sin(inc);
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);

    return new THREE.Vector3(
        radius * (cosNode * cosU - sinNode * sinU * cosInc),
        radius * (sinU * sinInc),
        radius * (sinNode * cosU + cosNode * sinU * cosInc)
    );
}

function buildOrbitPoints(orbit, distanceScaleFn, segments = 256) {
    const points = [];
    const baseMean = orbit.meanAnomalyDeg || 0;
    const period = Math.abs(orbit.orbitalPeriodDays || 1);

    for (let i = 0; i <= segments; i += 1) {
        const sample = {
            ...orbit,
            meanAnomalyDeg: baseMean + (i / segments) * 360,
            orbitalPeriodDays: period
        };
        points.push(getOrbitPosition(sample, 0, distanceScaleFn));
    }

    return points;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalizeRadians, solveKepler, getOrbitPosition, buildOrbitPoints };
}
