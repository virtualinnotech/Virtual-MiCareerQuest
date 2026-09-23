import { json, badRequest } from '../_lib.js';

// "Welcome back" check -- lets the landing page skip straight to editing
// when a returning employer types the same email, instead of claiming again.
export async function onRequestGet(context) {
  const { request, env } = context;
  const email = new URL(request.url).searchParams.get('email')?.trim().toLowerCase();
  if (!email) return badRequest('email query param is required.');

  const row = await env.DB
    .prepare('SELECT sector, slot_number, status, booth_name FROM slots WHERE email = ?')
    .bind(email)
    .first();

  if (!row) return json({ found: false });
  return json({
    found: true,
    sector: row.sector,
    slotNumber: row.slot_number,
    status: row.status,
    boothName: row.booth_name,
  });
}
