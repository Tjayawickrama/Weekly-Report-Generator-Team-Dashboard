const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');
const { requireAuth, requireManagerOrAdmin } = require('../middlewares/auth');

router.get('/', requireAuth, projectsController.getProjects);
router.post('/', requireManagerOrAdmin, projectsController.createProject);

module.exports = router;
