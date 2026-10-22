-- Add Hospitality without resetting existing reservations or employer shipments.
-- Safe to run repeatedly on an already-initialized database.
WITH RECURSIVE numbers(n) AS (
  SELECT 1 UNION ALL SELECT n + 1 FROM numbers WHERE n < 40
)
INSERT OR IGNORE INTO slots (sector, slot_number, status)
SELECT 'Hospitality', n, 'open' FROM numbers;
