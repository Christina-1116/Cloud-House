const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const target = process.env.TEST_URL || 'http://127.0.0.1:4173/?test=1';
const output = process.env.QA_DIR || 'qa/pets';
(async () => {
  const browser = await chromium.launch({ headless:true, args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({viewport:{width:1200,height:1000}});
    const errors=[];page.on('pageerror', e=>errors.push(e.message));
    await page.goto(target);
    await page.waitForFunction(()=>window.__home?.voyage.ready);
    await page.evaluate(() => { window.__home.jEnter(); document.querySelector('[data-j="begin"]').click(); });
    await page.locator('.j-footer [data-j="home"]').click();
    await page.locator('#btnChar').click();await page.locator('[data-tab="p"]').click();
    assert.equal(await page.locator('.pet-cats [data-pet]').count(),9,'All nine reference cats must be selectable');
    assert.equal(await page.locator('.pet-dogs [data-pet]').count(),2,'Existing dogs must remain selectable');
    const expected=[[0,'云绒'],[1,'橘座'],[2,'煤球'],[5,'花花'],[6,'奶糖'],[7,'暹罗'],[8,'布偶'],[9,'金渐层'],[10,'墨墨']];
    fs.mkdirSync(output,{recursive:true});
    const images=new Set(), geometryCounts=[];
    for (const [index,name] of expected) {
      await page.locator(`[data-pet="${index}"]`).click();
      await page.waitForFunction(i=>window.__home.state.pet===i,index);
      assert.equal(await page.locator('.pet-showcase h3').textContent(),name);
      assert.equal(await page.evaluate(()=>window.__home.petR.def.n),name);
      assert.ok(await page.evaluate(()=>window.__home.petR.b.g.userData.furCount>1000),'Scene cat must have real fur geometry');
      const preview=await page.locator('#petPreview canvas').screenshot();
      images.add(require('node:crypto').createHash('sha256').update(preview).digest('hex'));
      fs.writeFileSync(path.join(output,`model-${index}.png`),preview);
      geometryCounts.push(await page.evaluate(()=>window.__home.renderer.info.memory.geometries));
    }
    assert.equal(images.size,9,'Each selection must render a distinct 3D appearance');
    assert.ok(Math.max(...geometryCounts)-Math.min(...geometryCounts)<=12,'Switching cats must release the previous fur geometry');
    await page.locator('#petTurn').fill('95');
    await page.locator('#petTurn').dispatchEvent('input');
    await page.locator('[data-pet="7"]').focus();await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.pet),'7');
    await page.waitForTimeout(450);await page.reload();await page.waitForFunction(()=>window.__home?.voyage.ready);
    assert.equal(await page.evaluate(()=>window.__home.petR.def.id),'cat5');
    await page.locator('.j-footer [data-j="home"]').click();await page.locator('#btnChar').click();await page.locator('[data-tab="p"]').click();
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(output,'mobile-selector.png'),animations:'disabled'});
    assert.ok(await page.evaluate(()=>document.body.scrollWidth<=innerWidth));
    await page.locator('[data-pet="4"]').click();
    assert.equal(await page.evaluate(()=>window.__home.petR.def.id),'dog1');
    await page.locator('[data-pet="0"]').click();
    assert.equal(await page.evaluate(()=>window.__home.petR.def.id),'cat0');
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({cats:9,dogs:2,distinctModels:images.size,geometryCounts,errors},null,2));
    console.log('PETS_BROWSER_OK — nine distinct furred 3D cats, two legacy dogs, rotation, keyboard selection, reload save and mobile layout passed.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
