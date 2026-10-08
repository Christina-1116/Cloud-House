const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:4173/?test=1');await page.waitForFunction(()=>window.__home?.voyage.ready);
 if(await page.locator('[data-j="begin"]').count())await page.locator('[data-j="begin"]').click();
 assert.ok(await page.locator('#stage').isVisible(),'The game must enter actual 3D by default');
 fs.mkdirSync('qa/homes',{recursive:true});
 const ids=['home','winter','coast','garden','sakura','palace','loft','nordic','boho','zen'];
 for(const id of ids){await page.locator('#homeMap').click();await page.locator(`[data-room="${id}"]`).click();
  await page.waitForFunction(id=>window.__home.homeWorld.active===id,id);
  assert.ok(await page.locator('#stage').isVisible());
  const data=await page.evaluate(()=>({id:window.__home.state.homes.active,furn:window.__home.furn.length,pet:window.__home.state.petId,chara:window.__home.state.chara}));
  assert.equal(data.id,id);assert.ok(data.furn>=15);
  for(const act of ['tea','pet','cook','sleep']){
   await page.locator(`[data-act="${act}"]`).click();
   await page.waitForFunction(a=>window.__home.H.next===a,act);
   await page.evaluate(()=>window.__home.sim(650));
   assert.equal(await page.evaluate(()=>window.__home.H.act),act,`${id}: ${act} must reach its furniture`);
  }
  await page.locator('#btnView').click();
  await page.screenshot({path:`qa/homes/${id}.png`,animations:'disabled'});
 }
 assert.deepEqual(errors,[]);console.log('HOMES_3D_OK — all ten 3D homes and core companion actions passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
