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
    await page.evaluate(() => {
      const F = Forklift34, f = F.test.state, c = F.test.controls;
      c.add('e'); for (let i = 0; i < 10; i++) F.update(.02); c.clear();
      if (f.carrying) throw Error('Remote pickup was allowed');
      c.add('q'); for (let i = 0; i < 10; i++) F.update(.02); c.clear();
      c.add('w');
      for (let i = 0; i < 120 && F.test.socket()[1] < F.snapshot().pallet.z - .06; i++) F.update(.02);
      c.clear();
      if (f.distance < .4) throw Error('Driving failed');
      F.exit(); if (!f.mounted) throw Error('Exited while moving');
      f.speed = 0;
      c.add('e'); for (let i = 0; i < 60; i++) F.update(.02); c.clear();
      if (!f.carrying || F.snapshot().pallet.y < .05) throw Error('Aligned pickup failed');
      F.release(); if (!f.carrying) throw Error('Released an elevated pallet');
      const [x,z] = F.snapshot().destination;
      // State-assisted placement isolates the scoring rule from steering/path following.
      f.x = x; f.z = z - .648; f.yaw = 0; player.position = [x, player.position[1], f.z];
      c.add('q'); for (let i = 0; i < 100; i++) F.update(.02); c.clear();
      F.release(); if (!f.delivered || f.carrying) throw Error('Aligned grounded delivery failed');
      __walktest.render();
      const pixels = new Uint8Array(64 * 64 * 4);
      gl.readPixels(Math.floor(gl.drawingBufferWidth/2)-32,Math.floor(gl.drawingBufferHeight/2)-32,64,64,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
      if (new Set(pixels).size < 8) throw Error('Canvas is blank');
    });
    await page.keyboard.press('t');
    assert.equal(await page.evaluate(() => Forklift34.mounted), false);
    await page.evaluate(() => { Forklift34.reset(); Forklift34.visit(); });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.keyboard.press('t');
    const bounds = await page.locator('#forkliftPanel34').boundingBox();
    assert(bounds.x >= 0 && bounds.x + bounds.width <= 390 && bounds.y + bounds.height <= 844);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    assert.equal(await page.evaluate(() => Forklift34.snapshot().speed), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: proximity, T enter/exit, driving, pickup alignment, lift, safe release, delivery, reset, blur stop, canvas pixels and mobile panel bounds.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
