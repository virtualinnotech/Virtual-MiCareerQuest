import { badRequest } from '../../_lib.js';

// The optimizer on the admin page reads each employer's original upload
// straight from R2 here, so it never works from a stale edge-cached copy.
export async function onRequestGet(context) {
  const { request, env } = context;
  if (request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return badRequest('Unauthorized.', 401);
  }

  const key = new URL(request.url).searchParams.get('key') || '';
  if (!/^booths\/[a-z0-9-]+\/\d+\.glb$/.test(key)) return badRequest('Invalid booth key.');

  const object = await env.BOOTHS.get(key);
  if (!object) return badRequest('Booth file not found.', 404);
  return new Response(object.body, {
    headers: { 'content-type': 'model/gltf-binary', 'cache-control': 'no-store' },
  });
}
