const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { requireAuth, requireManagerOrAdmin } = require('../middlewares/auth');

router.get('/', requireAuth, reportsController.getReports);
router.post('/', requireAuth, reportsController.createReport);
router.get('/team', requireManagerOrAdmin, reportsController.getTeamReports);
router.get('/:id', requireAuth, reportsController.getReportById);
router.put('/:id', requireAuth, reportsController.updateReport);
router.delete('/:id', requireAuth, reportsController.deleteReport);

module.exports = router;
