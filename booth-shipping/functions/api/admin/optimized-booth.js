import { json, badRequest, slugify, boothLock } from '../../_lib.js';

// Student download optimizer, server half. The admin page downloads each
// shipped booth, rebuilds it for the game (shared textures moved to the
// library, images at the size the game displays them, gzip) and posts the
// result here. The employer's original upload is never touched: the slot
// just points students at the optimized copy, and "Undo" points it back.
//
// Only allowed while booth editing is locked, so an employer cannot re-ship
// underneath it. (A re-ship after unlocking points the slot back at the new
// original anyway -- see ship.js.)
const MAX_BYTES = 30 * 1024 * 1024;

export async function onRequestPost(context) {
  const { request, env } = context;
  if (request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return badRequest('Unauthorized.', 401);
  }
  if (!(await boothLock(env)).locked) {
    return badRequest('Lock booth editing before optimizing booths for students.', 409);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return badRequest('Could not read the upload.');
  }
  const sector = String(form.get('sector') || '').trim();
  const slotNumber = Number(form.get('slotNumber'));
  const file = form.get('file');
  if (!sector || !Number.isInteger(slotNumber)) return badRequest('sector and slotNumber are required.');
  if (!(file instanceof File) || !file.size || file.size > MAX_BYTES) return badRequest('Optimized booth file is missing or too large.');

  const bytes = await file.arrayBuffer();
  const head = new Uint8Array(bytes, 0, 2);
  if (head[0] !== 0x1f || head[1] !== 0x8b) return badRequest('Optimized booth must be gzip-compressed.');

  const original = `booths/${slugify(sector)}/${slotNumber}.glb`;
  const row = await env.DB
    .prepare('SELECT status, booth_asset_key FROM slots WHERE sector = ? AND slot_number = ?')
    .bind(sector, slotNumber)
    .first();
  if (!row) return badRequest('No such slot.', 404);
  if (row.status !== 'shipped') return badRequest('That slot has no shipped booth.', 409);

  // Content-addressed name: a new optimization is a new URL, so neither the
  // edge cache nor a student's browser can ever serve an older one.
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const key = `booths/${slugify(sector)}/${slotNumber}.${digest}.opt.glb.gz`;
  await env.BOOTHS.put(key, bytes, { httpMetadata: { contentType: 'application/gzip' } });

  const result = await env.DB
    .prepare(
      `UPDATE slots SET booth_asset_key = ?
        WHERE sector = ? AND slot_number = ? AND status = 'shipped'
          AND (booth_asset_key = ? OR booth_asset_key LIKE '%.opt.glb.gz')`
    )
    .bind(key, sector, slotNumber, original)
    .run();
  if (!result.meta.changes) return badRequest('That booth changed while it was being optimized. Run Optimize again.', 409);

  return json({ ok: true, assetKey: key, bytes: bytes.byteLength });
}
