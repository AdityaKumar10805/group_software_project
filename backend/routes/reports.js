const router = require('express').Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/reports/dashboard — dashboard stats
router.get('/dashboard', reportController.dashboardStats);

// GET /api/reports/subject — subject-wise report
router.get('/subject', reportController.subjectReport);

// GET /api/reports/student — student-wise report
router.get('/student', reportController.studentReport);

// GET /api/reports/daily — daily attendance report
router.get('/daily', reportController.dailyReport);

module.exports = router;
