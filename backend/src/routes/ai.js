const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middlewares/auth');

router.post('/chat', requireAuth, aiController.handleChat);

module.exports = router;
