'use strict';

const TelegramBot = require('node-telegram-bot-api');
const pool = require('../db');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  console.error('[telegram] TELEGRAM_BOT_TOKEN is not set');
  process.exit(1);
}

async function acquireLock() {
  const res = await pool.query(
    'SELECT pg_try_advisory_lock(42424242) AS locked'
  );

  if (!res.rows[0].locked) {
    console.error('[telegram] another bot instance is already running');
    process.exit(1);
  }

  console.log('[telegram] advisory lock acquired');
}

async function main() {
  await acquireLock();

  console.log('[telegram] starting bot');
  const bot = new TelegramBot(TOKEN, { polling: true });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg.text === '/start') {
      await pool.query(
        `
        INSERT INTO telegram_identities (
          telegram_id,
          username,
          first_name,
          last_name
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (telegram_id) DO NOTHING
        `,
        [
          msg.from.id,
          msg.from.username || null,
          msg.from.first_name || null,
          msg.from.last_name || null,
        ]
      );

      bot.sendMessage(
        chatId,
        'Telegram identity registered. You can now open the CupidKE app.'
      );
    }
  });

  console.log('[telegram] bot started');
}

main().catch(err => {
  console.error('[telegram] fatal:', err);
  process.exit(1);
});
