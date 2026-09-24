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
import * as listBooths from '../functions/api/admin/list-booths.js';
import * as resetSlot from '../functions/api/admin/reset-slot.js';
import * as updateSlot from '../functions/api/admin/update-slot.js';
import * as booths from '../functions/booths/[[path]].js';

const ROUTES = [
  { method: 'GET', path: '/api/sectors', handler: sectors.onRequestGet },
  { method: 'POST', path: '/api/claim', handler: claim.onRequestPost },
  { method: 'GET', path: '/api/lookup', handler: lookup.onRequestGet },
  { method: 'POST', path: '/api/ship', handler: ship.onRequestPost },
  { method: 'GET', path: '/api/manifest', handler: manifest.onRequestGet },
  { method: 'POST', path: '/api/admin/fill-demo', handler: fillDemo.onRequestPost },
  { method: 'GET', path: '/api/admin/list-booths', handler: listBooths.onRequestGet },
  { method: 'POST', path: '/api/admin/reset-slot', handler: resetSlot.onRequestPost },
  { method: 'POST', path: '/api/admin/update-slot', handler: updateSlot.onRequestPost },
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const context = { request, env, waitUntil: ctx.waitUntil.bind(ctx) };

    // "/" used to serve a leftover mock claim page from before the real
    // studio (design.html) existed -- it posted plain JSON to /api/ship,
    // which has expected a real multipart GLB upload for a long time, so
    // it was just a broken dead end. There is no third link: employers get
    // /design.html directly, students get /venue.html directly. Anyone who
    // lands on the bare domain is far more likely to be a student, so send
    // them straight into the fair.
    if (url.pathname === '/') {
      return Response.redirect(new URL('/venue.html', request.url).toString(), 302);
    }

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

    // venue.html (the student "walk the fair" link) is the same ~47MB venue
    // renderer the studio's own "Walk venue" tab embeds, standing alone at
    // the top level instead of in an iframe. Same 25MB static-asset limit
    // problem as design.html, same R2 fix. When it's loaded at the top of
    // the browsing context (not inside the studio's iframe) its own script
    // switches into student mode: it hides the employer/QA controls and
    // fetches /api/manifest itself to place every shipped booth.
    if (url.pathname === '/venue.html') {
      const object = await env.BOOTHS.get('static/venue.html');
      if (!object) return new Response('venue.html not uploaded to R2 yet.', { status: 404 });
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
