/* MiCareerQuest DEV 33 - real-world booth styles for the Design Booth studio (booths33.js).
 * Loaded by dev-tools.js into the booth studio (the "Design booth" tab). Adds 20 new booth
 * families (33-52) with their own architecture, floors, furniture, lighting and branding,
 * plus 16 bold colour schemes. Everything is built from the studio's own mesh helpers, so
 * booths ship to the venue exactly like the original 32 families.
 * Footprint stays the same (compact 7.2 x 5.2 model units), so every booth still fits its slot.
 */
const Booths33 = (() => {
  'use strict';
  const FIRST = studioFamilies.length;          // 32: the new families start after the originals
  const PALETTE_FIRST = studioPalettes.length;  // 48
  const TAU = Math.PI * 2;

  /* ---------- bold colour schemes (name, primary, secondary, accent, wall, trim, floor) ---------- */
  const PALETTES = [
    ['Signal Blue', '#1f6fd1', '#9cc7f2', '#00c2d7', '#f4f7fa', '#0f2240', '#d7e0ea'],
    ['Blaze Orange & Black', '#f07d1a', '#ffc58e', '#ffd23f', '#f6f3ee', '#17191c', '#d9d2c8'],
    ['Navy & Tangerine', '#1d2b5c', '#8b98c9', '#f28c28', '#f3f3f6', '#111830', '#cfd3e0'],
    ['Lime Studio', '#8cc63f', '#d8ecb4', '#2f7d4f', '#f6f8ef', '#1f3322', '#dfe6cf'],
    ['Scarlet & Charcoal', '#d6283c', '#f0a7ae', '#6c3fd1', '#f6f1f2', '#1c1b20', '#d8cfd2'],
    ['Sunflower & Slate', '#f2b705', '#ffe28a', '#2d6a8f', '#f8f5ea', '#26313b', '#e0d8c2'],
    ['Emerald & Gold', '#0f8a5f', '#8fd3b6', '#d9a520', '#f2f6f2', '#0f2a22', '#cfe0d7'],
    ['Ultraviolet', '#6a3fd1', '#c2b0f2', '#27d3c8', '#f5f3fa', '#1c1433', '#d9d3ea'],
    ['Hot Coral', '#ff5a5f', '#ffc2c3', '#1bb3a5', '#fbf3f2', '#2a2224', '#e7d6d6'],
    ['Teal & Tomato', '#0e8c8c', '#9fdcd8', '#ef5b3f', '#f1f7f6', '#123233', '#cfe2e0'],
    ['Cobalt & Citrus', '#2a4bd7', '#a9b8f5', '#c6e03c', '#f3f5fb', '#141d45', '#d4daee'],
    ['Magenta Pop', '#d0317f', '#f5a9cd', '#ffc93c', '#fbf2f6', '#2b1a26', '#e8d4de'],
    ['Forest & Copper', '#1f5e3a', '#9cc4a6', '#d0783a', '#f2f4ef', '#14261b', '#d2dccf'],
    ['Sky & Graphite', '#29a3e0', '#b3e1f7', '#ffb400', '#f2f8fb', '#1e2a33', '#d5e4ec'],
    ['Burgundy & Cream', '#8e1f3f', '#e2aab9', '#e6b25c', '#faf4ee', '#2a1219', '#e5d7cd'],
    ['Mono Black & Red', '#202226', '#9ea3a8', '#e63946', '#f5f5f5', '#101113', '#d9d9d9']
  ];

  /* ---------- colour helpers ---------- */
  const hex = c => {const h = String(c || '#888888').replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);};
  const toHex = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => {const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t));};
  const lum = c => {const a = hex(c); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2];};
  const ink = c => lum(c) > .6 ? '#15202b' : '#ffffff';

  /* ---------- new automatic finishes (grayscale tiles, tinted by the material colour) ---------- */
  function tile(kind, paint) {
    if (finishTextures.has(kind)) return;
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const q = c.getContext('2d'), im = q.createImageData(256, 256), r = mulberry(9001 + kind.length * 131 + kind.charCodeAt(0));
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4, v = Math.max(0, Math.min(255, paint(x, y, r() - .5, r)));
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255;
    }
    q.putImageData(im, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = 10497; t._finishShared = true; t.name = 'MCQ automatic ' + kind;
    finishTextures.set(kind, t);
  }
  const boardSeed = Array.from({length: 64}, (_, i) => ((i * 2654435761) >>> 0) / 4294967296);
  function installFinishes() {
    Object.assign(finishSpecs, {planks: [.55, 0, 1.6], terrazzo: [.28, 0, 1.2], concrete: [.86, 0, 2.4], corrugated: [.42, .55, .8], leather: [.62, 0, .45], turf: [.98, 0, .6], straw: [.97, 0, .5], boards: [.8, 0, 1.8], checker: [.4, 0, 1.2], polished: [.2, 0, 1.5]});
    tile('planks', (x, y, n) => {
      const b = Math.floor(x / 32), s = boardSeed[b + Math.floor((y + boardSeed[b] * 256) / 256) * 8 & 63], yy = (y + s * 256) % 256;
      let v = 222 + 26 * s + 9 * Math.sin(yy * .09 + s * 20 + Math.sin(x * .7) * 1.4) + 6 * n;
      if (x % 32 < 1 || (yy % 128) < 1) v -= 70;
      return v;
    });
    tile('terrazzo', (x, y, n, r) => 238 + 8 * n - (r() < .05 ? 40 + 60 * r() : 0) + (r() < .01 ? 30 : 0));
    tile('concrete', (x, y, n) => 224 + 14 * Math.sin(x * .05 + Math.sin(y * .04) * 2) * Math.cos(y * .037) + 12 * n);
    tile('corrugated', (x) => 170 + 80 * Math.pow(Math.abs(Math.sin(x * Math.PI / 32)), .7));
    tile('leather', (x, y, n) => 232 + 10 * Math.sin(x * .8 + Math.sin(y * .6) * 2) * Math.sin(y * .7) + 10 * n);
    tile('turf', (x, y, n, r) => 190 + 55 * r() - 25 * Math.abs(Math.sin(x * 1.3 + y * .2)));
    tile('straw', (x, y, n, r) => 205 + 40 * Math.sin(x * .9 + Math.sin(y * .05) * 6 + r() * .6) + 12 * n);
    tile('boards', (x, y, n) => {const b = Math.floor(x / 43), s = boardSeed[b + 11]; let v = 214 + 30 * s + 10 * Math.sin(y * .05 + s * 30 + Math.sin(x * .4)) + 8 * n; if (x % 43 < 2) v -= 90; return v;});
    tile('checker', (x, y) => ((Math.floor(x / 64) + Math.floor(y / 64)) % 2 ? 252 : 150) + ((x % 64 < 1 || y % 64 < 1) ? -30 : 0));
    tile('polished', (x, y, n) => 244 + 6 * n + 5 * Math.sin((x + y) * .02));
  }

  /* ---------- flat graphics (name-free, so identical palettes share one texture in the venue) ---------- */
  const graphicCache = new Map();
  // Graphics stay at 512 px or less: they are flat shapes, and 140 demo booths must fit in GPU memory.
  function graphic(kind, colors, w = 512, h = 256) {
    const sc = Math.min(1, 512 / Math.max(w, h));
    w = Math.round(w * sc); h = Math.round(h * sc);
    const key = kind + ':' + colors.join(',') + ':' + w + 'x' + h;
    if (graphicCache.has(key)) return graphicCache.get(key);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const q = c.getContext('2d'), [a, b, e, f] = colors, r = mulberry(key.length * 977 + w);
    q.fillStyle = a; q.fillRect(0, 0, w, h);
    const poly = (pts, col) => {q.fillStyle = col; q.beginPath(); pts.forEach(([x, y], i) => i ? q.lineTo(x * w, y * h) : q.moveTo(x * w, y * h)); q.closePath(); q.fill();};
    const circle = (x, y, rr, col) => {q.fillStyle = col; q.beginPath(); q.arc(x * w, y * h, rr * h, 0, TAU); q.fill();};
    if (kind === 'diagonal') {poly([[0, 1], [.62, 0], [1, 0], [1, .12], [.38, 1]], b); poly([[.46, 1], [1, .22], [1, .44], [.66, 1]], e);}
    else if (kind === 'split') {poly([[0, 0], [.58, 0], [.30, 1], [0, 1]], b); poly([[.58, 0], [.66, 0], [.38, 1], [.30, 1]], e);}
    else if (kind === 'circles') {circle(.78, .52, .62, b); circle(.78, .52, .40, a); circle(.18, .18, .12, e); circle(.30, .82, .07, f || e);}
    else if (kind === 'leaves') {
      for (const [x, y, s, rot, col] of [[.84, .42, .55, .5, b], [.70, .78, .34, -.6, e], [.12, .85, .22, .9, b]]) {
        q.save(); q.translate(x * w, y * h); q.rotate(rot); q.fillStyle = col; q.beginPath(); q.moveTo(0, -s * h); q.quadraticCurveTo(s * h * .62, 0, 0, s * h); q.quadraticCurveTo(-s * h * .62, 0, 0, -s * h); q.fill(); q.restore();
      }
    } else if (kind === 'waves') {
      for (let k = 0; k < 4; k++) {q.strokeStyle = k % 2 ? e : b; q.lineWidth = h * (.09 - k * .012); q.beginPath(); for (let x = 0; x <= w; x += 8) {const y = h * (.25 + k * .17) + Math.sin(x / w * TAU * 1.5 + k) * h * .08; x ? q.lineTo(x, y) : q.moveTo(x, y);} q.stroke();}
    } else if (kind === 'chevrons') {for (let k = 0; k < 7; k++) {const x0 = -.3 + k * .2; poly([[x0, 0], [x0 + .08, 0], [x0 + .22, .5], [x0 + .08, 1], [x0, 1], [x0 + .14, .5]], k % 3 === 1 ? e : b);}}
    else if (kind === 'dots') {for (let yy = 0; yy < 9; yy++) for (let xx = 0; xx < 18; xx++) {const s = .018 + .03 * Math.max(0, xx / 18 - .25); circle((xx + .5) / 18, (yy + .5) / 9, s, yy % 3 === 1 ? e : b);}}
    else if (kind === 'stripes') {for (let k = 0; k < 9; k++) {q.fillStyle = k % 3 === 2 ? e : b; q.fillRect(w * (.08 + k * .1), 0, w * .035, h);}}
    else if (kind === 'blocks') {poly([[0, .55], [.36, .55], [.36, 1], [0, 1]], b); poly([[.36, 0], [.58, 0], [.58, .55], [.36, .55]], e); poly([[.72, .3], [1, .3], [1, 1], [.72, 1]], f || b);}
    else if (kind === 'circuit') {
      q.strokeStyle = b; q.lineWidth = 3;
      for (let k = 0; k < 42; k++) {let x = r() * w, y = r() * h; q.beginPath(); q.moveTo(x, y); for (let s = 0; s < 4; s++) {if (s % 2) x += (r() - .5) * w * .3; else y += (r() - .5) * h * .4; q.lineTo(x, y);} q.stroke(); q.fillStyle = e; q.beginPath(); q.arc(x, y, 5, 0, TAU); q.fill();}
    } else if (kind === 'pixels') {
      for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 64; xx++) {const t = .5 + .5 * Math.sin(xx * .35 + yy * .5); q.fillStyle = [b, e, f || a, '#ffffff'][Math.floor((t + r() * .6) * 3) % 4]; q.globalAlpha = .35 + .65 * r(); q.fillRect(xx * w / 64 + 1, yy * h / 16 + 1, w / 64 - 2, h / 16 - 2);}
      q.globalAlpha = 1;
    } else if (kind === 'hazard') {for (let k = -4; k < 20; k++) poly([[k * .08, 1], [k * .08 + .04, 1], [k * .08 + .04 + .5 * h / w, 0], [k * .08 + .5 * h / w, 0]].map(([x, y]) => [x, y]), b);}
    else if (kind === 'greenery') {
      for (let k = 0; k < 900; k++) {const x = r() * w, y = r() * h, s = 6 + r() * 14; q.fillStyle = [b, e, f || b, mix(b, '#ffffff', .25)][k % 4]; q.beginPath(); q.ellipse(x, y, s, s * .55, r() * TAU, 0, TAU); q.fill();}
    } else if (kind === 'chalk') {
      q.strokeStyle = 'rgba(255,255,255,.55)'; q.lineWidth = 4; q.strokeRect(w * .05, h * .08, w * .9, h * .84);
      q.fillStyle = 'rgba(255,255,255,.7)'; q.font = `700 ${h * .16}px Arial, sans-serif`; q.textAlign = 'center'; q.fillText('FRESH TODAY', w / 2, h * .38);
      q.font = `600 ${h * .1}px Arial, sans-serif`; q.fillText('Careers grow here', w / 2, h * .62);
    } else if (kind === 'molecule') {
      const nodes = [];
      for (let i = 0; i < 9; i++) {const cx = (.1 + .8 * r()) * w, cy = (.15 + .7 * r()) * h, rr = h * (.06 + .05 * r()); const ring = Array.from({length: 6}, (_, j) => [cx + Math.cos(j / 6 * TAU) * rr, cy + Math.sin(j / 6 * TAU) * rr]); nodes.push(...ring); q.strokeStyle = i % 3 ? b : e; q.lineWidth = h * .012; q.beginPath(); ring.forEach(([x, y], j) => j ? q.lineTo(x, y) : q.moveTo(x, y)); q.closePath(); q.stroke();}
      q.strokeStyle = b; q.lineWidth = h * .006; for (let i = 0; i < 14; i++) {const p0 = nodes[Math.floor(r() * nodes.length)], p1 = nodes[Math.floor(r() * nodes.length)]; if (Math.hypot(p0[0] - p1[0], p0[1] - p1[1]) < w * .3) {q.beginPath(); q.moveTo(...p0); q.lineTo(...p1); q.stroke();}}
      for (const [x, y] of nodes) circle(x / w, y / h, .014, e);
    } else if (kind === 'grid') {
      q.strokeStyle = b; q.lineWidth = Math.max(2, h * .008);
      for (let i = 0; i < 12; i++) {const y = h * (.45 + .55 * Math.pow(i / 11, 1.8)); q.beginPath(); q.moveTo(0, y); q.lineTo(w, y); q.stroke();}
      for (let i = -12; i <= 12; i++) {q.beginPath(); q.moveTo(w / 2 + i * w * .02, h * .45); q.lineTo(w / 2 + i * w * .16, h); q.stroke();}
      const g2 = q.createLinearGradient(0, 0, 0, h * .45); g2.addColorStop(0, e); g2.addColorStop(1, a); q.fillStyle = g2; q.fillRect(0, 0, w, h * .45);
      circle(.5, .42, .22, f || b);
      q.fillStyle = a; for (let i = 0; i < 5; i++) q.fillRect(0, h * (.3 + i * .03), w, h * .012);
    } else if (kind === 'topo') {
      q.lineWidth = Math.max(2, h * .006);
      for (let c = 0; c < 3; c++) {const cx = [.25, .7, .55][c] * w, cy = [.4, .6, .15][c] * h; for (let i = 1; i < 9; i++) {q.strokeStyle = i % 3 ? b : e; q.beginPath(); for (let t = 0; t <= 64; t++) {const an = t / 64 * TAU, rr = h * .045 * i * (1 + .18 * Math.sin(an * 3 + i * .7 + c)); const x = cx + Math.cos(an) * rr * 1.5, y = cy + Math.sin(an) * rr; t ? q.lineTo(x, y) : q.moveTo(x, y);} q.stroke();}}
    } else if (kind === 'field') {
      circle(.78, .3, .16, e);
      for (let i = 0; i < 9; i++) {q.fillStyle = i % 2 ? b : (f || b); q.beginPath(); const y0 = h * (.52 + i * .06); q.moveTo(0, y0); q.quadraticCurveTo(w * .5, y0 - h * .1, w, y0 + h * .02); q.lineTo(w, y0 + h * .045); q.quadraticCurveTo(w * .5, y0 - h * .06, 0, y0 + h * .04); q.fill();}
    } else if (kind === 'hexes') {
      const s = h / 7; q.lineWidth = Math.max(2, s * .08);
      for (let yy = -1; yy < 9; yy++) for (let xx = -1; xx < w / (s * 1.5) + 1; xx++) {const cx = xx * s * 1.5, cy = yy * s * 1.732 + (xx % 2) * s * .866, pick = (xx * 7 + yy * 3) % 5; q.beginPath(); for (let j = 0; j < 6; j++) {const x = cx + Math.cos(j / 6 * TAU) * s * .92, y = cy + Math.sin(j / 6 * TAU) * s * .92; j ? q.lineTo(x, y) : q.moveTo(x, y);} q.closePath(); if (pick === 0) {q.fillStyle = e; q.fill();} else if (pick === 3) {q.fillStyle = b; q.fill();} q.strokeStyle = b; q.stroke();}
    } else if (kind === 'blueprint') {
      q.strokeStyle = b; q.globalAlpha = .35; q.lineWidth = 1;
      for (let x = 0; x < w; x += w / 32) {q.beginPath(); q.moveTo(x, 0); q.lineTo(x, h); q.stroke();}
      for (let y = 0; y < h; y += w / 32) {q.beginPath(); q.moveTo(0, y); q.lineTo(w, y); q.stroke();}
      q.globalAlpha = .9; q.lineWidth = Math.max(2, h * .008);
      q.strokeRect(w * .08, h * .2, w * .34, h * .56); q.beginPath(); q.moveTo(w * .08, h * .2); q.lineTo(w * .25, h * .08); q.lineTo(w * .42, h * .2); q.stroke();
      q.beginPath(); q.arc(w * .7, h * .5, h * .26, 0, TAU); q.stroke(); q.beginPath(); q.arc(w * .7, h * .5, h * .1, 0, TAU); q.stroke();
      for (let i = 0; i < 12; i++) {const an = i / 12 * TAU; q.beginPath(); q.moveTo(w * .7 + Math.cos(an) * h * .26, h * .5 + Math.sin(an) * h * .26); q.lineTo(w * .7 + Math.cos(an) * h * .32, h * .5 + Math.sin(an) * h * .32); q.stroke();}
      q.strokeStyle = e; q.beginPath(); q.moveTo(w * .08, h * .86); q.lineTo(w * .42, h * .86); q.stroke(); q.globalAlpha = 1;
    } else if (kind === 'screen') {
      const g = q.createLinearGradient(0, 0, w, h); g.addColorStop(0, a); g.addColorStop(1, b); q.fillStyle = g; q.fillRect(0, 0, w, h);
      q.globalAlpha = .55; circle(.7, .45, .42, e); q.globalAlpha = .9; poly([[.1, .75], [.45, .75], [.45, .8], [.1, .8]], '#ffffff'); poly([[.1, .62], [.33, .62], [.33, .67], [.1, .67]], e); q.globalAlpha = 1;
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.name = 'MCQ DEV33 graphic ' + kind;
    graphicCache.set(key, t);
    return t;
  }
  function graphicMat(kind, colors, opts = {}) {
    return material('dev33graphic:' + kind + ':' + colors.join(',') + ':' + (opts.w || 1024) + ':' + (opts.emissive || 0), () => new THREE.MeshStandardMaterial({
      color: '#ffffff', map: graphic(kind, colors, opts.w || 1024, opts.h || 512), roughness: opts.rough ?? .6, metalness: 0,
      emissive: opts.emissive ? '#ffffff' : '#000000', emissiveIntensity: opts.emissive || 0
    }));
  }

  /* ---------- the company sign (per booth: name and optional logo, like the original header) ---------- */
  function signTexture(t, data, w, h, style = {}) {
    const c = document.createElement('canvas');
    let cw = 2048, ch = Math.round(2048 * h / w);
    if (ch > 2048) {ch = 2048; cw = Math.round(2048 * w / h);}
    c.width = cw; c.height = Math.max(96, ch);
    const q = c.getContext('2d'), W = c.width, H = c.height, bg = style.bg || t.palette.wall, fg = style.fg || ink(bg);
    q.fillStyle = bg; q.fillRect(0, 0, W, H);
    if (style.bar) {q.fillStyle = style.bar; q.fillRect(W * .04, H * .9, W * .92, Math.max(4, H * .03));}
    if (style.frame) {q.strokeStyle = style.frame; q.lineWidth = Math.max(6, H * .035); q.strokeRect(q.lineWidth, q.lineWidth, W - 2 * q.lineWidth, H - 2 * q.lineWidth);}
    const img = projectImages.logo?.element, requested = ['logo', 'flanked', 'name'].includes(data.logoMode) ? data.logoMode : 'name', mode = img ? requested : 'name', drawn = [];
    const imageIn = (x, y, bw, bh) => {const s = Math.min(bw / img.width, bh / img.height), iw = img.width * s, ih = img.height * s; q.drawImage(img, x + (bw - iw) / 2, y + (bh - ih) / 2, iw, ih); drawn.push({kind: 'logo', x: x + (bw - iw) / 2, y: y + (bh - ih) / 2, width: iw, height: ih});};
    if (mode === 'logo') imageIn(W * .07, H * .08, W * .86, H * .78);
    else {
      const margin = W * .05, logoBox = Math.min(H * .7, W * .16);
      let left = margin, right = W - margin;
      if (mode === 'flanked') {imageIn(margin, H * .12, logoBox, H * .72); imageIn(W - margin - logoBox, H * .12, logoBox, H * .72); left += logoBox + W * .025; right -= logoBox + W * .025;}
      let text = data.boothName || 'Your Company';
      if (style.upper) text = text.toUpperCase();
      const fit = headerFitText(q, text, right - left, H * (style.fill || .78));
      q.font = `${style.weight || 800} ${fit.size}px Arial, sans-serif`;
      q.fillStyle = fg; q.textAlign = style.align === 'left' ? 'left' : 'center'; q.textBaseline = 'middle';
      const lh = fit.size * 1.08, cy = H * (style.cy || .48), x = style.align === 'left' ? left : (left + right) / 2;
      if (style.glow) {q.shadowColor = style.glow; q.shadowBlur = fit.size * .28;}
      fit.lines.forEach((s, i) => q.fillText(s, x, cy + (i - (fit.lines.length - 1) / 2) * lh));
      if (style.glow) fit.lines.forEach((s, i) => q.fillText(s, x, cy + (i - (fit.lines.length - 1) / 2) * lh));
      q.shadowBlur = 0;
      drawn.push({kind: 'name', x: left, y: cy - fit.lines.length * lh / 2, width: right - left, height: fit.lines.length * lh, lines: fit.lines});
      if (style.tagline && H / W > .2) {q.font = `600 ${fit.size * .28}px Arial, sans-serif`; q.globalAlpha = .82; q.fillText(style.tagline, x, cy + fit.lines.length * lh / 2 + fit.size * .32); q.globalAlpha = 1;}
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.needsUpdate = true;
    tex.brandingAudit = {requestedMode: requested, effectiveMode: mode, hasLogo: !!img, layout: drawn, width: W, height: H, physicalWidth: w, physicalHeight: h, style: style.name || 'dev33'};
    return tex;
  }

  /* ---------- per-booth build context ---------- */
  function context(root, t, d, data) {
    const W = d.width, D = d.depth, H = d.height, v = t.variant || 0, fam = t.familyIndex - FIRST;
    const rng = mulberry(4099 * (fam + 7) + 131 * v + 17);
    const mirror = (v & 1) === 1, sx = mirror ? -1 : 1;
    const p = t.palette, base = studioMaterials(t);
    const woods = ['#b98b5e', '#8a6446', '#caa77c', '#6e5140', '#d6b88f', '#a5764f'];
    const k = {
      root, t, d, W, D, H, v, fam, rng, mirror, data, p,
      y0: .08,
      tvHalf: (W * .34 + .14) / 2,   // half width of the studio TV incl. frame (it scales with the booth size)
      bit: n => (v >> n) & 1,
      pick: (list, n = 0) => list[((v + n * 5 + fam * 3) % list.length + list.length) % list.length],
      X: x => x * sx, Y: yaw => yaw * sx,
      layout: {slots: {}, photos: null, rack: null, sign: null},
      m: null
    };
    const wood = woods[(v + fam) % woods.length];
    k.woodColor = wood;
    k.m = {
      ...base,
      white: finished('paint', '#f3f3f0'),
      snow: finished('plaster', '#f6f6f2'),
      dark: finished('paint', '#1e2126'),
      charcoal: finished('powder', '#2f343a'),
      gloss: finished('anodized', '#16191d'),
      primary: finished('paint', p.primary),
      primaryMatte: finished('plaster', p.primary),
      secondary: finished('powder', p.secondary),
      accent: finished('paint', p.accent),
      trim: finished('anodized', p.trim),
      trimMatte: finished('plaster', p.trim),
      wood: finished('wood', wood),
      woodDark: finished('wood', mix(wood, '#2b1d14', .45)),
      woodLight: finished('wood', mix(wood, '#f2e2c6', .45)),
      planks: finished('planks', wood),
      planksDark: finished('planks', mix(wood, '#3a2618', .55)),
      boards: finished('boards', mix(wood, '#8b4a32', .25)),
      terrazzo: finished('terrazzo', '#e9e7e1'),
      darkFloor: finished('polished', '#23272c'),
      concrete: finished('concrete', '#a3a5a2'),
      turf: finished('turf', '#5f8f3e'),
      straw: finished('straw', '#d6b56a'),
      leather: finished('leather', ['#6b4430', '#2e2b2a', '#8b5e3c', '#3d4a3f'][v % 4]),
      sofa: finished('fabric', ['#e9e4dc', p.secondary, '#3b3f45', mix(p.primary, '#ffffff', .55)][(v >> 1) % 4]),
      cushion: finished('fabric', mix(p.accent, '#ffffff', .15)),
      chrome: finished('metal', '#d5dbe0'),
      steel: finished('metal', '#8e979e'),
      corrugated: finished('corrugated', p.primary),
      stone: finished('stone', '#eeece3'),
      terracotta: finished('ceramic', '#b8653f'),
      ceramicWhite: finished('ceramic', '#f0eee8'),
      ceramicBlack: finished('ceramic', '#26292d'),
      glass: mat('#cfe3ea', {roughness: .08, transparent: true, opacity: .28}),
      frosted: mat('#f2f6f8', {roughness: .5, transparent: true, opacity: .55}),
      ledWarm: mat('#fff4de', {roughness: .3, emissive: '#ffe6bd', emissiveIntensity: 1}),
      ledCool: mat('#f1f7ff', {roughness: .3, emissive: '#e3f0ff', emissiveIntensity: 1}),
      ledPrimary: mat(mix(p.primary, '#ffffff', .15), {roughness: .3, emissive: p.primary, emissiveIntensity: 1}),
      ledAccent: mat(mix(p.accent, '#ffffff', .15), {roughness: .3, emissive: p.accent, emissiveIntensity: 1}),
      ledSecondary: mat(p.secondary, {roughness: .3, emissive: p.secondary, emissiveIntensity: 1}),
      screenDark: mat('#0d1117', {roughness: .18, metalness: .2}),
      foliage: finished('leaf', ['#3f6f3a', '#557f3a', '#2f5e45', '#7a8f3a'][v % 4]),
      foliageWarm: finished('leaf', ['#b7652f', '#c98a3a', '#8f4a2b', '#d9a441'][v % 4]),
      bark: finished('wood', '#5b4331')
    };
    return k;
  }

  /* ---------- geometry helpers (all positions are in booth space; x is mirrored per variant) ---------- */
  const R = (k, name, size, pos, m, r = .03, rot = [0, 0, 0], n = 2) => studioRound(k.root, name, size, [k.X(pos[0]), pos[1], pos[2]], m, r, [rot[0], k.Y(rot[1]), k.mirror ? -rot[2] : rot[2]], n);
  const B = (k, name, size, pos, m, rot = [0, 0, 0]) => {const o = meshBox(name, size, [k.X(pos[0]), pos[1], pos[2]], m, [rot[0], k.Y(rot[1]), k.mirror ? -rot[2] : rot[2]]); k.root.add(o); return o;};
  const C = (k, name, rt, rb, h, pos, m, seg = 24, rot = [0, 0, 0]) => {const o = meshCylinder(name, rt, rb, h, [k.X(pos[0]), pos[1], pos[2]], m, seg, [rot[0], k.Y(rot[1]), k.mirror ? -rot[2] : rot[2]]); k.root.add(o); return o;};
  const Rod = (k, name, a, b, r, m) => studioRod(k.root, name, [k.X(a[0]), a[1], a[2]], [k.X(b[0]), b[1], b[2]], r, m);
  const Tube = (k, name, pts, r, m, sides = 8) => studioMesh(k.root, name, studioTube(pts.map(q => [k.X(q[0]), q[1], q[2]]), r, sides), m);
  const Surf = (k, name, fn, m, nu = 24, nv = 6) => studioMesh(k.root, name, studioSurface((u, w) => {const q = fn(u, w); return [k.X(q[0]), q[1], q[2]];}, nu, nv), m);
  const Lathe = (k, name, profile, pos, m, seg = 28, scale = null, rot = [0, 0, 0]) => {const o = studioMesh(k.root, name, studioLathe(profile, seg), m, [k.X(pos[0]), pos[1], pos[2]], [rot[0], k.Y(rot[1]), k.mirror ? -rot[2] : rot[2]]); if (scale) o.scale.set(...scale); return o;};
  const Plane = (k, name, w, h, pos, yaw, m, rx = 0) => {const o = meshPlane(name, w, h, [k.X(pos[0]), pos[1], pos[2]], m, [rx, k.Y(yaw), 0]); k.root.add(o); return o;};
  const Body = (k, name, w, d, h, shape, pos, m, yaw = 0) => studioMesh(k.root, name, studioPlanBody(w, d, h, shape), m, [k.X(pos[0]), pos[1], pos[2]], [0, k.Y(yaw), 0]);
  const Ring = (k, name, rx, rz, y, pos, width, depth, m, start = 0, arc = TAU, tilt = 0) => {const o = studioRing(k.root, name, rx, rz, 0, 0, width, depth, m, k.mirror ? Math.PI - start - arc : start, arc, tilt); o.position.set(k.X(pos[0]), y, pos[2]); return o;};
  const regular = (n, r, cx = 0, cz = 0, rot = 0) => Array.from({length: n}, (_, i) => [cx + r * Math.cos(rot + i / n * TAU), cz + r * Math.sin(rot + i / n * TAU)]);

  /* ---------- floors ---------- */
  function floor(k, kind = 'planks', edge = null) {
    const m = {planks: k.m.planks, planksDark: k.m.planksDark, dark: k.m.darkFloor, terrazzo: k.m.terrazzo, concrete: k.m.concrete, turf: k.m.turf, primary: k.m.primaryMatte, secondary: k.m.secondary, white: k.m.snow, carpet: k.m.floor, trim: k.m.trimMatte, accent: finished('plaster', k.p.accent), checker: finished('checker', k.p.secondary)}[kind] || k.m.planks;
    R(k, 'Booth floor platform', [k.W - .03, .08, k.D - .03], [0, .04, 0], m, .018);
    if (edge) for (const [w, d, x, z] of [[k.W - .04, .02, 0, k.D / 2 - .012], [.02, k.D - .04, k.W / 2 - .012, 0], [.02, k.D - .04, -k.W / 2 + .012, 0], [k.W - .04, .02, 0, -k.D / 2 + .012]]) B(k, 'Platform LED edge', [w, .024, d], [x, .04, z], edge);
  }
  const shadow = (k, x, z, w, d) => studioShadow(k.root, k.X(x), z, w, d);

  /* ---------- lights ---------- */
  function spotArm(k, x, y, z, yaw = 0, reach = .34, drop = .12, finish = null) {
    const m = finish || k.m.dark, a = [x, y, z], s = Math.sin(yaw), c = Math.cos(yaw), b = [x + s * reach, y + drop, z + c * reach];
    Rod(k, 'Spotlight arm', a, b, .012, m);
    C(k, 'Spotlight head', .045, .06, .16, [b[0] + s * .05, b[1] - .05, b[2] + c * .05], m, 14, [-.75 * c, 0, .75 * s]);
    C(k, 'Spotlight lens', .04, .04, .012, [b[0] + s * .09, b[1] - .105, b[2] + c * .09], k.m.ledWarm, 14, [-.75 * c, 0, .75 * s]);
  }
  function trackSpot(k, x, y, z, finish = null) {
    const m = finish || k.m.dark;
    B(k, 'Track light adapter', [.06, .05, .06], [x, y - .025, z], m);
    C(k, 'Track spotlight can', .05, .05, .17, [x, y - .12, z + .03], m, 14, [.5, 0, 0]);
    C(k, 'Track spotlight lens', .043, .043, .01, [x, y - .19, z + .07], k.m.ledWarm, 14, [.5, 0, 0]);
  }
  function pendant(k, x, z, yTop, yLamp, r, shell, style = 'dome') {
    Rod(k, 'Pendant cord', [x, yTop, z], [x, yLamp + r * .5, z], .006, k.m.dark);
    if (style === 'dome') Lathe(k, 'Pendant dome shade', [[.02, r * .55], [r * .35, r * .5], [r * .78, r * .22], [r, -r * .12], [r * .96, -r * .16], [r * .74, .08 - r * .1]], [x, yLamp, z], shell, 24);
    else Lathe(k, 'Pendant cylinder shade', [[.02, r * .6], [r * .6, r * .6], [r * .6, -r * .5], [r * .55, -r * .5]], [x, yLamp, z], shell, 20);
    C(k, 'Pendant glowing bulb', r * .45, r * .45, .02, [x, yLamp - r * .14, z], k.m.ledWarm, 16);
  }
  // Arc floor lamp: weighted base, a single arched stem and a dome shade over the tip.
  function arcLamp(k, bx, bz, tx, tz, h, shade) {
    const pts = Array.from({length: 13}, (_, i) => {const t = i / 12, a = [bx, .1, bz], b = [bx, h + .25, bz], c = [tx, h, tz]; return [0, 1, 2].map(j => (1 - t) * (1 - t) * a[j] + 2 * (1 - t) * t * b[j] + t * t * c[j]);});
    Tube(k, 'Arc lamp upright stem', pts, .018, k.m.chrome, 6);
    Lathe(k, 'Arc lamp marble base', [[0, 0], [.2, 0], [.2, .06], [.16, .09], [0, .09]], [bx, .08, bz], k.m.stone, 20);
    Lathe(k, 'Arc lamp dome shade', [[.02, .14], [.1, .13], [.2, .05], [.24, -.08], [.22, -.09], [.18, -.02]], [tx, h - .12, tz], shade, 20);
    C(k, 'Arc lamp glowing bulb', .1, .1, .02, [tx, h - .19, tz], k.m.ledWarm, 14);
  }
  function hexLight(k, x, y, z, r, rim, glow) {
    prism(k, 'Hexagon ceiling light rim', regular(6, r, x, z, Math.PI / 6), y, y + .07, rim);
    prism(k, 'Hexagon ceiling light diffuser', regular(6, r * .9, x, z, Math.PI / 6), y - .012, y + .002, glow);
  }
  function ledLine(k, name, a, b, m, r = .016) {Rod(k, name, a, b, r, m);}

  /* ---------- furniture (built in a local frame: x mirrored per variant, yaw about the local origin) ---------- */
  function frame(k, x, z, yaw = 0) {
    const base = [k.X(x), 0, z], Y = k.Y(yaw);
    const L = p => localPose(base, Y, [k.mirror ? -p[0] : p[0], p[1], p[2]]);
    return {
      L, Y,
      round: (name, s, p, m, r = .03, n = 2) => studioRound(k.root, name, s, L(p), m, r, [0, Y, 0], n),
      rod: (name, a, b, r, m) => studioRod(k.root, name, L(a), L(b), r, m),
      cyl: (name, rt, rb, h, p, m, seg = 24) => {const o = meshCylinder(name, rt, rb, h, L(p), m, seg, [0, Y, 0]); k.root.add(o); return o;},
      tube: (name, pts, r, m, sides = 8) => studioMesh(k.root, name, studioTube(pts.map(L), r, sides), m),
      surf: (name, fn, m, nu = 12, nv = 4) => studioMesh(k.root, name, studioSurface((u, w) => L(fn(u, w)), nu, nv), m),
      mesh: (name, g, p, m) => studioMesh(k.root, name, g, m, L(p), [0, Y, 0]),
      ring: (name, r, y, w, h, m) => {const o = studioRing(k.root, name, r, r, y, 0, w, h, m); const q = L([0, 0, 0]); o.position.set(q[0], 0, q[2]); return o;}
    };
  }
  function sofa(k, x, z, yaw, w, fabric, legs = null) {
    const f = frame(k, x, z, yaw);
    f.round('Sofa chair seat base', [w, .22, .82], [0, .26, 0], fabric, .05);
    const n = w > 1.6 ? 3 : 2, cw = (w - .3) / n;
    for (let i = 0; i < n; i++) f.round('Sofa seat cushion', [cw - .02, .13, .66], [(-(n - 1) / 2 + i) * cw, .43, .04], fabric, .06);
    f.round('Sofa back cushion', [w - .26, .42, .2], [0, .63, -.3], fabric, .08);
    for (const s of [-1, 1]) f.round('Sofa arm', [.15, .5, .82], [s * (w / 2 - .075), .4, 0], fabric, .06);
    for (const s of [-1, 1]) for (const t of [-1, 1]) f.round('Sofa leg', [.05, .1, .05], [s * (w / 2 - .1), .09, t * .32], legs || k.m.dark, .01, 1);
    for (let i = 0; i < 2; i++) f.round('Sofa accent pillow', [.36, .3, .1], [(i ? 1 : -1) * (w / 2 - .38), .6, -.16], k.m.cushion, .05);
    shadow(k, x, z, w + .3, 1.1);
  }
  function armchair(k, x, z, yaw, fabric, frameM) {
    const f = frame(k, x, z, yaw);
    for (const s of [-1, 1]) {f.round('Wooden armchair side frame', [.06, .5, .7], [s * .36, .35, 0], frameM, .02); f.round('Wooden armchair armrest', [.1, .05, .74], [s * .36, .62, 0], frameM, .02);}
    f.round('Armchair seat cushion', [.66, .14, .64], [0, .4, .03], fabric, .05);
    f.round('Armchair back cushion', [.66, .44, .15], [0, .66, -.28], fabric, .06);
    f.round('Armchair rear rail', [.72, .06, .06], [0, .2, -.32], frameM, .015);
    shadow(k, x, z, .95, .95);
  }
  function tubChair(k, x, z, yaw, shellM, seatM) {
    const f = frame(k, x, z, yaw);
    f.surf('Tub chair wrapped shell', (u, w) => {const a = (u - .5) * 3.7; return [Math.sin(a) * .36, .33 + w * .42, -Math.cos(a) * .3 + .05];}, shellM, 18, 4);
    f.mesh('Tub chair seat', studioPlanBody(.62, .56, .12, 'pill'), [0, .42, .02], seatM);
    for (let i = 0; i < 4; i++) {const a = i / 4 * TAU + .78; f.rod('Tub chair leg', [Math.cos(a) * .2, .36, Math.sin(a) * .18], [Math.cos(a) * .27, .085, Math.sin(a) * .24], .014, k.m.dark);}
    shadow(k, x, z, .9, .9);
  }
  function loungeChair(k, x, z, yaw, seatM, frameM) {
    const f = frame(k, x, z, yaw);
    f.surf('Lounge chair curved seat shell', (u, w) => {const a = (u - .5) * 2.6; return [Math.sin(a) * .34, .36 + w * (.1 + .36 * Math.cos((u - .5) * 1.8)), -Math.cos(a) * .22 - w * .08 + .08];}, seatM, 16, 4);
    f.mesh('Lounge chair cushion', studioPlanBody(.6, .5, .1, 'pill'), [0, .4, .06], k.m.cushion);
    f.tube('Lounge chair sled frame', [[-.3, .09, .32], [-.3, .09, -.25], [-.26, .34, -.2], [.26, .34, -.2], [.3, .09, -.25], [.3, .09, .32]], .014, frameM, 6);
    shadow(k, x, z, .9, .9);
  }
  function stool(k, x, z, seat, style = 0, height = .76, yaw = 0) {
    const f = frame(k, x, z, yaw);
    if (style === 0) {
      f.cyl('Bar stool chair seat', .2, .2, .07, [0, height, 0], seat, 24);
      f.rod('Bar stool chrome post', [0, .1, 0], [0, height - .03, 0], .025, k.m.chrome);
      f.cyl('Bar stool base disc', .19, .21, .025, [0, .095, 0], k.m.chrome, 24);
      f.ring('Bar stool foot ring', .16, .32, .018, .018, k.m.chrome);
    } else if (style === 1) {
      const pts = Array.from({length: 22}, (_, i) => {const t = i / 21, a = t * TAU * 1.25; return [Math.cos(a) * .15 * (1 - t * .4), .1 + t * (height - .12), Math.sin(a) * .15 * (1 - t * .4)];});
      f.tube('Swirl stool chrome base', pts, .014, k.m.chrome, 6);
      f.cyl('Swirl stool base ring', .2, .2, .02, [0, .09, 0], k.m.chrome, 24);
      f.mesh('Swirl stool chair seat', studioPlanBody(.42, .4, .06, 'pill'), [0, height, 0], seat);
      f.round('Swirl stool backrest', [.34, .24, .03], [0, height + .3, -.19], seat, .1);
      f.rod('Swirl stool back spine', [0, height, -.16], [0, height + .2, -.19], .012, k.m.chrome);
    } else {
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) f.rod('Wooden stool leg', [a * .13, height - .02, b * .13], [a * .19, .09, b * .19], .018, k.m.wood);
      f.round('Wooden stool chair seat', [.38, .05, .38], [0, height, 0], seat, .02);
      f.round('Wooden stool back', [.36, .12, .03], [0, height + .36, -.2], k.m.wood, .012);
      for (const a of [-1, 1]) f.rod('Wooden stool back post', [a * .15, height, -.18], [a * .15, height + .38, -.2], .014, k.m.wood);
      f.rod('Wooden stool foot rail', [-.17, .35, .17], [.17, .35, .17], .012, k.m.wood);
    }
    shadow(k, x, z, .55, .55);
  }
  function highTable(k, x, z, r, top, style = 0) {
    const f = frame(k, x, z);
    f.cyl('High table top', r, r, .04, [0, 1.06, 0], top, 32);
    if (style === 0) {f.rod('High table upright pedestal', [0, .1, 0], [0, 1.04, 0], .035, k.m.chrome); f.cyl('High table base', .24, .27, .03, [0, .095, 0], k.m.chrome, 28);}
    else for (let i = 0; i < 3; i++) {const a = i / 3 * TAU; f.rod('High table upright leg', [Math.cos(a) * r * .45, 1.04, Math.sin(a) * r * .45], [Math.cos(a) * r * .75, .09, Math.sin(a) * r * .75], .018, k.m.dark);}
    shadow(k, x, z, r * 2.4, r * 2.4);
  }
  function coffeeTable(k, x, z, w, d, top, round = false, yaw = 0) {
    const f = frame(k, x, z, yaw);
    if (round) {f.cyl('Coffee table round top upright block', w / 2, w / 2, .05, [0, .42, 0], top, 32); f.rod('Coffee table stem', [0, .1, 0], [0, .4, 0], .03, k.m.dark); f.cyl('Coffee table foot', .16, .18, .03, [0, .095, 0], k.m.dark, 24);}
    else {f.round('Coffee table top upright block', [w, .06, d], [0, .42, 0], top, .02); for (const a of [-1, 1]) for (const b of [-1, 1]) f.round('Coffee table leg', [.05, .32, .05], [a * (w / 2 - .06), .24, b * (d / 2 - .06)], k.m.dark, .01, 1);}
    shadow(k, x, z, w + .3, (round ? w : d) + .3);
  }
  function rug(k, x, z, r, m) {const o = C(k, 'Round lounge rug', r, r, .012, [x, .087, z], m, 40); o.userData = {nonColliding: true, decorative: true}; return o;}
  // Leaves never cross the booth outline: large plants shrink a little, then step inward if needed.
  function fitSpread(k, x, z, h, f, add = 0, minScale = .62) {
    const lim = Math.min(k.W / 2 - .035 - Math.abs(x), k.D / 2 - .035 - Math.abs(z));
    if (f * h + add > lim) h = Math.max(h * minScale, (lim - add) / f);
    const R = f * h + add, xl = k.W / 2 - .035 - R, zl = k.D / 2 - .035 - R;
    return [Math.max(-xl, Math.min(xl, x)), Math.max(-zl, Math.min(zl, z)), h];
  }
  function potPlant(k, x, z, h, pot = null, type = 0) {
    [x, z, h] = fitSpread(k, x, z, h, type ? .66 : .46);
    studioPlant(k.root, [k.X(x), k.y0 - .01, z], h, type, {...k.m, stone: pot || k.m.ceramicWhite}, k.rng, 'balanced');
    shadow(k, x, z, h * .55, h * .55);
  }
  function vasePlant(k, x, z, h, pot) {
    [x, z, h] = fitSpread(k, x, z, h, .26, .27, .72);
    const f = frame(k, x, z);
    f.mesh('Tall ceramic floor vase upright', studioLathe([[.08, 0], [.16, .08], [.19, h * .25], [.12, h * .42], [.07, h * .5], [.085, h * .52], [.02, h * .52]], 20), [0, k.y0, 0], pot);
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4 + .3, len = h * (.55 + .3 * ((i * 37) % 10) / 10), top = [Math.cos(a) * len * .3, k.y0 + h * .5 + len * .8, Math.sin(a) * len * .3];
      f.tube('Vase plant stem', [[0, k.y0 + h * .45, 0], [Math.cos(a) * len * .12, k.y0 + h * .5 + len * .45, Math.sin(a) * len * .12], top], .006, k.m.foliage, 4);
      f.surf('Vase plant broad leaf', (u, w) => {const s = Math.sin(Math.PI * w) * .9; return [top[0] + (u - .5) * .16 * s * Math.sin(a) + Math.cos(a) * w * .22, top[1] + w * .1 - w * w * .14, top[2] - (u - .5) * .16 * s * Math.cos(a) + Math.sin(a) * w * .22];}, k.m.foliage, 3, 6);
    }
    shadow(k, x, z, .6, .6);
  }
  function bamboo(k, x, z, w, d, h, box = null) {
    const f = frame(k, x, z);
    f.round('Bamboo planter upright box', [w, .42, d], [0, .29, 0], box || k.m.woodLight, .02);
    const n = Math.max(5, Math.round(w * 7));
    for (let i = 0; i < n; i++) {
      const px = (i / (n - 1) - .5) * (w - .16), pz = (((i * 7) % 5) / 4 - .5) * (d - .12), hh = h * (.72 + .28 * ((i * 11) % 7) / 6);
      f.cyl('Bamboo cane', .016, .02, hh, [px, .5 + hh / 2, pz], k.m.foliage, 6);
      for (let j = 0; j < 3; j++) {const y = .5 + hh * (.55 + j * .16), a = i * 1.7 + j * 2.1; f.surf('Bamboo leaf spray', (u, w2) => [px + Math.cos(a) * w2 * .32 + (u - .5) * .05 * Math.sin(a), y + w2 * .08 - w2 * w2 * .1, pz + Math.sin(a) * w2 * .32 - (u - .5) * .05 * Math.cos(a)], k.m.foliage, 2, 4);}
    }
  }
  function tree(k, x, z, h, foliage, bark) {
    const f = frame(k, x, z);
    f.tube('Sculpted tree trunk upright', [[0, k.y0 + .1, 0], [.04, h * .35, .02], [-.03, h * .6, -.03], [.02, h * .75, 0]], .07, bark, 10);
    const tips = [];
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * TAU + .4, len = h * (.22 + .06 * (i % 2)), from = [0, h * (.5 + i * .05), 0], to = [Math.cos(a) * len, from[1] + len * .7, Math.sin(a) * len * .8];
      f.tube('Tree branch', [from, [to[0] / 2, (from[1] + to[1]) / 2 + .05, to[2] / 2], to], .025, bark, 6);
      tips.push(to);
    }
    tips.push([0, h * .95, 0]);
    tips.forEach((q, i) => {const s = h * (.13 + .03 * (i % 3)), o = f.mesh('Tree foliage cluster', studioLathe([[0, -s * .8], [s * .7, -s * .55], [s, 0], [s * .72, s * .5], [0, s * .75]], 9), q, i % 2 ? foliage : k.m.foliage); o.scale.set(1.1, .85, 1);});
    shadow(k, x, z, h * .7, h * .7);
  }
  function banner(k, x, z, yaw, w, h, face) {
    const f = frame(k, x, z, yaw);
    f.round('Roll-up banner cassette base', [w + .06, .1, .24], [0, .13, 0], k.m.steel, .03);
    f.round('Roll-up banner upright print', [w, h, .02], [0, .18 + h / 2, 0], face, .005, 1);
    f.rod('Roll-up banner pole', [0, .18, -.05], [0, .18 + h, -.05], .012, k.m.steel);
  }
  function flag(k, x, z, h, face, yaw = 0) {
    const f = frame(k, x, z, yaw);
    f.rod('Flag banner upright pole', [0, k.y0, 0], [0, k.y0 + h, 0], .022, k.m.dark);
    f.cyl('Flag banner weighted base', .2, .23, .05, [0, k.y0 + .025, 0], k.m.dark, 20);
    f.round('Flag banner fabric', [.46, h * .72, .012], [.25, k.y0 + h * .58, 0], face, .004, 1);
    f.rod('Flag banner top arm', [0, k.y0 + h * .94, 0], [.5, k.y0 + h * .94, 0], .012, k.m.dark);
  }
  function crate(k, x, z, s, m, fill = null) {
    const f = frame(k, x, z);
    for (const y of [.1, s * .5 + .06, s - .02]) f.round('Wooden crate slat band', [s, .07, s * .8], [0, k.y0 + y, 0], m, .01, 1);
    for (const a of [-1, 1]) for (const b of [-1, 1]) f.round('Wooden crate upright corner post', [.05, s, .05], [a * (s / 2 - .03), k.y0 + s / 2, b * (s * .4 - .03)], m, .01, 1);
    f.round('Wooden crate bottom', [s - .04, .03, s * .8 - .04], [0, k.y0 + .03, 0], m, .005, 1);
    if (fill) for (let i = 0; i < 6; i++) f.mesh('Crate produce', studioLathe([[0, -.07], [.06, -.05], [.075, 0], [.06, .05], [0, .07]], 10), [((i % 3) - 1) * s * .26, k.y0 + s * .75, (Math.floor(i / 3) - .5) * s * .3], fill);
  }
  function cone(k, x, z, m) {const f = frame(k, x, z); f.round('Traffic cone base', [.34, .03, .34], [0, k.y0 + .015, 0], m, .01, 1); f.mesh('Traffic cone body', studioLathe([[.13, 0], [.12, .04], [.03, .5], [.02, .52], [0, .52]], 16), [0, k.y0 + .03, 0], m); f.cyl('Traffic cone reflective band', .085, .1, .08, [0, k.y0 + .22, 0], k.m.white, 16);}
  function hardHat(k, x, y, z, m) {const f = frame(k, x, z); f.mesh('Hard hat shell', studioLathe([[0, .14], [.07, .135], [.12, .1], [.14, .03], [.14, 0], [.18, -.005], [.18, -.015], [0, -.015]], 18), [0, y, 0], m);}
  function truss(k, a, b, s, m) {
    const d = svSub(b, a), n = Math.max(2, Math.round(Math.hypot(...d) / s)), up = Math.abs(d[1]) > Math.hypot(d[0], d[2]) ? [1, 0, 0] : [0, 1, 0];
    const t = svNorm(d), u = svNorm(svCross(t, up)), w = svNorm(svCross(u, t)), off = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([p, q]) => svAdd(svMul(u, p * s / 2), svMul(w, q * s / 2)));
    for (const o of off) Rod(k, 'Box truss chord', svAdd(a, o), svAdd(b, o), .018, m);
    for (let i = 0; i < n; i++) {const p0 = svAdd(a, svMul(d, i / n)), p1 = svAdd(a, svMul(d, (i + 1) / n)); for (let j = 0; j < 4; j++) Rod(k, 'Box truss lacing', svAdd(p0, off[j]), svAdd(p1, off[(j + 1) % 4]), .008, m);}
  }

  /* ---------- counters (names are the ones the content system looks for) ---------- */
  function counter(k, shape, x, z, yaw, w, d, bodyM, topM, opts = {}) {
    const h = opts.h || .96, Y = k.Y(yaw), X = k.X(x);
    let body, top;
    if (shape === 'box' || shape === 'wedge') {
      body = studioRound(k.root, 'Information pod counter body', [w, h - .07, d], [X, (h - .07) / 2 + .075, z], bodyM, .04, [0, Y, 0], 2);
      top = studioRound(k.root, 'Information pod counter top', [w + .1, .06, d + .1], [X, h + .01, z], topM, .02, [0, Y, 0], 2);
    } else {
      body = studioMesh(k.root, 'Information pod counter body', studioPlanBody(w, d, h - .07, shape), bodyM, [X, (h - .07) / 2 + .075, z], [0, Y, 0]);
      top = studioMesh(k.root, 'Information pod counter top', studioPlanBody(w + .12, d + .12, .06, shape), topM, [X, h + .01, z], [0, Y, 0]);
    }
    if (opts.led) studioMesh(k.root, 'Counter LED toe reveal', shape === 'box' || shape === 'wedge' ? roundedGeometry(w - .08, .03, d - .06, .01, 1) : studioPlanBody(w - .06, d - .06, .03, shape), opts.led, [X, .12, z], [0, Y, 0]);
    if (opts.band) studioMesh(k.root, 'Counter colour band', shape === 'box' || shape === 'wedge' ? roundedGeometry(w + .012, .12, d + .012, .02, 1) : studioPlanBody(w + .012, d + .012, .12, shape), opts.band, [X, h - .2, z], [0, Y, 0]);
    shadow(k, x, z, w + .5, d + .5);
    return {body, top};
  }

  /* ---------- content (sign, video, contact poster, papers), placed later by the studio ---------- */
  function content(k) {
    const {root, t, d, m, data} = k, L = k.layout, s = L.sign;
    const tex = signTexture(t, data, s.w, s.h, s.style || {});
    const sign = meshPlane('Dynamic company name sign', s.w, s.h, s.pos, textureMaterial(tex));
    sign.rotation.set(...s.rot);
    sign.userData = {role: 'companyName', editable: true, source: 'boothName', logoMode: data.logoMode || 'name', headerHasLogo: !!projectImages.logo, backingColor: s.backing || (s.style && s.style.bg) || t.palette.trim, signStyle33: s.style?.name || 'dev33'};
    root.add(sign);
    const sw = d.width * .34, sh = 1.32;
    studioRound(root, 'Video screen frame', [sw + .14, sh + .14, .10], [0, 2.0, -d.depth / 2 + .8], m.trim, .048);
    const texture = createCanvasTexture({width: 1024, height: 576, accent: t.palette.accent, title: data.videoLink ? 'Company Video' : 'Your company video', subtitle: data.videoLink ? normalizeUrl(data.videoLink) : 'Add a video link', kicker: data.boothName || 'Employer', compact: true, type: 'screen'});
    const video = meshPlane('Dynamic video screen', sw, sh, [0, 2.0, -d.depth / 2 + .87], textureMaterial(texture));
    video.userData = {role: 'video', editable: true, href: data.videoLink};
    root.add(video);
    studioRound(root, 'Video screen shelf', [sw * .48, .045, .17], [0, 2.0 - sh / 2 - .14, -d.depth / 2 + .84], m.secondary, .02);
    const contact = meshPlane('Dynamic contact poster', 1.08, 1.54, [0, 1.94, -d.depth / 2 + .82], textureMaterial(createReadableContactTexture(t, data)));
    contact.userData = {role: 'contact', editable: true, href: data.website};
    root.add(contact);
    addResourcePapers(root, t, d, m, data);
  }
  // Slot helpers: wall-mounted panels face along yaw; stands get the studio's rounded post and foot.
  // The TV pose is clamped so the (size-dependent) screen always stays inside the booth outline.
  const slot = (k, x, y, z, yaw, mount = 'stand', tv = null) => {
    let t = null;
    if (tv) {
      const ty = tv[3] ?? yaw, c = Math.abs(Math.cos(ty)), s = Math.abs(Math.sin(ty)), xl = k.W / 2 - .04 - k.tvHalf * c - .15 * s, zl = k.D / 2 - .04 - k.tvHalf * s - .15 * c;
      t = {pos: [k.X(Math.max(-xl, Math.min(xl, tv[0]))), tv[1], Math.max(-zl, Math.min(zl, tv[2]))], yaw: k.Y(ty), mount: tv[4] || mount};
    }
    return {pos: [k.X(x), y, z], yaw: k.Y(yaw), mount, tv: t};
  };

  /* ---------- robust custom geometry ---------- */
  // Every triangle is wound to agree with its normals, so mirrored variants stay correctly lit
  // (the studio and the venue both flip normals on back faces).
  function buf() {
    const b = studioBuffer(), tri = b.tri.bind(b);
    b.tri = (a, c, d, na, nc, nd, ta = [0, 0], tc = [1, 0], td = [1, 1]) => {
      const g = svCross(svSub(c, a), svSub(d, a)), n = svAdd(svAdd(na, nc), nd);
      if (g[0] * n[0] + g[1] * n[1] + g[2] * n[2] < 0) tri(a, d, c, na, nd, nc, ta, td, tc);
      else tri(a, c, d, na, nc, nd, ta, tc, td);
    };
    b.quad = (a, c, d, e, n, uv = null) => {
      const u = uv || [[0, 0], [1, 0], [1, 1], [0, 1]];
      b.tri(a, c, d, n, n, n, u[0], u[1], u[2]);
      b.tri(a, d, e, n, n, n, u[0], u[2], u[3]);
    };
    return b;
  }
  const area2 = P => {let a = 0; for (let i = 0; i < P.length; i++) {const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1];} return a / 2;};
  function dedupe(P) {
    const out = [];
    for (const p of P) {const q = out[out.length - 1]; if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-6) out.push(p);}
    while (out.length > 2 && Math.hypot(out[0][0] - out[out.length - 1][0], out[0][1] - out[out.length - 1][1]) < 1e-6) out.pop();
    return out;
  }
  // Ear clipping for simple polygons (arches, gables, gears, folded ribbons).
  function triangulate(P) {
    const idx = P.map((_, i) => i);
    if (area2(P) < 0) idx.reverse();
    const out = [], cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const inside = (p, a, b, c) => cr(a, b, p) > 1e-10 && cr(b, c, p) > 1e-10 && cr(c, a, p) > 1e-10;
    let guard = 0;
    while (idx.length > 3 && guard++ < 20000) {
      let clipped = false;
      for (let i = 0; i < idx.length; i++) {
        const i0 = idx[(i + idx.length - 1) % idx.length], i1 = idx[i], i2 = idx[(i + 1) % idx.length], a = P[i0], b = P[i1], c = P[i2];
        if (cr(a, b, c) <= 1e-12) continue;
        let ok = true;
        for (const j of idx) if (j !== i0 && j !== i1 && j !== i2 && inside(P[j], a, b, c)) {ok = false; break;}
        if (!ok) continue;
        out.push([i0, i1, i2]); idx.splice(i, 1); clipped = true; break;
      }
      if (!clipped) break;
    }
    if (idx.length === 3) out.push([idx[0], idx[1], idx[2]]);
    else for (let i = 1; i < idx.length - 1; i++) out.push([idx[0], idx[i], idx[i + 1]]);
    return out;
  }
  // Extrude a 2D outline between t0 and t1. map(a, b, t) is a rigid map into design space (x unmirrored).
  function extrude(k, name, outline, t0, t1, m, map, opts = {}) {
    const P = dedupe(outline), n = P.length, b = buf(), W = (a, c, t) => {const q = map(a, c, t); return [k.X(q[0]), q[1], q[2]];};
    const o = W(0, 0, 0), dir = v => svNorm(svSub(W(v[0], v[1], v[2]), o)), s = area2(P) > 0 ? 1 : -1, tn = dir([0, 0, 1]);
    const minA = Math.min(...P.map(p => p[0])), maxA = Math.max(...P.map(p => p[0])), minB = Math.min(...P.map(p => p[1])), maxB = Math.max(...P.map(p => p[1]));
    const uv = p => {let u = (p[0] - minA) / (maxA - minA || 1); if (k.mirror) u = 1 - u; return [u, (p[1] - minB) / (maxB - minB || 1)];};
    const caps = opts.caps ?? 'both';
    for (const [i, j, l] of triangulate(P)) {
      if (caps !== 'back') b.tri(W(...P[i], t1), W(...P[j], t1), W(...P[l], t1), tn, tn, tn, uv(P[i]), uv(P[j]), uv(P[l]));
      if (caps !== 'front') {const bn = svMul(tn, -1); b.tri(W(...P[i], t0), W(...P[j], t0), W(...P[l], t0), bn, bn, bn, uv(P[i]), uv(P[j]), uv(P[l]));}
    }
    const smooth = opts.smooth ?? .5, ang = (x, y) => Math.acos(Math.max(-1, Math.min(1, x[0] * y[0] + x[1] * y[1]))), avg = (x, y) => {const c = [x[0] + y[0], x[1] + y[1]], L = Math.hypot(...c) || 1; return [c[0] / L, c[1] / L];};
    const edges = P.map((p, i) => {const q = P[(i + 1) % n], d = [q[0] - p[0], q[1] - p[1]], L = Math.hypot(...d) || 1; return {p, q, n2: [s * d[1] / L, -s * d[0] / L], len: L};});
    let run = 0;
    edges.forEach((e, i) => {
      const prev = edges[(i + n - 1) % n], next = edges[(i + 1) % n];
      const nA = ang(prev.n2, e.n2) < smooth ? avg(prev.n2, e.n2) : e.n2, nB = ang(e.n2, next.n2) < smooth ? avg(e.n2, next.n2) : e.n2;
      const NA = dir([nA[0], nA[1], 0]), NB = dir([nB[0], nB[1], 0]), u0 = run, u1 = run + e.len;
      run = u1;
      b.tri(W(...e.p, t0), W(...e.q, t0), W(...e.q, t1), NA, NB, NB, [u0, t0], [u1, t0], [u1, t1]);
      b.tri(W(...e.p, t0), W(...e.q, t1), W(...e.p, t1), NA, NB, NA, [u0, t0], [u1, t1], [u0, t1]);
    });
    return studioMesh(k.root, name, b.finish(), m);
  }
  // Plan outline (x/z) extruded vertically from y0 to y1.
  const prism = (k, name, outline, y0, y1, m, opts) => extrude(k, name, outline, y0, y1, m, (a, c, t) => [a, t, c], opts);
  // Front outline (local u/y) extruded through local depth w0..w1, placed at [x, z] and turned by yaw.
  const slab = (k, name, outline, w0, w1, m, pose = [0, 0, 0], opts) => extrude(k, name, outline, w0, w1, m, (a, c, t) => localPose([pose[0], 0, pose[1]], pose[2], [a, c, t]), opts);

  /* ---------- outline generators ---------- */
  function roundRect(w, h, r, cx = 0, cy = 0, seg = 6) {
    r = Math.min(r, w / 2, h / 2);
    const out = [];
    for (const [qx, qy, a0] of [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI], [w / 2 - r, -h / 2 + r, Math.PI * 1.5]])
      for (let i = 0; i <= seg; i++) {const a = a0 + i / seg * Math.PI / 2; out.push([cx + qx + Math.cos(a) * r, cy + qy + Math.sin(a) * r]);}
    return out;
  }
  // Rectangle with a semicircular (or elliptical) top, bottom at y0.
  function archTop(w, h, y0 = 0, cx = 0, rise = null, seg = 20) {
    const r = w / 2, rr = rise ?? r, out = [[cx + r, y0]];
    for (let i = 0; i <= seg; i++) {const a = i / seg * Math.PI; out.push([cx + Math.cos(a) * r, y0 + h - rr + Math.sin(a) * rr]);}
    out.push([cx - r, y0]);
    return out;
  }
  // Arch band (U-shape) with legs down to y0: outer width w, height h, band thickness b.
  function archBand(w, h, b, y0 = 0, seg = 24) {
    const R = w / 2, ri = R - b, spring = y0 + h - R, out = [[R, y0]];
    for (let i = 0; i <= seg; i++) {const a = i / seg * Math.PI; out.push([Math.cos(a) * R, spring + Math.sin(a) * R]);}
    out.push([-R, y0], [-ri, y0]);
    for (let i = seg; i >= 0; i--) {const a = i / seg * Math.PI; out.push([Math.cos(a) * ri, spring + Math.sin(a) * ri]);}
    out.push([ri, y0]);
    return out;
  }
  function sector(r0, r1, a0, a1, seg = 20, cx = 0, cz = 0) {
    const out = [];
    for (let i = 0; i <= seg; i++) {const a = a0 + (a1 - a0) * i / seg; out.push([cx + Math.cos(a) * r1, cz + Math.sin(a) * r1]);}
    for (let i = seg; i >= 0; i--) {const a = a0 + (a1 - a0) * i / seg; out.push([cx + Math.cos(a) * r0, cz + Math.sin(a) * r0]);}
    return out;
  }
  function gearOutline(r, teeth, depth = .16, cx = 0, cy = 0) {
    const out = [], ri = r * (1 - depth);
    for (let i = 0; i < teeth; i++) {
      const a = i / teeth * TAU, s = TAU / teeth;
      for (const [f, rr] of [[0, ri], [.18, ri], [.3, r], [.7, r], [.82, ri]]) out.push([cx + Math.cos(a + f * s) * rr, cy + Math.sin(a + f * s) * rr]);
    }
    return out;
  }
  // A thick polyline (for folded ribbons): points [[u, y]], total thickness t.
  function thickLine(pts, t) {
    const L = [], Rr = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const d0 = i > 0 ? svNorm([p[0] - a[0], p[1] - a[1], 0]) : svNorm([b[0] - p[0], b[1] - p[1], 0]);
      const d1 = i < pts.length - 1 ? svNorm([b[0] - p[0], b[1] - p[1], 0]) : d0;
      const n0 = [-d0[1], d0[0]], n1 = [-d1[1], d1[0]], nm = svNorm([n0[0] + n1[0], n0[1] + n1[1], 0]), cos = Math.max(.35, nm[0] * n1[0] + nm[1] * n1[1]), s = t / 2 / cos;
      L.push([p[0] + nm[0] * s, p[1] + nm[1] * s]);
      Rr.push([p[0] - nm[0] * s, p[1] - nm[1] * s]);
    }
    return [...L, ...Rr.reverse()];
  }

  /* ---------- thick curved shell (pods, vaults): fn(u, w) -> design-space point ---------- */
  function shell(k, name, fn, thick, m, nu = 24, nv = 8, rims = [1, 1, 1, 1]) {
    // Thickness is measured in design space, so mirrored variants keep the same inside/outside.
    const b = buf(), F = (u, w) => fn(Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, w))), e = 1e-4, MX = q => [k.X(q[0]), q[1], q[2]];
    const N0 = (u, w) => svNorm(svCross(svSub(F(u + e, w), F(u - e, w)), svSub(F(u, w + e), F(u, w - e))));
    const P = (u, w) => MX(F(u, w));
    const V = (u, w, outer) => {const q = F(u, w), n = N0(u, w); return outer ? {p: MX(q), n: MX(n)} : {p: MX(svAdd(q, svMul(n, -thick))), n: MX(svMul(n, -1))};};
    for (const outer of [true, false]) for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
      const a = V(i / nu, j / nv, outer), c = V((i + 1) / nu, j / nv, outer), d = V((i + 1) / nu, (j + 1) / nv, outer), f = V(i / nu, (j + 1) / nv, outer);
      b.tri(a.p, c.p, d.p, a.n, c.n, d.n, [i / nu, j / nv], [(i + 1) / nu, j / nv], [(i + 1) / nu, (j + 1) / nv]);
      b.tri(a.p, d.p, f.p, a.n, d.n, f.n, [i / nu, j / nv], [(i + 1) / nu, (j + 1) / nv], [i / nu, (j + 1) / nv]);
    }
    const border = (list, away) => {
      for (let i = 0; i < list.length - 1; i++) {
        const [u0, w0] = list[i], [u1, w1] = list[i + 1], a = V(u0, w0, true), c = V(u1, w1, true), d = V(u1, w1, false), f = V(u0, w0, false);
        let n = svNorm(svCross(svSub(c.p, a.p), svSub(f.p, a.p)));
        const out = svSub(P(u0, w0), P(u0 + away[0] * .02, w0 + away[1] * .02));
        if (n[0] * out[0] + n[1] * out[1] + n[2] * out[2] < 0) n = svMul(n, -1);
        b.quad(a.p, c.p, d.p, f.p, n);
      }
    };
    const us = Array.from({length: nu + 1}, (_, i) => i / nu), ws = Array.from({length: nv + 1}, (_, j) => j / nv);
    if (rims[0]) border(us.map(u => [u, 0]), [0, 1]);
    if (rims[1]) border(us.map(u => [u, 1]), [0, -1]);
    if (rims[2]) border(ws.map(w => [0, w]), [1, 0]);
    if (rims[3]) border(ws.map(w => [1, w]), [-1, 0]);
    return studioMesh(k.root, name, b.finish(), m);
  }
  // Glowing tube (neon, LED ropes).
  const neon = (k, name, pts, m, r = .022) => Tube(k, name, pts, r, m, 8);
  const lightbox = (k, colors, kind = 'screen', glow = .35, w = 512, h = 512) => graphicMat(kind, colors, {emissive: glow, w, h, rough: .5});

  /* ---------- layout helpers ---------- */
  // Slots are written in design space (left = negative x). Mirrored variants swap the labels so
  // "Back left" in the builder is always the visitor's left.
  function setSlots(k, s) {
    const L = k.mirror ? s.right : s.left, Rr = k.mirror ? s.left : s.right, FL = k.mirror ? s.frontRight : s.frontLeft, FR = k.mirror ? s.frontLeft : s.frontRight;
    k.layout.slots = {'back-left': L, 'back-middle': s.middle, 'back-right': Rr, 'front-left': FL, 'front-right': FR};
    // Photo gallery candidates: the family's own spots first, then generic side-edge spots.
    const sides = s.sidePhotos || 'both', side = [.4, .08, -.25].flatMap(f => [sides !== 'right' ? photoPose(k, -k.W / 2 + .5, 1.8, k.D * f, Math.PI / 2) : null, sides !== 'left' ? photoPose(k, k.W / 2 - .5, 1.8, k.D * f, -Math.PI / 2) : null]).filter(Boolean);
    k.layout.photos = [...(s.photos ? (k.mirror ? s.photos.slice().reverse() : s.photos) : []), ...side];
    if (s.rack) k.layout.rack = k.mirror ? s.rack.slice().reverse() : s.rack;
  }
  const photoPose = (k, x, y, z, yaw, mount = 'stand') => ({pos: [k.X(x), y, z], yaw: k.Y(yaw), mount});
  const rackPos = (k, x, z) => [k.X(x), z];
  function setSign(k, w, h, x, y, z, yaw, style, backing) {k.layout.sign = {w, h, pos: [k.X(x), y, z], rot: [0, k.Y(yaw), 0], style, backing};}
  // Standard front stands keep both front corners usable for a TV (2.6 m wide) or the contact card.
  function frontStands(k, zc = 1.72) {
    const W = k.W;
    return {
      frontLeft: slot(k, -W / 2 + .95, 1.98, zc, .3, 'stand', [-W / 2 + 1.5, 2.02, zc - .05, .22, 'stand']),
      frontRight: slot(k, W / 2 - .95, 1.98, zc, -.3, 'stand', [W / 2 - 1.5, 2.02, zc - .05, -.22, 'stand'])
    };
  }

  /* ================= 33 Skyline Bridge: slanted brand towers, glowing bridge beams, halo ring on a column ================= */
  function skylineBridge(k) {
    const {W, D, H, m, p} = k, dark = k.bit(2), towerM = dark ? m.charcoal : m.snow, inset = m.primary;
    floor(k, k.bit(3) ? 'dark' : 'planks', m.ledPrimary);
    const towers = [[-W * .38, -D * .3, .32, 1.3], [-W * .19, -D * .41, .18, 1.2]];
    towers.forEach(([x, z, yaw, w], i) => {
      const h = H - .2 + i * .15;
      R(k, 'Brand tower upright slab', [w, h, .2], [x, h / 2 + .08, z], towerM, .04, [0, yaw, 0]);
      R(k, 'Brand tower colour inset', [w * .62, h * .72, .04], [x + Math.sin(yaw) * .11, h * .45 + .1, z + Math.cos(yaw) * .11], inset, .02, [0, yaw, 0]);
      R(k, 'Brand tower cantilever header', [w, .3, 1.1], [x + Math.sin(yaw) * .45, h - .07, z + Math.cos(yaw) * .45], towerM, .04, [0, yaw, 0]);
      for (const s of [-1, 1]) spotArm(k, x + Math.cos(yaw) * s * w * .32 + Math.sin(yaw) * .9, h - .25, z - Math.sin(yaw) * s * w * .32 + Math.cos(yaw) * .9, yaw, .12, -.02);
    });
    // Halo ring on a column, reached by two glowing bridge beams.
    const cx = W * .27, cz = D * .02, ry = H - .2;
    C(k, 'Halo column upright', .15, .17, ry, [cx, ry / 2 + .08, cz], towerM, 24);
    Ring(k, 'Halo canopy ring', .95, .95, ry + .08, [cx, 0, cz], .16, .42, towerM, .5, 5.3);
    Ring(k, 'Halo ring underside LED', .93, .93, ry - .15, [cx, 0, cz], .05, .03, m.ledPrimary, .5, 5.3);
    Lathe(k, 'LED pixel drum', [[.52, -.36], [.52, .36]], [cx, ry - .72, cz], graphicMat('pixels', [p.trim, p.primary, p.accent, p.secondary], {emissive: .22, w: 1024, h: 256}), 36);
    Lathe(k, 'LED drum top cap', [[.18, 0], [.54, 0], [.54, .04], [.18, .04]], [cx, ry - .36, cz], towerM, 36);
    Lathe(k, 'LED drum bottom cap', [[.18, 0], [.54, 0], [.54, .04], [.18, .04]], [cx, ry - 1.12, cz], towerM, 36);
    for (const [i, [x, z, yaw, w]] of towers.entries()) {
      const hx = x + Math.sin(yaw) * .75, hz = z + Math.cos(yaw) * .75, y = H - .12 + i * .15;
      Rod(k, 'Glowing bridge beam', [hx, y, hz], [cx - .55, ry - .05 - i * .12, cz - .35 + i * .5], .085, m.ledPrimary);
      Rod(k, 'Bridge beam white sleeve', [hx, y, hz], [hx + (cx - .55 - hx) * .18, y + (ry - .05 - i * .12 - y) * .18, hz + (cz - .35 + i * .5 - hz) * .18], .1, towerM);
    }
    counter(k, 'crescent', cx, cz + .62, 0, 2.1, .72, towerM, m.white, {band: m.primary, led: m.ledPrimary});
    Lathe(k, 'Halo column plinth', [[0, 0], [.42, 0], [.42, .1], [.36, .14], [0, .14]], [cx, .08, cz], towerM, 28);
    // Lounge and bar corner.
    sofa(k, -W * .31, D * .1, .35, 1.9, m.sofa);
    coffeeTable(k, -W * .17, D * .2, .7, .7, m.glass, true);
    highTable(k, -W * .02, -D * .22, .34, m.white);
    for (const a of [.6, 2.4, 4.2]) stool(k, -W * .02 + Math.cos(a) * .55, -D * .22 + Math.sin(a) * .55, m.white, 1, .74, Math.atan2(-Math.cos(a), -Math.sin(a)));
    potPlant(k, -W * .46, -D * .44, 1.35, m.ceramicWhite, 1);
    setSign(k, 1.22, .76, towers[0][0] + Math.sin(.32) * .205, H * .62, towers[0][1] + Math.cos(.32) * .205, .32, {bg: p.primary, fg: '#ffffff', upper: true, fill: .7, name: 'tower'}, p.primary);
    setSlots(k, {
      left: slot(k, towers[1][0] + Math.sin(.18) * .2, 1.62, towers[1][1] + Math.cos(.18) * .2 + .02, .18, 'wall', [-W * .2, 2.0, -D * .15, .2, 'stand']),
      middle: slot(k, W * .02, 1.98, -D * .38, 0, 'stand', [.56, 2.02, -D * .4, 0, 'stand']),
      right: slot(k, W * .36, 1.98, -D * .36, -.2, 'stand', [W * .295, 2.02, -D * .38, -.12, 'stand']),
      ...frontStands(k),
      photos: [photoPose(k, -W / 2 + .4, 1.8, -D * .08, Math.PI / 2), photoPose(k, W / 2 - .4, 1.8, -D * .1, -Math.PI / 2)],
      rack: [rackPos(k, -W * .1, D * .43), rackPos(k, W * .08, D * .43)]
    });
  }

  /* ================= 34 Brand Wall: bold L-shaped wall, huge company name, leaf graphics, pass-through counter ================= */
  function brandWall(k) {
    const {W, D, H, m, p} = k, wallM = m.primaryMatte, h = H + .1, back = -D / 2 + .1, sideX = W / 2 - .1, sideD = D * (k.bit(2) ? .7 : .55);
    floor(k, k.pick(['planks', 'planks', 'white', 'accent']));
    R(k, 'Bold brand back wall', [W - .02, h, .2], [0, h / 2 + .08, back], wallM, .02);
    R(k, 'Back wall white top trim', [W - .02, .06, .2], [0, h + .1, back], m.white, .01);
    const sideFace = graphicMat(k.bit(3) ? 'leaves' : 'circles', [p.primary, '#ffffff', p.accent, p.secondary]);
    R(k, 'Bold brand side wall', [sideD, h, .2], [sideX, h / 2 + .08, -D / 2 + sideD / 2 + .01], sideFace, .02, [0, -Math.PI / 2, 0]);
    R(k, 'Side wall white edge', [.2, h + .06, .06], [sideX, h / 2 + .1, -D / 2 + sideD + .02], m.white, .01);
    Plane(k, 'Brand wall graphic panel', W * .44, h - .5, [-W * .27, (h - .5) / 2 + .33, back + .103], 0, graphicMat(k.bit(3) ? 'waves' : 'split', [p.primary, mix(p.primary, '#ffffff', .18), p.accent, '#ffffff'], {w: 1024, h: 1024}));
    for (const x of [-W * .32, -W * .05, W * .22]) spotArm(k, x, h + .1, back + .1, 0, .36, .02);
    spotArm(k, sideX - .1, h + .1, -D * .12, -Math.PI / 2, .3, .02);
    // Pass-through counter along the front with a white top and a painted body.
    const cw = W * .5, cx = W * .2;
    counter(k, 'box', cx, D * .33, 0, cw, .62, m.primary, m.white, {band: m.white});
    // Meeting table, round stools, tall vase plant.
    R(k, 'Square meeting table top', [.95, .05, .95], [-W * .2, .78, -D * .08], m.woodLight, .02);
    Rod(k, 'Meeting table upright pedestal', [-W * .2, .1, -D * .08], [-W * .2, .76, -D * .08], .04, m.chrome);
    R(k, 'Meeting table foot', [.6, .03, .6], [-W * .2, .095, -D * .08], m.chrome, .01);
    for (const s of [-1, 1]) stool(k, -W * .2 + s * .72, -D * .08, m.primary, 0, .6);
    const upper = k.bit(1);
    setSign(k, W * .5, .9, -W * .08, H - .55, back + .175, 0, {bg: p.primary, fg: '#ffffff', align: 'left', weight: 900, fill: .86, name: 'wall'}, p.primary);
    setSlots(k, {
      left: slot(k, -W * .36, 1.68, back + .18, 0, 'wall', [-W / 2 + 1.45, 1.78, back + .24, 0, 'wall']),
      middle: slot(k, W * .02, 1.68, back + .18, 0, 'wall', [0, 1.78, back + .24, 0, 'wall']),
      right: slot(k, sideX - .18, 1.8, -D * .28, -Math.PI / 2, 'wall', [sideX - .24, 1.9, -D / 2 + .26 + k.tvHalf, -Math.PI / 2, 'wall']),
      frontLeft: slot(k, -W / 2 + .95, 1.98, D * .33, .3, 'stand', [-W / 2 + 1.5, 2.02, D * .3, .22, 'stand']),
      frontRight: slot(k, W * .36, 1.98, D * .06, -.4, 'stand', [W * .12, 2.02, D * .08, -.1, 'stand']),
      photos: [photoPose(k, -W / 2 + .4, 1.8, D * .12, Math.PI / 2), photoPose(k, -W / 2 + .4, 1.8, -D * .2, Math.PI / 2)],
      rack: [rackPos(k, -W * .32, D * .43), rackPos(k, -W * .12, D * .43)]
    });
    if (upper) {/* mirrored-style variants keep the same parts; the palette and floor provide contrast */}
  }

  /* ================= 35 Hex Lounge: floating overhead frame, glowing hexagons, wave slat wall, living wall ================= */
  function hexLounge(k) {
    const {W, D, H, m, p} = k, frameM = k.bit(2) ? m.woodLight : m.snow, top = H + .05, bw = .34;
    floor(k, k.bit(3) ? 'dark' : 'terrazzo', m.ledWarm);
    // Overhead frame: four beams with an inner warm LED reveal.
    const fx = W / 2 - .04 - bw / 2, fz = D / 2 - .13 - bw / 2;
    R(k, 'Overhead frame front canopy beam', [W - .06, .38, bw], [0, top, fz], frameM, .03);
    R(k, 'Overhead frame rear beam', [W - .06, .38, bw], [0, top, -fz], frameM, .03);
    for (const s of [-1, 1]) R(k, 'Overhead frame side beam', [bw, .38, D - .06 - 2 * bw], [s * fx, top, 0], frameM, .03);
    B(k, 'Frame inner LED reveal front', [W - .2 - 2 * bw, .03, .04], [0, top - .2, fz - bw / 2 - .02], m.ledWarm);
    B(k, 'Frame inner LED reveal rear', [W - .2 - 2 * bw, .03, .04], [0, top - .2, -fz + bw / 2 + .02], m.ledWarm);
    for (const s of [-1, 1]) B(k, 'Frame inner LED reveal side', [.04, .03, D - .2 - 2 * bw], [s * (fx - bw / 2 - .02), top - .2, 0], m.ledWarm);
    // Left: stepped stack of horizontal slats on two posts.
    const lx = -W / 2 + .2;
    for (const z of [-D * .38, D * .12]) R(k, 'Slat stack upright post', [.1, top - .15, .1], [lx, (top - .15) / 2 + .08, z], m.charcoal, .02);
    for (let i = 0; i < 9; i++) {const len = D * (.36 + .28 * Math.abs(Math.sin(i * .9 + k.v))), y = .45 + i * .34; R(k, 'Stacked horizontal slat', [.34, .12, len], [lx + .05, y, -D * .13 + (i % 2 ? .12 : -.12)], k.bit(2) ? m.snow : m.woodLight, .02);}
    // Back: undulating timber fins over a dark panel, then a living wall.
    const back = -D / 2 + .12;
    R(k, 'Wave wall back wall panel', [W * .56, H - .2, .06], [-W * .16, (H - .2) / 2 + .08, back], m.dark, .01);
    for (let i = 0; i < 26; i++) {const x = -W * .43 + i * W * .54 / 25; R(k, 'Undulating timber fin', [.06, H - .35, .14], [x, (H - .35) / 2 + .12, back + .12 + .1 * Math.sin(i * .55 + k.v * .3)], m.wood, .015, [0, .25 * Math.cos(i * .55), 0], 1);}
    R(k, 'Living wall back wall frame', [W * .34, H - .2, .12], [W * .31, (H - .2) / 2 + .08, back], m.charcoal, .02);
    R(k, 'Living wall planting', [W * .31, H - .5, .06], [W * .31, (H - .5) / 2 + .2, back + .07], graphicMat('greenery', ['#2c4a28', '#4f7d3a', '#6b9a45', '#3b6a3a'], {w: 512, h: 512}), .01);
    // Hexagon lights hanging inside the frame.
    const hexes = [[-1.6, -.4, .42], [-.8, .1, .36], [-.1, -.5, .4], [.7, .1, .34], [1.4, -.55, .38], [-1.2, .75, .3], [.2, .8, .33], [1.9, .45, .3]];
    for (const [x, z, r] of hexes.slice(0, 6 + (k.v % 3))) {Rod(k, 'Hexagon light cable', [x, top - .19, z], [x, top - .6, z], .004, m.dark); hexLight(k, x, top - .68, z, r, k.bit(2) ? m.snow : m.woodLight, m.ledWarm);}
    // Lounge: sofa facing out, two armchairs, table; cafe set on the right.
    sofa(k, -W * .12, -D * .18, 0, 2.1, m.leather);
    for (const s of [-1, 1]) armchair(k, -W * .12 + s * .95, D * .12, Math.PI + s * .35, m.sofa, m.wood);
    coffeeTable(k, -W * .12, -D * .01, 1.0, .55, m.woodLight);
    bamboo(k, W * .02, D * .38, .9, .34, 1.3);
    for (const s of [-1, 1]) stool(k, W * .3 + s * .45, D * .08, m.white, 2, .62, -s * Math.PI / 2);
    highTable(k, W * .3, D * .08, .3, m.white, 1);
    counter(k, 'box', W * .33, D * .36, 0, 1.6, .56, frameM, m.dark, {led: m.ledWarm});
    setSign(k, W * .56, .3, 0, top, fz + bw / 2 + .07, 0, {bg: k.bit(2) ? mix(k.woodColor, '#f2e2c6', .45) : '#f6f6f2', fg: p.trim, fill: .8, upper: true, name: 'frame'}, k.bit(2) ? mix(k.woodColor, '#f2e2c6', .45) : '#f6f6f2');
    setSlots(k, {
      left: slot(k, -W * .3, 1.95, -D * .3, .15, 'stand', [-W * .22, 2.0, -D * .3, .06, 'stand']),
      middle: slot(k, -W * .12, 1.75, back + .4, 0, 'wall', [-W * .14, 1.9, back + .47, 0, 'wall']),
      right: slot(k, W * .31, 1.7, back + .22, 0, 'wall', [W * .2, 2.0, -D * .3, -.1, 'stand']),
      frontLeft: slot(k, -W / 2 + .95, 1.98, D * .36, .3, 'stand', [-W / 2 + 1.55, 2.02, D * .33, .22, 'stand']),
      frontRight: slot(k, W * .14, 1.98, D * .24, -.2, 'stand', [W * .16, 2.02, D * .2, -.1, 'stand']),
      photos: [photoPose(k, -W / 2 + .7, 1.8, D * .3, Math.PI / 2 - .2), photoPose(k, W / 2 - .5, 1.8, -D * .08, -Math.PI / 2)], sidePhotos: 'right',
      rack: [rackPos(k, -W * .2, D * .43), rackPos(k, W * .12, D * .43)]
    });
  }

  /* ================= 36 Corner Studio: black corner walls, big diagonal graphic, banner stand, lounge tub chairs ================= */
  function cornerStudio(k) {
    const {W, D, H, m, p} = k, h = H + .05, back = -D / 2 + .1, sideX = -W / 2 + .1, sideD = D * .8, blackM = k.bit(2) ? m.trimMatte : m.dark;
    floor(k, k.pick(['planks', 'planksDark', 'planks', 'concrete']));
    const g = graphicMat(k.bit(3) ? 'split' : 'diagonal', [k.bit(2) ? p.trim : '#1c1f24', p.accent, p.primary, '#ffffff']);
    R(k, 'Graphic corner back wall', [W - .02, h, .2], [0, h / 2 + .08, back], g, .02);
    R(k, 'Graphic corner side wall', [.2, h, sideD], [sideX, h / 2 + .08, -D / 2 + sideD / 2 + .01], blackM, .02);
    R(k, 'Side wall accent return', [.2, h * .6, .2], [sideX + .01, h * .3 + .08, -D / 2 + sideD - .1], m.accent, .02);
    R(k, 'Corner wall white cap', [W - .02, .05, .2], [0, h + .105, back], m.white, .01);
    for (const x of [-W * .38, -W * .12, W * .12, W * .38]) trackSpot(k, x, h + .08, back + .25, m.dark);
    trackSpot(k, sideX + .25, h + .08, -D * .1, m.dark);
    banner(k, -W * .38, D * .34, .25, .85, 2.0, graphicMat('diagonal', [k.bit(2) ? p.trim : '#1c1f24', p.accent, p.primary], {w: 512, h: 1024}));
    counter(k, 'box', -W * .06, D * .3, 0, 1.9, .62, m.accent, m.white, {band: blackM});
    for (const [x, z, a] of [[W * .08, -D * .1, .5], [W * .27, -D * .09, -.5], [W * .18, D * .09, Math.PI]]) tubChair(k, x, z, a, k.bit(1) ? m.charcoal : m.leather, m.sofa);
    coffeeTable(k, W * .18, -D * .01, .7, .5, m.white);
    vasePlant(k, W * .45, D * .14, 1.55, m.terracotta);
    setSign(k, W * .54, .86, W * .1, H - .72, back + .175, 0, {bg: k.bit(2) ? p.trim : '#1c1f24', fg: '#ffffff', align: 'left', weight: 800, tagline: 'Careers start here', fill: .8, name: 'corner'}, k.bit(2) ? p.trim : '#1c1f24');
    setSlots(k, {
      left: slot(k, sideX + .18, 1.8, -D / 2 + .8, Math.PI / 2, 'wall', [-W * .26, 1.62, back + .24, 0, 'wall']),
      middle: slot(k, .1, 1.6, back + .18, 0, 'wall', [.9, 1.62, back + .24, 0, 'wall']),
      right: slot(k, W * .4, 1.95, -D * .3, -.2, 'stand', [W * .3, 2.0, -D * .36, -.1, 'stand']),
      frontLeft: slot(k, sideX + .18, 1.8, .6, Math.PI / 2, 'wall', [sideX + .25, 1.9, .15, Math.PI / 2, 'wall']),
      frontRight: slot(k, W / 2 - .95, 1.98, D * .34, -.3, 'stand', [W / 2 - 1.5, 2.02, D * .32, -.22, 'stand']),
      photos: [photoPose(k, sideX + .22, 1.8, D * .2, Math.PI / 2, 'wall'), photoPose(k, W / 2 - .45, 1.8, D * .12, -Math.PI / 2)],
      rack: [rackPos(k, -W * .22, D * .43), rackPos(k, W * .1, D * .43)]
    });
  }

  /* ================= 37 Truss Stage: aluminium truss cage, flown LED video wall, header banner, feather flags ================= */
  function trussStage(k) {
    const {W, D, H, m, p} = k, s = .29, top = H + .02, tx = W / 2 - .25, tzF = D / 2 - .24, tzB = -D / 2 + .24, trussM = k.bit(2) ? m.chrome : m.dark;
    floor(k, k.pick(['carpet', 'dark', 'primary', 'planksDark']), k.bit(3) ? m.ledAccent : null);
    for (const x of [-tx, tx]) for (const z of [tzF, tzB]) {
      truss(k, [x, .12, z], [x, top, z], s, trussM);
      R(k, 'Truss tower upright base plate', [.44, .04, .44], [x, .1, z], trussM, .01);
    }
    truss(k, [-tx, top, tzF], [tx, top, tzF], s, trussM);
    truss(k, [-tx, top, tzB], [tx, top, tzB], s, trussM);
    for (const x of [-tx, tx]) truss(k, [x, top, tzB], [x, top, tzF], s, trussM);
    // Back drape and a flown LED video wall.
    R(k, 'Fabric drape back wall', [W - .9, top - .4, .04], [0, (top - .4) / 2 + .1, tzB - .06], k.bit(1) ? m.trimMatte : m.primaryMatte, .01);
    const lx = -W * .035, lw = W * .38, ly0 = .42, ly1 = 3.02, lz = -D / 2 + .5;
    R(k, 'LED video wall frame back wall', [lw + .12, ly1 - ly0 + .12, .14], [lx, (ly0 + ly1) / 2, lz], m.gloss, .02);
    B(k, 'LED video wall pixels', [lw, ly1 - ly0, .02], [lx, (ly0 + ly1) / 2, lz + .08], lightbox(k, [p.trim, p.primary, p.accent, p.secondary], 'screen', .38, 1024, 1024));
    for (const x of [lx - lw * .35, lx + lw * .35]) Rod(k, 'LED wall rigging chain', [x, ly1 + .06, lz], [x, top - s / 2, tzB], .01, m.steel);
    R(k, 'LED wall plinth', [lw + .3, .34, .5], [lx, .25, lz + .05], m.gloss, .03);
    const ledFace = lz + .09;
    // Left half wall with a bold graphic (inner face faces +x).
    const sx = -W / 2 + .22, sz0 = -D / 2 + .52, sz1 = .72, sh = 2.62;
    R(k, 'Graphic side wall', [sz1 - sz0, sh, .16], [sx, sh / 2 + .08, (sz0 + sz1) / 2], graphicMat(k.bit(1) ? 'stripes' : 'chevrons', [p.primary, '#ffffff', p.accent, p.trim], {w: 1024, h: 512}), .02, [0, Math.PI / 2, 0]);
    // Header banner flown from the front truss.
    const by = top - s / 2 - .47, bw = W * .64;
    R(k, 'Header banner frame', [bw, .8, .08], [0, by, tzF], trussM, .02);
    for (const x of [-bw * .4, bw * .4]) Rod(k, 'Banner rigging cable', [x, by + .4, tzF], [x, top - s / 2, tzF], .006, m.steel);
    for (const x of [-W * .3, 0, W * .3]) trackSpot(k, x, top - s / 2, tzF - .12, trussM);
    for (const x of [-W * .28, W * .28]) trackSpot(k, x, top - s / 2, tzB + .12, trussM);
    // Counter, flags and seating.
    counter(k, 'box', -W * .02, D * .31, 0, 1.9, .6, k.bit(3) ? graphicMat('hazard', [p.primary, p.trim], {w: 512, h: 256}) : m.primary, m.white, {band: m.accent, led: m.ledAccent});
    flag(k, -W / 2 + .3, D / 2 - .3, 2.7, graphicMat('diagonal', [p.primary, p.accent, '#ffffff'], {w: 256, h: 512}));
    flag(k, W / 2 - .78, D / 2 - .3, 2.4, graphicMat('diagonal', [p.accent, p.primary, '#ffffff'], {w: 256, h: 512}));
    highTable(k, -W * .31, -D * .08, .32, m.white, 1);
    for (const a of [.3, 2.4]) stool(k, -W * .31 + Math.cos(a) * .52, -D * .08 + Math.sin(a) * .52, m.primary, 0, .74, Math.atan2(-Math.cos(a), -Math.sin(a)));
    for (const [x, z, c] of [[W * .3, -D * .08, m.primary], [W * .4, D * .06, m.accent]]) R(k, 'Cube ottoman chair seat', [.5, .44, .5], [x, .3, z], c, .06);
    potPlant(k, W / 2 - .45, -D / 2 + .62, 1.3, m.ceramicBlack, 1);
    setSign(k, bw - .12, .68, 0, by, tzF + .07, 0, {bg: k.bit(2) ? p.trim : p.primary, fg: '#ffffff', upper: true, weight: 900, fill: .76, name: 'banner'}, null);
    setSlots(k, {
      left: slot(k, sx + .16, 1.6, -D * .2, Math.PI / 2, 'wall', [sx + .22, 1.62, (sz0 + sz1) / 2, Math.PI / 2, 'wall']),
      middle: slot(k, lx, 1.74, ledFace + .08, 0, 'wall', [lx, 1.72, ledFace + .14, 0, 'wall']),
      right: slot(k, W * .35, 1.98, -D * .28, -.3, 'stand', [W * .3, 2.02, -D * .22, -.28, 'stand']),
      frontLeft: slot(k, -W / 2 + 1.0, 1.98, D * .3, .3, 'stand', [-W / 2 + 1.55, 2.02, D * .27, .22, 'stand']),
      frontRight: slot(k, W / 2 - .95, 1.98, D * .28, -.3, 'stand', [W / 2 - 1.5, 2.02, D * .26, -.22, 'stand']),
      photos: [photoPose(k, -W / 2 + .5, 1.8, D * .36, Math.PI / 2), photoPose(k, W / 2 - .45, 1.8, D * .1, -Math.PI / 2)],
      rack: [rackPos(k, -W * .22, D * .43), rackPos(k, W * .2, D * .43)]
    });
  }

  /* ================= 38 Eco Glow: backlit arch lightboxes, sculpted tree with ring bench, round timber bars ================= */
  function ecoGlow(k) {
    const {W, D, H, m, p} = k, z0 = -D / 2 + .18, rimM = k.bit(2) ? m.woodLight : m.snow;
    floor(k, k.bit(3) ? 'turf' : 'planks', null);
    if (!k.bit(3)) R(k, 'Moss carpet inlay', [W * .42, .012, D * .5], [-W * .15, .087, D * .02], m.turf, .004).userData = {nonColliding: true, decorative: true};
    const panels = [[-W * .34, 1.9, 2.9, 'leaves'], [0, 2.4, 3.46, 'topo'], [W * .34, 1.9, 2.9, 'leaves']];
    panels.forEach(([x, w, h, kind], i) => {
      const glow = lightbox(k, i === 1 ? [mix(p.primary, '#ffffff', .78), mix(p.primary, '#ffffff', .45), p.primary, p.secondary] : [mix(p.secondary, '#ffffff', .35), p.primary, mix(p.accent, '#ffffff', .2), mix(p.primary, '#ffffff', .5)], kind, .34, 512, 1024);
      slab(k, 'Backlit arch lightbox back wall', archTop(w, h, .08), -.07, .07, glow, [x, z0, 0]);
      slab(k, 'Lightbox arch rim', archBand(w + .12, h + .06, .08, .08), -.1, .1, rimM, [x, z0, 0]);
    });
    // Sculpted tree with a ring bench.
    const tx = -W * .2, tz = -D * .06;
    tree(k, tx, tz, 2.55, m.foliageWarm, m.bark);
    Lathe(k, 'Tree ring bench planter upright', [[.36, 0], [.78, 0], [.8, .02], [.8, .44], [.78, .46], [.36, .46], [.34, .44], [.34, .02]], [tx, .08, tz], k.bit(1) ? m.woodLight : m.wood, 32);
    Lathe(k, 'Tree bed moss', [[0, 0], [.35, 0], [.35, .02], [0, .02]], [tx, .52, tz], m.turf, 20);
    // Round timber welcome bar and a second tasting bar.
    counter(k, 'pill', W * .1, D * .29, 0, 1.45, 1.1, m.wood, m.white, {led: m.ledSecondary});
    studioMesh(k.root, 'Round tasting bar counter body', studioPlanBody(.9, .9, .96, 'pill'), m.woodLight, [k.X(W * .37), .56, -D * .02]);
    studioMesh(k.root, 'Round tasting bar counter top', studioPlanBody(1.02, 1.02, .05, 'pill'), m.white, [k.X(W * .37), 1.06, -D * .02]);
    for (const a of [1.9, 3.1, 4.4]) stool(k, W * .37 + Math.cos(a) * .72, -D * .02 + Math.sin(a) * .72, m.woodLight, 2, .66, Math.atan2(-Math.cos(a), -Math.sin(a)));
    for (const [x, z] of [[-W * .44, D * .08], [-W * .35, -D * .2]]) Lathe(k, 'Log stump stool chair seat', [[0, 0], [.2, 0], [.21, .44], [0, .44]], [x, .08, z], m.woodLight, 18);
    for (const x of [-W * .47, W * .47]) potPlant(k, x, -D * .22, 1.2, m.terracotta, 0);
    arcLamp(k, -.62, .95, W * .07, D * .22, 2.5, rimM);
    setSign(k, 1.6, .56, 0, 2.72, z0 + .07 + .075, 0, {bg: '#ffffff', fg: p.trim, upper: false, weight: 800, fill: .74, name: 'lightbox'}, '#ffffff');
    setSlots(k, {
      left: slot(k, -W * .34, 1.55, z0 + .07 + .08, 0, 'wall', [-W * .27, 2.02, -D * .27, .22, 'stand']),
      middle: slot(k, 0, 1.2, z0 + .07 + .08, 0, 'wall', [0, 1.25, z0 + .07 + .17, 0, 'wall']),
      right: slot(k, W * .34, 1.55, z0 + .07 + .08, 0, 'wall', [W * .27, 2.02, -D * .27, -.22, 'stand']),
      frontLeft: slot(k, -W / 2 + .95, 1.98, D * .34, .3, 'stand', [-W / 2 + 1.5, 2.02, D * .33, .22, 'stand']),
      frontRight: slot(k, W / 2 - .7, 1.98, D * .3, -.35, 'stand', [W / 2 - 1.5, 2.02, D * .36, -.2, 'stand']),
      photos: [photoPose(k, -W / 2 + .45, 1.8, -D * .08, Math.PI / 2), photoPose(k, W / 2 - .45, 1.8, D * .1, -Math.PI / 2)],
      rack: [rackPos(k, -W * .1, D * .43), rackPos(k, W * .38, D * .43)]
    });
  }

  /* ================= 39 Grid Cube: black cubby grid wall with lit display cubes, open cube frame, cube seating ================= */
  function gridCube(k) {
    const {W, D, H, m, p} = k, gw = W - .2, cols = 6, rows = 4, gh = 3.0, gd = .44, zb = -D / 2 + .08, zf = zb + gd, gridM = k.bit(2) ? m.snow : m.gloss;
    floor(k, k.bit(3) ? 'checker' : 'dark', m.ledPrimary);
    R(k, 'Cube grid back wall panel', [gw, gh, .04], [0, gh / 2 + .08, zb + .02], k.bit(2) ? m.trimMatte : m.dark, .005);
    for (let i = 0; i <= cols; i++) R(k, 'Cube grid upright fin', [.06, gh, gd], [-gw / 2 + i * gw / cols, gh / 2 + .08, zb + gd / 2], gridM, .01);
    for (let j = 0; j <= rows; j++) R(k, 'Cube grid shelf', [gw, .06, gd], [0, .08 + j * gh / rows, zb + gd / 2], gridM, .01);
    const cw = gw / cols, ch = gh / rows, fill = [m.primary, m.accent, m.ledPrimary, m.secondary, m.white, m.ledAccent];
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const x = -gw / 2 + (i + .5) * cw, y = .08 + (j + .5) * ch, r = (i * 7 + j * 5 + k.v * 3) % 9;
      if (r === 0 || r === 4) B(k, 'Glowing cubby backlight', [cw - .12, ch - .12, .02], [x, y, zb + .06], r ? m.ledPrimary : m.ledAccent);
      else if (r === 1 || r === 6) R(k, 'Colour display cube', [cw * .55, ch * .6, gd * .6], [x, y - ch * .15, zb + gd * .5], fill[(i + j) % 4], .03);
      else if (r === 2) Lathe(k, 'Display sphere product', [[0, -.2], [.12, -.17], [.2, 0], [.12, .17], [0, .2]], [x, y - ch * .2 + .15, zb + gd * .5], fill[(i + 2 * j) % 2 ? 1 : 0], 18);
      else if (r === 3) for (let s = 0; s < 3; s++) R(k, 'Stacked product box', [cw * .62, .14, gd * .55], [x, y - ch / 2 + .12 + s * .16, zb + gd * .5], s % 2 ? m.white : m.accent, .015);
    }
    R(k, 'Cube grid header', [gw, .54, gd + .08], [0, gh + .08 + .27, zb + gd / 2 + .04], gridM, .02);
    // Open cube frame over the lounge (square tubes), with a glowing cube hanging inside.
    const fx0 = W * .1, fx1 = W / 2 - .12, fz0 = -D * .02, fz1 = D / 2 - .14, fh = 2.75, t = .09;
    for (const x of [fx0, fx1]) for (const z of [fz0, fz1]) R(k, 'Cube frame upright edge', [t, fh, t], [x, fh / 2 + .08, z], k.bit(1) ? m.primary : gridM, .01);
    for (const z of [fz0, fz1]) R(k, 'Cube frame top rail', [fx1 - fx0 + t, t, t], [(fx0 + fx1) / 2, fh + .08, z], k.bit(1) ? m.primary : gridM, .01);
    for (const x of [fx0, fx1]) R(k, 'Cube frame top rail', [t, t, fz1 - fz0 + t], [x, fh + .08, (fz0 + fz1) / 2], k.bit(1) ? m.primary : gridM, .01);
    const cx = (fx0 + fx1) / 2, cz = (fz0 + fz1) / 2;
    R(k, 'Hanging glowing cube', [.7, .7, .7], [cx, 2.2, cz], m.ledAccent, .02);
    Rod(k, 'Glowing cube hanger', [cx, 2.55, cz], [cx, fh + .08, cz], .008, m.dark);
    for (const [x, z, c] of [[cx - .55, cz + .3, m.accent], [cx + .45, cz - .1, m.primary], [cx + .05, cz + .75, m.white]]) R(k, 'Cube ottoman chair seat', [.48, .46, .48], [x, .31, z], c, .05);
    counter(k, 'box', -W * .2, D * .3, 0, 1.8, .64, m.accent, m.gloss, {led: m.ledPrimary});
    for (let i = 0; i < 3; i++) R(k, 'Counter stacked cube', [.5, .5, .5], [-W * .2 - .9 - .3, .33 + i * .5, D * .3], [m.primary, m.white, m.accent][i], .03, [0, .12 * (i - 1), 0]);
    setSign(k, W * .66, .44, 0, gh + .08 + .27, zf + .08 + .075, 0, {bg: k.bit(2) ? p.trim : '#101114', fg: k.bit(2) ? '#ffffff' : p.accent, upper: true, weight: 900, fill: .8, name: 'grid'}, k.bit(2) ? p.trim : '#101114');
    const face = zf;
    setSlots(k, {
      left: slot(k, -W * .355, 1.56, face + .08, 0, 'wall', [-W * .27, 1.64, face + .14, 0, 'wall']),
      middle: slot(k, 0, 1.56, face + .08, 0, 'wall', [0, 1.64, face + .14, 0, 'wall']),
      right: slot(k, W * .355, 1.56, face + .08, 0, 'wall', [W * .27, 1.64, face + .14, 0, 'wall']),
      frontLeft: slot(k, -W / 2 + .7, 1.98, D * .08, .6, 'stand', [-W / 2 + 1.45, 2.02, -D * .02, .3, 'stand']),
      frontRight: slot(k, fx0 - .45, 1.98, D * .12, -.4, 'stand', [W * .22, 2.02, -D * .02 + .05, -.1, 'stand']),
      photos: [photoPose(k, -W / 2 + .4, 1.8, D * .3, Math.PI / 2), photoPose(k, fx1 - .06, 1.8, D * .1, -Math.PI / 2, 'stand')],
      rack: [rackPos(k, -W * .44, D * .43), rackPos(k, W * .02, D * .43)]
    });
  }

  /* ================= 40 Tree Columns: branching columns carrying round canopy discs, wrap-around benches ================= */
  function treeColumns(k) {
    const {W, D, H, m, p} = k, colM = k.bit(2) ? m.woodLight : m.snow, discTop = k.bit(1) ? m.primary : m.white, under = k.bit(1) ? m.white : m.primaryMatte;
    floor(k, k.pick(['planks', 'turf', 'terrazzo', 'planks']), null);
    const trees = [[-W * .27, -D * .16, 1.15, H - .05], [W * .22, -D * .08, .95, H - .35], [W * .02, D * .2, .68, H - .8]];
    trees.forEach(([x, z, r, y], i) => {
      Lathe(k, 'Tree column upright trunk', [[.16, 0], [.13, y * .45], [.1, y * .7], [.16, y - .22], [.34, y - .05], [.36, y]], [x, .08, z], colM, 24);
      Lathe(k, 'Round canopy disc', [[0, .05], [r - .06, .05], [r, 0], [r, -.08], [r - .06, -.12], [0, -.12]], [x, y + .16, z], discTop, 40);
      Lathe(k, 'Canopy underside panel', [[.3, 0], [r - .08, 0]], [x, y + .035, z], under, 40);
      Ring(k, 'Canopy glowing rim', r - .1, r - .1, y + .03, [x, 0, z], .05, .025, m.ledPrimary);
      for (let b = 0; b < 3; b++) {const a = b / 3 * TAU + i; Rod(k, 'Branch strut', [x, y * .72, z], [x + Math.cos(a) * r * .55, y + .02, z + Math.sin(a) * r * .55], .035, colM);}
      if (i < 2) Lathe(k, 'Wrap bench planter upright', [[.3, 0], [.62, 0], [.64, .02], [.64, .42], [.62, .44], [.3, .44]], [x, .08, z], k.bit(2) ? m.wood : m.woodLight, 32);
    });
    // Back: low planter hedge and a curved graphic screen.
    const bz = -D / 2 + .16;
    R(k, 'Hedge planter back wall', [W - .4, .56, .38], [0, .36, bz + .08], m.charcoal, .03);
    for (let i = 0; i < 14; i++) Lathe(k, 'Hedge shrub', [[0, -.2], [.18, -.16], [.24, 0], [.18, .16], [0, .22]], [-W / 2 + .45 + i * (W - .9) / 13, .74, bz + .08], i % 3 ? m.foliage : m.foliageWarm, 10, [1, .8 + .2 * (i % 2), 1]);
    Surf(k, 'Curved graphic screen back wall', (u, w) => [(u - .5) * W * .7, .7 + w * 2.0, bz + .06 + .3 * Math.sin(u * Math.PI)], graphicMat('field', [mix(p.secondary, '#ffffff', .4), p.primary, p.accent, mix(p.primary, '#ffffff', .3)], {w: 1024, h: 512}), 24, 2);
    Tube(k, 'Screen top rail', Array.from({length: 17}, (_, i) => [(i / 16 - .5) * W * .7, 2.72, bz + .06 + .3 * Math.sin(i / 16 * Math.PI)]), .03, m.dark, 6);
    for (const u of [0, 1]) Rod(k, 'Screen upright post', [(u - .5) * W * .7, .6, bz + .06], [(u - .5) * W * .7, 2.74, bz + .06], .03, m.dark);
    // Freestanding name board on two posts at the front left.
    const sx = -W * .3, sz = D * .3;
    for (const d of [-.9, .9]) R(k, 'Name board upright post', [.08, 2.9, .08], [sx + d, 1.53, sz - .06], m.dark, .01);
    R(k, 'Name board back panel', [2.0, .7, .05], [sx, 2.62, sz - .06], m.dark, .01);
    counter(k, 'pill', W * .26, D * .3, 0, 1.8, .9, colM, m.white, {band: m.primary, led: m.ledPrimary});
    for (const [x, z] of [[W * .02 + .9, D * .2], [W * .02 - .85, D * .12]]) stool(k, x, z, m.white, 1, .74, x > 0 ? -Math.PI / 2 : Math.PI / 2);
    highTable(k, W * .02, D * .2, .34, m.white);
    potPlant(k, W / 2 - .45, -D * .05, 1.2, m.terracotta, 1);
    setSign(k, 1.9, .62, sx, 2.62, sz - .06 + .025 + .075, 0, {bg: p.primary, fg: '#ffffff', weight: 800, fill: .76, name: 'board'}, p.primary);
    setSlots(k, {
      left: slot(k, -W * .42, 1.98, -1.72, .15, 'stand', [-W * .3, 2.02, -1.76, .08, 'stand']),
      middle: slot(k, -W * .05, 1.98, -1.72, 0, 'stand', [-W * .02, 2.05, -1.78, 0, 'stand']),
      right: slot(k, W * .41, 1.98, -1.66, -.2, 'stand', [W * .3, 2.02, -1.76, -.1, 'stand']),
      frontLeft: slot(k, -W / 2 + .5, 1.98, D * .06, .7, 'stand', [-W / 2 + 1.45, 2.02, D * .12, .35, 'stand']),
      frontRight: slot(k, W / 2 - .55, 1.98, D * .1, -.7, 'stand', [W / 2 - 1.45, 2.02, D * .16, -.3, 'stand']),
      photos: [photoPose(k, -W / 2 + .4, 1.8, -D * .12, Math.PI / 2), photoPose(k, W / 2 - .4, 1.8, -D * .2, -Math.PI / 2)],
      rack: [rackPos(k, -W * .08, D * .43), rackPos(k, W * .06, D * .43)]
    });
  }

  /* ================= 41 Pod Shell: white rounded vault shell with glowing rim, egg chairs, round pod counter ================= */
  function podShell(k) {
    const {W, D, H, m, p} = k, shellM = k.bit(2) ? m.primaryMatte : m.snow, glow = k.bit(1) ? m.ledAccent : m.ledPrimary;
    floor(k, k.bit(3) ? 'white' : 'terrazzo', glow);
    const zb = -D / 2 + .1, Re = 1.9, xa = -W / 2 + .12 + Re, xb = W / 2 - .12 - Re, zc = zb + Re, yv = 2.2, r = 1.25, flat = .55, t = .08;
    // Section (d forward from the back line, y): vertical back, quarter-round roof, flat overhang.
    const L1 = yv - .08, L2 = r * Math.PI / 2, T = L1 + L2 + flat;
    const sec = w => {const s = w * T; if (s <= L1) return [0, .08 + s]; if (s <= L1 + L2) {const a = (s - L1) / r; return [r - r * Math.cos(a), yv + r * Math.sin(a)];} return [r + (s - L1 - L2), yv + r];};
    // Plan: quarter-round left end, straight back, quarter-round right end (a half capsule).
    const A = Re * Math.PI / 2, S = xb - xa, P = 2 * A + S;
    const plan = u => {
      const s = u * P;
      if (s < A) {const th = Math.PI + s / Re; return {b: [xa + Re * Math.cos(th), zc + Re * Math.sin(th)], n: [-Math.cos(th), -Math.sin(th)]};}
      if (s <= A + S) return {b: [xa + (s - A), zb], n: [0, 1]};
      const th = 1.5 * Math.PI + (s - A - S) / Re;
      return {b: [xb + Re * Math.cos(th), zc + Re * Math.sin(th)], n: [-Math.cos(th), -Math.sin(th)]};
    };
    const fn = (u, w) => {const {b, n} = plan(u), [d, y] = sec(w); return [b[0] + n[0] * d, y, b[1] + n[1] * d];};
    shell(k, 'Pod capsule shell back wall', fn, t, shellM, 56, 18, [0, 1, 1, 1]);
    const rim = [...Array.from({length: 19}, (_, i) => fn(0, i / 18)), ...Array.from({length: 57}, (_, i) => fn(i / 56, 1)), ...Array.from({length: 19}, (_, i) => fn(1, 1 - i / 18))];
    neon(k, 'Pod shell glowing rim', rim, glow, .03);
    const uAt = x => (A + (x - xa)) / P;
    for (const x of [-1.1, 0, 1.1]) {const q = fn(uAt(x), .84); Lathe(k, 'Pod ceiling light disc', [[0, 0], [.2, 0], [.2, -.025], [0, -.025]], [q[0], q[1] - .02, q[2]], m.ledWarm, 24);}
    Plane(k, 'Pod interior graphic band', S * .92, .9, [0, 1.25, zb + .004], 0, graphicMat('waves', [k.bit(2) ? '#f6f6f2' : mix(p.secondary, '#ffffff', .55), p.primary, p.accent], {w: 1024, h: 256}));
    // Lounge nests inside the rounded ends, counter at the front.
    for (const s of [-1, 1]) {tubChair(k, s * 2.55, -1.55, s * -.7, shellM === m.snow ? m.primaryMatte : m.white, m.sofa); coffeeTable(k, s * 2.0, -1.95, .46, .46, m.white, true);}
    counter(k, 'pill', 0, D * .25, 0, 2.1, 1.0, m.white, m.white, {band: m.primary, led: glow});
    for (const x of [-3.0, 3.0]) vasePlant(k, x, -.3, 1.0, m.ceramicWhite);
    setSign(k, Math.min(3.0, S - .1), .5, 0, yv + r - .07 - .25, zb + r + flat + .02, 0, {bg: '#ffffff', fg: p.primary, weight: 800, upper: true, fill: .74, name: 'pod'}, k.bit(2) ? '#ffffff' : p.primary);
    setSlots(k, {
      left: slot(k, -2.35, 1.98, .12, .45, 'stand', [-1.9, 2.02, .45, .3, 'stand']),
      middle: slot(k, 0, 1.3, zb + .08, 0, 'wall', [0, 1.36, zb + .14, 0, 'wall']),
      right: slot(k, 2.35, 1.98, .12, -.45, 'stand', [1.9, 2.02, .45, -.3, 'stand']),
      frontLeft: slot(k, -W / 2 + .95, 1.98, D * .36, .3, 'stand', [-W / 2 + 1.5, 2.02, D * .36, .22, 'stand']),
      frontRight: slot(k, W / 2 - .95, 1.98, D * .36, -.3, 'stand', [W / 2 - 1.5, 2.02, D * .36, -.22, 'stand']),
      photos: [],
      rack: [rackPos(k, -W * .2, D * .43), rackPos(k, W * .2, D * .43)]
    });
  }

  /* ================= 42 Timber Frame: post-and-beam L frame, slatted back wall, open shelving, pendant bar ================= */
  function timberFrame(k) {
    const {W, D, H, m, p} = k, post = .16, top = H - .15, beamM = k.bit(2) ? m.woodDark : m.wood, zb = -D / 2 + .2, zf = D / 2 - .3, xl = -W / 2 + .2, xr = W / 2 - .2;
    floor(k, k.bit(3) ? 'planksDark' : 'concrete', null);
    for (const [x, z] of [[xl, zb], [xr, zb], [xl, zf], [xr, zf], [0, zf]]) R(k, 'Timber upright post', [post, top, post], [x, top / 2 + .08, z], beamM, .012);
    R(k, 'Timber front beam', [W - .3, .4, .2], [0, top - .12, zf], beamM, .012);
    R(k, 'Timber rear beam', [W - .3, .26, .2], [0, top - .05, zb], beamM, .012);
    R(k, 'Timber side beam', [.2, .26, zf - zb], [xl, top - .05, (zb + zf) / 2], beamM, .012);
    for (let i = 0; i < 9; i++) R(k, 'Timber rafter', [.07, .16, zf - zb - .2], [-W / 2 + .7 + i * (W - 1.4) / 8, top + .13, (zb + zf) / 2], beamM, .01);
    // Slatted back wall with floating shelves.
    R(k, 'Slatted back wall panel', [W - .5, top - .1, .05], [0, (top - .1) / 2 + .08, zb - .02], m.dark, .005);
    for (let i = 0; i < 34; i++) R(k, 'Vertical wood slat', [.07, top - .15, .05], [-W / 2 + .38 + i * (W - .76) / 33, (top - .15) / 2 + .1, zb + .04], k.bit(1) ? m.woodLight : m.wood, .01, [0, 0, 0], 1);
    const shelfX = -W * .28;
    for (let j = 0; j < 3; j++) {
      R(k, 'Floating oak shelf', [1.6, .05, .3], [shelfX, 1.05 + j * .52, zb + .22], m.woodLight, .01);
      for (let i = 0; i < 3; i++) {
        const x = shelfX - .55 + i * .55 + (j % 2) * .1, y = 1.1 + j * .52;
        if ((i + j) % 3 === 0) Lathe(k, 'Shelf ceramic vase', [[.05, 0], [.09, .03], [.1, .14], [.05, .24], [.06, .27], [0, .27]], [x, y, zb + .22], i % 2 ? m.ceramicBlack : m.ceramicWhite, 16);
        else if ((i + j) % 3 === 1) for (let b = 0; b < 4; b++) R(k, 'Shelf book', [.04, .2 + .03 * (b % 2), .18], [x - .08 + b * .05, y + .11, zb + .22], [m.primary, m.accent, m.white, m.secondary][b], .004, [0, 0, 0], 1);
        else potPlant(k, x, zb + .22, .32, m.terracotta, 0);
      }
    }
    const sideL = Math.max(2.7, 2 * k.tvHalf + .2);
    R(k, 'Slatted side wall', [.06, top - .2, sideL], [xl + .03, (top - .2) / 2 + .1, zb + .1 + sideL / 2], k.bit(1) ? m.woodLight : m.wood, .01);
    // Pendant bar along the front beam.
    counter(k, 'box', W * .12, D * .22, 0, 2.5, .62, m.wood, m.dark, {band: m.primary});
    for (const dx of [-.8, 0, .8]) pendant(k, W * .12 + dx, D * .22, top - .18, 2.2, .2, k.bit(1) ? m.primary : m.ceramicBlack, k.v % 3 === 1 ? 'cylinder' : 'dome');
    for (const x of [-.6, .6]) Rod(k, 'Pendant cross rail', [W * .12 + x * 1.6, top - .18, D * .22], [W * .12 + x * 1.6, top - .18, zf], .012, m.dark);
    R(k, 'Pendant rail', [2.4, .05, .05], [W * .12, top - .18, D * .22], m.dark, .01);
    for (const dx of [-.85, 0, .85]) stool(k, W * .12 + dx, D * .22 + .62, m.leather, 2, .7, Math.PI);
    // Lounge corner.
    rug(k, -W * .26, -D * .06, 1.05, finished('fabric', mix(p.secondary, '#ffffff', .25)));
    for (const s of [-1, 1]) armchair(k, -W * .26 + s * .78, -D * .06 + .05, -s * (Math.PI / 2 - .35), m.sofa, beamM);
    coffeeTable(k, -W * .26, -D * .06, .6, .6, m.woodLight, true);
    potPlant(k, W / 2 - .6, -D * .28, 1.1, m.ceramicWhite, 0);
    setSign(k, W * .5, .32, -W * .12, top - .12, zf + .1 + .025, 0, {bg: mix(k.woodColor, '#2b1d14', k.bit(2) ? .45 : 0), fg: '#ffffff', upper: true, weight: 800, fill: .82, name: 'beam'}, null);
    setSlots(k, {
      left: slot(k, xl + .06 + .08, 1.7, zb + 1.9, Math.PI / 2, 'wall', [xl + .06 + .14, 1.75, zb + .16 + k.tvHalf, Math.PI / 2, 'wall']),
      middle: slot(k, -W * .01, 1.7, zb + .07 + .08, 0, 'wall', [W * .05, 1.8, zb + .07 + .14, 0, 'wall']),
      right: slot(k, W * .33, 1.7, zb + .07 + .08, 0, 'wall', [W * .27, 1.8, zb + .07 + .14, 0, 'wall']),
      frontLeft: slot(k, -W / 2 + .95, 1.98, D * .33, .3, 'stand', [-W / 2 + 1.5, 2.02, D * .3, .22, 'stand']),
      frontRight: slot(k, W / 2 - .6, 1.98, D * .3, -.4, 'stand', [W / 2 - 1.45, 2.02, D * .06, -.15, 'stand']),
      photos: [photoPose(k, xl + .06 + .12, 1.8, zb + .6, Math.PI / 2, 'wall'), photoPose(k, W / 2 - .4, 1.8, -D * .18, -Math.PI / 2)],
      rack: [rackPos(k, -W * .12, D * .43), rackPos(k, W * .4, D * .43)]
    });
  }

  /* ================= 43 Container Hub: cut-open shipping container, rooftop deck and railing, pallet furniture ================= */
  function containerHub(k) {
    const {W, D, H, m, p} = k, cl = W * .74, cd = 2.1, ch = 2.5, cx = -W / 2 + .1 + cl / 2, zb = -D / 2 + .08, cz = zb + cd / 2, boxM = m.corrugated, frameM = k.bit(2) ? m.dark : m.trimMatte;
    floor(k, 'concrete', null);
    for (const [w, d, x, z] of [[W - .1, .1, 0, D / 2 - .06], [.1, D - .1, W / 2 - .06, 0], [.1, D - .1, -W / 2 + .06, 0]]) B(k, 'Hazard floor edge', [w, .012, d], [x, .087, z], graphicMat('hazard', ['#1b1b1b', '#f2c200'], {w: 512, h: 64}));
    // Container shell: back, roof, two end walls (one with open doors), corner posts and rails.
    R(k, 'Container corrugated back wall', [cl, ch, .06], [cx, ch / 2 + .08, zb + .03], boxM, .01);
    R(k, 'Container roof deck', [cl, .08, cd], [cx, ch + .12, cz], frameM, .01);
    R(k, 'Container end side wall', [.06, ch, cd], [cx - cl / 2 + .03, ch / 2 + .08, cz], boxM, .01);
    R(k, 'Container door side wall', [.06, ch, cd * .45], [cx + cl / 2 - .03, ch / 2 + .08, zb + cd * .225], boxM, .01);
    const hinge = [cx + cl / 2, zb + cd - .05];
    R(k, 'Container open door leaf', [.9, ch - .1, .05], [hinge[0] + .47 * Math.cos(.35), ch / 2 + .1, hinge[1] + .47 * Math.sin(.35)], boxM, .01, [0, -.35, 0]);
    for (const x of [cx - cl / 2, cx + cl / 2]) for (const [z, s] of [[zb, 1], [zb + cd, -1]]) {R(k, 'Container corner upright post', [.14, ch + .16, .14], [x + (x < cx ? .07 : -.07), (ch + .16) / 2 + .08, z + s * .07], frameM, .01); R(k, 'Container corner casting', [.18, .12, .18], [x + (x < cx ? .09 : -.09), ch + .2, z + s * .09], frameM, .01);}
    R(k, 'Container bottom front rail', [cl, .16, .14], [cx, .16, zb + cd - .07], frameM, .01);
    R(k, 'Container top front rail', [cl, .18, .14], [cx, ch + .02, zb + cd - .07], frameM, .01);
    B(k, 'Container interior lining back wall', [cl - .2, ch - .2, .02], [cx, ch / 2 + .08, zb + .07], k.bit(1) ? m.woodLight : m.white);
    for (let i = 0; i < 4; i++) ledLine(k, 'Container interior LED batten', [cx - cl / 2 + .5 + i * (cl - 1) / 3, ch - .02, zb + .3], [cx - cl / 2 + .5 + i * (cl - 1) / 3, ch - .02, zb + cd - .3], m.ledCool, .018);
    // Roof deck railing with the sign.
    const ry = ch + .16;
    for (const x of [cx - cl / 2 + .12, cx + cl / 2 - .12]) R(k, 'Roof railing upright post', [.06, .9, .06], [x, ry + .45, zb + cd - .12], m.steel, .01);
    R(k, 'Roof railing top rail', [cl - .2, .06, .06], [cx, ry + .9, zb + cd - .12], m.steel, .01);
    R(k, 'Rooftop sign panel', [cl * .7, .62, .05], [cx, ry + .45, zb + cd - .12], m.dark, .01);
    for (const x of [cx - cl * .3, cx + cl * .3]) potPlant(k, x, zb + cd * .45, .7, m.ceramicBlack, 0);
    // Counter inside the container mouth, cable-reel tables and pallet seating outside.
    counter(k, 'box', cx - cl * .12, zb + cd - .5, 0, 2.2, .58, graphicMat('boards', [k.woodColor, mix(k.woodColor, '#3a2618', .3)], {w: 512, h: 256}), m.dark, {band: m.accent});
    for (let i = 0; i < 2; i++) {
      const px = W * .22 + i * 1.1, pz = D * .28;
      for (let j = 0; j < 2; j++) R(k, 'Pallet chair seat stack', [.9, .12, .7], [px, .14 + j * .13, pz], m.woodLight, .01);
      R(k, 'Pallet cushion chair cushion', [.84, .08, .64], [px, .38, pz], m.cushion, .03);
    }
    const rx = W * .38, rz = -D * .02;
    Lathe(k, 'Cable reel table flange', [[0, 0], [.46, 0], [.46, .05], [0, .05]], [rx, .1, rz], m.woodLight, 24);
    Lathe(k, 'Cable reel table flange', [[0, 0], [.46, 0], [.46, .05], [0, .05]], [rx, .7, rz], m.woodLight, 24);
    Lathe(k, 'Cable reel upright drum', [[.2, 0], [.2, .6]], [rx, .12, rz], m.woodDark, 20);
    for (const a of [2.2, 4.0]) stool(k, rx + Math.cos(a) * .7, rz + Math.sin(a) * .7, m.accent, 2, .6, Math.atan2(-Math.cos(a), -Math.sin(a)));
    cone(k, W / 2 - .35, D / 2 - .35, finished('paint', '#ff6a13'));
    hardHat(k, cx + cl * .2, 1.03, zb + cd - .5, finished('paint', '#f2c200'));
    setSign(k, cl * .66, .56, cx, ry + .45, zb + cd - .12 + .025 + .025, 0, {bg: k.bit(2) ? '#15171a' : p.trim, fg: '#ffffff', upper: true, weight: 900, fill: .78, name: 'container'}, null);
    setSlots(k, {
      left: slot(k, cx - cl * .3, 1.6, zb + .08 + .08, 0, 'wall', [cx - cl / 2 + .14 + k.tvHalf, 1.5, zb + .08 + .14, 0, 'wall']),
      middle: slot(k, cx + cl * .2, 1.6, zb + .08 + .08, 0, 'wall', [cx + cl * .2, 1.5, zb + .08 + .14, 0, 'wall']),
      right: slot(k, W / 2 - .62, 1.98, -D * .26, -.5, 'stand', [W / 2 - 1.1, 2.02, -D * .12, -.9, 'stand']),
      frontLeft: slot(k, -W / 2 + .9, 1.98, D * .35, .3, 'stand', [-W / 2 + 1.5, 2.02, D * .36, .15, 'stand']),
      frontRight: slot(k, W / 2 - .45, 1.98, D * .12, -.6, 'stand', [W / 2 - 1.5, 2.02, D * .12, -.25, 'stand']),
      photos: [photoPose(k, cx - cl / 2 + .12, 1.8, zb + cd * .5, Math.PI / 2, 'wall'), photoPose(k, W / 2 - .4, 1.8, D * .34, -Math.PI / 2)],
      rack: [rackPos(k, -W * .18, D * .43), rackPos(k, W * .06, D * .43)]
    });
  }

  /* ================= 44 Farm Stand: red barn gable wall, lean-to plank awning, straw bales and produce crates ================= */
  function farmStand(k) {
    const {W, D, H, m, p} = k, zb = -D / 2 + .15, barn = k.bit(2) ? finished('boards', p.primary) : finished('boards', '#9e2b25'), trimW = m.white;
    floor(k, k.bit(3) ? 'planksDark' : 'straw', null);
    const bw = W * .62, eave = 2.55, ridge = 3.62, bx = -W * .16;
    slab(k, 'Barn gable back wall', [[-bw / 2, .08], [bw / 2, .08], [bw / 2, eave], [0, ridge], [-bw / 2, eave]], -.08, .08, barn, [bx, zb, 0], {smooth: 0});
    // White trim on the gable and X-braced barn doors.
    for (const [a, b] of [[[-bw / 2 - .05, eave - .04], [0, ridge + .04]], [[0, ridge + .04], [bw / 2 + .05, eave - .04]]]) {
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], len = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      R(k, 'Barn roof edge trim', [len + .1, .14, .2], [bx + mid[0], mid[1], zb + .02], trimW, .02, [0, 0, ang]);
    }
    const dw = 1.5, dh = 2.1, dz = zb + .1;
    for (const s of [-1, 1]) {
      const cx = bx + s * .78;
      for (const [w, h, x, y] of [[dw * .5, .1, cx, .14 + dh], [dw * .5, .1, cx, .2], [.1, dh, cx - dw * .25 + .05, .17 + dh / 2], [.1, dh, cx + dw * .25 - .05, .17 + dh / 2]]) R(k, 'Barn door trim', [w, h, .05], [x, y, dz], trimW, .01);
      const L = Math.hypot(dw * .5 - .1, dh - .1);
      R(k, 'Barn door cross brace', [L, .09, .045], [cx, .17 + dh / 2, dz], trimW, .01, [0, 0, s * Math.atan2(dh - .1, dw * .5 - .1)]);
    }
    R(k, 'Hay loft door', [.7, .6, .05], [bx, 2.95, zb + .1], trimW, .02);
    // Lean-to awning on posts over the market counter.
    const ax = W * .12, aw = W * .34, az0 = D * .02, az1 = D * .42, ay0 = 2.45, ay1 = 2.95;
    for (const x of [ax - aw / 2 + .1, ax + aw / 2 - .1]) {R(k, 'Awning upright post', [.12, ay0 - .08, .12], [x, (ay0 - .08) / 2 + .08, az1 - .05], m.woodDark, .01); R(k, 'Awning upright rear post', [.12, ay1 - .08, .12], [x, (ay1 - .08) / 2 + .08, az0], m.woodDark, .01);}
    const slope = Math.atan2(ay1 - ay0, az1 - az0), L = Math.hypot(ay1 - ay0, az1 - az0) + .3;
    R(k, 'Plank awning roof', [aw + .1, .07, L], [ax, (ay0 + ay1) / 2 + .1, (az0 + az1) / 2], finished('boards', mix(k.woodColor, '#6b4a2a', .3)), .01, [slope, 0, 0]);
    Surf(k, 'Scalloped awning valance', (u, w) => [ax - aw / 2 + u * aw, ay0 - .05 - w * (.22 + .06 * Math.cos(u * Math.PI * 12)), az1 + .09], graphicMat('stripes', ['#ffffff', p.primary === '#ffffff' ? p.accent : p.primary, p.primary], {w: 512, h: 128}), 48, 2);
    counter(k, 'box', ax, D * .3, 0, aw - .5, .66, finished('boards', mix(k.woodColor, '#f2e2c6', .2)), m.woodDark, {band: m.primary});
    for (let i = 0; i < 3; i++) crate(k, ax - .7 + i * .7, D * .3 - .62, .42, m.woodLight, [finished('paint', '#d93a2b'), finished('paint', '#f2b705'), finished('paint', '#6a9a2b')][(i + k.v) % 3]);
    // Straw bales, chalkboard and planters.
    for (const [x, z, a] of [[-W * .38, D * .18, .1], [-W * .26, D * .28, -.2], [-W * .41, D * .38, 0]]) R(k, 'Straw bale chair seat', [.9, .42, .46], [x, .29, z], m.straw, .04, [0, a, 0]);
    const cbx = -W * .14, cbz = D * .39;
    for (const s of [-1, 1]) R(k, 'Chalkboard easel upright leg', [.05, 1.25, .05], [cbx, .7, cbz + s * .16], m.woodDark, .01, [s * .22, 0, 0]);
    R(k, 'A-frame chalkboard', [.66, .9, .03], [cbx, .9, cbz + .12], graphicMat('chalk', ['#243127', '#2e3d31'], {w: 512, h: 512}), .01, [.22, 0, 0]);
    for (const x of [bx - bw / 2 - .4, bx + bw / 2 + .35]) potPlant(k, x, zb + .45, 1.05, m.terracotta, 0);
    Lathe(k, 'Galvanized feed bucket', [[0, 0], [.15, 0], [.19, .32], [.2, .33], [0, .33]], [W * .45, .08, -D * .2], m.steel, 16);
    setSign(k, bw * .58, .5, bx, 2.95, zb + .08 + .075, 0, {bg: '#f6f1e3', fg: k.bit(2) ? p.trim : '#6d1d18', upper: true, weight: 900, fill: .74, name: 'barn'}, '#f6f1e3');
    setSlots(k, {
      left: slot(k, bx - .78, 1.2, zb + .1 + .1, 0, 'wall', [-W * .3, 2.02, -D * .05, .35, 'stand']),
      middle: slot(k, bx + .78, 1.2, zb + .1 + .1, 0, 'wall', [W * .06, 2.02, -D * .18, -.15, 'stand']),
      right: slot(k, W * .38, 1.98, -D * .28, -.25, 'stand', [W * .3, 2.02, -D * .3, -.15, 'stand']),
      frontLeft: slot(k, -W / 2 + .5, 1.98, -D * .05, .8, 'stand', [-W / 2 + 1.35, 2.02, -D * .1, .45, 'stand']),
      frontRight: slot(k, W / 2 - .6, 1.98, D * .3, -.35, 'stand', [W / 2 - 1.4, 2.02, -D * .1, -.35, 'stand']),
      photos: [photoPose(k, -W / 2 + .45, 1.8, -D * .3, Math.PI / 2), photoPose(k, W / 2 - .4, 1.8, -D * .3, -Math.PI / 2)],
      rack: [rackPos(k, -W * .3, D * .43), rackPos(k, W * .45, D * .44)]
    });
  }

  /* ================= 45 Clean Lab: white modular lab, glowing double helix, frosted glass fins, lab bench ================= */
  function cleanLab(k) {
    const {W, D, H, m, p} = k, zb = -D / 2 + .12, white = m.snow, cyan = k.bit(2) ? m.ledPrimary : m.ledCool;
    floor(k, 'white', cyan);
    Lathe(k, 'Floor inlay disc', [[0, 0], [1.3, 0], [1.3, .006], [0, .006]], [W * .1, .084, D * .1], finished('plaster', mix(p.primary, '#ffffff', .6)), 40).userData = {nonColliding: true, decorative: true};
    // Modular back wall panels with rounded corners and glowing seams.
    const pw = (W - .3) / 4;
    for (let i = 0; i < 4; i++) {
      const x = -W / 2 + .15 + pw * (i + .5), h = (k.bit(1) ? [3.3, 3.5, 3.5, 2.95] : [2.95, 3.5, 3.5, 3.3])[i];
      slab(k, 'Lab module back wall panel', roundRect(pw - .06, h, .2, 0, .08 + h / 2), -.07, .07, i === 1 ? graphicMat('molecule', ['#f7f9fb', mix(p.primary, '#ffffff', .3), p.accent], {w: 512, h: 1024}) : white, [x, zb, 0], {smooth: .8});
      if (i < 3) B(k, 'Glowing panel seam', [.03, 2.6, .03], [x + pw / 2, 1.5, zb + .02], cyan);
    }
    // Frosted glass fins at the right.
    for (let i = 0; i < 3; i++) {const z = -D * .28 + i * .7; slab(k, 'Frosted glass fin', roundRect(.9, 2.3, .12, 0, 1.25), -.012, .012, m.frosted, [W / 2 - .25, z, Math.PI / 2 + .35], {smooth: .8}); R(k, 'Glass fin upright foot', [.1, .12, .9], [W / 2 - .25, .14, z], m.chrome, .02, [0, .35, 0]);}
    // Glowing double helix.
    const hx = -W * .3, hz = -D * .05, turns = 1.6, hh = 2.9;
    for (const ph of [0, Math.PI]) neon(k, 'Double helix glowing strand', Array.from({length: 49}, (_, i) => {const t = i / 48, a = t * turns * TAU + ph; return [hx + Math.cos(a) * .36, .25 + t * hh, hz + Math.sin(a) * .36];}), ph ? m.ledAccent : cyan, .035);
    for (let i = 1; i < 12; i++) {const t = i / 12, a = t * turns * TAU; Rod(k, 'Helix base pair rung', [hx + Math.cos(a) * .34, .25 + t * hh, hz + Math.sin(a) * .34], [hx - Math.cos(a) * .34, .25 + t * hh, hz - Math.sin(a) * .34], .012, i % 2 ? m.white : m.secondary);}
    Lathe(k, 'Helix plinth upright', [[0, 0], [.55, 0], [.55, .16], [.5, .2], [0, .2]], [hx, .08, hz], m.white, 32);
    // Lab bench counter and white stools.
    counter(k, 'box', W * .04, D * .3, 0, 2.3, .66, m.white, finished('stone', '#e9eef2'), {led: cyan, band: m.primary});
    for (let i = 0; i < 2; i++) {const x = W * .04 + (i ? 1.0 : -1.0); Lathe(k, 'Lab sample flask', [[0, 0], [.1, 0], [.11, .02], [.05, .16], [.035, .26], [.04, .28], [0, .28]], [x, 1.03, D * .3 - .12], i ? mat(mix(p.accent, '#ffffff', .3), {roughness: .1, transparent: true, opacity: .6}) : m.glass, 16);}
    for (const x of [-W * .08, W * .32]) stool(k, x, D * .12, m.white, 1, .74, 0);
    const hx2 = W * .1, hz2 = D * .12, hy = 2.85;
    Ring(k, 'Suspended halo light', 1.0, 1.0, hy, [hx2, 0, hz2], .1, .05, m.white);
    Ring(k, 'Halo light glow', 1.0, 1.0, hy - .035, [hx2, 0, hz2], .06, .02, cyan);
    for (const a of [.4, 2.5, 4.6]) Rod(k, 'Halo suspension cable', [hx2 + Math.cos(a) * 1.0, hy + .02, hz2 + Math.sin(a) * 1.0], [hx2 + Math.cos(a) * .2, H + .15, hz2 + Math.sin(a) * .2], .005, m.steel);
    Lathe(k, 'Halo suspension hub', [[0, 0], [.22, 0], [.22, .05], [0, .05]], [hx2, H + .15, hz2], m.white, 20);
    potPlant(k, -W / 2 + .4, D * .34, 1.1, m.ceramicWhite, 1);
    setSign(k, pw * 1.8, .5, 0, 3.05, zb + .07 + .075, 0, {bg: '#ffffff', fg: p.primary, weight: 800, fill: .74, name: 'lab'}, '#ffffff');
    const face = zb + .07;
    setSlots(k, {
      left: slot(k, -W / 2 + .15 + pw * .5, 1.6, face + .08, 0, 'wall', [-W * .29, 1.62, face + .14, 0, 'wall']),
      middle: slot(k, 0, 1.6, face + .08, 0, 'wall', [0, 1.62, face + .14, 0, 'wall']),
      right: slot(k, W / 2 - .15 - pw * .5, 1.6, face + .08, 0, 'wall', [W * .29, 1.62, face + .14, 0, 'wall']),
      frontLeft: slot(k, -W / 2 + .95, 1.98, D * .2, .45, 'stand', [-W / 2 + 1.45, 2.02, D * .3, .22, 'stand']),
      frontRight: slot(k, W / 2 - .55, 1.98, D * .34, -.5, 'stand', [W / 2 - 1.5, 2.02, D * .3, -.2, 'stand']),
      photos: [photoPose(k, -W / 2 + .45, 1.8, -D * .2, Math.PI / 2), photoPose(k, W / 2 - .4, 1.8, D * .3, -Math.PI / 2)],
      rack: [rackPos(k, -W * .2, D * .43), rackPos(k, W * .38, D * .43)]
    });
  }

  /* ================= 46 Scaffold Works: tube-and-coupler scaffold with plank deck, wrap graphic, site props ================= */
  function scaffoldWorks(k) {
    const {W, D, H, m, p} = k, tubeM = k.bit(2) ? m.chrome : finished('powder', '#f2b705'), r = .026, zb = -D / 2 + .16, zf = zb + 1.1, deck = 1.9, xs = [-W / 2 + .2, -W / 2 + 1.85, -W / 2 + 3.5, -W / 2 + 5.15];
    floor(k, 'concrete', null);
    for (const [w, d, x, z] of [[W - .1, .1, 0, D / 2 - .06], [.1, D - .1, W / 2 - .06, 0], [.1, D - .1, -W / 2 + .06, 0]]) B(k, 'Hazard floor edge', [w, .012, d], [x, .087, z], graphicMat('hazard', ['#1b1b1b', '#f2c200'], {w: 512, h: 64}));
    B(k, 'Scaffold wrap graphic back wall', [xs[3] - xs[0] + .3, 3.35, .03], [(xs[0] + xs[3]) / 2, 3.35 / 2 + .08, zb - .1], graphicMat('blueprint', [k.bit(1) ? p.trim : '#123a63', '#ffffff', p.accent], {w: 1024, h: 512}));
    for (const x of xs) for (const z of [zb, zf]) {
      Rod(k, 'Scaffold standard upright tube', [x, .12, z], [x, 3.52, z], r, tubeM);
      R(k, 'Scaffold base jack plate', [.16, .03, .16], [x, .1, z], m.steel, .005, [0, 0, 0], 1);
    }
    for (const y of [1.0, deck, 2.45, 2.95, 3.45]) for (const z of [zb, zf]) Rod(k, 'Scaffold ledger tube', [xs[0] - .08, y, z], [xs[3] + .08, y, z], r * .9, tubeM);
    for (const x of xs) for (const y of [1.0, deck, 3.45]) Rod(k, 'Scaffold transom tube', [x, y, zb - .06], [x, y, zf + .06], r * .9, tubeM);
    for (let i = 0; i < 3; i++) Rod(k, 'Scaffold diagonal brace', [xs[i], .2, zb - .045], [xs[i + 1], deck - .05, zb - .045], r * .8, tubeM);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) R(k, 'Scaffold plank deck', [1.6, .05, .2], [(xs[i] + xs[i + 1]) / 2, deck + .05, zb + .12 + j * .215], finished('boards', mix(k.woodColor, '#d8c49a', .3)), .005, [0, 0, 0], 1);
    B(k, 'Hazard toe board', [xs[3] - xs[0], .15, .025], [(xs[0] + xs[3]) / 2, deck + .16, zf + .04], graphicMat('hazard', [p.accent === '#ffffff' ? '#f2c200' : p.accent, '#17191c'], {w: 1024, h: 64}));
    // Ladder to the deck in the right bay.
    const lx = xs[3] - .45;
    for (const s of [-1, 1]) Rod(k, 'Ladder stile', [lx + s * .2, .1, zf + .26], [lx + s * .2, deck + .9, zf + .02], .02, m.steel);
    for (let i = 1; i < 8; i++) {const t = i / 8; Rod(k, 'Ladder rung', [lx - .2, .1 + t * (deck + .8), zf + .26 - t * .24], [lx + .2, .1 + t * (deck + .8), zf + .26 - t * .24], .014, m.steel);}
    // Deck props: stacked materials, a bucket and hard hats.
    for (let i = 0; i < 3; i++) R(k, 'Deck brick stack', [.36, .2, .2], [xs[0] + .6 + i * .45, deck + .19, zb + .4], finished('stone', ['#b0553a', '#9c4a33', '#b86447'][i]), .01);
    // Work counter, barrier, cones and toolbox.
    counter(k, 'box', W * .08, D * .3, 0, 2.1, .66, finished('boards', mix(k.woodColor, '#e2c998', .35)), m.dark, {band: graphicMat('hazard', ['#17191c', '#f2c200'], {w: 512, h: 64})});
    for (const s of [-1, 1]) hardHat(k, W * .08 + s * .86, 1.03, D * .3, finished('paint', [p.accent, '#f2c200', '#ffffff'][(k.v + (s > 0 ? 1 : 0)) % 3]));
    const bxx = W * .33, bzz = -D * .33;
    for (const s of [-1, 1]) for (const t of [-1, 1]) Rod(k, 'Barrier upright leg', [bxx + s * .6, .1, bzz + t * .22], [bxx + s * .6, 1.0, bzz], .02, m.dark);
    R(k, 'Site barrier board', [1.4, .22, .04], [bxx, .92, bzz + .03], graphicMat('hazard', ['#ffffff', '#d6283c'], {w: 512, h: 64}), .01);
    for (const [x, z] of [[W / 2 - .35, D * .12], [-W * .02, D / 2 - .3]]) cone(k, x, z, finished('paint', '#ff6a13'));
    R(k, 'Red toolbox upright chest', [.62, .5, .38], [W * .3, .33, -D * .44], finished('paint', '#c9282d'), .03);
    for (let i = 0; i < 3; i++) R(k, 'Toolbox drawer line', [.56, .012, .005], [W * .3, .22 + i * .13, -D * .44 + .19], m.chrome, .003, [0, 0, 0], 1);
    potPlant(k, -W / 2 + .45, D * .34, .9, m.concrete, 0);
    setSign(k, xs[2] - xs[0] + .2, .6, (xs[0] + xs[2]) / 2, 2.7, zf + .1, 0, {bg: k.bit(1) ? p.primary : '#f2c200', fg: k.bit(1) ? ink(p.primary) : '#17191c', upper: true, weight: 900, fill: .78, name: 'scaffold'}, k.bit(1) ? p.primary : '#f2c200');
    setSlots(k, {
      left: slot(k, (xs[0] + xs[1]) / 2, 1.05, zf + .07, 0, 'wall', [-W * .3, 2.02, D * .02, .25, 'stand']),
      middle: slot(k, (xs[1] + xs[2]) / 2, 1.05, zf + .07, 0, 'wall', [xs[2], 1.12, zf + .17, 0, 'wall']),
      right: slot(k, W * .42, 1.98, -D * .12, -.5, 'stand', [W / 2 - 1.3, 2.02, -D * .02, -.25, 'stand']),
      frontLeft: slot(k, -W / 2 + .95, 1.98, D * .2, .35, 'stand', [-W / 2 + 1.5, 2.02, D * .24, .2, 'stand']),
      frontRight: slot(k, W / 2 - .7, 1.98, D * .3, -.35, 'stand', [W / 2 - 1.5, 2.02, D * .38, -.15, 'stand']),
      photos: [photoPose(k, -W / 2 + .45, 1.8, -D * .02, Math.PI / 2), photoPose(k, W / 2 - .4, 1.8, -D * .3, -Math.PI / 2)],
      rack: [rackPos(k, -W * .2, D * .43), rackPos(k, W * .43, D * .43)]
    });
  }

  /* ================= 47 Neon Arcade: black box with neon tube art, pixel wall, arcade cabinets, racing seats ================= */
  function neonArcade(k) {
    const {W, D, H, m, p} = k, zb = -D / 2 + .1, h = H - .1, black = k.bit(2) ? finished('plaster', mix(p.trim, '#000000', .35)) : finished('plaster', '#141519'), n1 = m.ledPrimary, n2 = m.ledAccent;
    floor(k, 'dark', n1);
    for (let i = 1; i < 6; i++) {const z = -D / 2 + i * D / 6; B(k, 'Floor neon grid line', [W * .8, .006, .025], [0, .083, z], i % 2 ? n1 : n2).userData = {nonColliding: true, decorative: true};}
    R(k, 'Black box back wall', [W - .02, h, .2], [0, h / 2 + .08, zb], black, .01);
    const sx = -W / 2 + .1, sd = D * .66;
    R(k, 'Black box side wall', [sd, h, .2], [sx, h / 2 + .08, -D / 2 + sd / 2 + .01], black, .01, [0, Math.PI / 2, 0]);
    R(k, 'Neon wall cap', [W - .02, .05, .2], [0, h + .105, zb], m.dark, .01);
    const face = zb + .1;
    // Neon art on the back wall: triangle (top left), ring (top right) and a zigzag baseboard.
    neon(k, 'Neon triangle tube', [[-W / 2 + .8, 2.45], [-W / 2 + 1.2, 3.45], [-W / 2 + 1.6, 2.45], [-W / 2 + .8, 2.45]].map(([x, y]) => [x, y, face + .05]), n2, .025);
    const ring = Ring(k, 'Neon ring tube', .42, .42, 0, [0, 0, 0], .05, .05, n1);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(k.X(W / 2 - 1.35), 2.98, face + .05);
    neon(k, 'Neon zigzag baseboard', Array.from({length: Math.round((W - 2.35) / .19) + 1}, (_, i) => [-W / 2 + .3 + i * .19, .3 + (i % 2) * .16, face + .04]), n2, .018);
    // Pixel wall panel on the right.
    const pxl = W / 2 - 1.1;
    B(k, 'Pixel LED wall frame', [1.9, 1.95, .08], [pxl, 1.45, face + .04], m.gloss);
    B(k, 'Pixel LED wall', [1.8, 1.85, .02], [pxl, 1.45, face + .09], lightbox(k, ['#0b0c10', p.primary, p.accent, p.secondary], 'pixels', .45, 1024, 1024));
    // Arcade cabinets along the side wall.
    for (let i = 0; i < 2; i++) {
      const cz = -1.9 + i * .78, cx = sx + .5, f = frame(k, cx, cz, Math.PI / 2);
      f.round('Arcade cabinet upright body', [.66, 1.75, .6], [0, .96, -.05], black, .02);
      f.round('Arcade cabinet side art', [.68, 1.6, .5], [0, .9, -.08], graphicMat('diagonal', [p.primary, p.accent, '#0b0c10'], {w: 256, h: 512}), .02);
      f.round('Arcade control deck', [.62, .1, .34], [0, 1.02, .28], m.dark, .02);
      f.round('Arcade screen bezel', [.56, .5, .05], [0, 1.4, .24], m.gloss, .01);
      f.round('Arcade glowing screen', [.5, .42, .02], [0, 1.4, .27], lightbox(k, ['#05060a', p.primary, p.accent, '#ffffff'], 'grid', .5, 256, 256), .005, 1);
      f.round('Arcade marquee light', [.62, .2, .1], [0, 1.83, .12], i ? n1 : n2, .02);
      for (const s of [-1, 1]) f.cyl('Arcade button', .03, .03, .03, [s * .1, 1.08, .3], s > 0 ? n1 : n2, 10);
    }
    // Racing seats and a neon-edged angular counter.
    for (const [x, z, a] of [[W * .06, -D * .04, -.25], [W * .24, D * .02, -.6]]) {
      const f = frame(k, x, z, a), c = k.bit(1) ? m.accent : m.primary;
      f.round('Racing seat chair seat', [.52, .12, .5], [0, .5, 0], m.dark, .04);
      f.round('Racing seat upright back', [.54, .8, .12], [0, .95, -.26], m.dark, .05);
      for (const s of [-1, 1]) {f.round('Racing seat colour bolster', [.08, .7, .14], [s * .25, .95, -.22], c, .04); f.round('Racing seat colour bolster', [.08, .12, .46], [s * .25, .58, 0], c, .04);}
      f.rod('Racing seat gas lift', [0, .12, 0], [0, .46, 0], .03, m.chrome);
      for (let i = 0; i < 5; i++) {const an = i / 5 * TAU; f.rod('Racing seat base spoke', [0, .13, 0], [Math.cos(an) * .3, .1, Math.sin(an) * .3], .018, m.dark);}
      shadow(k, x, z, .8, .8);
    }
    counter(k, 'box', -W * .06, D * .3, 0, 2.0, .6, black, m.gloss, {led: n1});
    neon(k, 'Counter neon edge', [[-W * .06 - .96, .86, D * .3 + .318], [-W * .06 + .96, .86, D * .3 + .318]], n2, .016);
    // Hanging neon triangle over the play zone.
    const hx = W * .15, hz = D * .05, hy = 3.05;
    neon(k, 'Hanging neon triangle', [[hx - .9, hy, hz], [hx + .9, hy, hz], [hx, hy, hz + 1.3], [hx - .9, hy, hz]], k.bit(3) ? n2 : n1, .035);
    for (const [x, z] of [[hx - .9, hz], [hx + .9, hz], [hx, hz + 1.3]]) Rod(k, 'Neon triangle cable', [x, hy, z], [x, H + .35, z], .004, m.steel);
    potPlant(k, W / 2 - .4, D * .36, 1.1, m.ceramicBlack, 1);
    setSign(k, 3.1 * W / 7.2, .5, -.3 * W / 7.2, 3.2, face + .075, 0, {bg: '#0b0c10', fg: mix(p.accent, '#ffffff', .4), glow: p.accent, upper: true, weight: 900, fill: .7, name: 'neon'}, '#0b0c10');
    setSlots(k, {
      left: slot(k, sx + .18, 1.9, .1, Math.PI / 2, 'wall', [sx + .24, 2.78, -D / 2 + .26 + k.tvHalf, Math.PI / 2, 'wall']),
      middle: slot(k, -W * .125, 1.6, face + .08, 0, 'wall', [-W * .125, 1.62, face + .14, 0, 'wall']),
      right: slot(k, pxl, 1.45, face + .1 + .08, 0, 'wall', [W / 2 - 1.4, 1.42, face + .1 + .14, 0, 'wall']),
      frontLeft: slot(k, -W / 2 + .6, 1.98, D * .36, .45, 'stand', [-W / 2 + 1.5, 2.02, D * .33, .2, 'stand']),
      frontRight: slot(k, W / 2 - .95, 1.98, D * .3, -.3, 'stand', [W / 2 - 1.5, 2.02, D * .3, -.22, 'stand']),
      photos: [photoPose(k, sx + .22, 1.8, D * .08, Math.PI / 2, 'wall'), photoPose(k, W / 2 - .5, 1.8, -D * .05, -Math.PI / 2)],
      rack: [rackPos(k, -W * .36, D * .43), rackPos(k, W * .12, D * .43)]
    });
  }

  /* ================= 48 Amphitheater: curved timber seating tiers facing the aisle, brand wall, presenter lectern ================= */
  function amphitheater(k) {
    const {W, D, H, m, p} = k, zb = -D / 2 + .1, s = D / 5.2, cz = D / 2 + 2.4 * s, lim = Math.min(W / 2 - .7, Math.sqrt(Math.pow(5.12 * s, 2) - Math.pow(cz - .8 * s, 2))), tierM = k.bit(2) ? m.planksDark : m.planks;
    floor(k, k.pick(['carpet', 'planks', 'terrazzo', 'dark']), null);
    R(k, 'Presentation back wall', [W - .02, H + .05, .2], [0, (H + .05) / 2 + .08, zb], k.bit(1) ? graphicMat('circles', [p.primary, mix(p.primary, '#ffffff', .2), p.accent, p.secondary], {w: 1024, h: 512}) : graphicMat('dots', [p.trim, p.primary, p.accent], {w: 1024, h: 512}), .02);
    R(k, 'Back wall cap', [W - .02, .05, .2], [0, H + .155, zb], m.white, .01);
    const tiers = [[5.12 * s, 5.72 * s, .5], [5.72 * s, 6.32 * s, .92], [6.32 * s, 6.92 * s, 1.34]];
    tiers.forEach(([r0, r1, top], i) => {
      const a = Math.asin(Math.min(.98, lim / r1)), a0 = -Math.PI / 2 - a, a1 = -Math.PI / 2 + a;
      prism(k, 'Curved seating tier chair seat', sector(r0, r1, a0, a1, 28, 0, cz), .08, top, tierM, {smooth: .3});
      prism(k, 'Tier cushion strip', sector(r0 + .06, r0 + .46, a0 + .01, a1 - .01, 28, 0, cz), top, top + .05, [m.primaryMatte, m.secondary, m.primaryMatte][i], {smooth: .3});
      Ring(k, 'Tier LED nosing', r0 + .01, r0 + .01, top - .06, [0, 0, cz], .02, .02, m.ledWarm, a0, a1 - a0);
    });
    // Presenter lectern and counter at the front.
    const lf = frame(k, -W * .3, D * .3, .35);
    lf.round('Lectern upright body', [.6, 1.05, .45], [0, .6, 0], m.primary, .03);
    lf.round('Lectern sloped top', [.66, .04, .5], [0, 1.15, .02], m.white, .01);
    lf.rod('Lectern microphone', [0, 1.17, -.1], [0, 1.4, .08], .008, m.dark);
    counter(k, 'box', W * .2, D * .33, 0, 2.0, .6, m.white, tierM, {band: m.primary, led: m.ledWarm});
    for (const x of [-W * .08, W * .02]) spotArm(k, x, H + .1, zb + .1, 0, .5, .02);
    setSign(k, W * .52, .62, 0, H - .28, zb + .1 + .075, 0, {bg: '#ffffff', fg: p.primary, weight: 900, fill: .76, upper: true, name: 'arena'}, '#ffffff');
    const face = zb + .1;
    setSlots(k, {
      left: slot(k, -W * .31, 2.2, face + .08, 0, 'wall', [-W * .27, 2.18, face + .14, 0, 'wall']),
      middle: slot(k, 0, 2.2, face + .08, 0, 'wall', [0, 2.18, face + .14, 0, 'wall']),
      right: slot(k, W * .31, 2.2, face + .08, 0, 'wall', [W * .27, 2.18, face + .14, 0, 'wall']),
      frontLeft: slot(k, -W / 2 + .5, 1.98, D * .38, .5, 'stand', [-W / 2 + 1.5, 2.02, D * .4, .1, 'stand']),
      frontRight: slot(k, W / 2 - .45, 1.98, D * .2, -.6, 'stand', [W / 2 - 1.5, 2.02, D * .2, -.3, 'stand']),
      photos: [photoPose(k, -W / 2 + .4, 1.8, D * .12, Math.PI / 2), photoPose(k, W / 2 - .4, 1.8, D * .38, -Math.PI / 2)],
      rack: [rackPos(k, -W * .06, D * .43), rackPos(k, W * .41, D * .43)]
    });
  }

  /* ================= 49 Kiosk Island: graphic totem, flying ring header on spokes, crescent counter, lounge ring ================= */
  function kioskIsland(k) {
    const {W, D, H, m, p} = k, tz = -D * .06, ts = 1.2, th = H - .05, ringR = 2.15, ry = H + .02;
    floor(k, k.pick(['carpet', 'terrazzo', 'planks', 'white']), null);
    Lathe(k, 'Round platform inlay', [[0, 0], [2.2, 0], [2.2, .008], [0, .008]], [0, .082, tz], finished('plaster', mix(p.primary, '#ffffff', .2)), 48).userData = {nonColliding: true, decorative: true};
    Ring(k, 'Platform inlay LED ring', 2.2, 2.2, .09, [0, 0, tz], .03, .012, m.ledPrimary);
    R(k, 'Graphic totem upright', [ts, th, ts], [0, th / 2 + .08, tz], graphicMat(k.bit(2) ? 'hexes' : 'blocks', [p.primary, mix(p.primary, '#ffffff', .25), p.accent, p.secondary], {w: 512, h: 1024}), .04);
    R(k, 'Totem cap', [ts + .1, .12, ts + .1], [0, th + .14, tz], m.white, .03);
    Ring(k, 'Flying ring header', ringR, ringR, ry, [0, 0, tz], .26, .34, m.white);
    Ring(k, 'Ring header colour band', ringR + .13, ringR + .13, ry, [0, 0, tz], .01, .3, m.primary);
    Ring(k, 'Ring header LED underside', ringR, ringR, ry - .18, [0, 0, tz], .12, .02, m.ledPrimary);
    for (let i = 0; i < 4; i++) {const a = i / 4 * TAU + Math.PI / 4; Rod(k, 'Ring header spoke', [Math.cos(a) * .6, th + .1, tz + Math.sin(a) * .6], [Math.cos(a) * (ringR - .1), ry + .05, tz + Math.sin(a) * (ringR - .1)], .03, m.white);}
    studioMesh(k.root, 'Information pod counter body', studioPlanBody(2.3, .72, .89, 'crescent'), m.white, [0, .52, tz + 1.35]);
    studioMesh(k.root, 'Information pod counter top', studioPlanBody(2.42, .84, .06, 'crescent'), m.primary, [0, .98, tz + 1.35]);
    studioMesh(k.root, 'Counter LED toe reveal', studioPlanBody(2.24, .66, .03, 'crescent'), m.ledPrimary, [0, .12, tz + 1.35]);
    shadow(k, 0, tz + 1.35, 2.8, 1.2);
    for (const [x, z, a] of [[-W * .38, -D * .3, .5], [W * .38, -D * .3, -.5], [-W * .4, D * .12, 1.6], [W * .4, D * .12, -1.6]]) loungeChair(k, x, z, a, k.bit(1) ? m.primary : m.secondary, m.chrome);
    for (const [x, z] of [[-W / 2 + .4, -D / 2 + .4], [W / 2 - .4, -D / 2 + .4]]) vasePlant(k, x, z, 1.3, m.ceramicWhite);
    for (const x of [-W * .41, W * .41]) coffeeTable(k, x, -D * .1, .5, .5, m.white, true);
    // Sign band hung from the front of the ring.
    const sw = 3.0, sz = tz + ringR + .22;
    for (const x of [-sw * .35, sw * .35]) Rod(k, 'Sign band bracket', [x, ry + .05, sz - .1], [x, ry + .05, tz + Math.sqrt(ringR * ringR - x * x)], .02, m.white);
    setSign(k, sw, .56, 0, ry + .05, sz, 0, {bg: p.primary, fg: ink(p.primary), upper: true, weight: 900, fill: .76, name: 'ring'}, p.primary);
    const face = tz + ts / 2;
    setSlots(k, {
      left: slot(k, -ts / 2 - .08, 1.55, tz, -Math.PI / 2, 'wall', [-ts / 2 - .14, 1.62, tz, -Math.PI / 2, 'wall']),
      middle: slot(k, 0, 1.6, face + .08, 0, 'wall', [0, 1.9, face + .14, 0, 'wall']),
      right: slot(k, ts / 2 + .08, 1.55, tz, Math.PI / 2, 'wall', [ts / 2 + .14, 1.62, tz, Math.PI / 2, 'wall']),
      frontLeft: slot(k, -W / 2 + .7, 1.98, D * .36, .35, 'stand', [-W / 2 + 1.5, 2.02, D * .38, .15, 'stand']),
      frontRight: slot(k, W / 2 - .7, 1.98, D * .36, -.35, 'stand', [W / 2 - 1.5, 2.02, D * .38, -.15, 'stand']),
      photos: [photoPose(k, -W / 2 + .45, 1.8, -D * .08, Math.PI / 2), photoPose(k, W / 2 - .45, 1.8, -D * .08, -Math.PI / 2)],
      rack: [rackPos(k, -W * .26, D * .43), rackPos(k, W * .26, D * .43)]
    });
  }

  /* ================= 50 Folded Ribbon: one folded plate forms legs and a zigzag roof, lit fold lines ================= */
  function foldedRibbon(k) {
    const {W, D, H, m, p} = k, zb = -D / 2 + .08, z0 = -D / 2 + .3, z1 = k.bit(2) ? D * .08 : -D * .1, t = .14;
    floor(k, k.pick(['terrazzo', 'dark', 'planks', 'white']), null);
    R(k, 'Ribbon backdrop back wall', [W - .3, 2.62, .08], [0, 1.39, zb], k.bit(1) ? m.snow : m.trimMatte, .01);
    const x0 = -W / 2 + .15, x1 = W / 2 - .15, pts = [[x0 + t / 2, .08], [x0 + t / 2, 2.35], [-1.9, 3.42], [-.45, 2.72], [1.05, 3.5], [2.35, 2.66], [x1 - t / 2, 3.18], [x1 - t / 2, .08]];
    slab(k, 'Folded ribbon side wall', thickLine(pts, t), z0, z1, k.bit(1) ? m.primary : finished('paint', mix(p.primary, '#ffffff', .1)), [0, 0, 0], {smooth: .2});
    for (const z of [z1 + .012, z0 - .012]) neon(k, 'Ribbon fold light line', pts.map(([x, y], i) => [x, y - (i > 0 && i < pts.length - 1 ? t / 2 + .005 : 0), z]), m.ledAccent, .014);
    // Colour fins hanging from the lower folds.
    for (const [x, y] of [[-1.9, 3.42], [1.05, 3.5]]) for (let i = 0; i < 3; i++) R(k, 'Ribbon hanging fin', [.04, .36 + i * .1, (z1 - z0) * .7], [x - .22 + i * .22, y - .07 - (.36 + i * .1) / 2 - .02, (z0 + z1) / 2], [m.accent, m.white, m.secondary][i], .01);
    counter(k, 'wedge', W * .12, D * .3, 0, 2.2, .66, m.primary, m.white, {band: m.accent, led: m.ledAccent});
    for (const [x, z, s] of [[-W * .2, D * .1, .44], [-W * .3, D * .2, .38], [-W * .1, D * .22, .4]]) prism(k, 'Folded hexagon stool chair seat', regular(6, s / 2, x, z, .3), .08, .5, [m.accent, m.primaryMatte, m.white][Math.round(s * 10) % 3], {smooth: 0});
    coffeeTable(k, -W * .24, D * .02, .6, .6, m.white, true);
    for (const x of [-W * .08, W * .3]) vasePlant(k, x, -D * .3, 1.2, m.ceramicWhite);
    setSign(k, 2.5, .5, 1.05 - 1.3, 2.36, zb + .04 + .075, 0, {bg: k.bit(1) ? '#ffffff' : p.trim, fg: k.bit(1) ? p.primary : '#ffffff', weight: 800, upper: true, fill: .78, name: 'ribbon'}, k.bit(1) ? '#ffffff' : p.trim);
    const face = zb + .04;
    setSlots(k, {
      left: slot(k, -W * .33, 1.25, face + .08, 0, 'wall', [-W * .27, 1.3, face + .14, 0, 'wall']),
      middle: slot(k, 0, 1.25, face + .08, 0, 'wall', [0, 1.3, face + .14, 0, 'wall']),
      right: slot(k, W * .33, 1.25, face + .08, 0, 'wall', [W * .27, 1.3, face + .14, 0, 'wall']),
      frontLeft: slot(k, -W / 2 + .6, 1.98, D * .36, .4, 'stand', [-W / 2 + 1.5, 2.02, D * .36, .2, 'stand']),
      frontRight: slot(k, W / 2 - .75, 1.98, D * .2, -.5, 'stand', [W / 2 - 1.5, 2.02, D * .08, -.25, 'stand']),
      photos: [photoPose(k, -W / 2 + .5, 1.8, D * .3, Math.PI / 2), photoPose(k, W / 2 - .4, 1.8, D * .34, -Math.PI / 2)],
      rack: [rackPos(k, -W * .4, D * .43), rackPos(k, W * .38, D * .43)]
    });
  }

  /* ================= 51 Arch Tunnel: receding rib arches in a colour gradient, portal sign, glowing end wall ================= */
  function archTunnel(k) {
    const {W, D, H, m, p} = k, zb = -D / 2 + .11, n = 5, zf = -D * .02, ribD = .14;
    floor(k, k.pick(['planks', 'terrazzo', 'carpet', 'dark']), m.ledPrimary);
    R(k, 'Tunnel end back wall', [W * .66, H - .1, .2], [0, (H - .1) / 2 + .08, zb], finished('plaster', mix(p.primary, '#ffffff', .82)), .02);
    const port = Ring(k, 'End wall glowing porthole', .62, .62, 0, [0, 0, 0], .06, .06, m.ledPrimary);
    port.rotation.x = Math.PI / 2;
    port.position.set(0, 2.85, zb + .13);
    const cols = [m.primary, m.snow, m.accent, m.snow, m.secondary];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), z = zb + .45 + t * (zf - zb - .45), w = (3.9 + t * 1.5) * W / 7.2, h = 2.95 + t * .6;
      slab(k, 'Tunnel rib arch upright', archBand(w, h, .2, .08, 28), -ribD / 2, ribD / 2, cols[(i + k.v) % cols.length], [0, z, 0], {smooth: .4});
      if (i === n - 1) neon(k, 'Portal arch LED edge', Array.from({length: 25}, (_, j) => {const a = j / 24 * Math.PI, R0 = w / 2 - .2 - .012, sp = .08 + h - w / 2; return [Math.cos(a) * R0, sp + Math.sin(a) * R0, z + ribD / 2 + .01];}), m.ledAccent, .016);
    }
    const portal = zf, keyW = 2.7, keyH = .58, apex = .08 + 3.55;
    R(k, 'Portal sign board', [keyW, keyH + .1, .1], [0, apex - .12, portal + ribD / 2 + .06], m.white, .02);
    // Benches inside the tunnel, counter at the mouth, lounge outside.
    for (const s of [-1, 1]) R(k, 'Tunnel bench chair seat', [.4, .44, 1.6], [s * 1.55, .3, zb + 1.35], m.wood, .03);
    counter(k, 'pill', W * .2, D * .3, 0, 1.7, .8, m.white, m.primary, {band: m.accent, led: m.ledPrimary});
    for (const s of [-1, 1]) potPlant(k, s * (W / 2 - .4), -D / 2 + .45, 1.3, m.ceramicWhite, 1);
    setSign(k, keyW - .12, keyH, 0, apex - .12, portal + ribD / 2 + .06 + .05 + .025, 0, {bg: '#ffffff', fg: p.primary, upper: true, weight: 900, fill: .76, name: 'portal'}, null);
    setSlots(k, {
      left: slot(k, -W * .41, 1.98, -D * .25, .35, 'stand', [-W * .33, 2.02, D * .2, .5, 'stand']),
      middle: slot(k, 0, 1.4, zb + .1 + .08, 0, 'wall', [0, 1.3, zb + .1 + .14, 0, 'wall']),
      right: slot(k, W * .41, 1.98, -D * .25, -.35, 'stand', [W * .33, 2.02, D * .2, -.5, 'stand']),
      frontLeft: slot(k, -W / 2 + .5, 1.98, D * .08, .9, 'stand', [-W / 2 + 1.5, 2.02, D * .4, .15, 'stand']),
      frontRight: slot(k, W / 2 - .5, 1.98, D * .08, -.9, 'stand', [W / 2 - 1.5, 2.02, D * .12, -.35, 'stand']),
      photos: [photoPose(k, -W / 2 + .4, 1.8, -D * .05, Math.PI / 2), photoPose(k, W / 2 - .4, 1.8, -D * .1, -Math.PI / 2)],
      rack: [rackPos(k, -W * .05, D * .43), rackPos(k, W * .44, D * .43)]
    });
  }

  /* ================= 52 Floating Cubes: rigging grid with suspended graphic and glowing cubes, cube shelving ================= */
  function floatingCubes(k) {
    const {W, D, H, m, p} = k, gy = H + .3, zb = -D / 2 + .1, gridM = k.bit(2) ? m.white : m.dark;
    floor(k, k.bit(3) ? 'checker' : k.pick(['white', 'terrazzo', 'dark']), null);
    for (const x of [-W / 2 + .12, W / 2 - .12]) R(k, 'Rigging upright post', [.1, gy, .1], [x, gy / 2 + .08, zb], gridM, .01);
    R(k, 'Rigging back beam', [W - .14, .1, .1], [0, gy + .08, zb], gridM, .01);
    const arms = [-W * .36, 0, W * .36], zf = zb + D * .8 - .04;
    for (const x of arms) R(k, 'Rigging cantilever arm', [.08, .08, D * .8], [x, gy + .08, zb + D * .4], gridM, .01);
    R(k, 'Rigging front beam', [W * .72 + .08, .1, .1], [0, gy + .08, zf], gridM, .01);
    R(k, 'Low back wall', [W - .3, 1.3, .16], [0, .73, zb], m.primaryMatte, .02);
    R(k, 'Low wall top', [W - .26, .05, .2], [0, 1.405, zb], m.white, .01);
    // The brand sign hangs from the front beam; the cubes float behind it and to both sides, so nothing covers the name.
    const cubes = [[-W * .38, 3.36, -D * .16, .8, 'g'], [-W * .3, 3.3, D * .12, .5, 'l'], [W * .36, 3.36, -D * .18, .86, 'g2'], [W * .31, 3.32, D * .1, .56, 'l2'], [W * .42, 3.5, D * .2, .34, 'w'], [-W * .42, 3.5, D * .2, .36, 'a'], [W * .04, 3.6, -D * .3, .44, 'l']];
    const mats = {g: graphicMat('blocks', [p.primary, p.accent, p.secondary, '#ffffff'], {w: 512, h: 512}), g2: graphicMat('circles', [p.accent, p.primary, '#ffffff', p.secondary], {w: 512, h: 512}), l: m.ledPrimary, l2: m.ledAccent, w: m.white, a: m.accent};
    cubes.forEach(([x, y, z, s, key], i) => {
      R(k, 'Floating cube', [s, s, s], [x, y, z], mats[key], .02, [0, (i % 3 - 1) * .3, 0]);
      const armX = arms.reduce((a, b) => Math.abs(b - x) < Math.abs(a - x) ? b : a);
      if (Math.abs(armX - x) > .1) R(k, 'Rigging spreader bar', [Math.abs(armX - x) + .06, .05, .05], [(armX + x) / 2, gy + .08, z], gridM, .01);
      Rod(k, 'Cube suspension cable', [x, y + s / 2, z], [x, gy + .055, z], .004, m.steel);
    });
    // Cube shelving in front of the low wall.
    for (let i = 0; i < 5; i++) for (let j = 0; j < (i % 2 ? 2 : 1); j++) R(k, 'Cube shelf block', [.5, .5, .42], [-W * .38 + i * .52, .34 + j * .5, zb + .32], [m.white, m.primary, m.accent, m.white, m.secondary][(i + j) % 5], .03);
    counter(k, 'box', W * .22, D * .3, .12, 1.8, .7, m.white, m.primary, {band: m.accent, led: m.ledPrimary});
    for (const [x, z, c] of [[-W * .12, D * .06, m.primary], [-W * .02, D * .16, m.white], [-W * .2, D * .2, m.accent]]) R(k, 'Cube stool chair seat', [.44, .44, .44], [x, .3, z], c, .04, [0, x * 2, 0]);
    potPlant(k, W / 2 - .4, -D * .1, 1.2, m.ceramicWhite, 1);
    setSign(k, W * .5, .5, 0, H - .15, zf + .05, 0, {bg: p.primary, fg: ink(p.primary), upper: true, weight: 900, fill: .76, name: 'cubes'}, p.primary);
    for (const x of [-W * .18, W * .18]) Rod(k, 'Sign hanging cable', [x, H + .08, zf], [x, gy + .03, zf], .005, m.steel);
    setSlots(k, {
      left: slot(k, -W * .38, 1.98, -D * .25, .2, 'stand', [-W * .27, 2.02, -D * .22, .1, 'stand']),
      middle: slot(k, -W * .02, 1.98, -D * .24, 0, 'stand', [W * .02, 2.05, -D * .24, 0, 'stand']),
      right: slot(k, W * .41, 1.98, -D * .22, -.25, 'stand', [W * .3, 2.02, -D * .2, -.1, 'stand']),
      frontLeft: slot(k, -W / 2 + .95, 1.98, D * .36, .3, 'stand', [-W / 2 + 1.5, 2.02, D * .38, .15, 'stand']),
      frontRight: slot(k, W / 2 - .45, 1.98, D * .12, -.6, 'stand', [W / 2 - 1.5, 2.02, D * .06, -.3, 'stand']),
      photos: [photoPose(k, -W / 2 + .4, 1.8, D * .12, Math.PI / 2), photoPose(k, W / 2 - .4, 1.8, D * .38, -Math.PI / 2)],
      rack: [rackPos(k, -W * .3, D * .43), rackPos(k, W * .02, D * .43)]
    });
  }

  /* ================= 53 Greenhouse: glazed gable frame, planting benches, seedling trays, hanging baskets ================= */
  function greenhouse(k) {
    const {W, D, H, m, p} = k, frameM = k.bit(2) ? m.dark : m.white, gw = W - .4, eave = 2.6, ridge = H + .1, z0 = -D / 2 + .15, z1 = D * .1, bays = 4, pr = .04;
    floor(k, k.bit(3) ? 'concrete' : 'planks', null);
    const prof = [[-gw / 2, .08], [-gw / 2, eave], [0, ridge], [gw / 2, eave], [gw / 2, .08]];
    for (let i = 0; i <= bays; i++) {
      const z = z0 + i * (z1 - z0) / bays;
      for (let j = 0; j < prof.length - 1; j++) Rod(k, j === 0 || j === prof.length - 2 ? 'Greenhouse frame upright post' : 'Greenhouse rafter', [prof[j][0], prof[j][1], z], [prof[j + 1][0], prof[j + 1][1], z], pr, frameM);
    }
    for (const [x, y] of [[-gw / 2, eave], [0, ridge], [gw / 2, eave], [-gw / 2, 1.0], [gw / 2, 1.0], [-gw / 4, (eave + ridge) / 2], [gw / 4, (eave + ridge) / 2]]) Rod(k, 'Greenhouse purlin', [x, y, z0], [x, y, z1], pr * .8, frameM);
    // Glass: roof slopes, the back gable, and low side panes.
    for (const s of [-1, 1]) Surf(k, 'Greenhouse roof glass', (u, w) => [s * gw / 2 * (1 - u), eave + u * (ridge - eave), z0 + w * (z1 - z0)], m.glass, 2, 2);
    slab(k, 'Greenhouse back glass wall', [[-gw / 2, .08], [gw / 2, .08], [gw / 2, eave], [0, ridge], [-gw / 2, eave]], -.01, .01, m.glass, [0, z0, 0], {smooth: 0});
    for (const s of [-1, 1]) Surf(k, 'Greenhouse side glass', (u, w) => [s * gw / 2, .08 + w * (eave - .08), z0 + u * (z1 - z0)], m.glass, 2, 2);
    R(k, 'Greenhouse brick plinth back wall', [gw, .5, .16], [0, .33, z0], finished('stone', '#a4553b'), .02);
    // Planting benches with seedlings, pots and a potting table.
    for (const s of [-1, 1]) {
      const bx = s * (gw / 2 - .5);
      R(k, 'Planting bench counter top', [.8, .06, (z1 - z0) - .5], [bx, .7, (z0 + z1) / 2], m.woodLight, .01);
      for (const t of [-1, 1]) for (const u of [-1, 1]) R(k, 'Planting bench upright leg', [.05, .64, .05], [bx + t * .34, .38, (z0 + z1) / 2 + u * ((z1 - z0) / 2 - .35)], m.woodDark, .01);
      for (let i = 0; i < 4; i++) {
        const z = z0 + .45 + i * ((z1 - z0) - .9) / 3;
        R(k, 'Seedling tray', [.6, .06, .38], [bx, .76, z], m.dark, .01);
        for (let j = 0; j < 6; j++) Lathe(k, 'Seedling sprout', [[0, 0], [.05, .03], [.07, .09], [.03, .13], [0, .14]], [bx - .22 + (j % 3) * .22, .79, z - .09 + Math.floor(j / 3) * .18], j % 2 ? m.foliage : m.foliageWarm, 7);
      }
    }
    for (const [x, z] of [[-gw / 4, (z0 + z1) / 2], [gw / 4, (z0 + z1) / 2]]) {
      Rod(k, 'Hanging basket chain', [x, (eave + ridge) / 2, z], [x, 2.35, z], .005, m.steel);
      Lathe(k, 'Hanging basket', [[0, -.18], [.2, -.12], [.25, 0], [.25, .02], [0, .02]], [x, 2.35, z], m.woodLight, 16);
      Lathe(k, 'Trailing basket foliage', [[0, -.34], [.2, -.22], [.3, -.05], [.26, .12], [0, .15]], [x, 2.38, z], m.foliage, 10);
    }
    for (const [x, z, h] of [[-1.2, z0 + .42, .8], [1.2, z0 + .42, .8]]) potPlant(k, x, z, h, m.terracotta, 0);
    counter(k, 'box', -W * .1, D * .3, 0, 1.9, .62, finished('boards', mix(k.woodColor, '#d8c49a', .35)), m.white, {band: m.primary});
    for (const s of [-1, 1]) Lathe(k, 'Terracotta pot on counter', [[.05, 0], [.08, .02], [.09, .14], [.1, .15], [0, .15]], [-W * .1 + s * .88, 1.02, D * .3], m.terracotta, 14);
    const gx = W * .3, gz = D * .3;
    Lathe(k, 'Watering can body upright', [[0, 0], [.14, 0], [.15, .28], [.1, .3], [0, .3]], [gx, .08, gz], k.bit(1) ? m.primary : finished('paint', '#3d7a54'), 16);
    Rod(k, 'Watering can spout', [gx + .12, .2, gz], [gx + .38, .42, gz], .02, k.bit(1) ? m.primary : finished('paint', '#3d7a54'));
    for (const [x, z, a] of [[W * .12, D * .42, 0], [-W * .38, D * .18, .5]]) R(k, 'Garden bench chair seat', [1.1, .45, .4], [x, .3, z], m.woodLight, .03, [0, a, 0]);
    // Sign panel at the front gable.
    R(k, 'Gable sign board', [gw * .5, .56, .06], [0, eave + .08, z1 + .05], frameM, .02);
    const zm = z0 + 1.5 * (z1 - z0) / bays;
    setSign(k, gw * .5 - .08, .5, 0, eave + .08, z1 + .08 + .025, 0, {bg: k.bit(2) ? '#1e2126' : '#ffffff', fg: k.bit(2) ? '#ffffff' : p.primary, weight: 800, fill: .76, name: 'gable'}, null);
    setSlots(k, {
      left: slot(k, -W * .28, 1.9, zm + .04, 0, 'stand', [-W * .27, 1.75, zm, 0, 'stand']),
      middle: slot(k, 0, 1.98, zm + .04, 0, 'stand', [0, 2.05, zm, 0, 'stand']),
      right: slot(k, W * .28, 1.9, zm + .04, 0, 'stand', [W * .27, 1.75, zm, 0, 'stand']),
      frontLeft: slot(k, -W / 2 + .5, 1.98, D * .38, .4, 'stand', [-W / 2 + 1.45, 2.02, D * .42, .1, 'stand']),
      frontRight: slot(k, W / 2 - .95, 1.98, D * .3, -.3, 'stand', [W / 2 - 1.5, 2.02, D * .24, -.22, 'stand']),
      photos: [photoPose(k, -W / 2 + .4, 1.8, D * .3, Math.PI / 2), photoPose(k, W / 2 - .4, 1.8, D * .36, -Math.PI / 2)],
      rack: [rackPos(k, -W * .26, D * .44), rackPos(k, W * .26, D * .44)]
    });
  }

  /* ================= 54 Gear Works: corrugated steel wall with giant gears, I-beam header, robot arm, conveyor ================= */
  function gearWorks(k) {
    const {W, D, H, m, p} = k, zb = -D / 2 + .1, h = H - .15, steel = finished('corrugated', k.bit(2) ? '#8e979e' : mix(p.trim, '#8e979e', .5)), face = zb + .08;
    floor(k, k.bit(3) ? 'checker' : 'dark', null);
    for (const [w, d, x, z] of [[W - .1, .1, 0, D / 2 - .06], [.1, D - .1, W / 2 - .06, 0], [.1, D - .1, -W / 2 + .06, 0]]) B(k, 'Hazard floor edge', [w, .012, d], [x, .087, z], graphicMat('hazard', ['#1b1b1b', '#f2c200'], {w: 512, h: 64}));
    R(k, 'Corrugated steel back wall', [W - .02, h, .16], [0, h / 2 + .08, zb], steel, .01);
    // I-beam header.
    const iy = h + .2;
    R(k, 'I-beam top flange', [W, .05, .3], [0, iy + .17, zb + .06], m.charcoal, .005);
    R(k, 'I-beam web', [W, .34, .06], [0, iy, zb + .06], m.charcoal, .005);
    R(k, 'I-beam bottom flange', [W, .05, .3], [0, iy - .17, zb + .06], m.charcoal, .005);
    // Giant gears.
    const sW = W / 7.2, gears = [[1.55 * sW, 2.15, .95, 16, m.accent], [W / 2 - .68, 2.86, .5, 10, m.primary], [W / 2 - .74, 1.42, .4, 8, finished('powder', '#b9c0c6')]];
    gears.forEach(([x, y, r, n, gm], i) => {
      const fz = face + .01 + i * .006;
      slab(k, 'Giant gear', gearOutline(r, n, .16, 0, y), fz, fz + .07, gm, [x, 0, 0], {smooth: 0});
      Lathe(k, 'Gear hub', [[0, 0], [r * .26, 0], [r * .26, .08], [r * .2, .11], [0, .11]], [x, y, fz + .07], m.charcoal, 20, null, [Math.PI / 2, 0, 0]);
    });
    // Robot arm on a plinth at the right.
    const rx = W * .3, rz = -D * .22, arm = k.bit(1) ? m.primary : finished('paint', '#f07d1a');
    R(k, 'Robot plinth upright', [1.0, .5, 1.0], [rx, .33, rz], m.charcoal, .03);
    Lathe(k, 'Robot base upright', [[0, 0], [.34, 0], [.34, .18], [.26, .24], [0, .24]], [rx, .58, rz], arm, 24);
    const sh = [rx, 1.02, rz], el = [rx - .45, 1.9, rz + .25], wr = [rx - .1, 2.45, rz + .75];
    C(k, 'Robot shoulder joint', .2, .2, .36, sh, m.dark, 20, [0, 0, Math.PI / 2]);
    Tube(k, 'Robot lower arm', [sh, el], .13, arm, 12);
    C(k, 'Robot elbow joint', .15, .15, .3, el, m.dark, 18, [0, 0, Math.PI / 2]);
    Tube(k, 'Robot upper arm', [el, wr], .1, arm, 12);
    Lathe(k, 'Robot wrist', [[0, -.1], [.08, -.1], [.08, .1], [0, .1]], wr, m.dark, 14);
    for (const s of [-1, 1]) Rod(k, 'Robot gripper finger', [wr[0] + s * .06, wr[1] - .1, wr[2]], [wr[0] + s * .09, wr[1] - .32, wr[2] + .05], .025, m.chrome);
    Tube(k, 'Robot service cable', [[rx + .2, .9, rz], [rx + .1, 1.5, rz + .1], [el[0] + .1, el[1] + .1, el[2]], [wr[0] + .08, wr[1] + .06, wr[2] - .05]], .02, m.dark, 6);
    // Conveyor with parcels.
    const cx0 = -W * .45, cx1 = -W * .12, cz = -D * .02, cy = .82;
    R(k, 'Conveyor side rail', [cx1 - cx0, .12, .06], [(cx0 + cx1) / 2, cy, cz - .32], m.steel, .01);
    R(k, 'Conveyor side rail', [cx1 - cx0, .12, .06], [(cx0 + cx1) / 2, cy, cz + .32], m.steel, .01);
    R(k, 'Conveyor rubber belt', [cx1 - cx0 - .1, .03, .56], [(cx0 + cx1) / 2, cy + .03, cz], finished('rubber', '#1d1f22'), .01);
    for (let i = 0; i < 5; i++) {const x = cx0 + .2 + i * (cx1 - cx0 - .4) / 4; for (const s of [-1, 1]) R(k, 'Conveyor upright leg', [.06, cy - .08, .06], [x, (cy - .08) / 2 + .08, cz + s * .3], m.steel, .01);}
    for (let i = 0; i < 3; i++) R(k, 'Parcel box on conveyor', [.36 + .06 * i, .3 - .04 * i, .34], [cx0 + .5 + i * .9, cy + .2 - .02 * i, cz], finished('paint', '#c49a6c'), .01);
    counter(k, 'box', W * .02, D * .32, 0, 2.2, .66, steel, m.charcoal, {band: graphicMat('hazard', ['#17191c', '#f2c200'], {w: 512, h: 64}), led: m.ledAccent});
    // Safety rail around the robot cell.
    for (const [x, z] of [[rx - .7, rz + .7], [rx + .7, rz + .7], [rx - .7, rz - .1]]) R(k, 'Safety rail upright post', [.07, 1.05, .07], [x, .6, z], finished('powder', '#f2c200'), .01);
    Rod(k, 'Safety rail tube', [rx - .7, 1.08, rz - .1], [rx - .7, 1.08, rz + .7], .025, finished('powder', '#f2c200'));
    Rod(k, 'Safety rail tube', [rx - .7, 1.08, rz + .7], [rx + .7, 1.08, rz + .7], .025, finished('powder', '#f2c200'));
    setSign(k, 3.0 * sW, .56, -1.05 * sW, 3.05, face + .075, 0, {bg: '#2f343a', fg: '#ffffff', bar: p.accent, upper: true, weight: 900, fill: .74, name: 'steel'}, '#2f343a');
    setSlots(k, {
      left: slot(k, -2.75 * sW, 1.6, face + .08, 0, 'wall', [-2.15 * sW, 1.66, face + .14, 0, 'wall']),
      middle: slot(k, -.14 * sW, 1.6, face + .08, 0, 'wall', [-.75 * sW, 1.66, face + .14, 0, 'wall']),
      right: slot(k, W * .42, 1.98, D * .08, -.6, 'stand', [W * .32, 2.02, D * .12, -.35, 'stand']),
      frontLeft: slot(k, -W / 2 + .8, 1.98, D * .3, .35, 'stand', [-W / 2 + 1.5, 2.02, D * .3, .2, 'stand']),
      frontRight: slot(k, W / 2 - .45, 1.98, D * .38, -.6, 'stand', [W / 2 - 1.5, 2.02, D * .4, -.2, 'stand']),
      photos: [photoPose(k, -W / 2 + .4, 1.8, D * .14, Math.PI / 2), photoPose(k, W / 2 - .4, 1.8, D * .1, -Math.PI / 2)],
      rack: [rackPos(k, -W * .34, D * .43), rackPos(k, W * .38, D * .43)]
    });
  }

  /* ================= registry ================= */
  const MFG = 'Manufacturing', HEALTH = 'Health Science', AGRI = 'Agribusiness', BUILD = 'Construction', IT = 'Information Technology', ALL = [MFG, HEALTH, AGRI, BUILD, IT];
  const FAMILIES = [
    ['skylineBridge', 'Skyline Bridge', skylineBridge, [IT, HEALTH, MFG]],
    ['brandWall', 'Brand Wall', brandWall, [HEALTH, IT, BUILD]],
    ['hexLounge', 'Hex Lounge', hexLounge, [HEALTH, IT, AGRI]],
    ['cornerStudio', 'Corner Studio', cornerStudio, [MFG, BUILD, IT]],
    ['trussStage', 'Truss Stage', trussStage, [MFG, BUILD, IT]],
    ['ecoGlow', 'Eco Glow', ecoGlow, [AGRI, HEALTH]],
    ['gridCube', 'Grid Cube', gridCube, [IT, MFG, BUILD]],
    ['treeColumns', 'Tree Columns', treeColumns, [AGRI, HEALTH]],
    ['podShell', 'Pod Shell', podShell, [HEALTH, IT]],
    ['timberFrame', 'Timber Frame', timberFrame, [AGRI, BUILD, HEALTH]],
    ['containerHub', 'Container Hub', containerHub, [BUILD, MFG, AGRI]],
    ['farmStand', 'Farm Stand', farmStand, [AGRI]],
    ['cleanLab', 'Clean Lab', cleanLab, [HEALTH, MFG]],
    ['scaffoldWorks', 'Scaffold Works', scaffoldWorks, [BUILD, MFG]],
    ['neonArcade', 'Neon Arcade', neonArcade, [IT]],
    ['amphitheater', 'Amphitheater', amphitheater, [HEALTH, IT, MFG]],
    ['kioskIsland', 'Kiosk Island', kioskIsland, ALL],
    ['foldedRibbon', 'Folded Ribbon', foldedRibbon, [MFG, IT, HEALTH]],
    ['archTunnel', 'Arch Tunnel', archTunnel, [HEALTH, BUILD, AGRI]],
    ['floatingCubes', 'Floating Cubes', floatingCubes, [IT, MFG]],
    ['greenhouse', 'Greenhouse', greenhouse, [AGRI, HEALTH]],
    ['gearWorks', 'Gear Works', gearWorks, [MFG, BUILD]]
  ].map(([key, name, build, industries]) => ({key, name, build, industries}));
  FAMILIES.forEach(f => studioFamilies.push([f.name, 'dev33:' + f.key, 'dev33', 'dev33']));
  PALETTES.forEach(pl => studioPalettes.push(pl));
  installFinishes();

  const owns = t => !!t && !t.useLegacy && Number.isInteger(t.familyIndex) && t.familyIndex >= FIRST && t.familyIndex < FIRST + FAMILIES.length;

  /* ================= booth creation ================= */
  function create(template, data, options = {}) {
    const t = template, d = sizeMap[t.size] || sizeMap.compact, root = new THREE.Group(), fam = FAMILIES[t.familyIndex - FIRST];
    root.name = `${t.signature} ${t.name}`;
    root.userData = {
      kind: 'careerFairBoothTemplate', builderVersion: '3.3', templateId: t.id, templateName: t.name, designSignature: t.signature,
      familyIndex: t.familyIndex, variant: t.variant, paletteIndex: t.paletteIndex, detail: t.detail, size: t.size,
      units: 'model units; normalize against hall before placement', anchorRoles: ['companyName', 'video', 'contact', 'resource', 'logo', 'photo'],
      employerData: data, boothStyle33: fam.key
    };
    const k = context(root, t, d, data);
    fam.build(k);
    content(k);
    root.userData.layout33 = k.layout;
    if (!options.deferContentLayout) finalizeBoothContent(root, t);
    return root;
  }

  /* ================= content placement for the new families ================= */
  function plate(root, panel, color) {
    const rect = contentPanel(panel), w = rect.half[0] * 2, h = rect.half[1] * 2;
    const b = meshBox(panel.name + ' mounting backplate', [w + .065, h + .065, .035], contentAddOffset(rect.origin, rect.axes[2], -.052), mat(color), [panel.rotation.x, panel.rotation.y, panel.rotation.z]);
    b.userData = {contentAssembly: panel.name, contentSupport: true};
    root.add(b);
    return b;
  }
  function finalize(root, template) {
    if (root.userData.contentLayoutVersion === 3) return root.userData.contentAudit;
    const L = root.userData.layout33, data = root.userData.employerData || {}, plan = informationPlan(template, data), trimColor = template.palette.trim;
    if (!plan.showTV) for (const n of contentObjects(root)) if (n.userData.role === 'video' || /^Video screen (frame|shelf)$/.test(n.name)) removeContentNode(root, n);
    const nodes = contentObjects(root), panels = nodes.filter(n => CONTENT_ROLES.has(n.userData.role)), role = r => panels.filter(n => n.userData.role === r);
    const company = role('companyName')[0], video = role('video')[0], contact = role('contact')[0];
    const tag = (panel, members) => {for (const n of members) n.userData.contentAssembly = panel.name; panel.userData.editable = true; panel.userData.contentLayoutVersion = 2;};
    const fits = [];
    // Uploaded logo and photos start at the studio's generic spots; park them until their own turn so they
    // never push the TV or the contact card away.
    for (const n of nodes) if (n.userData.role === 'photo' || n.userData.role === 'logo' || /^Photo panel frame /.test(n.name)) n.position.set(0, -60, 0);
    // Company sign: already at its designed pose; add a backplate unless the structure itself is the backing.
    if (company) {
      const members = [company];
      if (L.sign.backing) members.push(plate(root, company, L.sign.backing));
      tag(company, members);
      fits.push([company, members, .16]);
    }
    // TV and contact card go to the family's own slot poses.
    const place = (panel, members, pose, isTV) => {
      moveContentAssembly(panel, members, pose.pos, pose.yaw);
      contentFitAssembly(root, panel, members, .22);
      if (pose.mount === 'stand') members.push(...addInformationSupport(root, panel, template));
      else if (!isTV) members.push(plate(root, panel, trimColor));
      tag(panel, members);
    };
    if (video) {
      const frame = contentNamed(root, 'Video screen frame'), shelf = contentNamed(root, 'Video screen shelf'), members = [video, frame, shelf].filter(Boolean);
      const vp = contentPositionArray(video), n = contentAxis(video)[2], sh = contentLocalBounds(video).size[1];
      if (frame) frame.position.set(...contentAddOffset(vp, n, -.08));
      if (shelf) shelf.position.set(...contentAddOffset([vp[0], vp[1] - sh / 2 - .14, vp[2]], n, -.03));
      const s = L.slots[plan.tv] || L.slots['back-middle'];
      place(video, members, s.tv || s, true);
      video.userData.placementSlot = plan.tv;
    }
    if (contact) {
      const s = L.slots[plan.contact] || L.slots['back-left'];
      place(contact, [contact], s, false);
      contact.userData.placementSlot = plan.contact;
    }
    // Counter logo and brochures.
    const desk = contentCounter(root), bodyB = contentLocalBounds(desk.body), topB = contentLocalBounds(desk.top), bodyAxis = contentAxis(desk.body);
    const logo = role('logo')[0];
    if (logo) {
      contentSetGeometry(logo, Math.min(1.45, bodyB.size[0] - .24), Math.min(.725, bodyB.size[1] - .16));
      contentSetPose(logo, contentAddOffset(contentPositionArray(desk.body), bodyAxis[2], bodyB.size[2] / 2 + .06), [0, desk.body.rotation.y, 0]);
      const members = [logo, plate(root, logo, trimColor)];
      tag(logo, members);
      fits.push([logo, members, .16]);
    }
    const papers = role('resource');
    // A brochure stand never shares a front corner with the TV; it moves to the counter instead.
    if (plan.showTV && plan.resources === plan.tv) {plan.resources = 'counter'; plan.resourcesMovedForTV = true;}
    if (plan.resources === 'counter' || !L.rack) {
      const topY = desk.top.position.y + topB.size[1] / 2;
      papers.forEach((paper, i) => {
        const width = Math.min(.43, (topB.size[0] - .32) / (papers.length + .35)), localX = (i - (papers.length - 1) / 2) * (width + .1), base = contentPositionArray(desk.top), yaw = desk.top.rotation.y;
        contentSetGeometry(paper, width, .48);
        contentSetPose(paper, [base[0] + Math.cos(yaw) * localX + Math.sin(yaw) * .1, topY + .026, base[2] - Math.sin(yaw) * localX + Math.cos(yaw) * .1], [-Math.PI / 2, 0, yaw]);
        paper.userData.counterAnchor = desk.top.name;
        paper.userData.placementSlot = 'counter';
        tag(paper, [paper]);
      });
    } else if (papers.length) {
      const [px, pz] = L.rack[plan.resources === 'front-left' ? 0 : 1], y = .98, w = Math.max(.62, papers.length * .34 + .12), ang = -Math.PI * .35, trim = mat(trimColor);
      const rack = studioRound(root, 'Resource rack rounded tray', [w, .54, .042], [px, y, pz], trim, .017, [ang, 0, 0]);
      const support = studioRound(root, 'Resource rack pedestal', [.07, .83, .08], [px, .48, pz - .11], trim, .023);
      const foot = studioRound(root, 'Resource rack rounded foot', [.52, .048, .39], [px, .09, pz - .11], trim, .02);
      for (const n of [rack, support, foot]) n.userData = {contentSupport: true};
      papers.forEach((paper, i) => {
        contentSetGeometry(paper, .29, .41);
        contentSetPose(paper, [px + (i - (papers.length - 1) / 2) * .34, y + .045, pz + .03], [ang, 0, 0]);
        paper.userData.counterAnchor = 'Independent brochure stand';
        paper.userData.placementSlot = plan.resources;
        tag(paper, [paper]);
        contentFitAssembly(root, paper, [paper], .08);
      });
    }
    // Photos take the first free gallery spots of the family (spots the TV, contact card or brochures
    // already use are skipped); "Shuffle information" rotates where the search starts.
    const photos = role('photo'), cands = L.photos || [], taken = new Set();
    photos.forEach((photo, i) => {
      if (!cands.length) return;
      contentSetGeometry(photo, .8, .578);
      const frame = contentNamed(root, 'Photo panel frame ' + (i + 1));
      if (frame) {frame.geometry = geometry('studioPhotoFrame', () => new THREE.BoxGeometry(.9, .678, .07)); frame.scale.set(1, 1, 1);}
      const order = cands.map((_, j) => (j + plan.photoVariation) % cands.length).filter(j => !taken.has(j));
      const others = () => contentObjects(root).filter(n => CONTENT_ROLES.has(n.userData.role) && n !== photo && !photos.slice(i + 1).includes(n));
      const blocksOthers = members => {
        const recs = members.map(contentRecord);
        for (const panel of others()) {
          const rect = contentPanel(panel, .032);
          for (const r of recs) {const hit = contentOverlapInterval(r, rect, -.03, .24); if (hit && hit.max > -.03 && hit.min < .24) return true;}
        }
        return false;
      };
      const post = meshBox('Photo display support ' + (i + 1), [.06, 1.35, .06], [0, .71, 0], mat(trimColor));
      const tryPose = pose => {
        contentSetPose(photo, pose.pos, [0, pose.yaw, 0]);
        const members = [photo];
        if (frame) {contentSetPose(frame, contentAddOffset(pose.pos, contentAxis(photo)[2], -.075), [0, pose.yaw, 0]); members.push(frame);}
        let adj = Infinity;
        try {adj = contentFitAssembly(root, photo, members, .2);} catch (e) {}
        const at = contentPositionArray(photo);
        if (pose.mount !== 'wall') {contentSetPose(post, contentAddOffset([at[0], .71, at[2]], contentAxis(photo)[2], -.09), [0, pose.yaw, 0]); members.push(post);}
        if (adj <= .05 && blocksOthers(members)) adj = 1;
        return {adj, members};
      };
      let best = null;
      for (const j of order) {
        const r = tryPose(cands[j]);
        if (!best || r.adj < best.adj) best = {j, adj: r.adj};
        if (r.adj <= .05) break;
      }
      const pose = cands[best.j], {members} = tryPose(pose);
      taken.add(best.j);
      if (members.includes(post)) root.add(post);
      photo.userData.placementSlot = 'gallery-' + (best.j + 1);
      tag(photo, members);
      fits.push([photo, members, .2]);
    });
    for (const [panel, members, ahead] of fits) contentFitAssembly(root, panel, members, ahead);
    for (const panel of contentObjects(root).filter(n => CONTENT_ROLES.has(n.userData.role))) contentFitAssembly(root, panel, resourceAssembly(root, panel), .1);
    const audit = auditBoothContent(root);
    root.userData.contentLayoutVersion = 3;
    root.userData.contentAudit = audit;
    root.userData.informationLayout = plan;
    return audit;
  }

  /* ================= design sets: new families first, bold colours favoured ================= */
  function makeUniqueSet33(count = 200, seed = 140926) {
    const total = studioFamilies.length * 16;
    count = Math.max(1, Math.min(total, Math.floor(Number(count) || 200)));
    const rng = mulberry(seed), used = new Set(), pool = [];
    const shuffle = a => {for (let i = a.length - 1; i > 0; i--) {const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]];} return a;};
    const variants = studioFamilies.map(() => shuffle(Array.from({length: 16}, (_, i) => i)));
    const fresh = FAMILIES.map((_, i) => FIRST + i), classic = Array.from({length: FIRST}, (_, i) => i);
    let lastPalette = -1;
    const paletteFor = isNew => {
      let pl;
      do pl = isNew && rng() < .68 ? PALETTE_FIRST + Math.floor(rng() * PALETTES.length) : Math.floor(rng() * PALETTE_FIRST);
      while (pl === lastPalette);
      return (lastPalette = pl);
    };
    for (const group of [fresh, classic]) for (let round = 0; round < 16 && pool.length < count; round++) {
      for (const family of shuffle(group.slice())) {
        if (pool.length === count) break;
        const variant = variants[family][round], isNew = family >= FIRST, palette = paletteFor(isNew), s = studioSpec(family, variant, palette);
        if (used.has(s.signature)) throw Error('Repeated structural design');
        used.add(s.signature);
        pool.push({number: pool.length + 1, family, variant, palette, signature: s.signature, name: s.name, size: 'compact', industries: isNew ? FAMILIES[family - FIRST].industries.slice() : []});
      }
    }
    return {format: 'micareerquest-unique-design-set', version: 1, seed, count: pool.length, assignments: pool, notice: 'Local design allocation only. New DEV 33 booth styles are dealt first. No employer reservation service or automatic hall publication is connected.'};
  }

  return {
    version: 33, FIRST, PALETTE_FIRST, families: FAMILIES.map(f => ({key: f.key, name: f.name, industries: f.industries})),
    owns, create, finalize, makeUniqueSet: makeUniqueSet33, graphic, signTexture
  };
})();
window.Booths33 = Booths33;
