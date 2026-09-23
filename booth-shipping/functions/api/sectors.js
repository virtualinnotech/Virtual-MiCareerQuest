import { json } from '../_lib.js';

// Powers the sector picker on the employer landing page: how many spots
// are open/taken per sector, so a full sector can be greyed out before
// someone wastes a trip filling out the form.
export async function onRequestGet(context) {
  const { env } = context;
  const rows = await env.DB.prepare(
    `SELECT sector,
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open,
            SUM(CASE WHEN status IN ('claimed','shipped') THEN 1 ELSE 0 END) AS taken,
            SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) AS shipped,
            SUM(CASE WHEN status = 'demo' THEN 1 ELSE 0 END) AS demo
       FROM slots
      GROUP BY sector
      ORDER BY sector`
  ).all();
  return json({ sectors: rows.results });
}
