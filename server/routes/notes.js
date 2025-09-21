const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes');
const {authMiddleware} = require('../middleware/auth'); 
const { body, param, query } = require('express-validator');

const createNoteValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .isLength({ min: 1, max: 50000 })
    .withMessage('Content must be between 1 and 50000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Each tag must not exceed 30 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

const updateNoteValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Content must be between 1 and 50000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Each tag must not exceed 30 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid note ID')
];

const collaboratorValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('role')
    .optional()
    .isIn(['editor', 'read-only'])
    .withMessage('Role must be either editor or read-only')
];

const contentUpdateValidation = [
  body('content')
    .isLength({ min: 0, max: 50000 })
    .withMessage('Content must not exceed 50000 characters'),
  body('isAutoSave')
    .optional()
    .isBoolean()
    .withMessage('isAutoSave must be a boolean')
];

const searchValidation = [
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters'),
  query('sortBy')
    .optional()
    .isIn(['title', 'createdAt', 'updatedAt'])
    .withMessage('sortBy must be title, createdAt, or updatedAt'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be asc or desc'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer')
];


// GET /api/notes - Get all accessible notes for the user
router.get('/',
  authMiddleware,
  searchValidation,
  notesController.getNotes
);

// POST /api/notes - Create a new note
router.post('/',
  authMiddleware,
  createNoteValidation,
  notesController.createNote
);

// GET /api/notes/:id - Get a specific note by ID
router.get('/:id',
  authMiddleware,
  idValidation,

  notesController.getNoteById
);

// PUT /api/notes/:id - Update a note
router.put('/:id',
  authMiddleware,
  idValidation,
  updateNoteValidation,
  notesController.updateNote
);



// POST /api/notes/:id/collaborators - Add a collaborator to a note
router.post('/:id/collaborators',
  authMiddleware,
  idValidation,
  collaboratorValidation,
  notesController.addCollaborator
);

// DELETE /api/notes/:id/collaborators - Remove a collaborator from a note
router.delete('/:id/collaborators',
  authMiddleware,
  idValidation,
  body('userId').isMongoId().withMessage('Invalid user ID'),

  notesController.removeCollaborator
);

// GET /api/notes/:id/history - Get note history
router.get('/:id/history',
  authMiddleware,
  idValidation,
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  notesController.getNoteHistory
);

// PATCH /api/notes/:id/content - Real-time content update (for live typing)
router.patch('/:id/content',
  authMiddleware,
  idValidation,
  contentUpdateValidation,

  notesController.updateContent
);

module.exports = router;