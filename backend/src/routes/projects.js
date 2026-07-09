const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');
const { requireAuth, requireManagerOrAdmin } = require('../middlewares/auth');

router.get('/', requireAuth, projectsController.getProjects);
router.post('/', requireManagerOrAdmin, projectsController.createProject);
router.put('/:id', requireManagerOrAdmin, projectsController.updateProject);
router.delete('/:id', requireManagerOrAdmin, projectsController.deleteProject);
router.put('/:id/members', requireManagerOrAdmin, projectsController.updateProjectMembers);

module.exports = router;
