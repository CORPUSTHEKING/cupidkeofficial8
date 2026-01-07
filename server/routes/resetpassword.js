'use strict';

const express = require('express');
const sql = require('mssql');

const router = express.Router();

/*
 * POST /resetpassword
 * Body: { email, token, newPassword }
 * Validate token, update password.
 */
router.post('/', async (req, res) => {
  const { email, token, newPassword } = req.body || {};

  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Example: validate token, then update password.
    const validateResult = await sql.query`
      SELECT id FROM PasswordResets WHERE email = ${email} AND token = ${token} AND used = 0
    `;
    const row = validateResult.recordset[0];
    if (!row) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    await sql.query`
      UPDATE Users SET password = ${newPassword} WHERE email = ${email}
    `;
    await sql.query`
      UPDATE PasswordResets SET used = 1 WHERE email = ${email} AND token = ${token}
    `;

    res.json({ success: true });
  } catch (err) {
    console.error('[resetpassword] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
