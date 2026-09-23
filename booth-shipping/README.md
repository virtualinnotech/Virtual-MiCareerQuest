# Booth shipping backend (140 slots, real integration)

The one piece of "real" backend in the whole project. Everything else
(the student venue) stays a static site on Cloudflare Pages. This is a
small Cloudflare Pages + Functions + D1 + R2 app that runs on Cloudflare's
free tier, and does exactly one job: let an employer design a booth in the
existing 3D studio and ship it straight to a slot, first-come-first-served,
off a single shared link -- no separate claim step.

## How it works

- **One link, no accounts.** Employers open `design.html` (the existing
  booth studio, `MiCareerQuest-Ship-to-Venue-v13.html`, unmodified except
  for its "Ship to venue" button). They fill in company name, contact
  email and industry -- fields the studio already had -- design their
  booth, and hit Ship. The email is their whole "identity": no password,
  no per-employer link to distribute. Coming back later with the same
  email routes them straight back to editing their own booth.
- **Claim-and-upload in one call.** `functions/api/ship.js` claims a slot
  for this email if it doesn't have one yet, then stores the real
  exported GLB -- there's no separate "claim a spot" page in the real
  flow; opening the studio and shipping IS the whole thing.
  `functions/api/claim.js` still exists standalone too, for a lightweight
  "check open spots first" page or for testing without the full 3D studio.
- **First-come-first-served, race-safe.** The claim is a single atomic SQL
  statement (`UPDATE ... WHERE rowid = (SELECT ... LIMIT 1) RETURNING ...`,
  shared by claim.js and ship.js via `claimOrRecognize()` in `_lib.js`).
  D1 serializes writes to a database, so two employers submitting in the
  same instant cannot land on the same slot number -- proven by firing 25
  concurrent claims at a 20-slot sector (see "Tested" below).
- **Reads scale for free, independent of writes.** `functions/api/manifest.js`
  -- what the student game will fetch -- and `functions/booths/[[path]].js`
  -- which serves the actual GLB files -- are both edge-cached via the
  Cache API. Employers shipping booths (rare, low volume) hit the database
  and R2; students loading the venue (the actual traffic spike) mostly hit
  Cloudflare's cache, no matter how many of them there are.
- **No-shows get a placeholder, on your schedule.** `functions/api/admin/fill-demo.js`
  is a manual action (call it with the admin key whenever you decide
  design season is over) that converts any still-`open` slots to a
  generic "demo booth" so no sector has a gap on fair day.

## Still ahead

- **140 slots, evenly split** across the 5 sectors that already exist in
  the venue (30/30/30/20/30 -- Manufacturing, Health Science,
  Agribusiness, Construction, Information Technology). Edit
  `SECTOR_COUNTS` in `db/generate-seed.js` and re-run `npm run db:seed:gen`
  once you know the real per-sector employer counts -- nothing else
  changes.
- **The student venue doesn't read the manifest yet.** Employers can now
  design and ship a real booth, and `GET /api/manifest` / the individual
  `/booths/<sector>/<slot>.glb` files are ready and edge-cached, but
  nothing in `venue-frame.html` fetches them and drops them into the 3D
  scene yet -- today it only shows locally shipped booths in the
  employer's own browser (the `SHIP_BOOTH` -> `venueFrame` postMessage
  path, kept as-is for their own instant local preview). That dynamic-load
  wiring is the next piece.

## Files

```
db/schema.sql          the one table: slots (sector, slot_number, status, ...)
db/generate-seed.js     edit SECTOR_COUNTS here, then `npm run db:seed:gen`
db/seed.sql             generated -- do not hand-edit
functions/_lib.js                shared helpers: json/badRequest, claimOrRecognize, slugify
functions/api/sectors.js         GET  -- open/taken counts per sector
functions/api/claim.js           POST -- standalone claim (testing / a "check spots" page)
functions/api/lookup.js          GET  -- "welcome back" check by email
functions/api/ship.js            POST -- claim-if-needed + upload the real GLB (multipart)
functions/api/manifest.js        GET  -- what the student game will read, edge-cached
functions/api/admin/fill-demo.js POST -- fill remaining open slots with placeholders
functions/booths/[[path]].js     GET  -- serves the uploaded GLBs from R2, edge-cached
public/index.html         standalone claim-only page (not the real employer flow anymore)
public/venue-preview.html   stand-in for the student game reading /api/manifest
public/design.html         NOT committed -- copied in by `npm run sync:design-page`
                            from ../MiCareerQuest-Ship-to-Venue-v13.html. This is the
                            real employer link once deployed.
```

The studio itself (`../studio-frame.html`, the iframe the design page
embeds) has the actual integration: `shipToLiveVenue()` builds a
`multipart/form-data` POST to `/api/ship` with the exported GLB, contact
email, industry and booth name, fired from the existing "Ship to venue"
button alongside (not instead of) its original local-preview behavior.
`../MiCareerQuest-Ship-to-Venue-v13.html` embeds that studio as a base64
blob -- editing it directly isn't practical (single ~65MB line), so any
future change to the ship flow should be made in `../studio-frame.html`
and re-spliced in (see git history for the splice approach: find the
`<script id="studio-source">` tag, replace only its base64 content,
verify the decoded result matches the edited file before writing).

## Run it locally (no Cloudflare account needed)

```
npm install
npm run db:seed:gen                 # writes db/seed.sql from SECTOR_COUNTS
npx wrangler d1 execute micareerquest-slots --local --file=db/schema.sql
npx wrangler d1 execute micareerquest-slots --local --file=db/seed.sql
npm run dev                         # syncs design.html, then wrangler pages dev
```

Then open http://localhost:8788/design.html and use the actual booth
studio -- click "Use sample company" to fill the form instantly, then
"Ship to venue". http://localhost:8788/venue-preview.html shows what
landed, reading the same `/api/manifest` endpoint.

To reset the mock data back to all-open:
`npx wrangler d1 execute micareerquest-slots --local --file=db/seed.sql`

## Tested (this pass)

- **Real browser, real studio, real export**: drove `design.html` with
  Playwright/Chromium, clicked "Use sample company" then "Ship to venue",
  and captured the actual `POST /api/ship` the studio fired -- 200,
  `{"sector":"Manufacturing","slotNumber":1,"assetUrl":"/booths/manufacturing/1.glb"}`.
  Fetched that URL back and confirmed with `file` that it's a genuine
  ~4MB "glTF binary model, version 2" -- the studio's real export, not a
  stub -- and that the manifest correctly shows the sample company name.
- **Claim-if-needed inside ship**: shipping with no prior claim on that
  email claims a slot and uploads in the same call; re-shipping the same
  email overwrites the same slot (`taken` count stays 1, not 2) instead
  of creating a duplicate.
- **Sector names with spaces** ("Information Technology") round-trip
  correctly: `ship.js` slugs the sector for the R2 key /
  `/booths/<slug>/<n>.glb` URL, avoiding a real bug this surfaced where
  the raw name broke the URL <-> storage-key match.
- 25 concurrent claim requests fired at a 20-slot sector: exactly 20
  unique slots assigned (1-20), the other 5 correctly rejected as "full"
  -- no double-assignment.
- Admin fill-demo rejected without the key (401), fills all remaining
  open slots when authorized.
- The manifest's edge cache was observed serving a pre-fill snapshot
  until it expired -- confirms the caching the scaling story depends on
  is actually active, not just configured.

## Deploying for real (once you have a Cloudflare account)

```
npx wrangler d1 create micareerquest-slots        # paste the printed database_id into wrangler.toml
npx wrangler r2 bucket create micareerquest-booths
npx wrangler d1 execute micareerquest-slots --remote --file=db/schema.sql
npx wrangler d1 execute micareerquest-slots --remote --file=db/seed.sql
npx wrangler pages secret put ADMIN_KEY            # pick a real secret, not the dev default
npm run deploy                                      # syncs design.html, then deploys
```
