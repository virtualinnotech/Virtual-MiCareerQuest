import { json, badRequest } from '../../_lib.js';
import { ensureJourneys, deleteOldJourneys } from '../../_journey.js';

// "Find a student's code" on the admin page. Every word typed has to match the
// first name, last initial, school or code, so "maria central" finds Maria at
// Grand Rapids Central. Lists the newest first.
export async function onRequestGet(context) {
  const { request, env } = context;
  if (request.headers.get('x-admin-key') !== env.ADMIN_KEY) return badRequest('Unauthorized.', 401);
  await ensureJourneys(env.DB);
  await deleteOldJourneys(env.DB);
  const words = (new URL(request.url).searchParams.get('q') || '').trim().split(/\s+/).filter(Boolean).slice(0, 4);
  const where = words.map(() => '(first_name LIKE ? OR school LIKE ? OR code LIKE ? OR last_initial = ?)').join(' AND ');
  const args = words.flatMap((w) => {
    const like = '%' + w.replace(/[%_]/g, '') + '%';
    return [like, like, like.replace(/-/g, '').toUpperCase(), w.toUpperCase()];
  });
  const { results } = await env.DB
    .prepare(`SELECT code, first_name, last_initial, school, percent, created_at, updated_at FROM journeys ${where ? 'WHERE ' + where : ''} ORDER BY updated_at DESC LIMIT 50`)
    .bind(...args)
    .all();
  const total = await env.DB.prepare('SELECT COUNT(*) AS n FROM journeys').first();
  return json({ ok: true, total: total?.n ?? 0, journeys: results });
}
