import { json, boothLock } from '../_lib.js';

// Public: lets the booth builder tell an employer up front that editing is
// closed. Never cached, so unlocking takes effect immediately.
export async function onRequestGet(context) {
  const { locked } = await boothLock(context.env);
  const response = json({ open: !locked });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
