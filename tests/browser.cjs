const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const BASE = process.env.TEST_URL || 'http://127.0.0.1:4173';
const TARGET = BASE.startsWith('file:') ? `${BASE}?test=1` : `${BASE}/?test=1`;
const output = process.env.QA_DIR || path.resolve('qa');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const failures = [], notes = [];
  const check = (name, fn) => fn().then(() => notes.push(name));
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    page.on('pageerror', e => failures.push(e.message));
    page.on('response', r => { if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`); });
    await page.route('https://**/*', route => { failures.push(`Unexpected external request ${route.request().url()}`); return route.abort(); });
    await page.goto(TARGET);
    await page.waitForFunction(() => window.__home?.voyage.ready, { timeout: 60000 });
    await page.evaluate(() => { window.__home.jEnter(); document.querySelector('[data-j="begin"]').click(); });
    await page.waitForFunction(() => !document.querySelector('#loader'));
    await check('initial scene displays with all artwork and no external requests', async () => {
      assert.equal(await page.locator('#jTitle').textContent(), '云端原居');
      assert.equal(await page.locator('#jHotspots button').count(), 3);
      await page.waitForFunction(() => document.querySelector('#jArt').complete && document.querySelector('#jArt').naturalWidth > 0);
      await page.screenshot({ animations: 'disabled', path: path.join(output, 'desktop-home.png') });
    });
    await check('map displays ten scenes and supports keyboard focus', async () => {
      await page.locator('.j-travel').click();
      assert.equal(await page.locator('.j-map-card').count(), 10);
      await page.waitForFunction(() => [...document.querySelectorAll('.j-map-grid img')].every(im => im.complete && im.naturalWidth > 0));
      await page.screenshot({ animations: 'disabled', path: path.join(output, 'desktop-map.png') });
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.j), 'close');
      await page.keyboard.press('Shift+Tab');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.room), 'zen');
      await page.keyboard.press('Escape');
    });
    await check('discoveries restore keyboard focus to the replacement hotspot', async () => {
      await page.locator('[data-clue="0"]').focus();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.clue), '0');
    });
    await check('brew close button works by keyboard without taking a turn', async () => {
      await page.locator('#jTasks [data-j="ritual"]').click();
      await page.locator('[data-j="game-start"]').click();
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.j), 'close');
      await page.keyboard.press('Enter');
      assert.ok(await page.locator('#jOverlay').isHidden());
      assert.equal(await page.evaluate(() => window.__home.voyage.game), null);
    });
    await check('scene hotspots align to the artwork aspect ratio', async () => {
      const ratio = await page.locator('#jScene').evaluate(el => el.clientWidth / el.clientHeight);
      assert.ok(Math.abs(ratio - 1888 / 1600) < .005);
    });
    async function completeRitual() {
      await page.locator('#jTasks [data-j="ritual"]').click();
      await page.locator('[data-j="game-start"]').click();
      const type = await page.evaluate(() => window.__home.voyage.game.type);
      if (type === 'brew') {
        for (let i = 0; i < 3; i++) {
          await page.waitForFunction(() => window.__home.voyage.game?.type === 'brew' && !window.__home.voyage.game.locked && Math.abs(window.__home.voyage.game.pos - .5) < .05, { polling: 16 });
          await page.keyboard.press('Space');
          if (i < 2) await page.waitForFunction(n => window.__home.voyage.game.step === n && !window.__home.voyage.game.locked, i + 1);
        }
      } else if (type === 'pairs') {
        const cards = await page.evaluate(() => window.__home.voyage.game.cards);
        // First try a wrong pair, then solve using the actual shuffled deck.
        const a = 0, b = cards.findIndex(n => n !== cards[0]);
        await page.locator(`[data-card="${a}"]`).click();
        await page.locator(`[data-card="${b}"]`).click();
        await page.waitForFunction(() => !window.__home.voyage.game.locked);
        for (let v = 0; v < 3; v++) {
          const pair = cards.flatMap((n, i) => n === v ? [i] : []);
          await page.locator(`[data-card="${pair[0]}"]`).click();
          await page.locator(`[data-card="${pair[1]}"]`).click();
          if (v < 2) await page.waitForFunction(() => !window.__home.voyage.game.locked);
        }
      } else if (type === 'melody') {
        await page.waitForFunction(() => !window.__home.voyage.game.playing);
        const seq = await page.evaluate(() => window.__home.voyage.game.seq);
        for (const n of seq) await page.keyboard.press(String(n + 1));
      } else if (type === 'stars') {
        // A premature star gives a helpful hint and remains replayable.
        await page.keyboard.press('3');
        for (let i = 1; i <= 6; i++) await page.keyboard.press(String(i));
      }
      await page.waitForFunction(() => document.querySelector('.j-game-score'));
      assert.ok(parseInt(await page.locator('.j-game-score').textContent()) >= 50);
      await page.locator('#jDialog .j-primary[data-j="close"]').click();
      return type;
    }
    const types = new Set();
    for (let roomIndex = 0; roomIndex < 10; roomIndex++) {
      const roomId = await page.evaluate(() => window.__home.state.journey.room);
      for (let clue = 0; clue < 3; clue++) {
        await page.locator(`[data-clue="${clue}"]`).click();
        await page.locator('#jDialog .j-primary[data-j="close"]').click();
      }
      const before = await page.evaluate(() => window.__home.state.coins);
      await page.locator('[data-clue="0"]').click();
      assert.equal(await page.evaluate(() => window.__home.state.coins), before);
      await page.locator('#jDialog .j-primary[data-j="close"]').click();
      types.add(await completeRitual());
      await page.locator('#jTasks [data-j="story"]').click();
      await page.locator('[data-choice="1"]').click();
      assert.ok(await page.evaluate(id => window.__home.state.journey.rooms[id].postcard, roomId));
      await page.locator('#jDialog .j-primary[data-j="postcard"]').click();
      await page.keyboard.press('Escape');
      await page.locator('[data-j="next"]').click();
      notes.push(`three discoveries, ritual and story completed: ${roomId}`);
    }
    assert.deepEqual([...types].sort(), ['brew', 'melody', 'pairs', 'stars']);
    await check('ending rewards are paid once, with all ten postcards saved', async () => {
      assert.equal(await page.locator('#jStamps').textContent(), '10 / 10');
      await page.locator('#jFestival').click();
      const coins = await page.evaluate(() => window.__home.state.coins);
      await page.locator('[data-j="ending"]').click();
      assert.equal(await page.evaluate(() => window.__home.state.coins), coins + 300);
      assert.ok(await page.evaluate(() => window.__home.state.journey.ending));
      assert.equal(await page.locator('[data-j="ending"]').count(), 0);
      await page.screenshot({ animations: 'disabled', path: path.join(output, 'desktop-ending.png') });
      await page.keyboard.press('Escape');
    });
    await check('postcard downloads a real PNG', async () => {
      await page.locator('.j-scene-actions [data-j="photo"]').click();
      await page.locator('.j-download').waitFor();
      const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.j-download').click()]);
      await download.saveAs(path.join(output, 'postcard.png'));
      assert.ok(fs.statSync(path.join(output, 'postcard.png')).size > 10000);
      await page.keyboard.press('Escape');
    });
    await check('room, stamps, ending, time and hint preference survive reload', async () => {
      await page.locator('[data-j="time"]').click();
      await page.locator('[data-j="hints"]').click();
      await page.waitForTimeout(400);
      await page.reload(); await page.waitForFunction(() => window.__home?.voyage.ready);
      assert.equal(await page.locator('#jStamps').textContent(), '10 / 10');
      assert.equal(await page.evaluate(() => window.__home.state.journey.time), 'dusk');
      assert.equal(await page.evaluate(() => window.__home.state.journey.hints), false);
      assert.equal(await page.locator('[data-j="begin"]').count(), 0);
    });
    await check('3D home receives rewards and editing remains functional', async () => {
      await page.locator('.j-footer [data-j="home"]').click();
      await page.waitForTimeout(2000);
      assert.ok(await page.locator('#stage').isVisible());
      await page.locator('#btnShop').click();
      await page.locator('[data-tab="b"]').click();
      assert.ok((await page.locator('#sheetB').textContent()).includes('云朵灯'));
      await page.locator('[data-buy="cloudLamp"]').click();
      assert.equal(await page.evaluate(() => window.__home.state.bag.cloudLamp), 0);
      await page.locator('[data-e="done"]').click();
      await page.waitForTimeout(400);
      await page.screenshot({ animations: 'disabled', path: path.join(output, 'desktop-3d-home.png') });
      await page.locator('#jReturn').click();
      assert.ok(await page.locator('#journey').isVisible());
    });
    await check('mobile layout stays within screen and map remains usable', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('[data-j="hints"]').click();
      await page.screenshot({ animations: 'disabled', path: path.join(output, 'mobile-home.png') });
      assert.ok(await page.evaluate(() => document.body.scrollWidth <= innerWidth));
      await page.locator('.j-footer [data-j="map"]').click();
      assert.equal(await page.locator('.j-map-card').count(), 10);
      await page.locator('[data-room="zen"]').click();
      assert.equal(await page.locator('#jTitle').textContent(), '月白山房');
      await page.screenshot({ animations: 'disabled', path: path.join(output, 'mobile-zen.png') });
    });
    await check('legacy saves with no journey field restore existing furniture and currency', async () => {
      const legacy = await browser.newPage({viewport:{width:1280,height:800}});
      await legacy.addInitScript(() => localStorage.setItem('cloudhome.v3', JSON.stringify({ v: 3, coins: 777, aff: 120, day: {d: new Date().toLocaleDateString('en-CA'), claimed: []}, furn: [{u:'bed',k:'bed',x:8.55,z:1.12,r:0}], chara: 2 })));
      await legacy.goto(TARGET);await legacy.waitForFunction(()=>window.__home?.voyage.ready);
      assert.equal(await legacy.evaluate(()=>window.__home.state.coins),777);
      assert.equal(await legacy.evaluate(()=>window.__home.state.chara),2);
      assert.equal(await legacy.evaluate(()=>window.__home.furn.filter(f=>f.uid==='bed').length),1);
      await legacy.close();
    });
    assert.deepEqual(failures, [], 'No runtime errors, missing assets or external requests');
    fs.writeFileSync(path.join(output, 'browser-report.json'), JSON.stringify({passed:notes.length, checks:notes, errors:failures}, null, 2));
    console.log(`BROWSER_OK — ${notes.length} checks passed, 10 rooms completed, 4 ritual types played, zero runtime errors.`);
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
