-- Keep existing employer submissions; retire only unused positions above 25.
DELETE FROM slots WHERE sector='Hospitality' AND slot_number>25
  AND status='open' AND email IS NULL AND booth_asset_key IS NULL;
WITH RECURSIVE numbers(n) AS (
  SELECT 1 UNION ALL SELECT n+1 FROM numbers WHERE n<25
)
INSERT OR IGNORE INTO slots (sector,slot_number,status)
SELECT 'Hospitality',n,'open' FROM numbers;
