// Run from any directory: node /path/to/Virtual-MiCareerQuest/city106/animation121-test.cjs
// Reads the real embedded GLB and runtime code; no browser, downloads, or file writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const { before, test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../venue-frame.html'), 'utf8');
const lines = source.split('\n');
const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));

function section(text, start, end) {
  const a = text.indexOf(start), b = text.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `Runtime extraction anchors missing: ${start} / ${end}`);
  return text.slice(a, b);
}

function oneLineFunction(name) {
  const line = lines.find(line => line.startsWith(`function ${name}(`));
  assert(line && line.trimEnd().endsWith('}'), `Expected complete runtime function: ${name}`);
  return line;
}

function embeddedModel(id) {
  const tag = source.indexOf(`id="character-${id}"`);
  assert(tag >= 0, `Missing embedded character: ${id}`);
  const start = source.indexOf('>', tag) + 1, end = source.indexOf('</script>', start);
  assert(start > tag && end > start, 'Incomplete embedded character script');
  const bytes = zlib.gunzipSync(Buffer.from(source.slice(start, end).trim(), 'base64'));
  assert.equal(bytes.readUInt32LE(0), 0x46546c67, 'GLB magic');
  assert.equal(bytes.readUInt32LE(4), 2, 'GLB version');
  assert.equal(bytes.readUInt32LE(8), bytes.length, 'GLB declared length');
  let json, bin;
  for (let offset = 12; offset < bytes.length;) {
    const size = bytes.readUInt32LE(offset), type = bytes.readUInt32LE(offset + 4);
    const start = offset + 8;
    assert(start + size <= bytes.length, 'GLB chunk bounds');
    if (type === 0x4e4f534a) json = JSON.parse(bytes.subarray(start, start + size).toString('utf8'));
    if (type === 0x004e4942) bin = new DataView(bytes.buffer, bytes.byteOffset + start, size);
    offset = start + size;
  }
  assert(json && bin, 'GLB JSON and binary chunks');
  return { json, bin };
}

const gl = { createTexture: () => ({}), isContextLost: () => false };
for (const name of ['activeTexture', 'bindTexture', 'texImage2D', 'texParameteri', 'bindVertexArray']) {
  gl[name] = () => {};
}
for (const [i, name] of ['TEXTURE0', 'TEXTURE3', 'TEXTURE_2D', 'RGBA32F', 'RGBA', 'FLOAT',
  'TEXTURE_MIN_FILTER', 'TEXTURE_MAG_FILTER', 'NEAREST', 'TEXTURE_WRAP_S', 'TEXTURE_WRAP_T',
  'CLAMP_TO_EDGE'].entries()) gl[name] = i;

// Retain the loader's actual clip selection and the complete CrowdGraphics closure.
// Empty mesh parts avoid geometry/GPU work while prepareModels still calls the real bakeModel.
const loader = section(source, 'async function loadCharacterModelRaw18(', '\nfunction createActor(');
const modelSetup = section(loader, 'const parents=new Map(),order=[];', 'const maps=new Map();');
const characterState = { models: new Map() };
const runtime = vm.runInNewContext([
  ...['accessor', 'characterClip', 'mm', 'trs', 'tp'].map(oneLineFunction),
  section(source, 'function quaternionSlerp(', 'function evaluateLandmarkMotion('),
  `const IDENTITY = ${JSON.stringify(IDENTITY)};`,
  `function buildModel121(id, j, bin) { ${modelSetup} return model; }`,
  section(source, 'const CrowdGraphics = (() => {', '/* Runtime glue:'),
  '({ CrowdGraphics, buildModel121, mm, trs, tp, sampleLandmarkChannel })'
].join('\n'), { gl, characterState, structuredClone, setTimeout }, { filename: 'animation121-extracted-runtime.js' });

let model, atlas, posePoints, sourcePoints, bindSpan;
before(async () => {
  const { json, bin } = embeddedModel('sara_character');
  model = runtime.buildModel121('sara_character', json, bin);
  const bounds = json.extras?.crowdAppearanceV11?.bodyBounds;
  assert(bounds, 'Sara authored body bounds');
  model.lo = [...bounds.min];
  model.hi = [...bounds.max];
  characterState.models.set(model.id, model);
  await runtime.CrowdGraphics.prepareModels();
  atlas = runtime.CrowdGraphics.atlases.get(model.id);
  assert(atlas?.clips.idle && atlas.clips.walk && atlas.clips.talk, 'Baked crowd clips');

  const world = [];
  for (const i of model.order) world[i] = runtime.mm(world[model.parents.get(i)] || IDENTITY, runtime.trs(json.nodes[i]));
  const names = ['LeftArm', 'LeftHand', 'RightArm', 'RightHand', 'Head'];
  const bones = names.map(name => {
    const node = json.nodes.findIndex(n => (n.name || '').endsWith(`:${name}`));
    const joint = model.skins[0].joints.indexOf(node);
    assert(node >= 0 && joint >= 0, `Sara skin joint: ${name}`);
    return { name, node, joint, bind: world[node].slice(12, 15) };
  });
  bindSpan = distance(bones[1].bind, bones[3].bind);
  posePoints = palette => Object.fromEntries(bones.map(b => [b.name,
    runtime.tp(palette.subarray(b.joint * 16, (b.joint + 1) * 16), ...b.bind)]));
  sourcePoints = (clip, time) => {
    const nodes = structuredClone(json.nodes), posed = [];
    for (const channel of clip.channels) {
      if (!['translation', 'rotation', 'scale'].includes(channel.path)) continue;
      delete nodes[channel.node].matrix;
      nodes[channel.node][channel.path] = runtime.sampleLandmarkChannel(channel, time);
    }
    for (const i of model.order) posed[i] = runtime.mm(posed[model.parents.get(i)] || IDENTITY, runtime.trs(nodes[i]));
    return Object.fromEntries(bones.map(b => [b.name, posed[b.node].slice(12, 15)]));
  };
});

function metrics(points) {
  return {
    span: distance(points.LeftHand, points.RightHand) / bindSpan,
    leftDrop: (points.LeftHand[1] - points.LeftArm[1]) / bindSpan,
    rightDrop: (points.RightHand[1] - points.RightArm[1]) / bindSpan
  };
}

function assertNeutral(points, label) {
  const m = metrics(points);
  assert(Object.values(points).flat().every(Number.isFinite), `${label}: finite joint positions`);
  assert(m.span < .60 && m.leftDrop < -.25 && m.rightDrop < -.25,
    `${label}: expected arms down; ${JSON.stringify(m)}`);
  return m;
}

function bakedPoints(frame) {
  const skin = atlas.skins[0], start = frame * skin.bones * 16;
  assert(Number.isInteger(frame) && frame >= 0 && frame < atlas.total, `Atlas frame bounds: ${frame}`);
  return posePoints(skin.data.subarray(start, start + skin.bones * 16));
}

test('Sara source idle 0-2 seconds is neutral; t=1 is a safe fixed crowd pose', () => {
  const original = model.clips.find(c => c.name === 'sara idle');
  assert(original, 'Original authored Sara idle retained in source clips');
  const samples = [];
  for (let i = 0; i <= 240; i++) {
    samples.push(assertNeutral(sourcePoints(original, i / 120), `source idle ${i}/120s`));
  }
  const fixed = metrics(sourcePoints(original, 1));
  const authoredStretch = metrics(sourcePoints(original, 5.75));
  assert(authoredStretch.span > .90, 'Control: original 5.75s idle reproduces arms-out symptom');
  console.log('Validated Sara idle', JSON.stringify({ fixedTime: 1, fixed,
    firstTwoSecondsSpan: [Math.min(...samples.map(s => s.span)), Math.max(...samples.map(s => s.span))] }));
});

for (const mode of ['idle', 'talk']) {
  test(`every baked Sara crowd ${mode} frame and loop interpolation stays neutral`, () => {
    const clip = atlas.clips[mode], heads = [];
    for (let i = 0; i < clip.count; i++) {
      const a = bakedPoints(clip.offset + i), b = bakedPoints(clip.offset + (i + 1) % clip.count);
      heads.push(a.Head);
      for (const blend of [0, .5]) {
        const points = Object.fromEntries(Object.keys(a).map(name => [name,
          a[name].map((value, k) => value + (b[name][k] - value) * blend)]));
        assertNeutral(points, `${mode} atlas frame ${clip.offset + i}, blend ${blend}`);
      }
    }
    if (mode === 'talk') {
      assert(heads.some(head => distance(head, heads[0]) / bindSpan > 1e-4),
        'Talk retains procedural motion; do not freeze its gesture clock with the source idle time');
    }
  });
}

// Distinct ranges expose a jump even after neutral idle makes the visual pose difference smaller.
for (const [from, to] of [['walk', 'idle'], ['idle', 'walk']]) {
  test(`interrupted ${from}->${to}->${from} stays continuous and settles on latest request`, () => {
    const id = `animation121-${from}`, fixture = { id };
    const clips = Object.fromEntries(['walk', 'idle', 'talk', 'wave'].map((name, i) =>
      [name, { offset: i * 32, count: 4, duration: 1 }]));
    runtime.CrowdGraphics.atlases.set(id, { clips });
    try {
      const actor = { kind: 'cityPedestrian', mode: from, clock: .375, phase: 0 };
      function weight(time) {
        const frames = runtime.CrowdGraphics.animationFrames(actor, fixture, time);
        assert.equal(frames.length, 4, 'Shader frame tuple');
        assert(frames.every(Number.isFinite), 'Finite shader frame tuple');
        assert(frames[2] >= 0 && frames[2] <= 1, 'Blend weight bounds');
        const modes = frames.slice(0, 2).map(frame => {
          assert(Number.isInteger(frame), 'Integer baked frame');
          const mode = Object.keys(clips).find(name => frame >= clips[name].offset && frame < clips[name].offset + clips[name].count);
          assert(mode === from || mode === to, `Unexpected atlas range at ${time}: ${frames}`);
          return mode;
        });
        return (modes[0] === to ? 1 - frames[2] : 0) + (modes[1] === to ? frames[2] : 0);
      }
      weight(0);
      assert.equal(weight(1), 0, 'Initial mode settled');
      actor.mode = to;
      assert.equal(weight(1.001), 0, 'Transition begins from displayed source');
      const before = weight(1.05);
      assert(before > .05 && before < .95, 'Interrupt an active blend');
      actor.mode = from;
      let previous = weight(1.051);
      assert(Math.abs(previous - before) <= .02,
        `Interrupted blend jumped across atlas ranges: ${before.toFixed(4)} -> ${previous.toFixed(4)} in 1ms`);
      for (let i = 1; i <= 72; i++) {
        const current = weight(1.051 + i / 120);
        assert(Math.abs(current - previous) <= .07,
          `Queued transition discontinuity: ${previous.toFixed(4)} -> ${current.toFixed(4)} in 1/120s`);
        previous = current;
      }
      assert.equal(previous, 0, 'Latest requested mode eventually wins');
    } finally {
      runtime.CrowdGraphics.atlases.delete(id);
    }
  });
}
