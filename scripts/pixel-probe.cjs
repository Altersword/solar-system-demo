/**
 * Objective pixel probe: enter near-view focus for a target, read the
 * rendered canvas back, and report brightness distribution — especially the
 * fraction of saturated (near-white) pixels in the central region. This is
 * ground truth that does not depend on a vision model's interpretation.
 *
 * Usage: node scripts/pixel-probe.cjs [id1,id2,...]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 4181;
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.mp3': 'audio/mpeg'
};

function startServer() {
    const server = http.createServer((req, res) => {
        const urlPath = decodeURIComponent(req.url.split('?')[0]);
        const filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
        if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
        fs.readFile(filePath, (error, data) => {
            if (error) { res.writeHead(404); res.end(); return; }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
            res.end(data);
        });
    });
    return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function main() {
    const targets = (process.argv[2] || 'andromeda-galaxy,m87-galaxy,virgo-cluster,ring-nebula,orion-nebula,m13-great-cluster').split(',');
    const server = await startServer();
    const browser = await chromium.launch({
        headless: true,
        channel: 'msedge',
        args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
    await page.waitForFunction(() => typeof solarSystem !== 'undefined' && solarSystem?.starAtlas?.catalogEntries?.size > 0, null, { timeout: 30000 });
    await page.waitForTimeout(800);

    for (const id of targets) {
        const ok = await page.evaluate((targetId) => {
            const entry = solarSystem.starAtlas.getCatalogEntry(targetId);
            if (!entry) return false;
            solarSystem.selectCatalogEntry(targetId);
            solarSystem.showFocusView(entry);
            return true;
        }, id);
        if (!ok) { console.log(`${id}: not found`); continue; }
        await page.waitForTimeout(2800);

        // Read the actual rendered canvas pixels back and compute stats over
        // the central 40% box (where the galaxy/nebula core sits).
        const stats = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            const w = canvas.width, h = canvas.height;
            // Re-render into a 2D canvas to read pixels regardless of preserveDrawingBuffer.
            const tmp = document.createElement('canvas');
            tmp.width = w; tmp.height = h;
            const ctx = tmp.getContext('2d');
            ctx.drawImage(canvas, 0, 0);
            const bx0 = Math.floor(w * 0.3), bx1 = Math.floor(w * 0.7);
            const by0 = Math.floor(h * 0.3), by1 = Math.floor(h * 0.7);
            let total = 0, sat = 0, sumL = 0, bright = 0;
            const data = ctx.getImageData(bx0, by0, bx1 - bx0, by1 - by0).data;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i + 1], b = data[i + 2];
                const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                total += 1;
                sumL += l;
                if (l > 245) sat += 1;      // near-white saturation
                if (l > 60) bright += 1;    // lit (non-background) pixel
            }
            return {
                meanLuma: +(sumL / total).toFixed(1),
                satPct: +(100 * sat / total).toFixed(2),
                brightPct: +(100 * bright / total).toFixed(1)
            };
        });
        console.log(`${id.padEnd(20)} meanLuma=${String(stats.meanLuma).padStart(6)}  saturated%=${String(stats.satPct).padStart(6)}  lit%=${String(stats.brightPct).padStart(5)}`);

        await page.evaluate(() => solarSystem.clearFocusView());
        await page.waitForTimeout(300);
    }

    await browser.close();
    server.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
