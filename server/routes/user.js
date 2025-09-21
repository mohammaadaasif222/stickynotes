const express = require('express');
const { param, query, body } = require('express-validator');
const {
  getUserProfile,
  searchUsers,
  getUserActivity,
  getDashboard,
  updateUserStatus,
  searchPotentialCollaborators,
  getUsers
} = require('../controllers/user');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules
const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID')
];

const searchUsersValidation = [
  query('q')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Search query must be between 2 and 50 characters'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

const getUserActivityValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const updateUserStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),

  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const searchCollaboratorsValidation = [
  query('q')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Search query must be between 2 and 50 characters'),

  query('noteId')
    .optional()
    .isMongoId()
    .withMessage('Invalid note ID'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Apply auth middleware to all routes
// router.use(auth.authMiddleware);

// @route   GET /api/users/dashboard
// @desc    Get current user's dashboard data
// @access  Private
router.get('/', getUsers);
router.get('/dashboard', getDashboard);

// @route   GET /api/users/search
// @desc    Search users by username or email
// @access  Private
router.get('/search', searchUsersValidation, searchUsers);

// @route   GET /api/users/collaborators/search
// @desc    Search users that can be added as collaborators
// @access  Private
router.get('/collaborators/search', searchCollaboratorsValidation, searchPotentialCollaborators);

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Private
router.get('/:id', userIdValidation, getUserProfile);

// @route   GET /api/users/:id/activity
// @desc    Get user activity (recent note changes)
// @access  Private
router.get('/:id/activity', getUserActivityValidation, getUserActivity);

// @route   PUT /api/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private
router.put('/:id/status', updateUserStatusValidation, updateUserStatus);

module.exports = router;