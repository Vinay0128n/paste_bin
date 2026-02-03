import { checkConnection } from '../db/index.js';

export async function healthz(req, res) {
  try {
    const dbOk = await checkConnection();
    res.status(200).json({ ok: dbOk });
  } catch {
    res.status(200).json({ ok: false });
  }
}
