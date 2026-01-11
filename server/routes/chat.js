'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * GET chat messages between two users
 */
router.get('/messages/:sender_id/:receiver_id', async (req, res) => {
  const { sender_id, receiver_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM messages
      WHERE (sender_id = $1 AND receiver_id = $2)
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY timestamp DESC
      `,
      [sender_id, receiver_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('[chat] query failed:', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

module.exports = router;
