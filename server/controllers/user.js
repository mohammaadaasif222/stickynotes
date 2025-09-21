const User = require('../models/User');
const NoteHistory = require('../models/NoteHistory');
const { validationResult } = require('express-validator');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
};

// @desc    Search users by username or email
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = new RegExp(q, 'i');
    
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: searchRegex },
            { email: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex }
          ]
        },
        { isActive: true },
        { _id: { $ne: req.user.id } } // Exclude current user
      ]
    })
    .select('username email firstName lastName avatar')
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

const getUserActivity = async (req, res) => {
  try {
    const userId = req.params.id;

    // Users can only view their own activity or if they're viewing a collaborator's activity
    if (userId !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const limit = parseInt(req.query.limit) || 20;
    const activity = await NoteHistory.getUserActivity(userId, limit);

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user activity'
    });
  }
};

// @desc    Get current user's dashboard data
// @route   GET /api/users/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const Note = require('../models/Note');
    
    // Get user's note statistics
    const [ownedNotes, collaborativeNotes, recentActivity] = await Promise.all([
      // Notes owned by user
      Note.countDocuments({ owner: req.user.id, isDeleted: false }),
      
      // Notes where user is a collaborator
      Note.countDocuments({ 
        'collaborators.user': req.user.id, 
        isDeleted: false 
      }),
      
      // Recent activity (last 10 activities)
      NoteHistory.getUserActivity(req.user.id, 10)
    ]);

    // Get recently updated notes
    const recentNotes = await Note.findAccessibleNotes(req.user.id, {
      limit: 5,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });

    res.json({
      success: true,
      data: {
        statistics: {
          ownedNotes,
          collaborativeNotes,
          totalAccessibleNotes: ownedNotes + collaborativeNotes
        },
        recentNotes,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
};

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/users/:id/status
// @access  Private (Admin only - if implementing admin features)
const updateUserStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Only allow users to deactivate their own account
    if (req.params.id !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only modify your own account status'
      });
    }

    const { isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `Account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
};

// @desc    Get users that can be added as collaborators
// @route   GET /api/users/collaborators/search
// @access  Private
const searchPotentialCollaborators = async (req, res) => {
  try {
    const { q, noteId, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const Note = require('../models/Note');
    let existingCollaborators = [];

    // If noteId is provided, get existing collaborators to exclude them
    if (noteId) {
      const note = await Note.findById(noteId);
      if (note) {
        existingCollaborators = note.collaborators.map(c => c.user.toString());
        existingCollaborators.push(note.owner.toString()); // Also exclude owner
      }
    }

    const searchRegex = new RegExp(q, 'i');
    
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: searchRegex },
            { email: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex }
          ]
        },
        { isActive: true },
        { _id: { $nin: existingCollaborators } }, // Exclude existing collaborators
        { _id: { $ne: req.user.id } } // Exclude current user
      ]
    })
    .select('username email firstName lastName avatar')
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Search potential collaborators error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
};

module.exports = {
  getUsers,
  getUserProfile,
  searchUsers,
  getUserActivity,
  getDashboard,
  updateUserStatus,
  searchPotentialCollaborators
};