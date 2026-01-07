'use strict';

const express = require('express');
const sql = require('mssql');

const router = express.Router();

/*
 * GET /chat_api/room/:room_id
 * Return all messages for a room (ascending by created_at).
 */
router.get('/room/:room_id', async (req, res) => {
  const roomId = req.params.room_id;

  try {
    const q = await sql.query`
      SELECT id, sender_id, message, created_at
      FROM ChatMessages
      WHERE room_id = ${roomId}
      ORDER BY created_at ASC
    `;
    res.json(q.recordset);
  } catch (err) {
    console.error('[chat_api] db error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
