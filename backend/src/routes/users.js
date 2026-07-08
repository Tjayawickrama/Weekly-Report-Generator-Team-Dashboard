const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { requireManagerOrAdmin } = require('../middlewares/auth');

router.get('/', requireManagerOrAdmin, usersController.getUsers);

module.exports = router;
