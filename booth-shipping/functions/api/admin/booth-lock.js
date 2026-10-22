import { json, badRequest, boothLock, BOOTH_LOCK_KEY } from '../../_lib.js';

// Admin "Booth editing" switch. While locked, /api/ship and /api/claim turn
// employers away with a clear message, so the booths students see cannot
// change mid-fair, and the student-download optimizer can safely run.
export async function onRequestGet(context) {
  const { request, env } = context;
  if (request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return badRequest('Unauthorized.', 401);
  }
  return json(await boothLock(env));
}

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
  if (typeof body.locked !== 'boolean') return badRequest('locked must be true or false.');

  const state = { locked: body.locked, changedAt: new Date().toISOString() };
  await env.BOOTHS.put(BOOTH_LOCK_KEY, JSON.stringify(state), {
    httpMetadata: { contentType: 'application/json' },
  });
  return json(state);
}
