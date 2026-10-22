import { json, badRequest } from '../../_lib.js';

// Shared texture library for optimized booths. The booth builder embeds the
// same material maps (plaster, carpet, wood...) in every export; the
// optimizer stores each of them once under booths/library/ and optimized
// booths point at it, so a student downloads them once instead of 150 times.
// Names are the SHA-256 of the file's own bytes, so a name always means the
// same content and the files can be cached forever.
const NAME_RE = /^[0-9a-f]{64}\.(webp|png|jpg)$/;
const TYPES = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg' };
const MAX_BYTES = 8 * 1024 * 1024;

export async function onRequestGet(context) {
  const { request, env } = context;
  if (request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return badRequest('Unauthorized.', 401);
  }
  const names = [];
  let cursor;
  do {
    const page = await env.BOOTHS.list({ prefix: 'booths/library/', cursor });
    for (const o of page.objects) names.push(o.key.slice('booths/library/'.length));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return json({ names });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return badRequest('Unauthorized.', 401);
  }

  const name = new URL(request.url).searchParams.get('name') || '';
  if (!NAME_RE.test(name)) return badRequest('Invalid library image name.');
  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) return badRequest('Library image is empty or too large.', 413);

  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  if (!name.startsWith(digest + '.')) return badRequest('Library image name does not match its contents.');

  const key = 'booths/library/' + name;
  if (!(await env.BOOTHS.head(key))) {
    await env.BOOTHS.put(key, bytes, { httpMetadata: { contentType: TYPES[name.split('.').pop()] } });
  }
  return json({ ok: true, url: '/' + key });
}
