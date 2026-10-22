import { json, badRequest } from '../../_lib.js';

// The admin page's booth file check. Every slot that puts a booth in the
// student fair has to point at a file that exists, or students' games leave
// that booth out. Looks each file up without downloading it.
export async function onRequestGet(context) {
  const { request, env } = context;
  if (request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return badRequest('Unauthorized.', 401);
  }

  const { results } = await env.DB
    .prepare(
      `SELECT sector, slot_number, status, booth_name, booth_asset_key
         FROM slots
        WHERE status IN ('shipped', 'demo')
        ORDER BY sector, slot_number`
    )
    .all();

  // Demo booths ship with the site as static files; employer booths are in R2.
  const origin = new URL(request.url).origin;
  const found = new Map();
  const exists = (key) => {
    if (!found.has(key)) {
      found.set(key, key.startsWith('demo-booths/')
        ? env.ASSETS.fetch(new Request(`${origin}/${key}`)).then((r) => { r.body?.cancel(); return r.ok; })
        : env.BOOTHS.head(key).then((object) => !!object));
    }
    return found.get(key);
  };

  const missing = [];
  await Promise.all(results.map(async (slot) => {
    if (!slot.booth_asset_key || !(await exists(slot.booth_asset_key))) {
      missing.push({ sector: slot.sector, slot_number: slot.slot_number, status: slot.status, booth_name: slot.booth_name });
    }
  }));
  missing.sort((a, b) => a.sector.localeCompare(b.sector) || a.slot_number - b.slot_number);
  return json({ ok: true, checked: results.length, missing });
}
