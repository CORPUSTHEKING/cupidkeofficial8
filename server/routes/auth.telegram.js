'use strict';

const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * Verify Telegram Mini App initData
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
function verifyTelegramInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto
    .createHash('sha256')
    .update(botToken)
    .digest();

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(computedHash)
  );
}

/**
 * POST /auth/telegram
 */
router.post('/telegram', async (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({ error: 'initData missing' });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!BOT_TOKEN) {
    console.error('[telegram] BOT TOKEN NOT SET');
    return res.status(500).json({ error: 'server misconfigured' });
  }

  if (!verifyTelegramInitData(initData, BOT_TOKEN)) {
    return res.status(401).json({ error: 'invalid telegram signature' });
  }

  const data = Object.fromEntries(new URLSearchParams(initData));
  const telegramId = Number(data.id);

  try {
    // Resolve existing Telegram user
    const { rows } = await pool.query(
      `
      SELECT u.id
      FROM telegram_users t
      JOIN users u ON u.id = t.user_id
      WHERE t.telegram_id = $1
      `,
      [telegramId]
    );

    if (rows.length) {
      return res.json({
        ok: true,
        user_id: rows[0].id,
        telegram: true
      });
    }

    // Create bare user + telegram binding
    const userResult = await pool.query(
      `
      INSERT INTO users (username, firstname, lastname, email, password)
      VALUES ($1, $2, $3, $4, 'telegram-auth')
      RETURNING id
      `,
      [
        `tg_${telegramId}`,
        data.first_name || 'Telegram',
        data.last_name || 'User',
        `tg_${telegramId}@telegram.local`
      ]
    );

    const userId = userResult.rows[0].id;

    await pool.query(
      `
      INSERT INTO telegram_users (
        user_id,
        telegram_id,
        username,
        first_name,
        last_name,
        photo_url,
        auth_date
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        userId,
        telegramId,
        data.username || null,
        data.first_name || null,
        data.last_name || null,
        data.photo_url || null,
        data.auth_date
      ]
    );

    res.json({
      ok: true,
      user_id: userId,
      telegram: true,
      created: true
    });

  } catch (err) {
    console.error('[telegram auth] failed:', err);
    res.status(500).json({ error: 'internal error' });
  }
});

module.exports = router;
