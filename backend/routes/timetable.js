const router = require('express').Router();
const timetableController = require('../controllers/timetableController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/timetable/current — current lecture for logged-in teacher
router.get('/current', timetableController.getCurrentLecture);

// GET /api/timetable/teacher/my — teacher's full timetable
router.get('/teacher/my', timetableController.getMyTimetable);

// GET /api/timetable
router.get('/', timetableController.getTimetable);

// POST /api/timetable (admin only)
router.post('/', authorize('admin'), timetableController.createTimetable);

// PUT /api/timetable/:id (admin only)
router.put('/:id', authorize('admin'), timetableController.updateTimetable);

// DELETE /api/timetable/:id (admin only)
router.delete('/:id', authorize('admin'), timetableController.deleteTimetable);

module.exports = router;
