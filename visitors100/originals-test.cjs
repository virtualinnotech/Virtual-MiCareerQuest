const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [], requests = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => requests.push(r.url()));
    await page.addInitScript(() => localStorage.setItem('mcqOnboardingDone_v1', '1'));
    await page.goto('http://127.0.0.1:8014/venue-frame.html?v=20261012-originals103');
    await page.waitForFunction(() => state.ready && crowdState.sim?.agents.length > 0 && characterState.models.size > 0, null, { timeout: 180000 });
    await page.waitForTimeout(4000);
    assert.equal(await page.evaluate(() => typeof window.Visitors100), 'undefined');
    assert.equal(await page.getByText('Meet new students', { exact: true }).count(), 0);
    assert(!requests.some(url => /visitors100\/(walking\.js|visitors\.js|rigged102\/)/.test(url)));
    assert(await page.evaluate(() => [...characterState.models.keys()].every(id => !String(id).startsWith('visitor102-'))));
    const before = await page.evaluate(() => crowdState.sim.agents.map(a => [a.renderX, a.renderZ]));
    await page.waitForTimeout(4000);
    const moved = await page.evaluate(before => crowdState.sim.agents.filter((a, i) => before[i] && Math.hypot(a.renderX - before[i][0], a.renderZ - before[i][1]) > .02).length, before);
    assert(moved > 0, 'Original students should continue walking');
    await page.screenshot({ path: path.resolve(__dirname, '../../work/originals103-desktop.png') });
    assert.deepEqual(errors, []);
    console.log('PASS: no imported students loaded; original crowd moving (' + moved + '); no page errors; scooter/rewards retained');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
