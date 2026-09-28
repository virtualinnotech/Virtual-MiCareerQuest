// Run with Playwright installed and a local HTTP server at the repository root.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
    headless: true,
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('mcqOnboardingDone_v1', '1'));
    // Keep the test isolated from live employer data and any backend writes.
    await page.route('**/api/manifest', r => r.fulfill({ json: { booths: [] } }));
    await page.route('**/api/sectors', r => r.fulfill({ json: { sectors: [] } }));
    await page.goto((process.env.VENUE_URL || 'http://127.0.0.1:8014/venue-frame.html'));
    await page.waitForFunction(() => ['ready', 'error', 'blocked'].includes(window.Forklift34?.snapshot().status), null, { timeout: 60000 });
    assert.equal(await page.evaluate(() => Forklift34.snapshot().status), 'ready');
    await page.evaluate(() => { Forklift34.enter(); });
    assert.equal(await page.evaluate(() => Forklift34.mounted), false, 'cannot mount at a distance');
    await page.evaluate(() => Forklift34.visit());
    await page.waitForFunction(() => !document.getElementById('forkliftPrompt34').hidden);
    await page.keyboard.press('t');
    assert.equal(await page.evaluate(() => Forklift34.mounted), true);
    await page.waitForFunction(()=>characterState.player?.forkliftArms,null,{timeout:60000});
    await page.evaluate(()=>{
      const a=characterState.player,m=a.model,f=Forklift34.test.state;
      for(const yaw of [0,.6,0]){
        f.yaw=yaw;Forklift34.update(0);AnimatedCharacters.update(.016);
        const hip=a.world[m.skins[0].joints[0]],correction=[hip[12]-a.bindHip[0],0,hip[14]-a.bindHip[1]];
        const root=transform([f.x,floorHeightAt(f.x,f.z),f.z],[.48,.48,.48],0,f.yaw);
        for(let side=0;side<2;side++){
          const arm=a.forkliftArms[side],p=tp(actorMatrix(a),...sub(a.world[arm.palm].slice(12,15),correction));
          const target=tp(root,side===0?.167:-.038,1.015,.22);
          if(Math.hypot(...sub(p,target))>.025)throw Error('Driver hand missed steering-wheel rim');
        }
      }
    });
    await page.evaluate(() => {
      const F = Forklift34, f = F.test.state, c = F.test.controls;
      c.add('e'); for (let i = 0; i < 10; i++) F.update(.02); c.clear();
      if (f.carrying) throw Error('Remote pickup was allowed');
      c.add('q'); for (let i = 0; i < 10; i++) F.update(.02); c.clear();
      c.add('w');
      for (let i = 0; i < 120 && f.distance < .26; i++) F.update(.02);
      c.clear();
      if (f.distance < .25) throw Error('Driving failed');
      F.exit(); if (!f.mounted) throw Error('Exited while moving');
      f.speed = 0;
      const before=F.snapshot().pallet;
      if(Math.hypot(F.test.socket()[0]-before.x,F.test.socket()[1]-before.z)<.3)throw Error('Regression must exercise pickup outside the old center tolerance');
      if(!F.test.forkContact())throw Error('Shallow fork contact was not detected');
      c.add('e'); for (let i = 0; i < 60; i++) F.update(.02); c.clear();
      if (!f.carrying || F.snapshot().pallet.y < .05) throw Error('Aligned pickup failed');
      const lifted=F.snapshot().pallet;
      if(Math.hypot(lifted.x-before.x,lifted.z-before.z)>.001)throw Error('Pickup snapped pallet sideways');
      F.release(); if (!f.carrying) throw Error('Released an elevated pallet');
      const [x,z] = F.snapshot().destination;
      // State-assisted placement isolates the scoring rule from steering/path following.
      f.x = x-f.loadOffset[0]; f.z = z-f.loadOffset[1]; f.yaw = 0; player.position = [f.x, player.position[1], f.z];
      c.add('q'); for (let i = 0; i < 100; i++) F.update(.02); c.clear();
      F.release(); if (!f.delivered || f.carrying) throw Error('Aligned grounded delivery failed');
      __walktest.render();
      const pixels = new Uint8Array(64 * 64 * 4);
      gl.readPixels(Math.floor(gl.drawingBufferWidth/2)-32,Math.floor(gl.drawingBufferHeight/2)-32,64,64,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
      if (new Set(pixels).size < 8) throw Error('Canvas is blank');
    });
    await page.keyboard.press('t');
    assert.equal(await page.evaluate(() => Forklift34.mounted), false);
    await page.evaluate(()=>{
      const F=Forklift34,f=F.test.state,c=F.test.controls;
      F.reset();F.visit();F.enter();
      const start=[f.x,f.z];f.x+=.5;f.z+=.35;player.position=[f.x,player.position[1],f.z];
      if(F.test.forkContact())throw Error('Side miss counted as contact');
      f.x=start[0];f.z=start[1]+.26;player.position=[f.x,player.position[1],f.z];f.lift=.35;
      c.add('e');for(let i=0;i<10;i++)F.update(.02);c.clear();
      if(f.carrying)throw Error('Forks above pallet picked it up');
      c.add('q');for(let i=0;i<100;i++)F.update(.02);c.clear();
      c.add('e');for(let i=0;i<50;i++)F.update(.02);c.clear();
      if(!f.carrying)throw Error('Lowering and retrying pickup failed');
      F.exit();
    });
    await page.evaluate(() => { Forklift34.reset(); Forklift34.visit(); });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.keyboard.press('t');
    const bounds = await page.locator('#forkliftPanel34').boundingBox();
    assert(bounds.x >= 0 && bounds.x + bounds.width <= 390 && bounds.y + bounds.height <= 844);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    assert.equal(await page.evaluate(() => Forklift34.snapshot().speed), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: proximity, T enter/exit, driving, shallow-contact pickup without snapping, side/height misses, retry, lift, safe release, delivery, reset, blur stop, canvas pixels and mobile panel bounds.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
