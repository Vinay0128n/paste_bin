import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS pastes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        expires_at BIGINT,
        max_views INTEGER,
        views_used INTEGER NOT NULL DEFAULT 0
      )
    `);
  } finally {
    client.release();
  }
}

export async function checkConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return true;
  } catch (err) {
    return false;
  } finally {
    client.release();
  }
}

export async function createPaste({ id, content, created_at, expires_at, max_views }) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO pastes (id, content, created_at, expires_at, max_views, views_used)
       VALUES ($1, $2, $3, $4, $5, 0)`,
      [id, content, created_at, expires_at ?? null, max_views ?? null]
    );
  } finally {
    client.release();
  }
}

export async function getAndIncrementPaste(id, currentTimeMs) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const result = await client.query(
      `SELECT id, content, created_at, expires_at, max_views, views_used
       FROM pastes
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return { found: false, reason: 'not_found' };
    }

    const row = result.rows[0];

    // Check expiry (TTL)
    if (row.expires_at !== null && currentTimeMs >= row.expires_at) {
      await client.query('ROLLBACK');
      return { found: false, reason: 'expired' };
    }

    // Check view limit
    if (row.max_views !== null && row.views_used >= row.max_views) {
      await client.query('ROLLBACK');
      return { found: false, reason: 'exceeded' };
    }

    // Atomic increment
    await client.query(
      `UPDATE pastes SET views_used = views_used + 1 WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');

    const remainingViews = row.max_views !== null
      ? Math.max(0, row.max_views - row.views_used - 1)
      : null;

    let expiresAt = null;
    if (row.expires_at !== null) {
      const expiresNum = Number(row.expires_at);
      if (!isNaN(expiresNum) && expiresNum > 0) {
        try {
          expiresAt = new Date(expiresNum).toISOString();
        } catch (err) {
          console.error('Error converting expires_at:', err, 'value:', row.expires_at);
        }
      }
    }

    return {
      found: true,
      content: row.content,
      remaining_views: remainingViews,
      expires_at: expiresAt,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getPasteForView(id, currentTimeMs) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, content, expires_at, max_views, views_used
       FROM pastes WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return { found: false, reason: 'not_found' };
    }

    const row = result.rows[0];

    if (row.expires_at !== null && currentTimeMs >= row.expires_at) {
      return { found: false, reason: 'expired' };
    }

    if (row.max_views !== null && row.views_used >= row.max_views) {
      return { found: false, reason: 'exceeded' };
    }

    return {
      found: true,
      content: row.content,
    };
  } finally {
    client.release();
  }
}

export { pool };
