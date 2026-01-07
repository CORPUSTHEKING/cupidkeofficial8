'use strict';

const express = require('express');
const sql = require('mssql');

const router = express.Router();

/*
 * GET /notification/sender/:sender_id
 * Returns notifications created by a given sender
 */
router.get('/sender/:sender_id', async (req, res) => {
  const senderId = req.params.sender_id;

  try {
    const result = await sql.query`
      SELECT *
      FROM Notifications
      WHERE sender_id = ${senderId}
      ORDER BY timestamp DESC
    `;

    res.json(result.recordset);
  } catch (err) {
    console.error('[notification] db error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
