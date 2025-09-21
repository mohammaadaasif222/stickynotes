const express = require('express');
const router = express.Router();
const NoteHistoryController = require('../controllers/NoteHistoryController');

// Middleware for authentication (uncomment and adjust based on your auth system)
// const { authenticate, authorize } = require('../middlewares/auth');

// Validation middleware (optional)
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware function
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules
const validateObjectId = (field) => [
  param(field).isMongoId().withMessage(`Invalid ${field} format`)
];

const validateNoteHistoryQuery = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('changeType').optional().isIn(['major', 'minor', 'auto-save']).withMessage('Invalid change type'),
  query('action').optional().isIn(['created', 'updated', 'deleted', 'restored']).withMessage('Invalid action type'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('includeSnapshots').optional().isBoolean().withMessage('includeSnapshots must be a boolean')
];

const validateUserActivityQuery = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('noteId').optional().isMongoId().withMessage('Invalid note ID format'),
  query('action').optional().isIn(['created', 'updated', 'deleted', 'restored']).withMessage('Invalid action type')
];

const validateCompareVersions = [
  query('fromSequence').isInt({ min: 1 }).withMessage('fromSequence must be a positive integer'),
  query('toSequence').isInt({ min: 1 }).withMessage('toSequence must be a positive integer')
];

const validateHistoryEntry = [
  body('noteId').isMongoId().withMessage('Invalid note ID format'),
  body('action').isIn(['created', 'updated', 'deleted', 'restored']).withMessage('Invalid action type'),
  body('changeType').optional().isIn(['major', 'minor', 'auto-save']).withMessage('Invalid change type'),
  body('changes').optional().isObject().withMessage('Changes must be an object'),
  body('snapshot').optional().isObject().withMessage('Snapshot must be an object'),
  body('sessionId').optional().isString().withMessage('Session ID must be a string')
];

/**
 * @route   GET /api/notes/:noteId/history
 * @desc    Get history for a specific note with sequence pipeline
 * @access  Private (requires authentication)
 * @params  noteId - MongoDB ObjectId of the note
 * @query   limit, page, changeType, action, startDate, endDate, includeSnapshots
 */
router.get('/notes/:noteId/history', 
  // authenticate, // Uncomment when auth middleware is available
  validateObjectId('noteId'),
  validateNoteHistoryQuery,
  handleValidationErrors,
  NoteHistoryController.getNoteHistory
);

/**
 * @route   GET /api/users/:userId/activity
 * @desc    Get user's activity across all notes
 * @access  Private (requires authentication)
 * @params  userId - MongoDB ObjectId of the user
 * @query   limit, page, noteId, action
 */
router.get('/users/:userId/activity',
  // authenticate,
  validateObjectId('userId'),
  validateUserActivityQuery,
  handleValidationErrors,
  NoteHistoryController.getUserActivity
);

/**
 * @route   GET /api/notes/:noteId/history/compare
 * @desc    Compare two versions of a note
 * @access  Private (requires authentication)
 * @params  noteId - MongoDB ObjectId of the note
 * @query   fromSequence, toSequence - Sequence numbers to compare
 */
router.get('/notes/:noteId/history/compare',
  // authenticate,
  validateObjectId('noteId'),
  validateCompareVersions,
  handleValidationErrors,
  NoteHistoryController.compareVersions
);

/**
 * @route   GET /api/notes/:noteId/history/stats
 * @desc    Get history statistics for a note
 * @access  Private (requires authentication)
 * @params  noteId - MongoDB ObjectId of the note
 */
router.get('/notes/:noteId/history/stats',
  // authenticate,
  validateObjectId('noteId'),
  handleValidationErrors,
  NoteHistoryController.getHistoryStats
);

/**
 * @route   POST /api/history
 * @desc    Create a new history entry
 * @access  Private (requires authentication)
 * @body    noteId, action, changes, snapshot, changeType, sessionId
 */
router.post('/history',
  // authenticate,
  validateHistoryEntry,
  handleValidationErrors,
  NoteHistoryController.createHistoryEntry
);

// Alternative route for creating history entry directly under note
router.post('/notes/:noteId/history',
  // authenticate,
  validateObjectId('noteId'),
  [
    body('action').isIn(['created', 'updated', 'deleted', 'restored']).withMessage('Invalid action type'),
    body('changeType').optional().isIn(['major', 'minor', 'auto-save']).withMessage('Invalid change type'),
    body('changes').optional().isObject().withMessage('Changes must be an object'),
    body('snapshot').optional().isObject().withMessage('Snapshot must be an object'),
    body('sessionId').optional().isString().withMessage('Session ID must be a string')
  ],
  handleValidationErrors,
  (req, res, next) => {
    // Add noteId from params to body
    req.body.noteId = req.params.noteId;
    next();
  },
  NoteHistoryController.createHistoryEntry
);

// Batch operations

/**
 * @route   GET /api/history/recent
 * @desc    Get recent history across all notes (for admin/dashboard)
 * @access  Private (requires admin role)
 * @query   limit, page
 */
router.get('/history/recent',
  // authenticate,
  // authorize(['admin']), // Uncomment when role-based auth is available
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { limit = 20, page = 1 } = req.query;

      const pipeline = [
        { $sort: { timestamp: -1 } },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'notes',
            localField: 'noteId',
            foreignField: '_id',
            as: 'note',
            pipeline: [{ $project: { title: 1 } }]
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
            pipeline: [{ $project: { username: 1, firstName: 1, lastName: 1 } }]
          }
        },
        {
          $addFields: {
            note: { $arrayElemAt: ["$note", 0] },
            user: { $arrayElemAt: ["$user", 0] }
          }
        }
      ];

      const recentHistory = await require('../models/NoteHistory').aggregate(pipeline);

      res.json({
        success: true,
        data: {
          recentHistory,
          pagination: {
            currentPage: parseInt(page),
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent history',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/history/:historyId
 * @desc    Delete a specific history entry (admin only)
 * @access  Private (requires admin role)
 * @params  historyId - MongoDB ObjectId of the history entry
 */
router.delete('/history/:historyId',
  // authenticate,
  // authorize(['admin']),
  validateObjectId('historyId'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { historyId } = req.params;
      
      const deletedEntry = await require('../models/NoteHistory').findByIdAndDelete(historyId);
      
      if (!deletedEntry) {
        return res.status(404).json({
          success: false,
          message: 'History entry not found'
        });
      }

      res.json({
        success: true,
        message: 'History entry deleted successfully',
        data: { deletedEntry }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete history entry',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/notes/:noteId/history
 * @desc    Delete all history for a specific note (admin only)
 * @access  Private (requires admin role)
 * @params  noteId - MongoDB ObjectId of the note
 */
router.delete('/notes/:noteId/history',
  // authenticate,
  // authorize(['admin']),
  validateObjectId('noteId'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { noteId } = req.params;
      
      const result = await require('../models/NoteHistory').deleteMany({ noteId });

      res.json({
        success: true,
        message: `Deleted ${result.deletedCount} history entries`,
        data: { deletedCount: result.deletedCount }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete note history',
        error: error.message
      });
    }
  }
);

module.exports = router;