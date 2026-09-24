# Booth shipping backend (140 slots, real integration)

The one piece of "real" backend in the whole project. This is a small
Cloudflare Worker (with a static assets binding, D1, and R2) that runs on
Cloudflare's free tier, and does exactly one job: let an employer design a
booth in the existing 3D studio and ship it straight to a slot,
first-come-first-served, off a single shared link -- no separate claim step.

Built originally as a classic Cloudflare Pages project (a `functions/`
directory with file-based routing). Cloudflare's dashboard now provisions
everything as a plain Worker instead, so `src/index.js` is a thin router
that dispatches to those same handler files unchanged and falls through to
the static asset binding for everything else -- see "Files" below.

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
- **`design.html` is served from R2, not as a static asset.** It's a
  ~62MB single-file export of the booth studio, and Cloudflare's static
  asset serving (both the old Pages product and the current Workers+assets
  model) caps individual files at 25MB -- a hard platform limit, discovered
  the hard way against a real deploy. `sync:design-page:*` uploads it to R2
  at dev/deploy time instead, and `src/index.js` streams it back out for
  `GET /design.html`. R2 has no such per-object limit.
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
- **The student venue reads the manifest on its own.** `venue-frame.html`
  detects when it's loaded standalone (top-level, not inside the studio's
  iframe) and fetches `GET /api/manifest` itself, placing every shipped
  booth from `/booths/<sector>/<slot>.glb`. The employer's own local
  preview still uses the original `SHIP_BOOTH` -> `venueFrame` postMessage
  path for instant feedback while designing -- the two paths don't
  interfere with each other.

## Files

```
src/index.js            Worker entry point: routes /api/*, /booths/*, /design.html,
                         /venue.html, redirects / -> /venue.html, falls through to
                         the static asset binding for everything else
db/schema.sql          the one table: slots (sector, slot_number, status, ...)
db/generate-seed.js     edit SECTOR_COUNTS here, then `npm run db:seed:gen`
db/seed.sql             generated -- do not hand-edit
functions/_lib.js                shared helpers: json/badRequest, claimOrRecognize, slugify
functions/api/sectors.js         GET  -- open/taken counts per sector
functions/api/claim.js           POST -- standalone claim (testing / a "check spots" page)
functions/api/lookup.js          GET  -- "welcome back" check by email
functions/api/ship.js            POST -- claim-if-needed + upload the real GLB (multipart)
functions/api/manifest.js        GET  -- what the student game reads, edge-cached
functions/api/admin/fill-demo.js    POST -- fill remaining open slots with placeholders
functions/api/admin/list-booths.js  GET  -- every slot (incl. email), for the admin page
functions/api/admin/reset-slot.js   POST -- clear a slot back to open, delete its R2 files
functions/api/admin/update-slot.js  POST -- fix a typo'd contact email on an existing slot
functions/api/admin/set-capacity.js POST -- grow/shrink how many slots a sector has --
                                     see "Dynamic booth capacity" below
functions/booths/[[path]].js     GET  -- serves the uploaded GLBs from R2, edge-cached
public/admin.html           the organizer's booth-management page -- see "Admin page" below
public/venue-preview.html   pre-manifest stand-in, superseded by the real venue.html --
                             unreferenced, kept around as a testing scrap
```

There are exactly two real links given out: `/design.html` (employer
studio) and `/venue.html` (student fair), plus `/admin.html` for the
organizer only. `/` is not a third public page -- it 302s straight to
`/venue.html`. It used to serve a standalone mock claim page from
before the real studio existed; that page posted plain JSON to
`/api/ship`, which has expected a real multipart GLB upload for a long
time, so it was a dead, broken link and has been removed.

## Admin page

`/admin.html` lists every slot -- sector, status, company name,
contact email, when it shipped -- with a search box and, per slot:
**Edit in studio** (opens `/design.html?admin_sector=...&admin_slot=...`
in a new tab, loading that employer's saved design straight into the
studio so the organizer can add a link or fix something on their
behalf and ship it again -- no need for the employer's email), **Edit
email** (fixes a typo so an employer who lost track of the address
they used can be looked up again), and **Reset slot** (deletes their
uploaded GLB/project files from R2 and frees the slot back to `open`,
e.g. to let them start over, or to undo a mistaken/duplicate entry).
It also has a **Sector capacity** panel -- see "Dynamic booth
capacity" below.

It's a plain static page (small enough to sit directly in `public/`,
unlike `design.html`/`venue.html`) that calls the
`functions/api/admin/*.js` endpoints above, all gated by the same
`x-admin-key` header check `fill-demo.js` already used. The page asks
for that key once and keeps it in `sessionStorage` (cleared on tab
close, never written to disk) for the rest of that browser tab.

**`ADMIN_KEY` is not in `wrangler.toml` at all.** It's set once as a
real secret in the Cloudflare dashboard (Worker -> Settings ->
Variables and Secrets), which is also the *only* place it lives --
committing it to `wrangler.toml` would mean the next git-triggered
deploy re-applies whatever's in that file and silently overwrites the
real secret. For local `wrangler dev`, create a `.dev.vars` file
(gitignored) with `ADMIN_KEY=dev-only-change-me` instead.

## Dynamic booth capacity

Each of the venue's 5 sectors has a fixed floor area (the physical
building/curtain walls, never moved by any of this) but only a
default ~150 hand-placed booth positions total across all of them
(30/30/30/20/30 seeded today, out of 31/31/31/31/26 actually laid
out -- see `../venue-frame.html`'s `DISCOVERY_LAYOUT`). The **Sector
capacity** panel on `/admin.html` lets an organizer grow (or shrink)
how many slots a sector has, up to a hard per-sector cap
(`SECTOR_MAX_CAPACITY` in `set-capacity.js`, currently 71/75/70/72/61
-- verified by exhaustive simulation of the layout generator below,
comfortably covering 180-200+ employers total).

- **Growing** a sector inserts new `open` rows (`set-capacity.js`).
  `../venue-frame.html` reads each sector's live total from
  `GET /api/sectors` at boot and, only for a sector whose requested
  total exceeds what the hand-placed layout already has room for, runs
  a procedural generator (`regenerateDiscoveryLayout` /
  `layoutGenerateSector` in `../venue-frame.html`) that packs new
  booth anchor points in rings around each sector's fixed landmark
  sculptures, then along its perimeter, shrinking the *default* booth
  footprint (and, isolated from that, the ambient crowd's rendered
  size via `crowdVisualScale` -- never the player's own collision/
  camera scale) as needed to fit. The walking-aisle gap never shrinks
  -- it's tied to the visitor's real, unscaled collision width.
- **Staying at or shrinking back within** a sector's original
  hand-placed count leaves that sector's layout completely untouched
  (byte-identical to the authored positions) -- growth is additive,
  never a wholesale replacement of the hand-tuned look.
- **Shrinking** only removes the highest-numbered slots, and only if
  every one of them is still `open`; it refuses (naming the blocking
  slot) rather than silently evicting a claimed or shipped booth.
- An existing shipped booth whose saved position no longer exists
  after a regeneration is automatically re-seated into a new valid
  spot the next time it's loaded (`allocateDiscoveryPlacement`'s
  existing "older layout" fallback in `../venue-frame.html` -- this
  was already there for handling schema/version changes, and covers
  this case for free).

The generator is duplicated (not imported) in two places that must be
kept in sync if its constants ever change: `../venue-frame.html`
(`LAYOUT_*` constants, runs in the browser) and
`functions/api/admin/set-capacity.js` (`SECTOR_MAX_CAPACITY`, a
precomputed cap so the backend can refuse an impossible request before
touching the database at all).

`design.html` is NOT a file in `public/` -- it's uploaded to R2 by
`npm run sync:design-page:local` / `:remote` from
`../MiCareerQuest-Ship-to-Venue-v13.html`, and `src/index.js` streams it
back out for `GET /design.html`. This is the real employer link once
deployed.

The studio itself (`../studio-frame.html`, the iframe the design page
embeds) has the actual integration: `shipToLiveVenue()` builds a
`multipart/form-data` POST to `/api/ship` with the exported GLB, contact
email, industry and booth name, fired from the existing "Ship to venue"
button alongside (not instead of) its original local-preview behavior.
`../MiCareerQuest-Ship-to-Venue-v13.html` embeds that studio, and
separately embeds `../venue-frame.html` (the venue itself, for the
studio's own local "Walk venue" preview tab) the same way -- two base64
blobs, `<script id="studio-source">` and `<script id="venue-source">`.
Editing either directly in `v13.html` isn't practical (each is a single
~65MB line), so a change belongs in `../studio-frame.html` or
`../venue-frame.html` and then gets re-spliced in with
`../splice-studio.sh` / `../splice-venue.sh` -- each finds its tag,
replaces only the base64 content between it and the closing
`</script>`, and verifies the decoded result matches the edited file
byte-for-byte before overwriting `v13.html`.

## Run it locally (no Cloudflare account needed)

```
npm install
npm run db:seed:gen                 # writes db/seed.sql from SECTOR_COUNTS
npx wrangler d1 execute micareerquest-slots --local --file=db/schema.sql
npx wrangler d1 execute micareerquest-slots --local --file=db/seed.sql
npm run dev                         # uploads design.html to local R2, then wrangler dev
```

Then open http://localhost:8788/design.html and use the actual booth
studio -- click "Use sample company" to fill the form instantly, then
"Ship to venue". http://localhost:8788/venue-preview.html shows what
landed, reading the same `/api/manifest` endpoint.

To reset the mock data back to all-open:
`npx wrangler d1 execute micareerquest-slots --local --file=db/seed.sql`

## Tested (this pass)

- **The whole thing, again, after the Pages-to-Workers pivot**: rebuilt
  `src/index.js` + `wrangler.toml` for the Workers+assets model (Cloudflare's
  dashboard provisions Workers now, not classic Pages, and `wrangler pages
  deploy` fails against it with a misleading auth error), moved
  `design.html` to R2 after hitting the real 25MB static-asset limit
  against an actual deploy attempt, then re-ran every check below against
  local `wrangler dev` and confirmed identical results.
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
npx wrangler secret put ADMIN_KEY                  # pick a real secret, not the dev default
npm run deploy                                      # uploads design.html to R2, then wrangler deploy
```

If deploying through Cloudflare's dashboard (Git-connected Worker) instead
of the CLI: set the **Build command** to
`npm install && npm run sync:design-page:remote`, the **Deploy command**
to `npx wrangler deploy` (the dashboard's own default -- not
`wrangler pages deploy`, which targets a different, older product and
fails with a misleading authentication error against a Worker), and the
**Root directory** / **Path** to `booth-shipping`.
