/* DEV31: volunteer check-in at the entrance information table (Grand Gallery).
 * Replaces the DEV24 check-in attempt, whose people stood in a line across the
 * walkway and whose oversized "shirt piles" floated 1 m above the floor.
 *
 * - Six purple-shirt volunteers (original rigs, logo shirts) stand BEHIND the
 *   existing long table, between the table and the gallery wall, facing arriving
 *   visitors. The nine folding chairs that filled that strip are retired.
 * - Uneven stacks of folded purple volunteer shirts sit on the table in front of
 *   every volunteer. Each shirt is its own soft-edged layer with small offsets and
 *   twists; top shirts show a collar and the MiCareerQuest chest print taken from
 *   the characters' own logo image.
 * - Clear plastic storage bins stand on the floor behind the volunteers, against
 *   the wall, filled with folded purple shirts. Some are stacked two high on
 *   latched lids.
 * Positions are measured from the venue's own table, wall and column geometry at
 * load time. All props are merged into ten GPU batches (no per-shirt draws).
 * Everything else from DEV22-DEV30 (officers, boundary helpers, closed gate) is
 * unchanged.
 */
const CheckInScene31 = (() => {
  'use strict';
  const PURPLE = '#7038aa';
  const TABLE_NAME = 'EventV6_entrance information tabletop_991';
  const WALL_NAMES = ['Grand_Gallery_exhibit_side_brown_lower_wall_with_three_entries_solid_wall_segment_end',
    'Grand_Exhibit_Hall_west_brown_wall_with_door_height_entries_solid_wall_segment_end'];
  const CHAIR_RE = /^EventV6_(?:entrance folding chair seat|entrance chair back|chair folding leg|chair crossing leg)_\d+$/;
  const TABLE_ITEM_RE = /^EventV6_(?:entrance table information card|acrylic desk sign foot|welcome brochure stack|registration pen|entrance drinking water bottle|small bottle cap)_\d+$/;
  // Measured from the v13 venue; used only if a lookup fails.
  const FALLBACK = {
    table: {x0: 3.970, x1: 4.430, z0: 21.0, z1: 28.2, top: .5709},
    wallX: 4.98,
    columns: [{x0: 4.822, z0: 22.672, z1: 22.928}],
    blocked: [
      {x0: 4.10, x1: 4.27, z0: 21.82, z1: 22.18}, {x0: 4.10, x1: 4.12, z0: 22.22, z1: 22.34},
      {x0: 4.10, x1: 4.27, z0: 24.42, z1: 24.78}, {x0: 4.10, x1: 4.12, z0: 24.82, z1: 24.94},
      {x0: 4.10, x1: 4.27, z0: 27.02, z1: 27.38}, {x0: 4.10, x1: 4.12, z0: 27.42, z1: 27.54},
      {x0: 4.29, x1: 4.35, z0: 22.97, z1: 23.03}, {x0: 4.29, x1: 4.35, z0: 25.97, z1: 26.03}
    ],
    measured: false
  };
  // Six volunteers along the 7.2-unit table. turn = small head-on variation from facing the gallery.
  const VOLUNTEERS = [
    {z: 21.50, model: 'kate_character', turn: -.12, mode: 'idle', stacks: 3},
    {z: 22.74, model: 'james_character', turn: .10, mode: 'talk', stacks: 3},
    {z: 23.98, model: 'sara_character', turn: -.05, mode: 'idle', stacks: 3},
    {z: 25.24, model: 'joe', turn: .15, mode: 'idle', stacks: 4},
    {z: 26.42, model: 'liz', turn: -.14, mode: 'talk', stacks: 3},
    {z: 27.64, model: 'adam_character', turn: .07, mode: 'idle', stacks: 3}
  ];
  const MODELS = [...new Set(VOLUNTEERS.map(v => v.model))];
  const STAND_GAP = .145;   // body centre behind the table's back edge
  // Retail-folded T-shirt at the 0.40x visitor scale: about 26 x 32 cm, 2 cm per shirt.
  const SHIRT = {w: .104, l: .128, t0: .0072, t1: .0090};
  // Clear 90-quart style totes: about 62 x 49 x 35 cm.
  const BIN = {L: .248, W: .196, H: .14, taper: .010, r: .022, flange: .006, lid: .007};
  // z along the wall; fill = share of a full bin. lid = closed, latched lid. top = a second bin stacked on the lid.
  const BINS = [
    {z: 20.64, fill: .85},
    {z: 21.34, fill: 1, lid: true, top: {fill: .55}},
    {z: 21.62, fill: .7},
    {z: 22.36, fill: .45},
    {z: 23.22, fill: 1, lid: true, top: {fill: .9}},
    {z: 23.50, fill: .3},
    {z: 24.46, fill: 1, lid: true},
    {z: 25.12, fill: .95, lid: true, top: {fill: .4}},
    {z: 25.40, fill: .65},
    {z: 26.38, fill: .85},
    {z: 27.50, fill: 1, lid: true, top: {fill: .75}},
    {z: 27.78, fill: .5},
    {z: 28.50, fill: .8}
  ];
  let layout = null, batches = [], decalBatch = null, logoState = 'waiting', built = false, summary = null, removed = [];

  function rng(seed) {
    let a = seed >>> 0;
    return () => {a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296;};
  }
  const lin = h => [1, 3, 5].map(k => {const v = parseInt(h.slice(k, k + 2), 16) / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;});

  /* ---------- venue measurement (runs inside loadVenue, before batching) ---------- */
  function prepareVenue(j) {
    if (j.extras?.volunteerCheckIn31) return;
    // Never let the check-in dressing stop the venue from opening.
    try {measureVenue(j);} catch (e) {console.warn('Volunteer check-in: using stored table position.', e); layout = null;}
  }
  function measureVenue(j) {
    const parents = new Map();
    j.nodes.forEach((n, i) => (n.children || []).forEach(c => parents.set(c, i)));
    const S = identity(); S[0] = S[5] = S[10] = VENUE_SCALE;
    const worldOf = i => {let m = trs(j.nodes[i]); for (let p = parents.get(i); p !== undefined; p = parents.get(p)) m = mm(trs(j.nodes[p]), m); return mm(S, m);};
    const boundsOf = i => {
      const n = j.nodes[i]; if (n.mesh === undefined || !j.meshes[n.mesh]) return null;
      const m = worldOf(i), lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
      for (const pr of j.meshes[n.mesh].primitives) {
        const a = j.accessors[pr.attributes?.POSITION]; if (!a?.min || !a?.max) continue;
        for (const x of [a.min[0], a.max[0]]) for (const y of [a.min[1], a.max[1]]) for (const z of [a.min[2], a.max[2]]) {
          const q = tp(m, x, y, z); for (let k = 0; k < 3; k++) {lo[k] = Math.min(lo[k], q[k]); hi[k] = Math.max(hi[k], q[k]);}
        }
      }
      return Number.isFinite(lo[0]) ? {lo, hi} : null;
    };
    const L = {table: {...FALLBACK.table}, wallX: FALLBACK.wallX, columns: [], blocked: [], measured: false};
    const ti = j.nodes.findIndex(n => n.name === TABLE_NAME), tb = ti >= 0 ? boundsOf(ti) : null;
    if (tb && tb.hi[2] - tb.lo[2] > 3 && tb.hi[0] - tb.lo[0] < 1.2) {L.table = {x0: tb.lo[0], x1: tb.hi[0], z0: tb.lo[2], z1: tb.hi[2], top: tb.hi[1]}; L.measured = true;}
    const t = L.table;
    let wall = Infinity;
    for (const name of WALL_NAMES) {const i = j.nodes.findIndex(n => n.name === name), b = i >= 0 ? boundsOf(i) : null; if (b && b.lo[0] > t.x1 && b.lo[0] < t.x1 + 1.2) wall = Math.min(wall, b.lo[0]);}
    if (Number.isFinite(wall)) L.wallX = wall;
    j.nodes.forEach((n, i) => {
      const name = n.name || '';
      if (n.mesh === undefined) return;
      if (TABLE_ITEM_RE.test(name)) {
        const b = boundsOf(i);
        if (b && b.lo[0] < t.x1 + .02 && b.hi[0] > t.x0 - .02 && b.hi[2] > t.z0 && b.lo[2] < t.z1) L.blocked.push({x0: b.lo[0], x1: b.hi[0], z0: b.lo[2], z1: b.hi[2]});
      } else if (/column/i.test(name)) {
        const b = boundsOf(i);
        if (b && b.lo[0] < L.wallX + .05 && b.hi[0] > t.x1 && b.hi[2] > t.z0 - 1 && b.lo[2] < t.z1 + 1 && b.hi[1] > .4) L.columns.push({x0: b.lo[0], z0: b.lo[2], z1: b.hi[2]});
      } else if (CHAIR_RE.test(name)) {
        // The folding chairs stand exactly where the volunteers and bins now go.
        const b = boundsOf(i);
        if (b && b.lo[0] > t.x1 - .05 && b.hi[0] < L.wallX + .05 && b.hi[2] > t.z0 - .5 && b.lo[2] < t.z1 + .5) {
          removed.push(name); delete n.mesh; n.extras = {...(n.extras || {}), walktestCollide: false, retiredByDEV31: 'volunteer check-in space'};
        }
      }
    });
    if (!L.blocked.length) L.blocked = FALLBACK.blocked.map(b => ({...b}));
    if (!L.columns.length) L.columns = FALLBACK.columns.map(c => ({...c}));
    layout = L;
    j.extras = {...(j.extras || {}), volunteerCheckIn31: {table: L.table, wallX: L.wallX, chairsRetired: removed.length / 6, measured: L.measured}};
  }
  const L0 = () => layout || FALLBACK;

  /* ---------- small mesh builder (world-space, consistent winding) ---------- */
  function mesh() {return {p: [], n: [], uv: [], i: []};}
  function addV(m, p, n, uv) {m.p.push(p[0], p[1], p[2]); m.n.push(n[0], n[1], n[2]); m.uv.push(uv ? uv[0] : 0, uv ? uv[1] : 0); return m.p.length / 3 - 1;}
  // Front faces must agree with the stored normals: the renderer flips normals on back faces.
  function addT(m, a, b, c) {
    const P = m.p, N = m.n, ax = P[a * 3], ay = P[a * 3 + 1], az = P[a * 3 + 2];
    const ux = P[b * 3] - ax, uy = P[b * 3 + 1] - ay, uz = P[b * 3 + 2] - az, vx = P[c * 3] - ax, vy = P[c * 3 + 1] - ay, vz = P[c * 3 + 2] - az;
    const fx = uy * vz - uz * vy, fy = uz * vx - ux * vz, fz = ux * vy - uy * vx;
    const nx = N[a * 3] + N[b * 3] + N[c * 3], ny = N[a * 3 + 1] + N[b * 3 + 1] + N[c * 3 + 1], nz = N[a * 3 + 2] + N[b * 3 + 2] + N[c * 3 + 2];
    if (fx * nx + fy * ny + fz * nz < 0) m.i.push(a, c, b); else m.i.push(a, b, c);
  }
  const rotY = (v, yaw) => {const c = Math.cos(yaw), s = Math.sin(yaw); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];};
  const place = (c, yaw, v) => {const r = rotY(v, yaw); return [c[0] + r[0], c[1] + r[1], c[2] + r[2]];};
  // Rounded box: half sizes h (local x, y, z), edge radius r, rotated by yaw about +y.
  function roundedBox(m, c, h, r, yaw) {
    const inner = h.map(x => Math.max(0, x - r));
    for (let ax = 0; ax < 3; ax++) {
      const u = (ax + 1) % 3, v = (ax + 2) % 3, cu = [-h[u], -inner[u], inner[u], h[u]], cv = [-h[v], -inner[v], inner[v], h[v]];
      for (const sign of [-1, 1]) {
        const base = m.p.length / 3;
        for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
          const p = [0, 0, 0]; p[ax] = sign * h[ax]; p[u] = cu[x]; p[v] = cv[y];
          const q = p.map((val, k) => Math.max(-inner[k], Math.min(inner[k], val)));
          let d = p.map((val, k) => val - q[k]); const len0 = Math.hypot(d[0], d[1], d[2]);
          d = len0 > 1e-9 ? d.map(val => val / len0) : [ax === 0 ? sign : 0, ax === 1 ? sign : 0, ax === 2 ? sign : 0];
          addV(m, place(c, yaw, q.map((val, k) => val + d[k] * r)), rotY(d, yaw));
        }
        for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) {const a = base + y * 4 + x; addT(m, a, a + 1, a + 5); addT(m, a, a + 5, a + 4);}
      }
    }
  }
  function tube(m, pts, radius, segs = 6) {
    const first = m.p.length / 3;
    for (let k = 0; k < pts.length; k++) {
      const a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)];
      let t = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]; const tl = Math.hypot(...t) || 1; t = t.map(x => x / tl);
      let u = [t[2], 0, -t[0]]; const ul = Math.hypot(...u); u = ul > 1e-6 ? u.map(x => x / ul) : [1, 0, 0];
      const w = [t[1] * u[2] - t[2] * u[1], t[2] * u[0] - t[0] * u[2], t[0] * u[1] - t[1] * u[0]];
      for (let i = 0; i < segs; i++) {
        const q = i / segs * Math.PI * 2, n = [u[0] * Math.cos(q) + w[0] * Math.sin(q), u[1] * Math.cos(q) + w[1] * Math.sin(q), u[2] * Math.cos(q) + w[2] * Math.sin(q)];
        addV(m, [pts[k][0] + n[0] * radius, pts[k][1] + n[1] * radius, pts[k][2] + n[2] * radius], n);
      }
    }
    for (let k = 0; k < pts.length - 1; k++) for (let i = 0; i < segs; i++) {
      const a = first + k * segs + i, b = first + k * segs + (i + 1) % segs;
      addT(m, a, b, b + segs); addT(m, a, b + segs, a + segs);
    }
  }
  // Rounded-rectangle outline in a bin's local frame: x across (W), z along the wall (L).
  function rrLoop(L, W, r, seg = 3) {
    const hx = W / 2 - r, hz = L / 2 - r, out = [];
    for (const [cx, cz, a0] of [[hx, hz, 0], [-hx, hz, Math.PI / 2], [-hx, -hz, Math.PI], [hx, -hz, Math.PI * 1.5]])
      for (let k = 0; k <= seg; k++) {const a = a0 + k / seg * Math.PI / 2; out.push({x: cx + r * Math.cos(a), z: cz + r * Math.sin(a), nx: Math.cos(a), nz: Math.sin(a)});}
    return out;
  }
  function band(m, c, yaw, loopA, yA, loopB, yB, normalOf) {
    const n = loopA.length, a0 = m.p.length / 3;
    for (let i = 0; i < n; i++) addV(m, place(c, yaw, [loopA[i].x, yA, loopA[i].z]), rotY(normalOf(loopA[i], 0), yaw));
    for (let i = 0; i < n; i++) addV(m, place(c, yaw, [loopB[i].x, yB, loopB[i].z]), rotY(normalOf(loopB[i], 1), yaw));
    for (let i = 0; i < n; i++) {const k = (i + 1) % n; addT(m, a0 + i, a0 + k, a0 + n + k); addT(m, a0 + i, a0 + n + k, a0 + n + i);}
  }
  function cap(m, c, yaw, loop, y, up) {
    const centre = addV(m, place(c, yaw, [0, y, 0]), [0, up, 0]), a0 = m.p.length / 3;
    for (const q of loop) addV(m, place(c, yaw, [q.x, y, q.z]), [0, up, 0]);
    for (let i = 0; i < loop.length; i++) addT(m, centre, a0 + i, a0 + (i + 1) % loop.length);
  }

  /* ---------- folded shirts ---------- */
  function foldedShirt(out, R, c, yaw, t, top, logo) {
    const w = SHIRT.w * (1 + (R() - .5) * .04), l = SHIRT.l * (1 + (R() - .5) * .04);
    roundedBox(out.shirts[Math.floor(R() * out.shirts.length)], c, [w / 2, t / 2, l / 2], t * .46, yaw);
    if (!top) return;
    // Collar ribbing: the neckline U plus the back collar along the top fold.
    const y = t / 2 + .0011, zc = -l / 2 + .006, u = [];   // local to the shirt centre
    for (let k = 0; k <= 10; k++) {const q = k / 10 * Math.PI; u.push(place(c, yaw, [.025 * Math.cos(q), y, zc + .017 * Math.sin(q)]));}
    tube(out.collars, u, .0022, 6);
    tube(out.collars, [place(c, yaw, [-.027, y - .0003, zc - .0015]), place(c, yaw, [.027, y - .0003, zc - .0015])], .0021, 6);
    if (!logo) return;
    // Chest print (the same MiCareerQuest ink as the volunteers' shirts), readable from the visitor side.
    const dw = .066, dh = dw * 178 / 728, zp = -l / 2 + .036, yy = t / 2 + .0006, a = out.decals.p.length / 3;
    for (const [x, z, uv] of [[-dw / 2, zp - dh / 2, [0, 0]], [dw / 2, zp - dh / 2, [1, 0]], [dw / 2, zp + dh / 2, [1, 1]], [-dw / 2, zp + dh / 2, [0, 1]]])
      addV(out.decals, place(c, yaw, [x, yy, z]), [0, 1, 0], uv);
    addT(out.decals, a, a + 1, a + 2); addT(out.decals, a, a + 2, a + 3);
    out.stats.logos++;
  }
  function stack(out, R, base, yaw, count, opts = {}) {
    let y = base[1];
    // Hand-made piles drift a little in one direction as they grow.
    const lean = opts.lean === false ? [0, 0] : [(R() - .5) * .0026, (R() - .5) * .0026];
    for (let k = 0; k < count; k++) {
      const t = SHIRT.t0 + R() * (SHIRT.t1 - SHIRT.t0), top = k === count - 1;
      let dx = (R() - .5) * .009 + lean[0] * k, dz = (R() - .5) * .009 + lean[1] * k, turn = (R() - .5) * .08;
      if (top && R() < (opts.messy ?? .45)) {turn += (R() - .5) * .34; dx += (R() - .5) * .018; dz += (R() - .5) * .018;}
      foldedShirt(out, R, [base[0] + dx, y + t / 2, base[2] + dz], yaw + turn, t, top && opts.collar !== false, top && opts.logo);
      y += t * .985;
    }
    return count;
  }
  // Soft contact shadow quad (texture supplies the falloff) so props sit on their surface.
  function shadowQuad(out, c, yaw, w, l) {
    const a = out.shadows.p.length / 3;
    for (const [x, z, uv] of [[-w / 2, -l / 2, [0, 0]], [w / 2, -l / 2, [1, 0]], [w / 2, l / 2, [1, 1]], [-w / 2, l / 2, [0, 1]]])
      addV(out.shadows, place(c, yaw, [x, 0, z]), [0, 1, 0], uv);
    addT(out.shadows, a, a + 1, a + 2); addT(out.shadows, a, a + 2, a + 3);
  }
  function shadowCanvas() {
    const n = 64, c = document.createElement('canvas'); c.width = c.height = n;
    const ctx = c.getContext('2d'), im = ctx.createImageData(n, n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const u = Math.max(0, Math.abs((x + .5) / n * 2 - 1) - .5) / .5, v = Math.max(0, Math.abs((y + .5) / n * 2 - 1) - .5) / .5;
      const d = Math.min(1, Math.hypot(u, v)), s = 1 - d * d * (3 - 2 * d);
      im.data.set([0, 0, 0, Math.round(255 * s)], (y * n + x) * 4);
    }
    ctx.putImageData(im, 0, 0);
    return c;
  }
  // Stack spots in front of each volunteer, avoiding the signs, pens, brochures and water bottles.
  function tableSpots(R) {
    const {table: t, blocked} = L0(), spots = [], margin = .012;
    const zones = blocked.map(b => ({x0: b.x0 - margin, x1: b.x1 + margin, z0: b.z0 - margin, z1: b.z1 + margin}));
    VOLUNTEERS.forEach((v, vi) => {
      const cands = [];
      for (let k = -4; k <= 4; k++) cands.push({z: v.z + k * .062, d: Math.abs(k) + (k > 0 ? .1 : 0)});
      cands.sort((a, b) => a.d - b.d);
      let got = 0;
      for (const c of cands) {
        if (got >= v.stacks) break;
        const x = t.x0 + .195 + (R() - .5) * .05, hx = SHIRT.l / 2 + .012, hz = SHIRT.w / 2 + .012;
        if (c.z - hz < t.z0 + .015 || c.z + hz > t.z1 - .015) continue;
        if (zones.some(b => x + hx > b.x0 && x - hx < b.x1 && c.z + hz > b.z0 && c.z - hz < b.z1)) continue;
        if (spots.some(s => Math.abs(s.z - c.z) < SHIRT.w + .014)) continue;
        spots.push({x, z: c.z, vi}); got++;
      }
    });
    return spots;
  }

  /* ---------- clear plastic bins ---------- */
  function bin(out, R, c, yaw, spec) {
    // Heights below are local to the bin (0 = the floor it stands on).
    const {L, W, H, taper, r, flange, lid} = BIN;
    const bottom = rrLoop(L - 2 * taper, W - 2 * taper, r - taper * .5), top = rrLoop(L, W, r), rim = rrLoop(L + 2 * flange, W + 2 * flange, r + flange);
    const slope = taper / H, wallN = q => {const n = [q.nx, -slope, q.nz], s = Math.hypot(...n); return n.map(x => x / s);};
    band(out.walls, c, yaw, bottom, .001, top, H, wallN);
    cap(out.walls, c, yaw, bottom, .001, -1);
    band(out.rims, c, yaw, top, H, rim, H, () => [0, 1, 0]);
    band(out.rims, c, yaw, rim, H, rim, H - .009, q => [q.nx, 0, q.nz]);
    // Moulded edges read as a storage tote rather than a glass box: corners, base and a stacking ledge.
    const hxB = (W - 2 * taper) / 2 - (r - taper * .5), hzB = (L - 2 * taper) / 2 - (r - taper * .5), hxT = W / 2 - r, hzT = L / 2 - r;
    for (const [sx, sz, a] of [[1, 1, Math.PI / 4], [-1, 1, Math.PI * .75], [-1, -1, Math.PI * 1.25], [1, -1, Math.PI * 1.75]]) {
      const rb = r - taper * .5;
      tube(out.rims, [place(c, yaw, [sx * hxB + rb * Math.cos(a), .004, sz * hzB + rb * Math.sin(a)]), place(c, yaw, [sx * hxT + r * Math.cos(a), H - .004, sz * hzT + r * Math.sin(a)])], .0021, 5);
    }
    const ring = (f, rad) => {const q = rrLoop(L - 2 * taper * (1 - f), W - 2 * taper * (1 - f), r - taper * .5 * (1 - f)); tube(out.rims, q.concat(q[0]).map(p => place(c, yaw, [p.x * 1.004, H * f + .002, p.z * 1.004])), rad, 5);};
    ring(0, .0019); ring(.64, .0016);
    if (c[1] < .3) shadowQuad(out, [c[0], c[1] + .0015, c[2]], yaw, W + .075, L + .075);
    out.stats.bins++;
    // Folded shirts inside: two stacks along the bin, long side across it.
    const fill = Math.max(0, Math.min(1, spec.fill ?? 1)), full = Math.floor((H - .012) / .0081);
    for (const side of [-1, 1]) {
      const n = Math.max(1, Math.round(full * fill) + (side > 0 ? -Math.floor(R() * 2) : 0));
      const p = place(c, yaw, [(R() - .5) * .008, .003, side * .056 + (R() - .5) * .006]);
      out.stats.binShirts += stack(out, R, p, yaw - Math.PI / 2, n, {collar: fill < .9, logo: false, messy: .6});
    }
    if (spec.lid) {
      const lidLoop = rrLoop(L + 2 * flange + .004, W + 2 * flange + .004, r + flange + .002);
      band(out.lids, c, yaw, lidLoop, H - .002, lidLoop, H + lid, q => [q.nx, 0, q.nz]);
      cap(out.lids, c, yaw, lidLoop, H + lid, 1);
      const panel = rrLoop(L * .78, W * .66, r * .8);
      band(out.lids, c, yaw, panel, H + lid, panel, H + lid + .003, q => [q.nx, 0, q.nz]);
      cap(out.lids, c, yaw, panel, H + lid + .003, 1);
      for (const end of [-1, 1]) roundedBox(out.latches, place(c, yaw, [0, H - .003, end * (L / 2 + flange + .006)]), [.018, .012, .0038], .002, yaw);
      out.stats.lids++;
    }
    // Absolute height where a second bin can stand (on the lid's raised panel).
    return c[1] + H + (spec.lid ? lid + .003 : 0);
  }

  /* ---------- batches ---------- */
  function upload(m, material) {
    if (!m.i.length) return null;
    const v = new Float32Array(m.p.length * 2);
    for (let i = 0; i < m.p.length / 3; i++) v.set([m.p[i * 3], m.p[i * 3 + 1], m.p[i * 3 + 2], m.n[i * 3], m.n[i * 3 + 1], m.n[i * 3 + 2]], i * 6);
    const {table: t, wallX} = L0(), zc = (t.z0 + t.z1) / 2;
    return uploadBatch(v, new Uint32Array(m.i), {rough: .9, metal: 0, ...material, center: [(t.x0 + wallX) / 2, .45, zc], cullRadius: (t.z1 - t.z0) / 2 + 1.6, flow22CheckIn: true, checkIn31: true});
  }
  function build() {
    if (built || !gl || gl.isContextLost()) return;
    built = true;
    // A failure here must never stop the venue start-up or the frame loop.
    try {buildProps();} catch (e) {console.warn('Volunteer check-in props could not be built:', e); summary = {error: e.message || String(e)};}
  }
  function buildProps() {
    const R = rng(3107031), {table: t, wallX, columns} = L0(), purple = lin(PURPLE);
    const out = {shirts: [mesh(), mesh(), mesh()], collars: mesh(), decals: mesh(), walls: mesh(), rims: mesh(), lids: mesh(), latches: mesh(), shadows: mesh(),
      stats: {tableStacks: 0, tableShirts: 0, bins: 0, lids: 0, binShirts: 0, logos: 0}};
    // Table: uneven stacks, collar towards the volunteer, print readable from the visitor side.
    const counts = [12, 7, 10, 4, 13, 8, 5, 11, 9, 6, 13, 3, 10, 8, 12, 5, 9, 7, 11, 6];
    const spots = tableSpots(R);
    spots.forEach((s, i) => {
      const n = counts[(i * 7 + 3) % counts.length] + (R() < .3 ? 1 : 0), yaw = -Math.PI / 2 + (R() - .5) * .08;
      out.stats.tableShirts += stack(out, R, [s.x, t.top + .0004, s.z], yaw, n, {logo: R() < .82});
      shadowQuad(out, [s.x, t.top + .0003, s.z], yaw, SHIRT.w + .05, SHIRT.l + .05);
      out.stats.tableStacks++;
    });
    // Floor bins against the wall behind the volunteers, clear of the gallery column.
    const x = wallX - .006 - (BIN.W / 2 + BIN.flange);
    for (const spec of BINS) {
      const hz = BIN.L / 2 + BIN.flange + .01;
      if (columns.some(c => spec.z + hz > c.z0 && spec.z - hz < c.z1 && x + BIN.W / 2 > c.x0)) continue;
      const yaw = (R() - .5) * .05, yFloor = floorHeightAt(x, spec.z);
      const topY = bin(out, R, [x, yFloor, spec.z], yaw, spec);
      if (spec.top && spec.lid) bin(out, R, [x + (R() - .5) * .006, topY, spec.z + (R() - .5) * .008], yaw + (R() - .5) * .04, spec.top);
    }
    const shade = f => [purple[0] * f, purple[1] * f, purple[2] * f, 1];
    batches = [
      upload(out.shirts[0], {color: shade(.80), rough: .93}),
      upload(out.shirts[1], {color: shade(.88), rough: .93}),
      upload(out.shirts[2], {color: shade(.97), rough: .92}),
      upload(out.collars, {color: shade(.62), rough: .95}),
      upload(out.latches, {color: [.80, .82, .83, 1], rough: .45}),
      // Transparent pass, in draw order: contact shadows, plastic shell, lids, then the brighter moulded rims.
      upload(out.shadows, {color: [0, 0, 0, .40], rough: 1, baseTexture: CharacterFitting.canvasTexture(shadowCanvas()), uv: new Float32Array(out.shadows.uv), transparent: true}),
      upload(out.walls, {color: [.80, .87, .93, .23], rough: .18, transparent: true}),
      upload(out.lids, {color: [.78, .86, .94, .36], rough: .22, transparent: true}),
      upload(out.rims, {color: [.90, .94, .98, .55], rough: .2, transparent: true})
    ].filter(Boolean);
    const decals = out.decals;
    summary = {...out.stats, volunteers: VOLUNTEERS.length, gpuBatches: batches.length + (decals.i.length ? 1 : 0), triangles: batches.reduce((s, b) => s + b.count / 3, 0), chairsRetired: removed.length / 6, measuredFromVenue: L0().measured, table: t, wallX};
    for (const b of batches) {renderBatches.push(b); if (Array.isArray(baseRenderBatches)) baseRenderBatches.push(b);}
    if (typeof lastSunRoof !== 'undefined') lastSunRoof = null; // re-bake the cached sun shadows once, now including the stacks
    if (decals.i.length) logoTexture31().then(tex => {
      if (!tex || gl.isContextLost()) return;
      decalBatch = upload(decals, {color: [1, 1, 1, 1], baseTexture: tex, uv: new Float32Array(decals.uv), transparent: true, rough: .85});
      if (!decalBatch) return;
      renderBatches.push(decalBatch); if (Array.isArray(baseRenderBatches)) baseRenderBatches.push(decalBatch);
      logoState = 'ready'; summary.gpuBatches = batches.length + 1;
    }).catch(e => {logoState = 'unavailable: ' + (e.message || e); console.warn('Check-in shirt print:', e);});
  }
  async function logoTexture31() {
    // Same supplied logo and the same ink conversion as the printed volunteer shirts.
    let j, glbBin;
    const loaded = characterState.models.get('brad_character');
    if (loaded?.j && loaded?.exportBin) {j = loaded.j; glbBin = loaded.exportBin;}
    else {
      const data = document.getElementById('character-brad_character')?.textContent.trim();
      if (!data) throw Error('logo source missing');
      const gz = Uint8Array.from(atob(data), c => c.charCodeAt(0));
      const ab = await new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      ({json: j, bin: glbBin} = parseGLB(ab));
    }
    const ti = j.extras?.characterFitV12?.logoTexture;
    if (ti == null) throw Error('no supplied logo texture');
    const im = await CharacterFitting.imageFromTexture(j, glbBin, ti), c = document.createElement('canvas');
    c.width = im.width; c.height = im.height;
    const ctx = c.getContext('2d', {willReadFrequently: true}); ctx.drawImage(im, 0, 0); im.close?.();
    const px = ctx.getImageData(0, 0, c.width, c.height), d = px.data;
    for (let i = 0; i < d.length; i += 4) {
      const a = Math.max(0, Math.min(1, (255 - Math.min(d[i], d[i + 1], d[i + 2])) / 80));
      d[i + 3] = Math.round(a * d[i + 3]);
      if (d[i + 2] > d[i] * 1.1) d[i] = d[i + 1] = d[i + 2] = 255;
    }
    ctx.putImageData(px, 0, 0);
    return CharacterFitting.canvasTexture(c);
  }
  // refreshShipments() rebuilds renderBatches from the base list; keep the props present.
  function ensure() {
    if (!built) {if (state.ready && gl) build(); return;}
    const all = decalBatch ? batches.concat(decalBatch) : batches;
    if (all.length && !renderBatches.includes(all[0])) for (const b of all) if (!renderBatches.includes(b)) renderBatches.push(b);
  }
  // Staff-dependent helpers are also guarded: the event staff simply fall back to the original behaviour.
  function safe(fn, fallback) {return (...a) => {try {return fn(...a);} catch (e) {console.warn('Volunteer check-in:', e); return fallback;}};}

  /* ---------- people ---------- */
  function staff(outfitFor) {
    const {table: t} = L0(), out = [];
    VOLUNTEERS.forEach((v, i) => {
      const m = characterState.models.get(v.model) || characterState.models.get('sara_character') || characterState.models.get('brad_character');
      if (!m) return;
      const x = t.x1 + STAND_GAP + (i % 2 ? .01 : -.006), z = v.z, yaw = -Math.PI / 2 + v.turn;
      out.push({id: 31100 + i, kind: 'checkInVolunteer', line: 'welcome-checkin', label: 'Volunteer check-in table', name: 'Check-in volunteer',
        role: 'Volunteer check-in (purple shirts)', industry: 'check in', volunteer: true, stationed: true, mode: v.mode, model: m, outfit: outfitFor(m, 400 + i),
        x, z, yaw, position: [x, floorHeightAt(x, z) + .004, z], renderX: x, renderZ: z, renderYaw: yaw, clock: 0, phase: (i * 1.37) % 9,
        displayMode: v.mode, transitionStart: -100, lastFrame: 0});
    });
    return out;
  }
  // Simulated students never walk behind the table, through the volunteers or the bins.
  function staffOnly(x, z) {const {table: t, wallX} = L0(); return x > t.x1 - .01 && x < wallX + .02 && z > t.z0 - .75 && z < t.z1 + .75;}
  function playerNear() {const p = player.position; return p[0] > -5.3 && p[0] < 5.3 && p[2] > 16.5 && p[2] < 34;}
  // Elevated front view of the middle of the table (framed between the side panels); W returns to walking in front of it.
  function visitPlace() {
    const {table: t} = L0(), zc = (t.z0 + t.z1) / 2;
    return {label: 'Event staff: Volunteer check-in table', p: [t.x0 - 1.0, .5, zc], yaw: -Math.PI / 2, scaledPlayer: true,
      view: {camera: [t.x0 - 1.62, 1.56, zc + .38], target: [t.x1 + .27, .38, zc - .05]}};
  }
  return {PURPLE, MODELS, VOLUNTEERS, BINS, prepareVenue, build, ensure: safe(ensure), staff: safe(staff, []), staffOnly: safe(staffOnly, false), playerNear: safe(playerNear, false), visitPlace,
    get layout() {return L0();}, get summary() {return summary ? {...summary, logo: logoState} : null;}, get removed() {return removed.slice();}};
})();
window.CheckInScene31 = CheckInScene31;

const EventFlow22 = (() => {
  'use strict';
  const TURN_NAMES = new Set(['demo manufacturing 12','demo agribusiness 26','demo construction 26']);
  const CLOSED_GATE = 'construction-east';
  const MODELS = ['brad_character','sara_character'];
  const SPACING = .62;
  const plans = [
    {id:'manufacturing-health-link',label:'Manufacturing / Health Science connection',points:[[32.48,-16.20],[34.72,-16.20]],face:[33.6,-14.1]},
    {id:'end-of-main-aisle',label:'Far end of the center bench aisle',points:[[58.12,-3.45],[58.12,3.45]],face:[54,0]},
    {id:'agribusiness-construction-link',label:'Agribusiness / Construction connection',points:[[32.48,16.20],[34.72,16.20]],face:[33.6,14.1]},
    {id:'agribusiness-gallery-edge',label:'Grand Gallery / Agribusiness outer edge',points:[[5.47,20.25],[8.82,20.25]],face:[7.1,18.0]},
    {id:'front-arrival-apron',label:'Front entrance and curb',points:[[-5.3,33.20],[-5.85,34.40],[-5.90,35.90],[-5.40,37.40],[-4.35,38.55],[-2.6,39.02],[3.8,39.02],[5.45,38.45],[5.85,36.60],[5.5,34.30],[5.1,33.20]],face:[0,33.8]},
    {id:'manufacturing-gallery-edge',label:'Grand Gallery / Manufacturing outer edge',points:[[5.47,-20.25],[8.82,-20.25]],face:[7.1,-18]},
    {id:'gallery-before-stairs',label:'Grand Gallery before rear stairs',points:[[-4.90,-21.00],[4.9,-21.00]],face:[0,-18]}
  ];
  const status={enabled:false,loading:false,error:null,message:'Officers, indoor boundary volunteers and the volunteer check-in staff are not loaded yet. They load when you walk into the Grand Gallery, or with the button below. The shirt stacks and bins are already on the table.',time:0,removed:[],added:[],requested:0,skipped:[],rotations:[]};
  let helpers=[],officers=[],checkInStaff=[],allStaff=[],loadingPromise=null,lastUI=0,mergedAgents=null,mergedHelpers=null,mergedCount=-1,merged=[];
  const qs=id=>document.getElementById(id);
  const normalizeName=s=>String(s||'').trim().replace(/\s+/g,' ').toLowerCase();
  function needsTurn(r){return TURN_NAMES.has(normalizeName(r.name));}
  function oriented(r,p){
    if(!p||!needsTurn(r))return p;
    const key=normalizeName(r.name);
    if(p.flow22Facing===key)return p;
    return {...p,yaw:((p.yaw+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2),flow22Facing:key};
  }
  function allocate(r,scale,preferred){
    const chosen=allocateDiscoveryPlacement(r,scale,preferred),p=oriented(r,chosen);
    const problem=discoveryPlacementProblem(r,p);
    if(problem)throw Error('Cannot turn '+r.name+' safely: '+problem);
    if(needsTurn(r)&&!status.rotations.some(x=>x.id===r.id))status.rotations.push({id:r.id,name:r.name,yaw:p.yaw,anchorId:p.anchorId});
    return p;
  }
  function prepareVenue(j){
    CheckInScene31.prepareVenue(j);
    if(j.extras?.eventFlow22)return;
    status.removed.length=0;status.added.length=0;
    const find=name=>{const i=j.nodes.findIndex(n=>n.name===name);if(i<0)throw Error('DEV31 venue does not match expected object: '+name);return i;};
    const retire=i=>{const n=j.nodes[i];if(n.mesh!==undefined){status.removed.push(n.name);delete n.mesh;}n.extras={...(n.extras||{}),walktestCollide:false,retiredByDEV22:true};};
    const parents=new Map();j.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>parents.set(c,i)));
    function clone(name,label,sz=1,tz=0){
      const i=find(name),src=j.nodes[i],n={...src,name:'Flow22_'+label,extras:{...(src.extras||{}),eventFlow22:true}};
      const m=identity();m[10]=sz;m[14]=tz;n.matrix=mm(m,trs(src));delete n.translation;delete n.scale;delete n.rotation;delete n.children;
      const ni=j.nodes.length;j.nodes.push(n);const parent=parents.get(i);
      if(parent===undefined)j.scenes[j.scene||0].nodes.push(ni);else j.nodes[parent].children.push(ni);
      status.added.push(n.name);return ni;
    }
    const sourceCount=j.nodes.length;
    for(let i=0;i<sourceCount;i++){
      const n=j.nodes[i],name=n.name||'';
      if(!/^EventV6_construction (entrance|entry)/.test(name)||n.mesh===undefined)continue;
      const pr=j.meshes[n.mesh].primitives[0],a=j.accessors[pr.attributes.POSITION];
      if(a.min&&a.max&&(a.min[0]+a.max[0])/2>57.7)retire(i);
    }
    ['V8_construction portal sign solid backing_28','V8_construction sector outward_29','V8_construction exit inward_30','V9_concealed arch sign support_256','V9_concealed arch sign support_257'].forEach(n=>retire(find(n)));
    ['EventV6_telescopic collar_854','EventV6_telescopic collar_857'].forEach(n=>retire(find(n)));
    clone('EventV6_construction curtain collision_871','Construction_closed_rear_curtain_COLLIDER',.5,10.2);
    clone('EventV6_construction pleated event curtain_872','Construction_closed_rear_pleated_yellow_curtain',.5,10.2);
    clone('EventV6_curtain header pole_888','Construction_closed_rear_header_pipe',.5,10.2);
    clone('EventV6_curtain upright_873','Construction_closed_rear_center_upright',1,10.5);
    clone('EventV6_curtain footplate_874','Construction_closed_rear_center_footplate',1,10.5);
    clone('EventV6_telescopic collar_875','Construction_closed_rear_center_collar',1,10.5);
    DISCOVERY_LAYOUT.gates=(DISCOVERY_LAYOUT.gates||[]).filter(g=>g.id!==CLOSED_GATE);
    if(j.extras?.discoveryLayout)j.extras.discoveryLayout.gates=(j.extras.discoveryLayout.gates||[]).filter(g=>g.id!==CLOSED_GATE);
    j.extras={...(j.extras||{}),eventFlow22:{closedGate:CLOSED_GATE,removed:status.removed.slice(),added:status.added.slice(),visualVolunteerLines:plans,volunteerCheckIn:{volunteers:CheckInScene31.VOLUNTEERS.length,bins:CheckInScene31.BINS.length,chairsRetired:CheckInScene31.removed.length/6}}};
  }
  function insideVisitorArea(x,z){
    if(CheckInScene31.staffOnly(x,z))return false;
    if(x<-5.1)return true;
    if(x<5.35)return z>=-20.78;
    if(DISCOVERY_LAYOUT.sectors.some(q=>q.industry!=='Information Technology'&&x>=q.min[0]&&x<=q.max[0]&&z>=q.min[1]&&z<=q.max[1]))return true;
    if(x<=9&&z>=-20.03&&z<=20.03)return true;
    if(x<=57.90&&z>=-3.6&&z<=3.6)return true;
    if(x>=32.4&&x<=34.8&&z>=-15.98&&z<=15.98)return true;
    return false;
  }
  function pointsFor(line){
    const pieces=[];let total=0;
    for(let i=1;i<line.points.length;i++){const a=line.points[i-1],b=line.points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);pieces.push({a,b,len,start:total});total+=len;}
    const margin=Math.min(.20,total/4),n=Math.max(2,Math.ceil((total-2*margin)/SPACING)+1),out=[];
    for(let i=0;i<n;i++){
      const d=margin+(total-2*margin)*i/(n-1);
      let seg=pieces.find(p=>d<=p.start+p.len+.000001)||pieces[pieces.length-1];
      const u=(d-seg.start)/seg.len;
      const x=seg.a[0]+(seg.b[0]-seg.a[0])*u,z=seg.a[1]+(seg.b[1]-seg.a[1])*u;
      out.push({line:line.id,label:line.label,x,z,yaw:Math.atan2(line.face[0]-x,line.face[1]-z)});
    }
    return out;
  }
  function clearPoint(p){
    const pos=[p.x,floorHeightAt(p.x,p.z)+PHYSICS.radii[1]+.01,p.z],q=resolveEllipsoid(pos,[0,0,0]).position;
    if(Math.hypot(q[0]-p.x,q[2]-p.z)>.035)return false;
    return ![...shippedBooths.values()].some(r=>{const b=r.cachedBound||worldBound(r,r.placement);return p.x>b.lo[0]-.19&&p.x<b.hi[0]+.19&&p.z>b.lo[2]-.19&&p.z<b.hi[2]+.19;});
  }
  function positions(){
    const all=plans.flatMap(pointsFor);status.requested=all.length;status.skipped=[];
    const good=all.filter(p=>{if(clearPoint(p))return true;status.skipped.push({line:p.line,x:p.x,z:p.z});return false;}).map((p,sourceIndex)=>({...p,sourceIndex}));
    status.originalOutdoor=good.filter(p=>p.line==='front-arrival-apron').length;
    const indoor=good.filter(p=>p.line!=='front-arrival-apron');status.originalIndoor=indoor.length;
    const counts=new Map(),kept=indoor.filter(p=>{const i=counts.get(p.line)||0;counts.set(p.line,i+1);return i%2===0;});
    status.removedIndoor=indoor.length-kept.length;return kept;
  }
  function outfit(m,i){
    const palette=CrowdWardrobe.appearance(200+i,914211001,m),purple=CrowdWardrobe.appearance(0,914211001,m);
    return {...palette,shirt:'#7038aa',volunteer:true,backpack:false,hat:false,colors:[...purple.colors.slice(0,3),...palette.colors.slice(3)],flags:[0,0,1,1]};
  }
  function buildHelpers(){
    const candidates=positions();helpers=candidates.map((p,i)=>{
      const m=characterState.models.get(MODELS[p.sourceIndex%MODELS.length]);
      return {id:22000+p.sourceIndex,kind:'boundaryVolunteer',name:'Event volunteer',role:'Please stay in the event area',industry:'Where is Information?',volunteer:true,stationed:true,mode:'idle',model:m,outfit:outfit(m,p.sourceIndex),...p,
        position:[p.x,floorHeightAt(p.x,p.z)+.004,p.z],renderX:p.x,renderZ:p.z,renderYaw:p.yaw,clock:0,phase:(i*.773)%9,displayMode:'idle',transitionStart:-100,lastFrame:0};
    });
    checkInStaff=CheckInScene31.staff(outfit);
    officers=TrafficPolice23.actors();
    allStaff=helpers.concat(checkInStaff,officers);
    status.message=checkInStaff.length+' check-in volunteers at the entrance table, '+helpers.length+' indoor boundary volunteers and '+officers.length+' traffic officers are loaded. Original 50 event volunteers remain unchanged.';
    updateUI();return helpers;
  }
  async function load(){
    if(loadingPromise)return loadingPromise;
    status.enabled=true;status.loading=true;status.error=null;status.message='Preparing the check-in volunteers, traffic officers and indoor boundary helpers. No student crowd starts.';updateUI();
    loadingPromise=(async()=>{
      const required=[...new Set([...MODELS,...CheckInScene31.MODELS,TrafficPolice23.BASE])];const D=required.every(id=>characterState.models.has(id))?null:await loadCharacterDecoder();
      for(const id of required){if(!characterState.models.has(id)){status.message='Loading event staff: '+id.replace('_character','')+'...';updateUI();characterState.models.set(id,await loadCharacterModel(id,D));}}
      status.message='Fitting the traffic uniform to the existing James character and placing the check-in volunteers...';updateUI();await new Promise(r=>setTimeout(r,0));
      TrafficPolice23.makeModel(characterState.models.get(TrafficPolice23.BASE));
      await CrowdGraphics.prepareModels(text=>{status.message=text;updateUI();});
      if(gl.isContextLost())throw Error('Graphics context was reset. Reload the empty venue.');
      buildHelpers();CheckInScene31.ensure();if(window.Crowd)Crowd.invalidate();
    })();
    try{await loadingPromise;}catch(e){status.enabled=false;status.error=e.message||String(e);status.message='Staff not loaded: '+status.error;throw e;}
    finally{loadingPromise=null;status.loading=false;updateUI();}
  }
  function visible(){return status.enabled&&state.showStaff!==false?allStaff:[];}
  function combined(agents){
    const extras=visible();
    if(!extras.length)return agents;
    if(mergedAgents!==agents||mergedHelpers!==extras||mergedCount!==agents.length){mergedAgents=agents;mergedHelpers=extras;mergedCount=agents.length;merged=agents.concat(extras);}
    return merged;
  }
  function forInteraction(){return visible();}
  function update(dt){
    status.time+=Math.min(.1,Math.max(0,dt));
    if(status.positionsDirty&&performance.now()-status.positionsDirty>500){status.positionsDirty=0;if(helpers.length){buildHelpers();if(window.Crowd)Crowd.invalidate();}}
    if(status.enabled)for(const a of allStaff)a.clock+=Math.min(.1,Math.max(0,dt));
    // Load staff automatically once characters are ready, or when the visitor walks into the Grand Gallery near the check-in table.
    if(!status.enabled&&!status.loading&&!status.error&&!status.dismissed&&(characterState.status==='ready'||CheckInScene31.playerNear())){
      if(characterState.status!=='ready'&&typeof toast==='function')toast('Loading the check-in volunteers at the entrance table...');
      load().catch(()=>{});
    }
    CheckInScene31.ensure();
    if(status.time-lastUI>1){lastUI=status.time;updateUI();}
  }
  function invalidate(){status.positionsDirty=performance.now();}
  function snapshot(){return {version:31,enabled:status.enabled,loading:status.loading,count:helpers.length,enabledCount:visible().length,indoorBoundaryVolunteers:helpers.length,checkInVolunteers:checkInStaff.length,checkInScene:CheckInScene31.summary,originalIndoorBoundaryVolunteers:status.originalIndoor||0,removedIndoorBoundaryVolunteers:status.removedIndoor||0,removedOutdoorBoundaryVolunteers:status.originalOutdoor||0,outdoorPurpleVolunteers:0,trafficOfficers:officers.length,requestedStations:status.requested,spacing:SPACING*2,patrolling:0,modelTemplates:[...new Set([...MODELS,...CheckInScene31.MODELS,TrafficPolice23.ID])],error:status.error,byLine:[...plans.map(p=>({id:p.id,label:p.label,volunteers:helpers.filter(a=>a.line===p.id).length,officers:officers.filter(a=>a.line===p.id).length})),{id:'welcome-checkin',label:'Volunteer check-in table',volunteers:checkInStaff.length,officers:0}],skipped:status.skipped.slice(),closedGate:CLOSED_GATE,rotatedBooths:[...shippedBooths.values()].filter(needsTurn).map(r=>({name:r.name,placement:{...r.placement}})),guidesAreVisual:true,simulatedVisitorsStayInEventAreas:true,unchangedOriginalVolunteers:50,officerFit:characterState.models.get(TrafficPolice23.ID)?.fitReport||null};}
  function addPlace(key,place){
    places[key]=place;
    if(!qs('places').querySelector('[value="'+key+'"]')){const o=document.createElement('option');o.value=key;o.textContent=place.label;qs('places').append(o);}
  }
  function visit(id){
    if(id==='welcome-checkin'){
      const key='flow22-welcome-checkin';addPlace(key,CheckInScene31.visitPlace());teleport(key);canvas.focus();
      if(typeof toast==='function')toast('Volunteer check-in. Press W to walk up to the table.');
      return;
    }
    const line=plans.find(p=>p.id===id)||plans[0];
    const mid=line.id==='front-arrival-apron'?[0,38.87]:line.points[Math.floor(line.points.length/2)],face=line.face,dx=face[0]-mid[0],dz=face[1]-mid[1],length=Math.hypot(dx,dz)||1;
    const px=mid[0]+dx/length*1.6,pz=mid[1]+dz/length*1.6;const key='flow22-'+line.id;
    addPlace(key,{label:'Event staff: '+line.label,p:[px,floorHeightAt(px,pz)+.5,pz],yaw:Math.atan2(px-mid[0],pz-mid[1]),scaledPlayer:true});
    teleport(key);canvas.focus();
  }
  function updateUI(){const n=qs('flow22Status');if(n)n.textContent=status.message;const b=qs('flow22Load');if(b){b.disabled=status.loading;b.textContent=status.loading?'Loading event staff...':helpers.length?'Show check-in + officers + helpers':'Load check-in + officers + helpers';}if(qs('flow22Toggle'))qs('flow22Toggle').checked=status.enabled;}
  function init(){if(qs('flow22Panel'))return;const panel=document.createElement('details');panel.id='flow22Panel';panel.className='panel';panel.open=true;panel.style.cssText='padding:12px;margin-bottom:9px';
    const cs=CheckInScene31;
    panel.innerHTML='<summary>Volunteer check-in + officers + boundary helpers / DEV 31</summary><p class="ship-hint">Six purple-shirt volunteers stand behind the long entrance table in the Grand Gallery, with uneven stacks of folded purple shirts in front of each of them and clear plastic bins of shirts on the floor behind them. Three traffic officers stay at the curb; every other indoor boundary volunteer stays at their original spot.</p><button id="flow22Load">Load check-in + officers + helpers</button><label class="setting">Show check-in + officers + helpers<input type="checkbox" id="flow22Toggle"></label><select id="flow22Visit" aria-label="Boundary area"></select><div class="buttonRow"><button id="flow22VisitButton">Visit selected area</button><button id="flow22Report">Save staffing report</button></div><div class="buttonRow"><button id="visitCheckin24">Visit check-in table</button><button id="visitOfficers23">Visit 3 officers</button><button id="inspectOfficer23">Officer close-up</button></div><p id="flow22Status" class="ship-hint" role="status"></p><p class="ship-foot">The check-in staff load by themselves when you walk into the Grand Gallery (internet needed once for the character decoder). The nine folding chairs behind the table were removed to make room for the volunteers and bins. The original 50 event volunteers and the student population are unchanged.</p>';
    qs('rightTools').prepend(panel);
    for(const p of [{id:'welcome-checkin',label:'Volunteer check-in table'},...plans]){const o=document.createElement('option');o.value=p.id;o.textContent=p.id==='front-arrival-apron'?'Three traffic officers at the curb':p.label;qs('flow22Visit').append(o);}
    qs('flow22Load').onclick=()=>load().catch(()=>{});qs('flow22Toggle').onchange=e=>{status.enabled=e.target.checked;status.dismissed=!e.target.checked;if(window.Crowd)Crowd.invalidate();if(status.enabled&&!helpers.length)load().catch(()=>{});else{status.message=status.enabled?'Check-in volunteers, officers and boundary helpers visible.':'Check-in volunteers, officers and boundary helpers hidden; shirt stacks, bins, booths and student crowd unchanged.';updateUI();}};
    qs('flow22VisitButton').onclick=()=>{const id=qs('flow22Visit').value;visit(id);load().catch(()=>{});};
    qs('inspectOfficer23').onclick=()=>{if(!helpers.length)load().then(()=>TrafficPolice23.inspect()).catch(()=>{});else TrafficPolice23.inspect();};
    qs('visitOfficers23').onclick=()=>load().then(()=>visit('front-arrival-apron')).catch(()=>{});
    qs('visitCheckin24').onclick=()=>{visit('welcome-checkin');load().catch(()=>{});};
    qs('flow22Report').onclick=()=>{const data={...snapshot(),stations:[...checkInStaff,...helpers,...officers].map(a=>({id:a.id,line:a.line,kind:a.kind,position:a.position,yaw:a.yaw,model:a.model.id,shirt:a.outfit.shirt}))},url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='MiCareerQuest-staffing-DEV31.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);};
    addPlace('flow22-welcome-checkin',cs.visitPlace());
    cs.build();
    updateUI();
  }
  return {init,prepareVenue,allocate,oriented,needsTurn,load,update,invalidate,visible,combined,forInteraction,snapshot,visit,plans,pointsFor,positions,insideVisitorArea,get helpers(){return helpers;},get officers(){return officers;},get checkInStaff(){return checkInStaff;},get status(){return status;}};
})();
window.EventFlow22=EventFlow22;
