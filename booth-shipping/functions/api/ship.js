import { json, badRequest } from '../_lib.js';

// Mirrors the 30MB ceiling already enforced client-side in the booth studio
// (MiCareerQuest-Ship-to-Venue) -- that check alone can be bypassed by
// anyone calling this endpoint directly, so it has to be re-checked here.
const MAX_BYTES = 30 * 1024 * 1024;

// MOCK NOTE: this accepts a small JSON "design" (name/description/color) so
// the claim -> ship -> manifest pipeline can be proven end to end without a
// real 3D asset pipeline attached yet. The real integration point is the
// booth studio's "Ship to venue" button -- swap that button's existing
// export/download call for a POST here with { email, glb: <binary> } and
// store the raw bytes in R2 instead of a JSON stub.
export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body.');
  }

  const email = String(body.email || '').trim().toLowerCase();
  const boothName = String(body.boothName || '').trim().slice(0, 120);
  const description = String(body.description || '').trim().slice(0, 500);
  const color = /^#[0-9a-fA-F]{6}$/.test(body.color || '') ? body.color : '#0c7580';

  if (!email) return badRequest('email is required.');
  if (!boothName) return badRequest('boothName is required.');

  const slot = await env.DB
    .prepare('SELECT sector, slot_number, status FROM slots WHERE email = ?')
    .bind(email)
    .first();
  if (!slot) return badRequest('No claimed slot found for that email. Claim a slot before shipping.', 404);
  if (slot.status === 'demo') {
    return badRequest('That slot was already filled with a placeholder booth. Contact the organizer.', 409);
  }

  const payload = JSON.stringify({
    boothName,
    description,
    color,
    email,
    shippedAt: new Date().toISOString(),
  });
  if (payload.length > MAX_BYTES) return badRequest('Booth package is too large.', 413);

  const key = `booths/${slot.sector}/${slot.slot_number}.json`;
  await env.BOOTHS.put(key, payload, { httpMetadata: { contentType: 'application/json' } });

  // Re-shipping (fixing a typo, swapping content) overwrites this same row
  // and the same R2 key -- it can never create a second booth for one email.
  await env.DB
    .prepare(
      `UPDATE slots
          SET status = 'shipped', shipped_at = datetime('now'),
              booth_asset_key = ?, booth_name = ?, booth_description = ?, booth_color = ?
        WHERE email = ?`
    )
    .bind(key, boothName, description, color, email)
    .run();

  return json({ ok: true, sector: slot.sector, slotNumber: slot.slot_number, assetKey: key });
}
