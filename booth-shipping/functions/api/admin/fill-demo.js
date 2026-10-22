import { json, badRequest, slugify, DEMO_SECTORS, DEMO_DESIGNS, DEMO_DESCRIPTION, DEMO_COLOR } from '../../_lib.js';

// The admin page's Fill toggle. On ({on: true}, also the default) puts a demo
// booth in every slot that is still 'open', so the whole venue can be run
// before every employer has shipped; off ({on: false}) empties every demo
// slot again. Employer slots are never touched either way.
export async function onRequestPost(context) {
  const { request, env } = context;
  if (request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return badRequest('Unauthorized.', 401);
  }

  let on = true;
  try {
    on = (await request.json()).on !== false;
  } catch {
    // No body: fill, as this endpoint always has.
  }

  if (!on) {
    const result = await env.DB
      .prepare(
        `UPDATE slots SET status = 'open', booth_name = NULL, booth_description = NULL, booth_color = NULL,
                booth_asset_key = NULL, shipped_at = NULL
          WHERE status = 'demo'`
      )
      .run();
    return json({ ok: true, cleared: result.meta.changes });
  }

  // Same design choice as demoBooth() in _lib.js, done in SQL per sector.
  let filled = 0;
  for (const sector of DEMO_SECTORS) {
    const result = await env.DB
      .prepare(
        `UPDATE slots
            SET status = 'demo',
                booth_name = ? || ' Demo ' || (((slot_number - 1) % ?) + 1),
                booth_description = ?, booth_color = ?,
                booth_asset_key = 'demo-booths/models/' || ? || '-' || (((slot_number - 1) % ?) + 1) || '.glb.gz',
                shipped_at = datetime('now')
          WHERE status = 'open' AND sector = ?`
      )
      .bind(sector, DEMO_DESIGNS, DEMO_DESCRIPTION, DEMO_COLOR, slugify(sector), DEMO_DESIGNS, sector)
      .run();
    filled += result.meta.changes;
  }
  return json({ ok: true, filled });
}
