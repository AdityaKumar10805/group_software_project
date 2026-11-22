const router = require('express').Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

// POST /api/auth/register (admin only)
router.post(
  '/register',
  authenticate,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'teacher']).withMessage('Role must be admin or teacher'),
  ],
  authController.register
);

// GET /api/auth/me
router.get('/me', authenticate, authController.getMe);

// GET /api/auth/users (admin only)
router.get('/users', authenticate, authorize('admin'), authController.getUsers);

// PUT /api/auth/users/:id (admin only)
router.put('/users/:id', authenticate, authorize('admin'), authController.updateUser);

// DELETE /api/auth/users/:id (admin only)
router.delete('/users/:id', authenticate, authorize('admin'), authController.deleteUser);

module.exports = router;
