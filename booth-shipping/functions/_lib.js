export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export function badRequest(message, status = 400) {
  return json({ error: message }, status);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// R2 object keys and the /booths/<...> URLs built from them need to
// round-trip through a URL path cleanly. A raw sector name like
// "Information Technology" breaks that (params.path in a Pages Functions
// catch-all route isn't reliably re-decoded to match the literal-space key
// used at upload time) -- slugging it avoids the whole encode/decode
// mismatch class of bugs instead of trying to get encoding symmetric.
export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Shared by /api/claim and /api/ship (which claims-if-needed before it
// uploads, so an employer never has to visit two separate pages).
//
// Returning employer: this email already owns a slot -- hand it back instead
// of letting them claim a second one.
//
// New employer: a single atomic UPDATE...RETURNING against the lowest-
// numbered open slot in the chosen sector. D1 serializes writes to a
// database, so two employers submitting in the same instant cannot land on
// the same slot number -- one simply gets the next slot up, or a "full"
// result if that was the last one.
export async function claimOrRecognize(db, { sector, email, companyName }) {
  const existing = await db
    .prepare('SELECT sector, slot_number, status FROM slots WHERE email = ?')
    .bind(email)
    .first();
  if (existing) return { ...existing, returning: true };

  const claimed = await db
    .prepare(
      `UPDATE slots
          SET status = 'claimed', company_name = ?, email = ?, claimed_at = datetime('now')
        WHERE rowid = (
          SELECT rowid FROM slots WHERE sector = ? AND status = 'open' ORDER BY slot_number LIMIT 1
        )
        RETURNING sector, slot_number, status`
    )
    .bind(companyName, email, sector)
    .first();

  if (!claimed) return null; // sector full
  return { ...claimed, returning: false };
}
