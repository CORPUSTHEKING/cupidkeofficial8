'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * Get notifications for a user
 */
router.get('/:user_id', async (req, res) => {
  const user_id = Number(req.params.user_id);

  try {
    const result = await pool.query(
      `
      SELECT
        notification_id,
        user_id,
        sender_id,
        notification_text,
        redirect_path,
        read,
        time_stamp
      FROM notifications
      WHERE user_id = $1
      ORDER BY time_stamp DESC
      `,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('[notification] query failed:', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

/**
 * Mark notification as read
 */
router.post('/:id/read', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await pool.query(
      `
      UPDATE notifications
      SET read = 'YES'
      WHERE notification_id = $1
      RETURNING notification_id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'notification not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('[notification] update failed:', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

module.exports = router;
