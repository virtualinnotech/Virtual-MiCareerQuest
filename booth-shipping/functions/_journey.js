import { badRequest } from './_lib.js';

// Student journeys: a student's progress saved under a short code, so they can
// continue on any computer. Only what the game already keeps is stored (first
// name, last initial, school and mission progress), and journeys nobody has
// played for 60 days are deleted.

// No 0/O, 1/I/L or U, so a code read off paper can't be misread.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
export const MAX_DATA_BYTES = 200 * 1024;

export function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('');
}

// "k7pq-2mxd", "K7PQ 2MXD" and "K7PQ2MXD" are the same code.
export function cleanCode(value) {
  const code = String(value || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  return code.length === 8 && [...code].every((c) => ALPHABET.includes(c)) ? code : null;
}

export function cleanStudent(body) {
  const firstName = String(body?.firstName || '').trim().replace(/\s+/g, ' ');
  const lastInitial = String(body?.lastInitial || '').trim().slice(0, 1).toUpperCase();
  const school = String(body?.school || '').trim().replace(/\s+/g, ' ');
  if (!/^\p{L}[\p{L} .'-]{0,29}$/u.test(firstName)) return { error: 'Type your first name (letters only).' };
  if (!/^\p{L}$/u.test(lastInitial)) return { error: 'Type the first letter of your last name.' };
  if (school.length < 2 || school.length > 80) return { error: 'Type the name of your school.' };
  return { firstName, lastInitial, school };
}

// The progress a game sends: a JSON object, kept small.
export function cleanData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const text = JSON.stringify(data);
  return text.length <= MAX_DATA_BYTES ? text : null;
}

export function cleanPercent(value) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

let ready = null;
// The table is created by the Worker itself the first time it is needed.
export function ensureJourneys(db) {
  ready ??= db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS journeys (
      code TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_initial TEXT NOT NULL,
      school TEXT NOT NULL,
      data TEXT NOT NULL DEFAULT '{}',
      percent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare('CREATE INDEX IF NOT EXISTS journeys_updated ON journeys (updated_at)'),
  ]).catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

export function deleteOldJourneys(db) {
  return db.prepare("DELETE FROM journeys WHERE updated_at < datetime('now', '-60 days')").run();
}

export async function readJson(request) {
  if (Number(request.headers.get('content-length') || 0) > MAX_DATA_BYTES + 4096) return { error: badRequest('Too much data.', 413) };
  try {
    return { body: await request.json() };
  } catch {
    return { error: badRequest('Invalid JSON body.') };
  }
}
