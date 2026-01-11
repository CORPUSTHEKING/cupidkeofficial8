const express = require('express');
const router = express.Router();

const { verifyTelegramInitData } = require('../telegram/verify');
const db = require('../db');

router.post('/telegram/init', async (req, res) => {
  const { initData } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!initData) {
    return res.status(400).json({ error: 'Missing initData' });
  }

  const result = verifyTelegramInitData(initData, botToken);

  if (!result.valid || !result.telegram_id) {
    return res.status(401).json({ error: 'Invalid Telegram auth data' });
  }

  const {
    telegram_id,
    username,
    first_name,
    last_name,
  } = result;

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // ensure cupidke user
    const userRes = await client.query(
      `INSERT INTO users (email)
       VALUES ($1)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      [`telegram:${telegram_id}`]
    );

    const userId = userRes.rows[0].id;

    // ensure telegram identity
    await client.query(
      `INSERT INTO telegram_identities
       (telegram_id, username, first_name, last_name, user_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (telegram_id)
       DO UPDATE SET
         username = EXCLUDED.username,
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         user_id = EXCLUDED.user_id`,
      [telegram_id, username, first_name, last_name, userId]
    );

    await client.query('COMMIT');

    res.json({
      ok: true,
      user_id: userId,
      telegram_id,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[telegram-auth]', err);
    res.status(500).json({ error: 'Internal error' });
  } finally {
    client.release();
  }
});

module.exports = router;
