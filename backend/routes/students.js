const router = require('express').Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/students/classes/list
router.get('/classes/list', studentController.getClasses);

// GET /api/students/verify/:studentId — QR verification
router.get('/verify/:studentId', studentController.verifyStudent);

// GET /api/students
router.get('/', studentController.getStudents);

// GET /api/students/:id
router.get('/:id', studentController.getStudent);

// POST /api/students (admin only)
router.post('/', authorize('admin'), studentController.createStudent);

// PUT /api/students/:id (admin only)
router.put('/:id', authorize('admin'), studentController.updateStudent);

// DELETE /api/students/:id (admin only)
router.delete('/:id', authorize('admin'), studentController.deleteStudent);

module.exports = router;
