import { json, badRequest, EMAIL_RE, claimOrRecognize, slugify } from '../_lib.js';

// Mirrors the 30MB ceiling already enforced client-side in the booth studio
// (see makeShipmentPacket's exportGLB in studio-frame.html) -- that check
// alone can be bypassed by anyone calling this endpoint directly, so it has
// to be re-checked here.
const MAX_BYTES = 30 * 1024 * 1024;

// This is the real integration point: the studio's "Ship to venue" button
// posts here directly (see shipToLiveVenue() in studio-frame.html) with the
// actual exported GLB, not a JSON stub. One call does both jobs -- claim a
// slot if this email doesn't have one yet, then upload -- so an employer
// never visits a separate claim page; opening the studio and shipping IS
// the whole flow.
export async function onRequestPost(context) {
  const { request, env } = context;

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return badRequest('Expected a multipart/form-data upload with a model file.');
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return badRequest('Could not read the upload.');
  }

  const email = String(form.get('email') || '').trim().toLowerCase();
  const sector = String(form.get('sector') || '').trim();
  const companyName = String(form.get('companyName') || '').trim().slice(0, 120);
  const boothName = String(form.get('boothName') || '').trim().slice(0, 120);
  const projectJson = form.get('project'); // opaque -- kept so a booth can be re-opened and re-shipped later
  const model = form.get('model');

  if (!email || !EMAIL_RE.test(email)) return badRequest('A valid contact email is required.');
  if (!sector) return badRequest('An industry/sector is required.');
  if (!(model instanceof File) || model.size === 0) return badRequest('No booth model was received.');
  if (model.size > MAX_BYTES) return badRequest('Booth file is too large (30MB max).', 413);

  const db = env.DB;
  const slot = await claimOrRecognize(db, { sector, email, companyName: companyName || boothName || email });
  if (!slot) return badRequest(`"${sector}" is full. Contact the organizer to be placed elsewhere.`, 409);
  if (slot.sector !== sector && slot.returning) {
    return badRequest(
      `This email already shipped a booth to ${slot.sector} #${slot.slot_number}. Contact the organizer if you need to move sectors.`,
      409
    );
  }
  if (slot.status === 'demo') {
    return badRequest('That slot was already filled with a placeholder booth. Contact the organizer.', 409);
  }

  const sectorSlug = slugify(slot.sector);
  const glbKey = `booths/${sectorSlug}/${slot.slot_number}.glb`;
  const projectKey = `booths/${sectorSlug}/${slot.slot_number}.project.json`;

  await env.BOOTHS.put(glbKey, await model.arrayBuffer(), {
    httpMetadata: { contentType: 'model/gltf-binary' },
  });
  if (typeof projectJson === 'string' && projectJson) {
    await env.BOOTHS.put(projectKey, projectJson, { httpMetadata: { contentType: 'application/json' } });
  }

  // Re-shipping (editing content, fixing a typo) overwrites this same row
  // and the same R2 keys -- it can never create a second booth for one email.
  await db
    .prepare(
      `UPDATE slots
          SET status = 'shipped', shipped_at = datetime('now'),
              booth_asset_key = ?, booth_name = ?
        WHERE email = ?`
    )
    .bind(glbKey, boothName || companyName || 'Untitled booth', email)
    .run();

  return json({ ok: true, sector: slot.sector, slotNumber: slot.slot_number, assetUrl: `/${glbKey}` });
}
