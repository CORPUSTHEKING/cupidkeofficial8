'use strict';

const express = require('express');
const sql = require('mssql');

const router = express.Router();

/*
 * GET /browsing/:user_id
 * Return browsing history for a user (most recent first).
 */
router.get('/:user_id', async (req, res) => {
  const userId = req.params.user_id;

  try {
    const result = await sql.query`
      SELECT id, url, title, created_at
      FROM BrowsingHistory
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.json(result.recordset);
  } catch (err) {
    console.error('[browsing] db error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
