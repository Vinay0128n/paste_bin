/**
 * Reusable helper for deterministic time in expiry logic.
 * When TEST_MODE=1, uses x-test-now-ms header; otherwise uses real system time.
 * @param {object} req - Express request object
 * @returns {number} Current time in milliseconds since epoch
 */
export function getCurrentTimeMs(req) {
  if (process.env.TEST_MODE === '1' && req) {
    const header = req.get('x-test-now-ms');
    if (header) {
      const parsed = parseInt(header, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return Date.now();
}
