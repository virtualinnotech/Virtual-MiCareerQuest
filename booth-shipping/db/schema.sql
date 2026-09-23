-- Booth slot assignment. One row per physical booth position in the hall.
-- status: 'open' (unclaimed) -> 'claimed' (employer signed up, still designing)
--         -> 'shipped' (booth design uploaded, live for students)
--         'demo' (nobody claimed it in time; filled with a placeholder booth)
CREATE TABLE IF NOT EXISTS slots (
  sector TEXT NOT NULL,
  slot_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  company_name TEXT,
  email TEXT,
  claimed_at TEXT,
  shipped_at TEXT,
  booth_asset_key TEXT,
  booth_name TEXT,
  booth_description TEXT,
  booth_color TEXT,
  PRIMARY KEY (sector, slot_number)
);

-- One claim per email. Lets a returning employer be recognized and routed
-- back to the slot they already own instead of taking a second one.
CREATE UNIQUE INDEX IF NOT EXISTS idx_slots_email ON slots(email) WHERE email IS NOT NULL;
