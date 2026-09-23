// Serves the R2 objects that /api/ship writes (booths/<sector>/<slot>.glb
// and .project.json) as plain, cacheable URLs -- this is what the student
// venue and the manifest's assetUrl actually point at. Cached at the edge
// for the same reason /api/manifest is: booth uploads are rare, but a GLB
// might be fetched by thousands of students loading the venue at once, and
// that traffic should hit Cloudflare's cache, not R2, however many there are.
export async function onRequestGet(context) {
  const { params, env, request } = context;
  const segments = Array.isArray(params.path) ? params.path : [params.path];
  const key = 'booths/' + segments.join('/');

  const cache = caches.default;
  const cacheKey = new Request(request.url, request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const object = await env.BOOTHS.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  // Belt and suspenders: local R2 emulation doesn't reliably carry the
  // contentType set at upload time through writeHttpMetadata, so pin it by
  // extension too -- this is what actually matters for a <script type=module>
  // GLTFLoader or a raw fetch().arrayBuffer() consumer.
  if (key.endsWith('.glb')) headers.set('content-type', 'model/gltf-binary');
  else if (key.endsWith('.json')) headers.set('content-type', 'application/json');
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=300');

  const response = new Response(object.body, { headers });
  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
