// Router for the modern Cloudflare Workers + static assets model.
//
// This project was originally built as a classic Cloudflare Pages project
// (functions/ directory, file-based routing, `wrangler pages deploy`).
// Cloudflare's dashboard now provisions everything as a plain Worker, and
// `wrangler pages deploy` can't target that -- so this is a thin router
// that reuses the exact same handler files unchanged (they're plain
// `onRequestGet(context)` / `onRequestPost(context)` functions) and falls
// through to the static asset binding for everything else.
import * as sectors from '../functions/api/sectors.js';
import * as claim from '../functions/api/claim.js';
import * as lookup from '../functions/api/lookup.js';
import * as ship from '../functions/api/ship.js';
import * as manifest from '../functions/api/manifest.js';
import * as fillDemo from '../functions/api/admin/fill-demo.js';
import * as booths from '../functions/booths/[[path]].js';

const ROUTES = [
  { method: 'GET', path: '/api/sectors', handler: sectors.onRequestGet },
  { method: 'POST', path: '/api/claim', handler: claim.onRequestPost },
  { method: 'GET', path: '/api/lookup', handler: lookup.onRequestGet },
  { method: 'POST', path: '/api/ship', handler: ship.onRequestPost },
  { method: 'GET', path: '/api/manifest', handler: manifest.onRequestGet },
  { method: 'POST', path: '/api/admin/fill-demo', handler: fillDemo.onRequestPost },
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const context = { request, env, waitUntil: ctx.waitUntil.bind(ctx) };

    // design.html is a ~62MB single-file export of the booth studio --
    // Cloudflare's static asset serving (both the old Pages product and
    // the current Workers+assets model) caps individual files at 25MB, so
    // it can't be a static asset. R2 has no such limit, so it's uploaded
    // there at build/deploy time (see sync:design-page:*) and streamed out
    // here instead.
    if (url.pathname === '/design.html') {
      const object = await env.BOOTHS.get('static/design.html');
      if (!object) return new Response('design.html not uploaded to R2 yet.', { status: 404 });
      const headers = new Headers();
      headers.set('content-type', 'text/html; charset=utf-8');
      headers.set('cache-control', 'public, max-age=300');
      return new Response(object.body, { headers });
    }

    if (url.pathname.startsWith('/booths/')) {
      const segments = url.pathname.slice('/booths/'.length).split('/');
      return booths.onRequestGet({ ...context, params: { path: segments } });
    }

    const route = ROUTES.find((r) => r.method === request.method && r.path === url.pathname);
    if (route) return route.handler(context);

    return env.ASSETS.fetch(request);
  },
};
