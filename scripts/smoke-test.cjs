/**
 * Browser smoke test for the solar system / star atlas demo.
 * Starts a static server, loads the page, enters near-view focus for a list
 * of targets, screenshots each, and reports console errors.
 *
 * Usage: node scripts/smoke-test.cjs [--targets id1,id2] [--keep]
 * Screenshots land in .smoke/ (gitignored, recreated each run).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, '.smoke');
const PORT = 4179;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.mp3': 'audio/mpeg'
};

const DEFAULT_TARGETS = [
    // one per renderer family
    'andromeda-galaxy',     // galaxy (spiral)
    'm87-galaxy',           // galaxy (elliptical, AGN)
    'virgo-cluster',        // galaxy-cluster
    'orion-nebula',         // nebula (emission)
    'ring-nebula',          // planetary-nebula
    'm13-great-cluster',    // globular-cluster
    'pleiades',             // open-cluster
    'sirius',               // generic-star (binary w/ WD)
    'rigel',                // generic-star (blue supergiant)
    'proxima-centauri',     // red-dwarf
    'vela-pulsar',          // pulsar
    'crab-nebula',          // supernova remnant / nebula
    'betelgeuse',           // red giant
    'sirius-b'              // white dwarf
];

function startServer() {
    const server = http.createServer((req, res) => {
        const urlPath = decodeURIComponent(req.url.split('?')[0]);
        let filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
        if (!filePath.startsWith(ROOT)) {
            res.writeHead(403);
            res.end();
            return;
        }
        fs.readFile(filePath, (error, data) => {
            if (error) {
                res.writeHead(404);
                res.end();
                return;
            }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
            res.end(data);
        });
    });
    return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function main() {
    const args = process.argv.slice(2);
    const targetsArg = args.find((a) => a.startsWith('--targets'));
    const targets = targetsArg
        ? (targetsArg.split('=')[1] || args[args.indexOf(targetsArg) + 1]).split(',')
        : DEFAULT_TARGETS;

    fs.rmSync(OUT_DIR, { recursive: true, force: true });
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const server = await startServer();
    const browser = await chromium.launch({
        headless: true,
        channel: 'msedge',
        args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    const consoleErrors = [];
    page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push('pageerror: ' + error.message));

    const startedAt = Date.now();
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
    // top-level `let solarSystem` lives in the global lexical scope (not on globalThis)
    await page.waitForFunction(() => typeof solarSystem !== 'undefined' && solarSystem?.starAtlas?.catalogEntries?.size > 0, null, { timeout: 30000 });
    const initMs = Date.now() - startedAt;
    console.log(`page init: ${initMs} ms, catalog ready`);

    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT_DIR, '00-overview.png') });

    const failures = [];
    for (const id of targets) {
        try {
            const selected = await page.evaluate((targetId) => {
                const system = solarSystem;
                const entry = system.starAtlas.getCatalogEntry(targetId);
                if (!entry) return { ok: false, reason: 'not in catalog' };
                if (!system.selectCatalogEntry(targetId)) return { ok: false, reason: 'select failed' };
                const focusType = globalThis.SpecialBodyFactory.getFocusType(entry);
                if (!focusType) return { ok: false, reason: 'no focus type' };
                system.showFocusView(entry);
                return { ok: true, focusType, name: entry.name };
            }, id);

            if (!selected.ok) {
                failures.push(`${id}: ${selected.reason}`);
                continue;
            }
            // let camera flight + animations settle
            await page.waitForTimeout(2600);
            const shotName = `${id}(${selected.focusType}).png`.replace(/[^\w.()\u4e00-\u9fff-]/g, '_');
            await page.screenshot({ path: path.join(OUT_DIR, shotName) });
            console.log(`ok: ${id} -> ${selected.focusType} (${selected.name})`);

            // exit focus and confirm clean return
            const returned = await page.evaluate(() => {
                const system = solarSystem;
                system.clearFocusView();
                return {
                    focusCleared: !system.focusGroup,
                    atlasVisible: system.atlasGroup.visible === system.showAtlas,
                    bloomOff: system.useBloom === false
                };
            });
            if (!returned.focusCleared || !returned.atlasVisible || !returned.bloomOff) {
                failures.push(`${id}: dirty state after exit ${JSON.stringify(returned)}`);
            }
            await page.waitForTimeout(300);
        } catch (error) {
            failures.push(`${id}: ${error.message.split('\n')[0]}`);
        }
    }

    console.log('---');
    if (consoleErrors.length) {
        console.log(`console errors (${consoleErrors.length}):`);
        [...new Set(consoleErrors)].slice(0, 10).forEach((text) => console.log('  ' + text));
    } else {
        console.log('console errors: none');
    }
    if (failures.length) {
        console.log(`failures (${failures.length}):`);
        failures.forEach((text) => console.log('  ' + text));
    } else {
        console.log('failures: none');
    }
    console.log(`screenshots: ${OUT_DIR}`);

    await browser.close();
    server.close();
    process.exit(failures.length || consoleErrors.length ? 1 : 0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
