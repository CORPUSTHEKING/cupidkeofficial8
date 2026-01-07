'use strict';

const express = require('express');
const router = express.Router();

const notificationRouter = require('./notification');
const chatRouter = require('./chat');

router.use('/notification', notificationRouter);
router.use('/chat', chatRouter);

module.exports = router;
