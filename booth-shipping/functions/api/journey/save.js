import { json, badRequest } from '../../_lib.js';
import { cleanCode, cleanData, cleanPercent, ensureJourneys, readJson } from '../../_journey.js';

// Auto-save: the game sends the student's progress whenever it changes (at
// most every few seconds) and once more when the page is closed.
export async function onRequestPost(context) {
  const { request, env } = context;
  const { body, error } = await readJson(request);
  if (error) return error;
  const code = cleanCode(body?.code);
  if (!code) return badRequest('Unknown code.', 404);
  const data = cleanData(body.data);
  if (data === null) return badRequest('Progress is too large to save.', 413);
  await ensureJourneys(env.DB);
  const result = await env.DB
    .prepare("UPDATE journeys SET data = ?, percent = ?, updated_at = datetime('now') WHERE code = ?")
    .bind(data, cleanPercent(body.percent), code)
    .run();
  if (!result.meta.changes) return badRequest('Unknown code.', 404);
  return json({ ok: true });
}
