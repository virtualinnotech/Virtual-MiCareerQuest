import { json, badRequest, EMAIL_RE, claimOrRecognize } from '../_lib.js';

// The "take a number" step. One link, everyone hits this same endpoint.
// (The studio's "Ship to venue" button now does this itself in one call --
// this standalone endpoint stays for the check-spots-first landing page and
// for anyone testing the flow before opening the full 3D studio.)
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

  const result = await claimOrRecognize(env.DB, { sector, email, companyName });
  if (!result) {
    return badRequest(`"${sector}" is full. Please choose a different sector.`, 409);
  }

  return json({
    sector: result.sector,
    slotNumber: result.slot_number,
    status: result.status,
    returning: result.returning,
  });
}
