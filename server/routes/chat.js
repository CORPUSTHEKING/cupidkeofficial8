'use strict';

const express = require('express');
const sql = require('mssql');

const router = express.Router();

/*
 * GET /chat/messages/:sender_id/:receiver_id
 * Returns all messages exchanged between two users
 */
router.get('/messages/:sender_id/:receiver_id', async (req, res) => {
  const senderId = req.params.sender_id;
  const receiverId = req.params.receiver_id;

  try {
    const result = await sql.query`
      SELECT *
      FROM Messages
      WHERE
        (sender_id = ${senderId} AND receiver_id = ${receiverId})
        OR
        (sender_id = ${receiverId} AND receiver_id = ${senderId})
      ORDER BY timestamp DESC
    `;

    res.json(result.recordset);
  } catch (err) {
    console.error('[chat] db error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
