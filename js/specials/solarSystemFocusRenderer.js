/**
 * Near-view renderer for solar-system planets, moons, and comets.
 * Phase 1: type coverage. Phase 2: stronger profiles for key bodies.
 * Far-view meshes stay in SolarBodies.
 */
/* global THREE */
class SolarSystemFocusRenderer {
    constructor(host) {
        this.host = host;
        this.group = null;
        this.core = null;
        this.atmosphere = null;
        this.rings = null;
        this.coma = null;
        this.tail = null;
        this.ionTail = null;
        this.clouds = null;
        this.extras = [];
        this.effectType = null;
        this.profile = null;
        this.entryId = null;
    }

    create(entry) {
        const group = new THREE.Group();
        group.name = `${entry.id}-solar-focus-model`;
        group.userData.effectType = entry.effectType;
        this.effectType = entry.effectType;
        this.entryId = entry.id;
        this.profile = this.resolveProfile(entry);
        this.extras = [];

        const coreSize = this.profile.coreSize;
        const material = new THREE.MeshBasicMaterial({
            map: this.createFocusTexture(entry),
            color: 0xffffff
        });
        const core = new THREE.Mesh(new THREE.SphereGeometry(coreSize, 160, 120), material);
        core.name = `${entry.id}-focus-core`;
        if (entry.id === 'uranus') {
            core.rotation.z = THREE.MathUtils.degToRad(90);
        }
        group.add(core);

        if (this.profile.atmosphere) {
            const atmosphere = this.host.createGlowMesh(
                coreSize * this.profile.atmosphere.scale,
                this.profile.atmosphere.color,
                this.profile.atmosphere.opacity
            );
            atmosphere.name = `${entry.id}-focus-atmosphere`;
            atmosphere.userData.baseOpacity = this.profile.atmosphere.opacity;
            core.add(atmosphere);
            this.atmosphere = atmosphere;
        }

        if (this.profile.clouds) {
            // Gas giants get textured cloud shells; rocky worlds keep soft glow clouds.
            if (entry.effectType === 'planet-gas' || entry.effectType === 'planet-ice') {
                const cloudShell = this.createTexturedCloudShell(entry, coreSize);
                core.add(cloudShell);
                this.clouds = cloudShell;
            } else {
                const clouds = this.host.createGlowMesh(
                    coreSize * this.profile.clouds.scale,
                    this.profile.clouds.color,
                    this.profile.clouds.opacity
                );
                clouds.name = `${entry.id}-focus-clouds`;
                clouds.userData.baseOpacity = this.profile.clouds.opacity;
                core.add(clouds);
                this.clouds = clouds;
            }
        }

        if (entry.rings || this.profile.forceRings) {
            const rings = this.createFocusRings(entry, coreSize);
            if (entry.id === 'uranus') rings.rotation.z = THREE.MathUtils.degToRad(90);
            if (entry.id === 'saturn') rings.rotation.x = THREE.MathUtils.degToRad(16);
            group.add(rings);
            this.rings = rings;
        }

        if (entry.effectType === 'comet' || entry.comet) {
            const coma = this.host.createGlowMesh(coreSize * 5.4, 0xaedfff, 0.36);
            coma.name = `${entry.id}-focus-coma`;
            coma.userData.baseOpacity = 0.36;
            core.add(coma);
            this.coma = coma;

            const tail = this.createCometTail(coreSize, 0xbfe8ff, 1100, 1.0);
            group.add(tail);
            this.tail = tail;

            const ionTail = this.createCometTail(coreSize, 0x7ec8ff, 700, 1.35);
            ionTail.position.y = coreSize * 0.25;
            group.add(ionTail);
            this.ionTail = ionTail;
        }

        if (this.profile.surfaceSprites) {
            group.add(this.createSurfaceSprites(entry, coreSize, this.profile.surfaceSprites));
        }

        this.addBodyExtras(group, entry, coreSize);

        if (this.profile.showMoonHint && entry.moons?.length) {
            group.add(this.createMoonHint(entry, coreSize));
        }

        this.group = group;
        this.core = core;
        return group;
    }

    resolveProfile(entry) {
        const type = entry.effectType;
        const id = entry.id;
        const base = {
            coreSize: 26,
            atmosphere: null,
            clouds: null,
            forceRings: false,
            surfaceSprites: 0,
            showMoonHint: false,
            spin: 0.08,
            cameraDistance: 110,
            bloomStrength: 0.22,
            bloomThreshold: 0.55
        };

        if (type === 'planet-terrestrial') {
            Object.assign(base, {
                coreSize: id === 'mercury' ? 20 : id === 'mars' ? 25 : id === 'earth' ? 30 : 28,
                atmosphere: entry.atmosphere || id === 'earth' || id === 'venus' || id === 'mars'
                    ? {
                        scale: id === 'venus' ? 1.18 : id === 'earth' ? 1.14 : id === 'mars' ? 1.08 : 1.1,
                        color: id === 'venus' ? 0xffc978 : id === 'earth' ? 0x6fb0ff : id === 'mars' ? 0xffb08a : 0x6f8dff,
                        opacity: id === 'venus' ? 0.36 : id === 'earth' ? 0.44 : id === 'mars' ? 0.16 : 0.18
                    }
                    : null,
                clouds: id === 'earth' || id === 'venus'
                    ? {
                        scale: id === 'venus' ? 1.09 : 1.06,
                        color: entry.visual?.cloudColor || 0xffffff,
                        opacity: id === 'venus' ? 0.24 : 0.16
                    }
                    : null,
                surfaceSprites: id === 'mercury' ? 24 : id === 'mars' ? 20 : id === 'earth' ? 8 : 12,
                spin: id === 'venus' ? -0.03 : 0.09,
                cameraDistance: id === 'earth' ? 105 : 100,
                bloomStrength: id === 'earth' ? 0.2 : 0.16
            });
        } else if (type === 'planet-gas') {
            Object.assign(base, {
                coreSize: id === 'jupiter' ? 38 : 36,
                atmosphere: { scale: 1.1, color: entry.visual?.color || 0xd6b07e, opacity: 0.18 },
                clouds: { scale: 1.04, color: 0xffe2b0, opacity: 0.12 },
                forceRings: id === 'saturn',
                showMoonHint: true,
                spin: id === 'jupiter' ? 0.22 : 0.18,
                cameraDistance: id === 'saturn' ? 175 : 150,
                bloomStrength: 0.22
            });
        } else if (type === 'planet-ice') {
            Object.assign(base, {
                coreSize: 31,
                atmosphere: { scale: 1.12, color: entry.visual?.color || 0x6f8dff, opacity: 0.22 },
                forceRings: id === 'uranus',
                spin: id === 'uranus' ? -0.07 : 0.09,
                cameraDistance: 128,
                bloomStrength: 0.2
            });
        } else if (type === 'dwarf-planet') {
            Object.assign(base, {
                coreSize: 22,
                surfaceSprites: 18,
                atmosphere: id === 'pluto' ? { scale: 1.09, color: 0xc9d7ff, opacity: 0.12 } : null,
                spin: 0.06,
                cameraDistance: 95,
                bloomStrength: 0.15
            });
        } else if (type === 'moon') {
            const isIo = id === 'io';
            const isEuropa = id === 'europa';
            const isTitan = id === 'titan';
            Object.assign(base, {
                coreSize: isTitan ? 23 : (id === 'moon' ? 22 : isIo || isEuropa ? 21 : 20),
                surfaceSprites: isIo || isEuropa || isTitan ? 0 : (id === 'moon' ? 34 : entry.visual?.pattern === 'ice' ? 10 : 20),
                atmosphere: isTitan
                    ? { scale: 1.19, color: 0xe3a450, opacity: 0.3 }
                    : isEuropa
                        ? { scale: 1.035, color: 0xaedbff, opacity: 0.045 }
                        : null,
                clouds: isTitan ? { scale: 1.075, color: 0xf0bd70, opacity: 0.055 } : null,
                spin: isTitan ? 0.024 : isEuropa ? 0.03 : isIo ? 0.038 : 0.045,
                cameraDistance: isTitan ? 92 : isIo ? 84 : isEuropa ? 82 : (id === 'moon' ? 82 : 78),
                bloomStrength: isIo ? 0.18 : isTitan ? 0.16 : isEuropa ? 0.11 : 0.1
            });
        } else if (type === 'comet') {
            Object.assign(base, {
                coreSize: 15,
                surfaceSprites: 16,
                spin: 0.13,
                cameraDistance: 100,
                bloomStrength: 0.32,
                bloomThreshold: 0.4
            });
        }

        return base;
    }

    createFocusTexture(entry) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const random = this.host.seededRandom(`${entry.id}-focus-tex-v3`);
        const base = new THREE.Color(entry.visual?.color || 0x888888);
        const secondary = new THREE.Color(entry.visual?.secondaryColor || entry.visual?.color || 0x666666);
        const cloud = new THREE.Color(entry.visual?.cloudColor || 0xffffff);
        const id = entry.id;
        const pattern = entry.visual?.pattern;

        const fillBase = () => {
            ctx.fillStyle = `#${base.getHexString()}`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        const drawCrater = (x, y, r, depth = 0.55) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, `rgba(20,18,16,${0.35 * depth})`);
            g.addColorStop(0.45, `rgba(40,36,32,${0.28 * depth})`);
            g.addColorStop(0.72, `rgba(180,175,165,${0.22 * depth})`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `rgba(230,225,210,${0.18 * depth})`;
            ctx.lineWidth = Math.max(1, r * 0.08);
            ctx.beginPath();
            ctx.arc(x, y, r * 0.92, 0, Math.PI * 2);
            ctx.stroke();
        };

        if (pattern === 'jupiter' || pattern === 'saturn' || entry.effectType === 'planet-gas') {
            for (let y = 0; y < canvas.height; y += 1) {
                const n = Math.sin(y * 0.045) * 0.5 + Math.sin(y * 0.11 + 1.7) * 0.3 + Math.sin(y * 0.23) * 0.2;
                const t = (n + 1) * 0.5;
                const color = base.clone().lerp(secondary, 0.15 + t * 0.7);
                const wobble = Math.sin(y * 0.07 + random() * 0.4) * 18 + Math.sin(y * 0.019) * 28;
                ctx.fillStyle = `rgb(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)})`;
                ctx.fillRect(0, y, canvas.width, 1);
                if (y % 17 < 2) {
                    ctx.fillStyle = 'rgba(255,245,220,0.16)';
                    ctx.fillRect(wobble, y, canvas.width, 1);
                }
                if (y % 29 < 2) {
                    ctx.fillStyle = 'rgba(90,50,25,0.14)';
                    ctx.fillRect(-wobble, y, canvas.width, 1);
                }
            }
            // Storm ovals / turbulence
            for (let i = 0; i < (id === 'jupiter' ? 28 : 18); i += 1) {
                const x = random() * canvas.width;
                const y = 40 + random() * (canvas.height - 80);
                const rx = 18 + random() * 55;
                const ry = 5 + random() * 14;
                ctx.fillStyle = id === 'jupiter'
                    ? `rgba(${140 + random() * 60},${50 + random() * 40},${30 + random() * 20},${0.18 + random() * 0.25})`
                    : `rgba(255,230,180,${0.08 + random() * 0.12})`;
                ctx.beginPath();
                ctx.ellipse(x, y, rx, ry, (random() - 0.5) * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
            if (id === 'jupiter') {
                ctx.fillStyle = 'rgba(168,48,28,0.82)';
                ctx.beginPath();
                ctx.ellipse(690, 300, 70, 28, -0.22, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(210,90,45,0.35)';
                ctx.beginPath();
                ctx.ellipse(690, 300, 48, 16, -0.22, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (pattern === 'earth' || id === 'earth') {
            // Ocean base
            const ocean = ctx.createLinearGradient(0, 0, 0, canvas.height);
            ocean.addColorStop(0, '#1b4f9a');
            ocean.addColorStop(0.5, '#2d66bd');
            ocean.addColorStop(1, '#163f7d');
            ctx.fillStyle = ocean;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Continents
            ctx.fillStyle = `#${secondary.getHexString()}`;
            for (let i = 0; i < 70; i += 1) {
                ctx.beginPath();
                ctx.ellipse(
                    random() * canvas.width,
                    random() * canvas.height,
                    22 + random() * 70,
                    10 + random() * 34,
                    random() * Math.PI,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
            // Cloud streaks
            for (let i = 0; i < 90; i += 1) {
                ctx.fillStyle = `rgba(255,255,255,${0.08 + random() * 0.18})`;
                ctx.fillRect(random() * canvas.width, random() * canvas.height, 30 + random() * 120, 2 + random() * 6);
            }
            // Polar ice
            ctx.fillStyle = 'rgba(230,240,255,0.55)';
            ctx.fillRect(0, 0, canvas.width, 28);
            ctx.fillRect(0, canvas.height - 28, canvas.width, 28);
        } else if (pattern === 'mars' || id === 'mars') {
            fillBase();
            for (let i = 0; i < 80; i += 1) {
                const c = secondary.clone().lerp(base, random());
                ctx.fillStyle = `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${0.15 + random() * 0.3})`;
                ctx.beginPath();
                ctx.ellipse(random() * canvas.width, random() * canvas.height, 20 + random() * 70, 8 + random() * 28, random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
            for (let i = 0; i < 55; i += 1) {
                drawCrater(random() * canvas.width, random() * canvas.height, 4 + random() * 18, 0.45 + random() * 0.4);
            }
            ctx.fillStyle = 'rgba(245,248,255,0.72)';
            ctx.fillRect(0, 0, canvas.width, 34);
            ctx.fillRect(0, canvas.height - 34, canvas.width, 34);
        } else if (id === 'io' || pattern === 'io') {
            // Io: sulfur-rich plains, lava fields, and volcanic paterae rather than cratered rock.
            const sulfur = ctx.createLinearGradient(0, 0, 0, canvas.height);
            sulfur.addColorStop(0, '#f2d56e');
            sulfur.addColorStop(0.48, '#d9bb47');
            sulfur.addColorStop(1, '#a8792a');
            ctx.fillStyle = sulfur;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < 76; i += 1) {
                ctx.fillStyle = `rgba(255,238,130,${0.06 + random() * 0.14})`;
                ctx.beginPath();
                ctx.ellipse(random() * canvas.width, random() * canvas.height, 18 + random() * 72, 8 + random() * 28, random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
            for (let i = 0; i < 26; i += 1) {
                const x = random() * canvas.width;
                const y = random() * canvas.height;
                const radius = 10 + random() * 34;
                const plume = ctx.createRadialGradient(x, y, radius * 0.12, x, y, radius);
                plume.addColorStop(0, 'rgba(82,38,22,0.78)');
                plume.addColorStop(0.32, 'rgba(177,58,24,0.55)');
                plume.addColorStop(0.64, 'rgba(230,123,35,0.2)');
                plume.addColorStop(1, 'rgba(230,123,35,0)');
                ctx.fillStyle = plume;
                ctx.beginPath();
                ctx.ellipse(x, y, radius, radius * (0.5 + random() * 0.28), random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = `rgba(86,41,23,${0.2 + random() * 0.2})`;
                ctx.lineWidth = 1 + random() * 2;
                ctx.beginPath();
                ctx.moveTo(x - radius * 0.25, y + radius * 0.1);
                ctx.bezierCurveTo(x - radius * 1.8, y + (random() - 0.5) * radius * 1.4, x + radius * 1.6, y + (random() - 0.5) * radius * 1.6, x + radius * 2.4, y + radius * 0.32);
                ctx.stroke();
            }
        } else if (id === 'europa') {
            // Europa: a bright ice shell cut through by long reddish-brown lineae.
            const ice = ctx.createLinearGradient(0, 0, 0, canvas.height);
            ice.addColorStop(0, '#eff5f2');
            ice.addColorStop(0.42, '#d7e2e3');
            ice.addColorStop(1, '#b9c9cc');
            ctx.fillStyle = ice;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < 105; i += 1) {
                ctx.fillStyle = `rgba(255,255,255,${0.025 + random() * 0.07})`;
                ctx.beginPath();
                ctx.ellipse(random() * canvas.width, random() * canvas.height, 30 + random() * 118, 3 + random() * 13, (random() - 0.5) * 0.35, 0, Math.PI * 2);
                ctx.fill();
            }
            for (let i = 0; i < 32; i += 1) {
                const y = 22 + random() * (canvas.height - 44);
                const start = -90 + random() * 120;
                ctx.strokeStyle = `rgba(${92 + Math.round(random() * 46)},${59 + Math.round(random() * 35)},${42 + Math.round(random() * 26)},${0.23 + random() * 0.23})`;
                ctx.lineWidth = 1.2 + random() * 3.2;
                ctx.beginPath();
                ctx.moveTo(start, y);
                for (let x = start; x < canvas.width + 100; x += 44) {
                    const bend = Math.sin(x * (0.009 + random() * 0.006) + y * 0.018) * (7 + random() * 17);
                    ctx.lineTo(x, y + bend + (random() - 0.5) * 12);
                }
                ctx.stroke();
            }
            for (let i = 0; i < 12; i += 1) {
                ctx.strokeStyle = `rgba(255,255,255,${0.11 + random() * 0.12})`;
                ctx.lineWidth = 1 + random() * 1.5;
                ctx.beginPath();
                ctx.moveTo(0, random() * canvas.height);
                ctx.quadraticCurveTo(canvas.width * 0.5, random() * canvas.height, canvas.width, random() * canvas.height);
                ctx.stroke();
            }
        } else if (id === 'titan') {
            // Titan: deep orange haze, latitude bands, muted clouds, and hints of dark hydrocarbon lakes.
            const haze = ctx.createLinearGradient(0, 0, 0, canvas.height);
            haze.addColorStop(0, '#d8ad61');
            haze.addColorStop(0.32, '#c98e3e');
            haze.addColorStop(0.7, '#a86329');
            haze.addColorStop(1, '#744019');
            ctx.fillStyle = haze;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let y = 0; y < canvas.height; y += 1) {
                const band = Math.sin(y * 0.045) * 0.5 + Math.sin(y * 0.012 + 1.4) * 0.5;
                ctx.fillStyle = band > 0
                    ? `rgba(255,213,132,${0.035 + band * 0.08})`
                    : `rgba(90,43,18,${0.02 + -band * 0.07})`;
                ctx.fillRect(0, y, canvas.width, 1);
            }
            for (let i = 0; i < 72; i += 1) {
                ctx.fillStyle = `rgba(255,221,147,${0.035 + random() * 0.11})`;
                ctx.beginPath();
                ctx.ellipse(random() * canvas.width, random() * canvas.height, 42 + random() * 150, 5 + random() * 20, (random() - 0.5) * 0.22, 0, Math.PI * 2);
                ctx.fill();
            }
            for (let i = 0; i < 15; i += 1) {
                ctx.fillStyle = `rgba(55,30,17,${0.1 + random() * 0.16})`;
                ctx.beginPath();
                ctx.ellipse(random() * canvas.width, 40 + random() * 150, 22 + random() * 76, 6 + random() * 20, random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (pattern === 'moon' || pattern === 'rocky' || entry.effectType === 'moon' || entry.effectType === 'dwarf-planet' || id === 'mercury') {
            // Grey rocky body with dense craters
            const lightRock = base.clone().lerp(new THREE.Color(0xffffff), 0.18);
            const darkRock = base.clone().lerp(new THREE.Color(0x000000), 0.22);
            const rock = ctx.createLinearGradient(0, 0, 0, canvas.height);
            rock.addColorStop(0, `#${lightRock.getHexString()}`);
            rock.addColorStop(0.5, `#${base.getHexString()}`);
            rock.addColorStop(1, `#${darkRock.getHexString()}`);
            ctx.fillStyle = rock;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Mare / dark patches
            for (let i = 0; i < (id === 'moon' ? 18 : 10); i += 1) {
                ctx.fillStyle = `rgba(40,38,35,${0.12 + random() * 0.2})`;
                ctx.beginPath();
                ctx.ellipse(random() * canvas.width, random() * canvas.height, 30 + random() * 90, 18 + random() * 50, random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
            // High crater density for moon
            const craterCount = id === 'moon' ? 220 : id === 'mercury' ? 160 : 90;
            for (let i = 0; i < craterCount; i += 1) {
                drawCrater(
                    random() * canvas.width,
                    random() * canvas.height,
                    2 + random() * (id === 'moon' ? 28 : 18),
                    0.4 + random() * 0.6
                );
            }
            // Bright ejecta rays for moon
            if (id === 'moon') {
                for (let i = 0; i < 8; i += 1) {
                    const x = random() * canvas.width;
                    const y = random() * canvas.height;
                    for (let r = 0; r < 12; r += 1) {
                        const ang = random() * Math.PI * 2;
                        const len = 20 + random() * 70;
                        ctx.strokeStyle = `rgba(230,225,210,${0.08 + random() * 0.1})`;
                        ctx.lineWidth = 1 + random() * 2;
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
                        ctx.stroke();
                    }
                    drawCrater(x, y, 8 + random() * 14, 0.8);
                }
            }
        } else if (pattern === 'iceGiant' || entry.effectType === 'planet-ice') {
            for (let y = 0; y < canvas.height; y += 1) {
                const t = y / canvas.height;
                const color = base.clone().lerp(secondary, 0.2 + Math.sin(t * Math.PI * 3) * 0.15);
                ctx.fillStyle = `rgb(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)})`;
                ctx.fillRect(0, y, canvas.width, 1);
            }
            for (let i = 0; i < 40; i += 1) {
                ctx.fillStyle = `rgba(200,230,255,${0.05 + random() * 0.1})`;
                ctx.beginPath();
                ctx.ellipse(random() * canvas.width, random() * canvas.height, 40 + random() * 100, 6 + random() * 16, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            if (id === 'neptune') {
                ctx.fillStyle = 'rgba(20,40,120,0.35)';
                ctx.beginPath();
                ctx.ellipse(620, 250, 55, 28, 0.1, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (pattern === 'cloud' || id === 'venus' || id === 'titan') {
            fillBase();
            for (let i = 0; i < 120; i += 1) {
                ctx.fillStyle = `rgba(${Math.round(cloud.r * 255)},${Math.round(cloud.g * 255)},${Math.round(cloud.b * 255)},${0.08 + random() * 0.16})`;
                ctx.beginPath();
                ctx.ellipse(random() * canvas.width, random() * canvas.height, 40 + random() * 100, 8 + random() * 24, random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (pattern === 'ice' || pattern === 'pluto') {
            fillBase();
            for (let i = 0; i < 50; i += 1) {
                ctx.fillStyle = `rgba(255,255,255,${0.08 + random() * 0.18})`;
                ctx.beginPath();
                ctx.ellipse(random() * canvas.width, random() * canvas.height, 20 + random() * 70, 10 + random() * 30, random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
            for (let i = 0; i < 40; i += 1) {
                drawCrater(random() * canvas.width, random() * canvas.height, 3 + random() * 14, 0.35);
            }
        } else {
            fillBase();
            for (let i = 0; i < 1200; i += 1) {
                const value = Math.floor(70 + random() * 100);
                ctx.fillStyle = `rgba(${value},${value},${value},${0.05 + random() * 0.12})`;
                ctx.fillRect(random() * canvas.width, random() * canvas.height, 1 + random() * 3, 1 + random() * 2);
            }
            for (let i = 0; i < 60; i += 1) {
                drawCrater(random() * canvas.width, random() * canvas.height, 3 + random() * 16, 0.4);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = 8;
        texture.needsUpdate = true;
        return texture;
    }

    createTexturedCloudShell(entry, coreSize) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const random = this.host.seededRandom(`${entry.id}-cloudshell`);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < canvas.height; y += 1) {
            const alpha = 0.04 + (Math.sin(y * 0.08) * 0.5 + 0.5) * 0.1;
            ctx.fillStyle = `rgba(255,245,220,${alpha})`;
            ctx.fillRect(0, y, canvas.width, 1);
            if (y % 19 < 2) {
                ctx.fillStyle = `rgba(255,255,255,${0.06 + random() * 0.08})`;
                ctx.fillRect(Math.sin(y * 0.05) * 20, y, canvas.width, 1);
            }
        }
        for (let i = 0; i < 50; i += 1) {
            ctx.fillStyle = `rgba(255,255,255,${0.04 + random() * 0.08})`;
            ctx.beginPath();
            ctx.ellipse(random() * canvas.width, random() * canvas.height, 20 + random() * 80, 4 + random() * 12, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        const map = new THREE.CanvasTexture(canvas);
        map.encoding = THREE.sRGBEncoding;
        map.needsUpdate = true;
        const shell = new THREE.Mesh(
            new THREE.SphereGeometry(coreSize * (this.profile.clouds?.scale || 1.04), 128, 96),
            new THREE.MeshBasicMaterial({
                map,
                transparent: true,
                opacity: entry.id === 'jupiter' ? 0.28 : 0.22,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })
        );
        shell.name = `${entry.id}-textured-clouds`;
        shell.userData.baseOpacity = shell.material.opacity;
        shell.userData.speed = entry.id === 'jupiter' ? 0.07 : 0.045;
        this.extras.push(shell);
        return shell;
    }

    addBodyExtras(group, entry, coreSize) {
        const id = entry.id;
        if (id === 'earth') {
            group.add(this.createEarthCityLights(coreSize));
            group.add(this.createSoftCloudLayer(coreSize * 1.03, 0xffffff, 0.12, 0.035, 'earth-soft-clouds'));
        } else if (id === 'mars') {
            group.add(this.createPolarCaps(coreSize));
            group.add(this.createDustHaze(coreSize));
        } else if (id === 'jupiter') {
            // Red spot is already baked into texture; keep a soft animated highlight.
            group.add(this.createGreatRedSpot(coreSize));
            group.add(this.createSoftCloudLayer(coreSize * 1.025, 0xffe0b0, 0.1, 0.06, 'jupiter-haze'));
        } else if (id === 'saturn') {
            group.add(this.createSoftCloudLayer(coreSize * 1.02, 0xffe6b5, 0.09, 0.04, 'saturn-haze'));
        } else if (id === 'io') {
            group.add(this.createIoVolcanicActivity(coreSize));
        } else if (id === 'europa') {
            group.add(this.createEuropaFractures(coreSize));
        } else if (id === 'titan') {
            group.add(this.createTitanHaze(coreSize));
        } else if (id === 'moon' || id === 'mercury') {
            // Craters are primarily in the texture now; keep a few raised rim sprites for depth.
            group.add(this.createCraterField(coreSize, id === 'moon' ? 28 : 16));
        } else if (id === 'halley') {
            group.add(this.createCometJets(coreSize));
        } else if (entry.effectType === 'planet-ice') {
            group.add(this.createSoftCloudLayer(coreSize * 1.03, 0xcfe9ff, 0.1, 0.03, `${id}-ice-haze`));
        }
    }

    createIoVolcanicActivity(coreSize) {
        const group = new THREE.Group();
        group.name = 'io-volcanic-activity';
        // Surface-wide lava glow from volcanic plains
        const lavaGlow = this.host.createHaloSprite(0xff6a1a, coreSize * 1.35, 0.09);
        lavaGlow.name = 'io-lava-glow';
        lavaGlow.position.set(0.12, 0.08, 0.88).multiplyScalar(coreSize);
        lavaGlow.userData.baseOpacity = 0.09;
        lavaGlow.userData.phase = 2.8;
        group.add(lavaGlow);
        this.extras.push(lavaGlow);

        const sites = [
            { position: [0.02, 0.32, 0.95], color: 0xff8a32, size: 0.28, rise: 0.82, phase: 0.0 },
            { position: [-0.58, -0.18, 0.78], color: 0xffc24a, size: 0.22, rise: 0.6, phase: 1.7 },
            { position: [0.58, -0.34, 0.72], color: 0xff6f29, size: 0.2, rise: 0.52, phase: 3.1 },
            { position: [-0.28, 0.58, 0.76], color: 0xffaa44, size: 0.17, rise: 0.38, phase: 4.2 }
        ];
        sites.forEach((site, index) => {
            const normal = new THREE.Vector3(...site.position).normalize();
            const hotspot = this.host.createHaloSprite(site.color, coreSize * site.size, 0.3 + index * 0.04);
            hotspot.name = `io-volcanic-hotspot-${index}`;
            hotspot.position.copy(normal).multiplyScalar(coreSize * 1.022);
            hotspot.userData.baseOpacity = 0.3 + index * 0.04;
            hotspot.userData.phase = site.phase;
            hotspot.userData.baseScale = coreSize * site.size;
            group.add(hotspot);
            this.extras.push(hotspot);

            const tangent = new THREE.Vector3(-normal.y, normal.x, 0);
            if (tangent.lengthSq() < 0.001) tangent.set(1, 0, 0);
            tangent.normalize();
            const start = normal.clone().multiplyScalar(coreSize * 1.018);
            const rise = site.rise;
            const points = [
                start,
                start.clone().addScaledVector(normal, coreSize * rise * 0.33).addScaledVector(tangent, coreSize * 0.07),
                start.clone().addScaledVector(normal, coreSize * rise).addScaledVector(tangent, coreSize * (0.2 + index * 0.04))
            ];
            const plume = new THREE.Mesh(
                new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, coreSize * (0.02 - index * 0.002), 5, false),
                new THREE.MeshBasicMaterial({
                    color: index === 2 ? 0xd97a37 : 0xffd891,
                    transparent: true,
                    opacity: 0.25 - index * 0.025,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending
                })
            );
            plume.name = `io-volcanic-plume-${index}`;
            plume.userData.baseOpacity = 0.25 - index * 0.025;
            plume.userData.phase = site.phase + 0.5;
            plume.userData.rise = rise;
            group.add(plume);
            this.extras.push(plume);
        });
        return group;
    }
    createEuropaFractures(coreSize) {
        const group = new THREE.Group();
        group.name = 'europa-lineae';
        const toSurface = (latitude, longitude, radius) => new THREE.Vector3(
            radius * Math.cos(latitude) * Math.cos(longitude),
            radius * Math.sin(latitude),
            radius * Math.cos(latitude) * Math.sin(longitude)
        );
        // Primary long lineae — equatorial arc bands
        [1.24, 1.55, 1.83, 2.1, 2.35].forEach((longitude, index) => {
            const points = [];
            const steps = 24 - index * 2;
            for (let step = 0; step <= steps; step += 1) {
                const t = step / steps;
                const latitude = -1.0 + t * 2.0;
                const waveringLongitude = longitude + Math.sin(t * Math.PI * (2.1 + index * 0.35)) * (0.09 + index * 0.018);
                points.push(toSurface(latitude, waveringLongitude, coreSize * 1.018));
            }
            const fracture = new THREE.Mesh(
                new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 50, coreSize * (0.009 + index * 0.001), 4, false),
                new THREE.MeshBasicMaterial({
                    color: index % 2 === 0 ? 0x8b6249 : 0x6f4937,
                    transparent: true,
                    opacity: 0.22 - index * 0.025,
                    depthWrite: false
                })
            );
            fracture.name = `europa-linea-${index}`;
            fracture.userData.baseOpacity = 0.22 - index * 0.025;
            group.add(fracture);
            this.extras.push(fracture);
        });
        // Secondary chaotic lineae — shorter, more chaotic cross-cuts
        [-0.85, 0.12, 0.72].forEach((baseLat, idx) => {
            const points = [];
            const steps = 14 + idx * 3;
            for (let step = 0; step <= steps; step += 1) {
                const t = step / steps;
                const latitude = baseLat + Math.sin(t * Math.PI * 1.7 + idx) * 0.6;
                const longitude = 0.5 + t * 1.8 + Math.sin(t * Math.PI * 3.3 + idx * 1.2) * 0.25;
                points.push(toSurface(latitude, longitude, coreSize * 1.018));
            }
            const fracture = new THREE.Mesh(
                new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 30, coreSize * 0.006, 4, false),
                new THREE.MeshBasicMaterial({
                    color: 0xa07858,
                    transparent: true,
                    opacity: 0.18 - idx * 0.02,
                    depthWrite: false
                })
            );
            fracture.name = `europa-linea-chaotic-${idx}`;
            fracture.userData.baseOpacity = 0.18 - idx * 0.02;
            group.add(fracture);
            this.extras.push(fracture);
        });
        return group;
    }
    createTitanHaze(coreSize) {
        const group = new THREE.Group();
        group.name = 'titan-layered-haze';
        // Layered atmospheric haze with independent slow rotation
        const lowHaze = this.createSoftCloudLayer(coreSize * 1.06, 0xf2be70, 0.045, 0.018, 'titan-low-haze');
        const upperHaze = this.createSoftCloudLayer(coreSize * 1.115, 0xd98536, 0.032, -0.011, 'titan-upper-haze');
        group.add(lowHaze);
        group.add(upperHaze);
        // Polar haze caps
        [-1, 1].forEach((dir) => {
            const polarHaze = this.host.createHaloSprite(0xd47a28, coreSize * 0.45, 0.12);
            polarHaze.name = `titan-polar-haze-${dir > 0 ? 'north' : 'south'}`;
            polarHaze.position.set(0, dir * coreSize * 0.88, 0);
            polarHaze.userData.baseOpacity = 0.12;
            polarHaze.userData.speed = 0.005 * dir;
            group.add(polarHaze);
            this.extras.push(polarHaze);
        });
        // Dark hydrocarbon lake hints on the surface
        const lakeRandom = this.host.seededRandom('titan-lakes');
        for (let i = 0; i < 18; i += 1) {
            const lake = this.host.createHaloSprite(0x332211, coreSize * (0.04 + lakeRandom() * 0.09), 0.25 + lakeRandom() * 0.15);
            const theta = lakeRandom() * Math.PI * 2;
            const phi = (0.3 + lakeRandom() * 0.6);
            const radius = coreSize * 1.012;
            lake.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            lake.userData.baseOpacity = 0.25 + lakeRandom() * 0.15;
            group.add(lake);
            this.extras.push(lake);
        }
        return group;
    }
    createSoftCloudLayer(radius, color, opacity, speed, name) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 96, 64),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            })
        );
        mesh.name = name;
        mesh.userData.baseOpacity = opacity;
        mesh.userData.speed = speed;
        this.extras.push(mesh);
        return mesh;
    }

    createGreatRedSpot(coreSize) {
        const spot = this.host.createHaloSprite(0xc14a2c, coreSize * 0.48, 0.42);
        spot.name = 'jupiter-great-red-spot';
        spot.position.set(coreSize * 0.78, -coreSize * 0.16, coreSize * 0.48);
        spot.userData.baseOpacity = 0.42;
        spot.userData.baseScale = coreSize * 0.48;
        this.extras.push(spot);
        return spot;
    }

    createPolarCaps(coreSize) {
        const group = new THREE.Group();
        group.name = 'mars-polar-caps';
        [-1, 1].forEach((dir) => {
            const cap = this.host.createHaloSprite(0xf3f7ff, coreSize * 0.42, 0.42);
            cap.position.set(0, dir * coreSize * 0.92, 0);
            cap.userData.baseOpacity = 0.42;
            group.add(cap);
            this.extras.push(cap);
        });
        return group;
    }

    createDustHaze(coreSize) {
        const haze = this.host.createGlowMesh(coreSize * 1.2, 0xffa06a, 0.1);
        haze.name = 'mars-dust-haze';
        haze.userData.baseOpacity = 0.1;
        this.extras.push(haze);
        return haze;
    }

    createEarthCityLights(coreSize) {
        const group = new THREE.Group();
        group.name = 'earth-city-lights';
        const random = this.host.seededRandom('earth-lights');
        for (let i = 0; i < 48; i += 1) {
            const light = this.host.createHaloSprite(0xffe2a8, coreSize * (0.03 + random() * 0.04), 0.2 + random() * 0.2);
            const theta = random() * Math.PI * 2;
            const phi = (0.35 + random() * 1.2);
            const radius = coreSize * 1.01;
            light.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi) * (0.2 + random() * 0.7),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            light.userData.baseOpacity = 0.15 + random() * 0.2;
            group.add(light);
            this.extras.push(light);
        }
        return group;
    }

    createCraterField(coreSize, count) {
        const group = new THREE.Group();
        group.name = 'moon-craters';
        const random = this.host.seededRandom('moon-craters');
        for (let i = 0; i < count; i += 1) {
            const crater = this.host.createHaloSprite(0x4d4a45, coreSize * (0.05 + random() * 0.12), 0.22 + random() * 0.2);
            const theta = random() * Math.PI * 2;
            const phi = Math.acos(2 * random() - 1);
            const radius = coreSize * 1.012;
            crater.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            group.add(crater);
        }
        return group;
    }

    createCometJets(coreSize) {
        const group = new THREE.Group();
        group.name = 'halley-jets';
        const random = this.host.seededRandom('halley-jets');
        for (let i = 0; i < 5; i += 1) {
            const points = [];
            const angle = random() * Math.PI * 2;
            for (let step = 0; step < 7; step += 1) {
                const t = step / 6;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * coreSize * (1.05 + t * 1.8),
                    (random() - 0.5) * coreSize * 0.5 + t * coreSize * 0.4,
                    Math.sin(angle) * coreSize * (1.05 + t * 1.8)
                ));
            }
            const curve = new THREE.CatmullRomCurve3(points);
            const jet = new THREE.Mesh(
                new THREE.TubeGeometry(curve, 20, coreSize * 0.03, 5, false),
                new THREE.MeshBasicMaterial({
                    color: 0xd7f3ff,
                    transparent: true,
                    opacity: 0.28,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending
                })
            );
            jet.userData.baseOpacity = 0.22 + random() * 0.14;
            group.add(jet);
            this.extras.push(jet);
        }
        return group;
    }

    createFocusRings(entry, coreSize) {
        const group = new THREE.Group();
        group.name = `${entry.id}-focus-rings`;
        const color = entry.rings?.color || 0xd7c08c;
        const layers = entry.id === 'saturn'
            ? [
                { inner: 1.28, outer: 1.52, opacity: 0.62 },
                { inner: 1.58, outer: 1.92, opacity: 0.5 },
                { inner: 2.0, outer: 2.28, opacity: 0.34 },
                { inner: 2.38, outer: 2.72, opacity: 0.22 }
            ]
            : [
                { inner: 1.45, outer: 1.85, opacity: 0.3 }
            ];

        layers.forEach((layer, index) => {
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(coreSize * layer.inner, coreSize * layer.outer, 192),
                new THREE.MeshBasicMaterial({
                    color,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: layer.opacity,
                    depthWrite: false
                })
            );
            ring.rotation.x = Math.PI / 2;
            ring.userData.baseOpacity = layer.opacity;
            ring.userData.speed = index % 2 === 0 ? 0.025 : -0.018;
            group.add(ring);
        });
        return group;
    }

    createCometTail(coreSize, color, count, lengthScale) {
        const group = new THREE.Group();
        group.name = 'comet-tail';
        const random = this.host.seededRandom(`halley-tail-${color}-${count}`);
        const positions = [];
        for (let i = 0; i < count; i += 1) {
            const t = Math.pow(random(), 0.65);
            positions.push(
                -t * coreSize * (8 * lengthScale + random() * 6) + (random() - 0.5) * coreSize * 0.8,
                (random() - 0.5) * coreSize * (0.6 + t * 1.8),
                (random() - 0.5) * coreSize * (0.6 + t * 1.8)
            );
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color,
            size: 1.3,
            map: this.host.createRadialTexture(0xffffff),
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        const tail = new THREE.Points(geometry, material);
        tail.userData.baseOpacity = 0.4;
        group.add(tail);
        return group;
    }

    createSurfaceSprites(entry, coreSize, count) {
        const group = new THREE.Group();
        group.name = `${entry.id}-surface-sprites`;
        const random = this.host.seededRandom(`${entry.id}-focus-surface`);
        const color = entry.visual?.pattern === 'ice' ? 0xddeeff : entry.id === 'mars' ? 0x8a3b1d : 0x66594c;
        for (let i = 0; i < count; i += 1) {
            const sprite = this.host.createHaloSprite(color, coreSize * (0.08 + random() * 0.12), 0.18 + random() * 0.16);
            const theta = random() * Math.PI * 2;
            const phi = Math.acos(2 * random() - 1);
            const radius = coreSize * 1.01;
            sprite.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            group.add(sprite);
        }
        return group;
    }

    createMoonHint(entry, coreSize) {
        const group = new THREE.Group();
        group.name = `${entry.id}-moon-hint`;
        const moon = new THREE.Mesh(
            new THREE.SphereGeometry(coreSize * 0.08, 24, 16),
            new THREE.MeshBasicMaterial({ color: 0xc9c4b8 })
        );
        moon.position.set(coreSize * 2.05, coreSize * 0.15, 0);
        group.add(moon);
        group.userData.speed = 0.25;
        return group;
    }

    update(deltaSeconds, time) {
        if (!this.group || !this.profile) return;

        if (this.core) {
            this.core.rotation.y += deltaSeconds * (this.profile.spin || 0.08);
        }

        if (this.atmosphere?.material?.uniforms) {
            this.atmosphere.material.uniforms.opacity.value =
                this.atmosphere.userData.baseOpacity * (0.88 + Math.sin(time * 0.4) * 0.12);
        }
        if (this.clouds) {
            const speed = this.clouds.userData?.speed || 0.03;
            this.clouds.rotation.y += deltaSeconds * speed;
            if (this.clouds.material?.uniforms) {
                this.clouds.material.uniforms.opacity.value =
                    this.clouds.userData.baseOpacity * (0.85 + Math.sin(time * 0.55) * 0.15);
            } else if (this.clouds.material) {
                this.clouds.material.opacity =
                    (this.clouds.userData.baseOpacity || 0.22) * (0.85 + Math.sin(time * 0.55) * 0.15);
            }
        }
        if (this.rings) {
            this.rings.children.forEach((ring) => {
                ring.rotation.z += deltaSeconds * (ring.userData.speed || 0.02);
                if (ring.material) {
                    ring.material.opacity = (ring.userData.baseOpacity || 0.4)
                        * (0.9 + Math.sin(time * 0.35) * 0.08);
                }
            });
        }
        if (this.coma?.material?.uniforms) {
            this.coma.material.uniforms.opacity.value =
                this.coma.userData.baseOpacity * (0.8 + Math.sin(time * 0.9) * 0.2);
            this.coma.scale.setScalar((this.coma.userData.baseScale || 1) * (1 + Math.sin(time * 0.7) * 0.05));
        }
        [this.tail, this.ionTail].forEach((tail, index) => {
            if (!tail) return;
            tail.rotation.z = Math.sin(time * (0.2 + index * 0.08)) * (0.05 + index * 0.02);
            tail.children.forEach((points) => {
                if (points.material) {
                    points.material.opacity = (points.userData.baseOpacity || 0.4)
                        * (0.72 + Math.sin(time * (0.8 + index * 0.15)) * 0.28);
                }
            });
        });

        this.extras.forEach((item, index) => {
            if (item.userData?.speed) {
                item.rotation.y += deltaSeconds * item.userData.speed;
            }
            if (item.material && item.userData?.baseOpacity != null) {
                const phase = item.userData.phase ?? index;
                // Io volcanic spots & plumes: independent pulsing with dramatic cadence
                if (item.name.startsWith('io-volcanic-')) {
                    item.material.opacity = item.userData.baseOpacity
                        * (0.55 + 0.45 * Math.sin(time * 1.6 + phase * 1.3));
                    // Hotspots also pulse in scale for a more dramatic flicker
                    if (item.name.includes('hotspot') && item.scale) {
                        const pulse = 0.7 + 0.3 * Math.sin(time * 2.1 + phase * 1.7);
                        item.scale.set(item.userData.baseScale * pulse, item.userData.baseScale * pulse, 1);
                    }
                } else if (item.name.startsWith('titan-')) {
                    // Titan haze & polar caps: slow, stately atmospheric breathing
                    const slowPhase = item.userData.phase ?? (index * 0.7);
                    item.material.opacity = item.userData.baseOpacity
                        * (0.82 + 0.18 * Math.sin(time * 0.25 + slowPhase));
                } else if (item.name.startsWith('europa-linea')) {
                    // Europa lineae: very subtle visibility shift
                    item.material.opacity = item.userData.baseOpacity
                        * (0.85 + 0.15 * Math.sin(time * 0.4 + index * 1.1));
                } else {
                    item.material.opacity = item.userData.baseOpacity
                        * (0.8 + Math.sin(time * 0.7 + index) * 0.2);
                }
            }
            if (item.name === 'jupiter-great-red-spot' && item.userData?.baseScale) {
                const pulse = 0.92 + Math.sin(time * 0.9) * 0.08;
                item.scale.set(item.userData.baseScale * pulse, item.userData.baseScale * pulse * 0.72, 1);
            }
        });

        this.group.children.forEach((child) => {
            if (child.userData?.speed && child.name.includes('moon-hint')) {
                child.rotation.y += deltaSeconds * child.userData.speed;
            }
        });
    }

    dispose() {
        if (this.core?.material?.map) this.core.material.map.dispose();
        if (this.clouds?.material?.map) this.clouds.material.map.dispose();
        this.group = null;
        this.core = null;
        this.atmosphere = null;
        this.rings = null;
        this.coma = null;
        this.tail = null;
        this.ionTail = null;
        this.clouds = null;
        this.extras = [];
        this.effectType = null;
        this.profile = null;
        this.entryId = null;
    }
}
