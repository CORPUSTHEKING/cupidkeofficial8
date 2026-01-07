'use strict';

const express = require('express');
const sql = require('mssql');

const router = express.Router();

/*
 * POST /signup
 * Body: { username, email, password }
 */
router.post('/', async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await sql.query`
      INSERT INTO Users (username, email, password)
      VALUES (${username}, ${email}, ${password})
    `;
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('[signup] db error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
