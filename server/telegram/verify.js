const crypto = require('crypto');

/*
Telegram Mini App auth verification
Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
*/

function verifyTelegramInitData(initData, botToken) {
  if (!initData || !botToken) {
    return { valid: false };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
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

  if (computedHash !== hash) {
    return { valid: false };
  }

  const user = params.get('user')
    ? JSON.parse(params.get('user'))
    : null;

  return {
    valid: true,
    telegram_id: user?.id,
    username: user?.username,
    first_name: user?.first_name,
    last_name: user?.last_name,
  };
}

module.exports = {
  verifyTelegramInitData,
};
