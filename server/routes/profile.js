'use strict';

const express = require('express');
const sql = require('mssql');

const router = express.Router();

/*
 * GET /profile/:user_id
 * Return public profile information for a user.
 */
router.get('/:user_id', async (req, res) => {
  const userId = req.params.user_id;

  try {
    const r = await sql.query`
      SELECT id, username, bio, created_at
      FROM Users
      WHERE id = ${userId}
    `;
    const profile = r.recordset[0] || null;
    res.json(profile);
  } catch (err) {
    console.error('[profile] db error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/*
 * POST /profile/:user_id/censor
 * Example endpoint that updates a 'censored' flag (keeps variable usage explicit).
 */
router.post('/:user_id/censor', async (req, res) => {
  const userId = req.params.user_id;
  const { censored } = req.body || {};

  try {
    await sql.query`
      UPDATE Users
      SET censored = ${Boolean(censored)}
      WHERE id = ${userId}
    `;
    res.json({ success: true });
  } catch (err) {
    console.error('[profile] update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
