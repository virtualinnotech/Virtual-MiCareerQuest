import { json, badRequest } from '../../_lib.js';

// Manual, deliberate action (not a timer) -- you press this when you decide
// design season is over, not automatically at some hardcoded date. Anything
// still 'open' becomes a placeholder booth so no sector has a gap.
export async function onRequestPost(context) {
  const { request, env } = context;
  if (request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return badRequest('Unauthorized.', 401);
  }

  const result = await env.DB
    .prepare(
      `UPDATE slots
          SET status = 'demo',
              booth_name = '(Demo booth)',
              booth_description = 'This employer was unable to design a booth in time. General industry information is shown instead.',
              booth_color = '#8a8f98',
              shipped_at = datetime('now')
        WHERE status = 'open'`
    )
    .run();

  return json({ ok: true, filled: result.meta.changes });
}
