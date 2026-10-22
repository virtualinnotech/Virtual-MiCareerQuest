import { json, badRequest, DEMO_SECTORS, DEMO_DESCRIPTION, DEMO_COLOR, demoBooth } from '../../_lib.js';

// One slot's Demo toggle on the admin page. On puts that sector's demo booth
// in an empty slot; off empties it again. Slots an employer has claimed or
// shipped into are never touched.
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
  if (!sector || !Number.isInteger(slotNumber)) return badRequest('sector and slotNumber are required.');
  if (typeof body.on !== 'boolean') return badRequest('on must be true or false.');
  if (!DEMO_SECTORS.has(sector)) return badRequest('There are no demo booths for this sector.');

  const row = await env.DB
    .prepare('SELECT status FROM slots WHERE sector = ? AND slot_number = ?')
    .bind(sector, slotNumber)
    .first();
  if (!row) return badRequest('No such slot.', 404);

  if (body.on) {
    if (row.status === 'demo') return json({ ok: true, status: 'demo' });
    if (row.status !== 'open') return badRequest('This slot belongs to an employer.', 409);
    const demo = demoBooth(sector, slotNumber);
    await env.DB
      .prepare(
        `UPDATE slots SET status = 'demo', booth_name = ?, booth_description = ?, booth_color = ?,
                booth_asset_key = ?, shipped_at = datetime('now')
          WHERE sector = ? AND slot_number = ? AND status = 'open'`
      )
      .bind(demo.name, DEMO_DESCRIPTION, DEMO_COLOR, demo.assetKey, sector, slotNumber)
      .run();
    return json({ ok: true, status: 'demo' });
  }

  if (row.status !== 'demo') return json({ ok: true, status: row.status });
  await env.DB
    .prepare(
      `UPDATE slots SET status = 'open', booth_name = NULL, booth_description = NULL, booth_color = NULL,
              booth_asset_key = NULL, shipped_at = NULL
        WHERE sector = ? AND slot_number = ? AND status = 'demo'`
    )
    .bind(sector, slotNumber)
    .run();
  return json({ ok: true, status: 'open' });
}
