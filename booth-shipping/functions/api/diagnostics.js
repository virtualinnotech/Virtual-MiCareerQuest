import { json, badRequest } from '../_lib.js';

// Results of the game's self-running speed test (/student?diagnose=<id>). The
// game posts one small report under the id from its link, and the same id
// reads it back. A report only says how fast a computer ran the game (its
// graphics chip, frame rates, timings), so the random id is the only key.
const ID_RE = /^[a-z0-9]{12,40}$/;
const MAX_BYTES = 64 * 1024;

function reportKey(request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  return ID_RE.test(id) ? `diagnostics/${id}.json` : null;
}

export async function onRequestGet(context) {
  const key = reportKey(context.request);
  if (!key) return badRequest('Unknown report.', 404);
  const object = await context.env.BOOTHS.get(key);
  if (!object) return badRequest('No report yet.', 404);
  return new Response(object.body, { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const key = reportKey(request);
  if (!key) return badRequest('Unknown report.', 404);
  if (Number(request.headers.get('content-length') || 0) > MAX_BYTES) return badRequest('Report too large.', 413);
  const text = await request.text();
  if (text.length > MAX_BYTES) return badRequest('Report too large.', 413);
  let report;
  try {
    report = JSON.parse(text);
  } catch {
    return badRequest('Report must be JSON.');
  }
  if (report?.format !== 'micareerquest-diagnose') return badRequest('Not a game report.');
  await env.BOOTHS.put(key, text, { httpMetadata: { contentType: 'application/json' } });
  return json({ ok: true });
}
