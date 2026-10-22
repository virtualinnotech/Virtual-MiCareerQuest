import { json, badRequest, slugify } from '../../_lib.js';

// "Undo optimization": every slot goes back to the employer's original
// upload. The optimized copies stay in R2 (harmless, never listed) so this
// is instant and safe to press at any time, locked or not.
export async function onRequestPost(context) {
  const { request, env } = context;
  if (request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return badRequest('Unauthorized.', 401);
  }

  const rows = await env.DB
    .prepare(`SELECT sector, slot_number FROM slots WHERE booth_asset_key LIKE '%.opt.glb.gz'`)
    .all();
  for (const r of rows.results) {
    await env.DB
      .prepare('UPDATE slots SET booth_asset_key = ? WHERE sector = ? AND slot_number = ?')
      .bind(`booths/${slugify(r.sector)}/${r.slot_number}.glb`, r.sector, r.slot_number)
      .run();
  }
  return json({ ok: true, restored: rows.results.length });
}
