const router = require('express').Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// POST /api/attendance/scan — QR scan attendance (main endpoint)
router.post('/scan', attendanceController.scanAttendance);

// POST /api/attendance/manual — manual attendance
router.post('/manual', attendanceController.manualAttendance);

// GET /api/attendance/today/summary — today's dashboard summary
router.get('/today/summary', attendanceController.getTodaySummary);

// GET /api/attendance — list attendance records
router.get('/', attendanceController.getAttendance);

// PUT /api/attendance/:id — edit attendance
router.put('/:id', attendanceController.updateAttendance);

// DELETE /api/attendance/:id — delete attendance
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;
