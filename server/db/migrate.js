'use strict';

const fs = require('fs');
const path = require('path');
const pool = require('../db');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureLedger() {
  console.log('[migrate] ensuring schema_migrations exists');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function run() {
  console.log('[migrate] starting');

  await ensureLedger();

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    console.log('[migrate] checking', file);

    const { rows } = await pool.query(
      'SELECT 1 FROM schema_migrations WHERE filename = $1',
      [file]
    );

    if (rows.length) {
      console.log('[migrate] skipped', file);
      continue;
    }

    const sql = fs.readFileSync(
      path.join(MIGRATIONS_DIR, file),
      'utf8'
    );

    console.log('[migrate] running', file);
    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file]
      );
      await pool.query('COMMIT');
      console.log('[migrate] applied', file);
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error('[migrate] failed on', file);
      throw err;
    }
  }

  console.log('[migrate] complete');
  process.exit(0);
}

run().catch(err => {
  console.error('[migrate] fatal:', err);
  process.exit(1);
});
