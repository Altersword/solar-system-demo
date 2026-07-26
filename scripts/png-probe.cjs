/**
 * Objective pixel analysis of the smoke-test PNG screenshots.
 * Decodes each PNG (via headless Edge's canvas) and reports the brightness
 * distribution in the central region — ground truth that does not depend on
 * a vision model's interpretation of "is the core too white".
 *
 * Run scripts/smoke-test.cjs first to generate .smoke/*.png, then:
 *   node scripts/png-probe.cjs
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, '.smoke');

async function main() {
    const files = fs.readdirSync(OUT_DIR)
        .filter((f) => f.endsWith('.png') && f !== '00-overview.png');
    if (!files.length) {
        console.log('no screenshots in .smoke — run scripts/smoke-test.cjs first');
        process.exit(1);
    }

    const browser = await chromium.launch({ headless: true, channel: 'msedge' });
    const page = await browser.newPage();

    console.log('target'.padEnd(38) + 'meanL  sat%   lit%   centerL');
    for (const file of files) {
        const b64 = fs.readFileSync(path.join(OUT_DIR, file)).toString('base64');
        const stats = await page.evaluate(async (dataUrl) => {
            const img = new Image();
            img.src = dataUrl;
            await img.decode();
            const c = document.createElement('canvas');
            c.width = img.naturalWidth; c.height = img.naturalHeight;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const w = c.width, h = c.height;

            function box(fx0, fy0, fx1, fy1) {
                const x0 = Math.floor(w * fx0), x1 = Math.floor(w * fx1);
                const y0 = Math.floor(h * fy0), y1 = Math.floor(h * fy1);
                const d = ctx.getImageData(x0, y0, x1 - x0, y1 - y0).data;
                let total = 0, sat = 0, sumL = 0, lit = 0;
                for (let i = 0; i < d.length; i += 4) {
                    const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
                    total += 1; sumL += l;
                    if (l > 248) sat += 1;
                    if (l > 55) lit += 1;
                }
                return { meanL: sumL / total, satPct: 100 * sat / total, litPct: 100 * lit / total };
            }
            // full frame excludes the right-side info panel (~last 26%)
            const frame = box(0.02, 0.05, 0.72, 0.98);
            const center = box(0.34, 0.36, 0.5, 0.64); // where the core sits (view is left of panel)
            return { frame, center };
        }, `data:image/png;base64,${b64}`);

        console.log(
            file.replace('.png', '').padEnd(38) +
            String(stats.frame.meanL.toFixed(1)).padStart(5) +
            String(stats.frame.satPct.toFixed(2)).padStart(7) +
            String(stats.frame.litPct.toFixed(1)).padStart(7) +
            String(stats.center.meanL.toFixed(1)).padStart(9)
        );
    }

    await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
