'use strict';

const pool = require('./db');

(async () => {
  const user = await pool.query(
    `
    INSERT INTO users (username, firstname, lastname, email, password)
    VALUES ('testuser', 'Test', 'User', 'test@cupidke.local', 'dev-password')
    RETURNING id
    `
  );

  await pool.query(
    `
    INSERT INTO notifications (user_id, sender_id, notification_text, redirect_path)
    VALUES ($1, $1, 'Welcome to CupidKE', '/home')
    `,
    [user.rows[0].id]
  );

  console.log('[seed] done');
  process.exit(0);
})().catch(err => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
