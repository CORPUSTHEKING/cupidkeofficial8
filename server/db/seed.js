'use strict';

const pool = require('../db');

async function seed() {
  console.log('[seed] starting');

  // ---- USERS -------------------------------------------------
  console.log('[seed] ensuring dev user');

  const userResult = await pool.query(
    `
    INSERT INTO users (username, firstname, lastname, email, password)
    VALUES ('testuser', 'Test', 'User', 'testuser@cupidke.local', 'dev-password-not-hashed')
    ON CONFLICT (email) DO NOTHING
    RETURNING id
    `
  );

  let userId;
  if (userResult.rowCount === 1) {
    userId = userResult.rows[0].id;
    console.log('[seed] created user id:', userId);
  } else {
    const existing = await pool.query(
      `SELECT id FROM users WHERE email = 'testuser@cupidke.local'`
    );
    userId = existing.rows[0].id;
    console.log('[seed] user already exists, id:', userId);
  }

  // ---- NOTIFICATIONS -----------------------------------------
  console.log('[seed] ensuring welcome notification');

  await pool.query(
    `
    INSERT INTO notifications (
      user_id,
      sender_id,
      notification_text,
      redirect_path
    )
    VALUES ($1, $1, 'Welcome to CupidKE', '/home')
    ON CONFLICT DO NOTHING
    `,
    [userId]
  );

  console.log('[seed] complete');
  process.exit(0);
}

seed().catch(err => {
  console.error('[seed] fatal:', err);
  process.exit(1);
});
