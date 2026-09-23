# Booth shipping backend (mock, 140 slots)

The one piece of "real" backend in the whole project. Everything else
(the student venue) stays a static site on Cloudflare Pages. This is a
small Cloudflare Pages + Functions + D1 + R2 app that runs on Cloudflare's
free tier, and does exactly one job: let an employer claim a booth slot
and ship a design to it, first-come-first-served, off a single shared link.

## How it works

- **One link, no accounts.** Every employer goes to the same `/` page.
  They pick a sector and type their company name + email. The email is
  their whole "identity" -- no password, no per-employer link to
  distribute. Coming back later with the same email routes them straight
  back to editing their own booth instead of claiming a new one.
- **First-come-first-served, race-safe.** Claiming a slot is a single
  atomic SQL statement in `functions/api/claim.js` (`UPDATE ... WHERE
  rowid = (SELECT ... LIMIT 1) RETURNING ...`). D1 serializes writes to a
  database, so two employers submitting in the same instant cannot land
  on the same slot number -- proven under `db/` by firing 25 concurrent
  claims at a 20-slot sector (see "Tested" below).
- **Reads scale for free, independent of writes.** `functions/api/manifest.js`
  -- what the student game will fetch -- is edge-cached for 30 seconds via
  the Cache API. Employers shipping booths (rare, low volume) hit the
  database; students loading the venue (the actual traffic spike) mostly
  hit Cloudflare's cache, not the database, no matter how many of them
  there are.
- **No-shows get a placeholder, on your schedule.** `functions/api/admin/fill-demo.js`
  is a manual action (call it with the admin key whenever you decide
  design season is over) that converts any still-`open` slots to a
  generic "demo booth" so no sector has a gap on fair day.

## This is a MOCK

- **140 slots, evenly split** across the 5 sectors that already exist in
  the venue (30/30/30/20/30 -- Manufacturing, Health Science,
  Agribusiness, Construction, Information Technology). Edit
  `SECTOR_COUNTS` in `db/generate-seed.js` and re-run `npm run db:seed:gen`
  once you know the real per-sector employer counts -- nothing else
  changes.
- **`ship` accepts a small JSON description** (title, description, accent
  color), not a real 3D booth. This proves the claim -> ship -> manifest
  pipeline end to end without the 3D asset pipeline attached yet. The
  real integration point is the "Ship to venue" button in the existing
  booth studio (`MiCareerQuest-Ship-to-Venue-v13.html`) -- point its
  export at `POST /api/ship` with `{ email, glb: <binary> }` instead of
  the small JSON stub, and store the raw GLB bytes in R2 (`env.BOOTHS`)
  instead of the JSON stub.

## Files

```
db/schema.sql          the one table: slots (sector, slot_number, status, ...)
db/generate-seed.js     edit SECTOR_COUNTS here, then `npm run db:seed:gen`
db/seed.sql             generated -- do not hand-edit
functions/api/sectors.js         GET  -- open/taken counts per sector (powers the picker)
functions/api/claim.js           POST -- atomic "take a number" claim
functions/api/lookup.js          GET  -- "welcome back" check by email
functions/api/ship.js            POST -- upload a design to your claimed slot
functions/api/manifest.js        GET  -- what the student game reads, edge-cached
functions/api/admin/fill-demo.js POST -- fill remaining open slots with placeholders
public/index.html        the one link employers use
public/venue-preview.html  stand-in for the student game reading /api/manifest
```

## Run it locally (no Cloudflare account needed)

```
npm install
npm run db:seed:gen                 # writes db/seed.sql from SECTOR_COUNTS
npx wrangler d1 execute micareerquest-slots --local --file=db/schema.sql
npx wrangler d1 execute micareerquest-slots --local --file=db/seed.sql
npm run dev                         # wrangler pages dev, local D1 + R2 emulation
```

Then open http://localhost:8788 (employer claim page) and
http://localhost:8788/venue-preview.html (what students would see).

To reset the mock data back to all-open:
`npx wrangler d1 execute micareerquest-slots --local --file=db/seed.sql`

## Tested (this pass)

- Claim -> welcome-back on repeat claim -> lookup -> ship -> shows up in
  manifest: full loop verified against the local dev server.
- 25 concurrent claim requests fired at a 20-slot sector: exactly 20
  unique slots assigned (1-20), the other 5 correctly rejected as
  "full" -- no double-assignment.
- Ship rejected with 404 for an email with no claimed slot.
- Admin fill-demo rejected without the key (401), fills all remaining
  open slots when authorized, and the manifest's 30s edge cache was
  observed serving the pre-fill snapshot until it expired -- confirms
  the caching that the scaling story depends on is actually active.

## Deploying for real (once you have a Cloudflare account)

```
npx wrangler d1 create micareerquest-slots        # paste the printed database_id into wrangler.toml
npx wrangler r2 bucket create micareerquest-booths
npx wrangler d1 execute micareerquest-slots --remote --file=db/schema.sql
npx wrangler d1 execute micareerquest-slots --remote --file=db/seed.sql
npx wrangler pages secret put ADMIN_KEY            # pick a real secret, not the dev default
npm run deploy
```
