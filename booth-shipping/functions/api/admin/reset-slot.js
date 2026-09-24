import { json, badRequest, slugify } from '../../_lib.js';

// Frees a slot back to 'open' -- for an employer who wants to start over,
// a mistaken/duplicate entry, or clearing a demo placeholder early. Also
// removes the uploaded GLB and project JSON from R2 so nothing dangling is
// left pointing at a slot that no longer claims to have a booth.
export async function onRequestPost(context) {
  const { request, env } = context;
  if (request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return badRequest('Unauthorized.', 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body.');
  }

  const sector = String(body.sector || '').trim();
  const slotNumber = Number(body.slotNumber);
  if (!sector || !Number.isInteger(slotNumber)) {
    return badRequest('sector and slotNumber are required.');
  }

  const row = await env.DB
    .prepare('SELECT sector FROM slots WHERE sector = ? AND slot_number = ?')
    .bind(sector, slotNumber)
    .first();
  if (!row) return badRequest('No such slot.', 404);

  const sectorSlug = slugify(sector);
  await env.BOOTHS.delete(`booths/${sectorSlug}/${slotNumber}.glb`).catch(() => {});
  await env.BOOTHS.delete(`booths/${sectorSlug}/${slotNumber}.project.json`).catch(() => {});

  await env.DB
    .prepare(
      `UPDATE slots
          SET status = 'open', company_name = NULL, email = NULL, claimed_at = NULL,
              shipped_at = NULL, booth_asset_key = NULL, booth_name = NULL,
              booth_description = NULL, booth_color = NULL
        WHERE sector = ? AND slot_number = ?`
    )
    .bind(sector, slotNumber)
    .run();

  return json({ ok: true });
}
