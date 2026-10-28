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

// GET /api/timetable/teachers — get list of teachers for slot assignment
router.get('/teachers', timetableController.getTeachers);

// POST /api/timetable (admin and teacher)
router.post('/', authorize('admin', 'teacher'), timetableController.createTimetable);

// PUT /api/timetable/:id (admin and teacher)
router.put('/:id', authorize('admin', 'teacher'), timetableController.updateTimetable);

// DELETE /api/timetable/:id (admin and teacher)
router.delete('/:id', authorize('admin', 'teacher'), timetableController.deleteTimetable);

module.exports = router;
