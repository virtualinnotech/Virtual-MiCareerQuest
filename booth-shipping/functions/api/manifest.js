import { json } from '../_lib.js';

// This is what the STUDENT game fetches on load -- the whole reason the
// scaling story stays simple. It's a read against D1 (cheap), but the
// response is cached at Cloudflare's edge for 30s via the Cache API below,
// so bursts of students loading the venue at once hit the CDN cache, not
// the database, however many of them there are.
export async function onRequestGet(context) {
  const { request, env } = context;
  const cache = caches.default;
  const cacheKey = new Request(request.url, request);

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const rows = await env.DB
    .prepare(
      `SELECT sector, slot_number, status, booth_name, booth_description, booth_color, booth_asset_key
         FROM slots
        WHERE status IN ('shipped', 'demo')
        ORDER BY sector, slot_number`
    )
    .all();

  const response = json({ generatedAt: new Date().toISOString(), booths: rows.results });
  response.headers.set('Cache-Control', 'public, max-age=30');
  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
