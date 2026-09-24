import { json, badRequest } from '../../_lib.js';

// The admin page's data source: every slot, whatever its status, including
// the employer's contact email -- this is how an employer who lost track of
// the email they shipped with can be looked up and reminded.
export async function onRequestGet(context) {
  const { request, env } = context;
  if (request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return badRequest('Unauthorized.', 401);
  }

  const rows = await env.DB
    .prepare(
      `SELECT sector, slot_number, status, company_name, email, claimed_at, shipped_at, booth_name
         FROM slots
        ORDER BY sector, slot_number`
    )
    .all();

  return json({ slots: rows.results });
}
