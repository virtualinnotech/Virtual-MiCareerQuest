import { json, badRequest } from '../_lib.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The "take a number" step. One link, everyone hits this same endpoint.
export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body.');
  }

  const sector = String(body.sector || '').trim();
  const companyName = String(body.companyName || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().toLowerCase();

  if (!sector || !companyName || !email) {
    return badRequest('sector, companyName and email are all required.');
  }
  if (!EMAIL_RE.test(email)) {
    return badRequest('That does not look like a valid email address.');
  }

  const db = env.DB;

  // Returning employer: this email already owns a slot. Send them back to
  // it instead of letting them claim a second one.
  const existing = await db
    .prepare('SELECT sector, slot_number, status FROM slots WHERE email = ?')
    .bind(email)
    .first();
  if (existing) {
    return json({
      sector: existing.sector,
      slotNumber: existing.slot_number,
      status: existing.status,
      returning: true,
    });
  }

  // Atomic claim. This single UPDATE...RETURNING targets the lowest-numbered
  // open slot in the chosen sector. D1 serializes writes to a database, so
  // two employers submitting in the same instant cannot both land on the
  // same slot number -- one of them will simply see the next slot up (or a
  // "full" response if that was the last one).
  const claimed = await db
    .prepare(
      `UPDATE slots
          SET status = 'claimed', company_name = ?, email = ?, claimed_at = datetime('now')
        WHERE rowid = (
          SELECT rowid FROM slots WHERE sector = ? AND status = 'open' ORDER BY slot_number LIMIT 1
        )
        RETURNING sector, slot_number`
    )
    .bind(companyName, email, sector)
    .first();

  if (!claimed) {
    return badRequest(`"${sector}" is full. Please choose a different sector.`, 409);
  }

  return json({
    sector: claimed.sector,
    slotNumber: claimed.slot_number,
    status: 'claimed',
    returning: false,
  });
}
