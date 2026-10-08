const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const browsers = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browserName = process.env.TEST_BROWSER || 'chromium';

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), '云端小屋 离线试玩-'));
  const target = path.join(dir, 'index.html');
  fs.copyFileSync(path.resolve('index.html'), target);
  let browser;
  try {
    browser = await browsers[browserName].launch({ headless: true, ...(browserName === 'chromium' ? { args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } : {}) });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [], requests = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.route('**/*', route => {
      const request = route.request();
      if (request.isNavigationRequest() || /^(data|blob):/.test(request.url())) return route.continue();
      requests.push(request.url());
      return route.abort();
    });
    await page.goto(pathToFileURL(target).href);
    try {
      await page.waitForFunction(() => window.__home?.voyage.ready, { timeout: 15000 });
    } catch {
      assert.fail(`Double-click launch did not initialize: ${errors.join('; ')} ${requests.join('; ')}`);
    }
    await page.locator('[data-j="begin"]').click();
    await page.locator('#jHotspots button').first().click();
    await page.keyboard.press('Escape');
    await page.locator('.j-travel').click();
    assert.equal(await page.locator('.j-map-card').count(), 10);
    await page.waitForFunction(() => [...document.querySelectorAll('.j-map-grid img')].every(im => im.complete && im.naturalWidth > 0));
    await page.locator('[data-room="zen"]').click();
    assert.equal(await page.locator('#jTitle').textContent(), '月白山房');
    await page.locator('.j-scene-actions [data-j="photo"]').click();
    await page.locator('.j-download').waitFor();
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.j-download').click()]);
    await download.saveAs(path.join(dir, 'postcard.png'));
    assert.ok(fs.statSync(path.join(dir, 'postcard.png')).size > 10000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await page.reload();
    await page.waitForFunction(() => window.__home?.voyage.ready);
    assert.equal(await page.locator('#jTitle').textContent(), '月白山房');
    await page.locator('.j-footer [data-j="home"]').click();
    await page.waitForFunction(() => !window.__home.voyage.on);
    assert.ok(await page.locator('#stage').isVisible());
    await page.locator('#btnShop').click();
    await page.locator('#sheetX').click();
    assert.deepEqual(errors, [], 'Offline mode must have no browser errors');
    assert.deepEqual(requests, [], 'Standalone HTML must not require adjacent files or a server');
    console.log(`OFFLINE_OK (${browserName}) — standalone double-click launch, ten scenes, discoveries, PNG download, reload save and 3D home passed.`);
  } finally {
    await browser?.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
