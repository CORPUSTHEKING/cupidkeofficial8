'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: false
});

pool.on('connect', () => {
  console.log('[db] connected to postgres');
});

pool.on('error', (err) => {
  console.error('[db] postgres error:', err);
  process.exit(1);
});

module.exports = pool;
