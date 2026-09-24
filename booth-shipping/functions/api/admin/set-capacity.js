import { json, badRequest } from '../../_lib.js';

// Hard caps on how many booths each sector's physical floor space can ever
// hold -- computed by the same procedural layout generator venue-frame.html
// uses at runtime (concentric rings around the sector's fixed landmark
// sculptures, then perimeter rows, shrinking booth footprint as needed down
// to a floor where the walking-aisle gap -- tied to the visitor's real,
// unscaled collision width -- stops shrinking). Verified by exhaustive
// simulation, not a guess; keep in sync with venue-frame.html's
// LAYOUT_SCALE_STEPS/LAYOUT_MIN_SCALE/LAYOUT_AISLE_GAP if those ever change.
const SECTOR_MAX_CAPACITY = {
  Manufacturing: 71,
  'Health Science': 75,
  Agribusiness: 70,
  Construction: 72,
  'Information Technology': 61,
};

// Grows or shrinks how many slots a sector has. Growing inserts new 'open'
// rows (the venue's layout generator picks up the new total on its next
// boot via /api/sectors, no other action needed). Shrinking only removes
// slots that are still 'open' -- an employer who already claimed or shipped
// into a slot is never silently evicted by a capacity change.
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
  const total = Number(body.total);
  if (!Object.prototype.hasOwnProperty.call(SECTOR_MAX_CAPACITY, sector)) {
    return badRequest('Unknown sector.');
  }
  if (!Number.isInteger(total) || total < 0) {
    return badRequest('total must be a non-negative whole number.');
  }
  const max = SECTOR_MAX_CAPACITY[sector];
  if (total > max) {
    return badRequest(`${sector} can hold at most ${max} booths at this venue's fixed floor size.`, 409);
  }

  const db = env.DB;
  const current = await db
    .prepare('SELECT COUNT(*) AS count, COALESCE(MAX(slot_number),0) AS maxSlot FROM slots WHERE sector = ?')
    .bind(sector)
    .first();

  if (total === current.count) {
    return json({ ok: true, sector, total: current.count, changed: 0 });
  }

  if (total > current.count) {
    const toAdd = total - current.count;
    const stmts = [];
    for (let i = 1; i <= toAdd; i++) {
      stmts.push(
        db.prepare('INSERT INTO slots (sector, slot_number, status) VALUES (?, ?, ?)').bind(sector, current.maxSlot + i, 'open')
      );
    }
    await db.batch(stmts);
    return json({ ok: true, sector, total, changed: toAdd });
  }

  // Shrinking: only the highest-numbered slots, and only if every one of
  // them is still open.
  const toRemove = current.count - total;
  const candidates = await db
    .prepare('SELECT slot_number, status FROM slots WHERE sector = ? ORDER BY slot_number DESC LIMIT ?')
    .bind(sector, toRemove)
    .all();
  const blocked = candidates.results.find((r) => r.status !== 'open');
  if (blocked) {
    return badRequest(
      `Can't shrink below ${current.count - candidates.results.filter((r) => r.status === 'open').length}: slot #${blocked.slot_number} is ${blocked.status}, not open. Reset it first if you want to free it up.`,
      409
    );
  }

  const slotNumbers = candidates.results.map((r) => r.slot_number);
  await db.batch(
    slotNumbers.map((n) => db.prepare('DELETE FROM slots WHERE sector = ? AND slot_number = ?').bind(sector, n))
  );
  return json({ ok: true, sector, total, changed: -toRemove });
}
