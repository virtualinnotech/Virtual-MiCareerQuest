import { json, badRequest, EMAIL_RE } from '../../_lib.js';

// Corrects a typo'd contact email (or company name) on an existing slot,
// without touching its booth design/status -- for when an employer shipped
// with the wrong address and can no longer look themselves up.
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

  const sector = String(body.sector || '').trim();
  const slotNumber = Number(body.slotNumber);
  const email = String(body.email || '').trim().toLowerCase();
  const companyName = body.companyName != null ? String(body.companyName).trim().slice(0, 120) : undefined;
  if (!sector || !Number.isInteger(slotNumber)) {
    return badRequest('sector and slotNumber are required.');
  }
  if (!email || !EMAIL_RE.test(email)) {
    return badRequest('A valid email is required.');
  }

  const row = await env.DB
    .prepare('SELECT sector FROM slots WHERE sector = ? AND slot_number = ?')
    .bind(sector, slotNumber)
    .first();
  if (!row) return badRequest('No such slot.', 404);

  try {
    if (companyName !== undefined) {
      await env.DB
        .prepare('UPDATE slots SET email = ?, company_name = ? WHERE sector = ? AND slot_number = ?')
        .bind(email, companyName, sector, slotNumber)
        .run();
    } else {
      await env.DB
        .prepare('UPDATE slots SET email = ? WHERE sector = ? AND slot_number = ?')
        .bind(email, sector, slotNumber)
        .run();
    }
  } catch (e) {
    if (String(e.message || '').includes('UNIQUE')) {
      return badRequest('That email is already used by another booth.', 409);
    }
    throw e;
  }

  return json({ ok: true });
}
