const NoteHistory = require('../models/NoteHistory');
const mongoose = require('mongoose');

class NoteHistoryController {
  // Get note history with sequence pipeline
  static async getNoteHistory(req, res) {
    try {
      const { noteId } = req.params;
      const { 
        limit = 10, 
        page = 1, 
        changeType,
        action,
        startDate,
        endDate,
        includeSnapshots = false
      } = req.query;

      // Validate noteId
      if (!mongoose.Types.ObjectId.isValid(noteId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid note ID format'
        });
      }

      // Build match criteria
      const matchCriteria = { noteId: new mongoose.Types.ObjectId(noteId) };
      
      if (changeType) matchCriteria.changeType = changeType;
      if (action) matchCriteria.action = action;
      
      // Date range filter
      if (startDate || endDate) {
        matchCriteria.timestamp = {};
        if (startDate) matchCriteria.timestamp.$gte = new Date(startDate);
        if (endDate) matchCriteria.timestamp.$lte = new Date(endDate);
      }

      // Aggregation pipeline with sequence numbering
      const pipeline = [
        { $match: matchCriteria },
        { $sort: { timestamp: -1 } },
        
        // Add sequence number (reverse chronological)
        {
          $group: {
            _id: null,
            entries: { $push: "$$ROOT" }
          }
        },
        {
          $unwind: {
            path: "$entries",
            includeArrayIndex: "sequenceIndex"
          }
        },
        {
          $addFields: {
            "entries.sequenceNumber": { $add: ["$sequenceIndex", 1] }
          }
        },
        
        // Lookup user details
        {
          $lookup: {
            from: 'users',
            localField: 'entries.userId',
            foreignField: '_id',
            as: 'entries.userDetails',
            pipeline: [
              {
                $project: {
                  username: 1,
                  firstName: 1,
                  lastName: 1,
                  avatar: 1
                }
              }
            ]
          }
        },
        
        // Lookup note details
        {
          $lookup: {
            from: 'notes',
            localField: 'entries.noteId',
            foreignField: '_id',
            as: 'entries.noteDetails',
            pipeline: [
              {
                $project: {
                  title: 1,
                  isActive: 1
                }
              }
            ]
          }
        },
        
        // Flatten user and note details
        {
          $addFields: {
            "entries.user": { $arrayElemAt: ["$entries.userDetails", 0] },
            "entries.note": { $arrayElemAt: ["$entries.noteDetails", 0] }
          }
        },
        
        // Remove intermediate fields and conditionally remove snapshots
        {
          $project: {
            "entries.userDetails": 0,
            "entries.noteDetails": 0,
            ...(includeSnapshots === 'true' ? {} : { "entries.snapshot": 0 })
          }
        },
        
        // Pagination
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        
        // Group back to get final structure
        {
          $group: {
            _id: null,
            history: { $push: "$entries" },
            totalCount: { $sum: 1 }
          }
        }
      ];

      // Get total count for pagination
      const countPipeline = [
        { $match: matchCriteria },
        { $count: "total" }
      ];

      const [result, countResult] = await Promise.all([
        NoteHistory.aggregate(pipeline),
        NoteHistory.aggregate(countPipeline)
      ]);

      const history = result.length > 0 ? result[0].history : [];
      const totalCount = countResult.length > 0 ? countResult[0].total : 0;

      // Add diff summaries to each entry
      const enrichedHistory = history.map(entry => ({
        ...entry,
        diffSummary: this.generateDiffSummary(entry.changes),
        isLatest: entry.sequenceNumber === 1,
        relativeTime: this.getRelativeTime(entry.timestamp)
      }));

      res.json({
        success: true,
        data: {
          history: enrichedHistory,
          pagination: {
            currentPage: parseInt(page),
            limit: parseInt(limit),
            totalCount,
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            hasNext: parseInt(page) * parseInt(limit) < totalCount,
            hasPrev: parseInt(page) > 1
          },
          filters: {
            changeType,
            action,
            startDate,
            endDate,
            includeSnapshots
          }
        }
      });

    } catch (error) {
      console.error('Error fetching note history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch note history',
        error: error.message
      });
    }
  }

  // Get user activity across all notes
  static async getUserActivity(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 20, page = 1, noteId, action } = req.query;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }

      const matchCriteria = { userId: new mongoose.Types.ObjectId(userId) };
      if (noteId && mongoose.Types.ObjectId.isValid(noteId)) {
        matchCriteria.noteId = new mongoose.Types.ObjectId(noteId);
      }
      if (action) matchCriteria.action = action;

      const pipeline = [
        { $match: matchCriteria },
        { $sort: { timestamp: -1 } },
        
        // Add sequence numbering
        {
          $group: {
            _id: null,
            activities: { $push: "$$ROOT" }
          }
        },
        {
          $unwind: {
            path: "$activities",
            includeArrayIndex: "sequenceIndex"
          }
        },
        {
          $addFields: {
            "activities.sequenceNumber": { $add: ["$sequenceIndex", 1] }
          }
        },
        
        // Lookup note details
        {
          $lookup: {
            from: 'notes',
            localField: 'activities.noteId',
            foreignField: '_id',
            as: 'activities.noteDetails'
          }
        },
        
        // Lookup user details
        {
          $lookup: {
            from: 'users',
            localField: 'activities.userId',
            foreignField: '_id',
            as: 'activities.userDetails'
          }
        },
        
        {
          $addFields: {
            "activities.note": { $arrayElemAt: ["$activities.noteDetails", 0] },
            "activities.user": { $arrayElemAt: ["$activities.userDetails", 0] }
          }
        },
        
        {
          $project: {
            "activities.noteDetails": 0,
            "activities.userDetails": 0,
            "activities.snapshot": 0
          }
        },
        
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        
        {
          $group: {
            _id: null,
            activities: { $push: "$activities" }
          }
        }
      ];

      const result = await NoteHistory.aggregate(pipeline);
      const activities = result.length > 0 ? result[0].activities : [];

      res.json({
        success: true,
        data: {
          activities: activities.map(activity => ({
            ...activity,
            diffSummary: this.generateDiffSummary(activity.changes),
            relativeTime: this.getRelativeTime(activity.timestamp)
          })),
          pagination: {
            currentPage: parseInt(page),
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching user activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user activity',
        error: error.message
      });
    }
  }

  // Compare two versions of a note
  static async compareVersions(req, res) {
    try {
      const { noteId } = req.params;
      const { fromSequence, toSequence } = req.query;

      if (!mongoose.Types.ObjectId.isValid(noteId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid note ID format'
        });
      }

      if (!fromSequence || !toSequence) {
        return res.status(400).json({
          success: false,
          message: 'Both fromSequence and toSequence are required'
        });
      }

      // Get versions with sequence numbers
      const pipeline = [
        { $match: { noteId: new mongoose.Types.ObjectId(noteId) } },
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: null,
            entries: { $push: "$$ROOT" }
          }
        },
        {
          $unwind: {
            path: "$entries",
            includeArrayIndex: "sequenceIndex"
          }
        },
        {
          $addFields: {
            "entries.sequenceNumber": { $add: ["$sequenceIndex", 1] }
          }
        },
        {
          $match: {
            "entries.sequenceNumber": {
              $in: [parseInt(fromSequence), parseInt(toSequence)]
            }
          }
        }
      ];

      const result = await NoteHistory.aggregate(pipeline);
      
      if (result.length < 2) {
        return res.status(404).json({
          success: false,
          message: 'One or both versions not found'
        });
      }

      const versions = result.map(r => r.entries);
      const fromVersion = versions.find(v => v.sequenceNumber === parseInt(fromSequence));
      const toVersion = versions.find(v => v.sequenceNumber === parseInt(toSequence));

      res.json({
        success: true,
        data: {
          comparison: {
            from: {
              sequence: fromVersion.sequenceNumber,
              timestamp: fromVersion.timestamp,
              action: fromVersion.action,
              snapshot: fromVersion.snapshot
            },
            to: {
              sequence: toVersion.sequenceNumber,
              timestamp: toVersion.timestamp,
              action: toVersion.action,
              snapshot: toVersion.snapshot
            },
            differences: this.calculateDifferences(fromVersion, toVersion)
          }
        }
      });

    } catch (error) {
      console.error('Error comparing versions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to compare versions',
        error: error.message
      });
    }
  }

  // Create a new history entry
  static async createHistoryEntry(req, res) {
    try {
      const historyData = {
        noteId: req.body.noteId,
        userId: req.user?._id || req.body.userId, // Assuming auth middleware sets req.user
        action: req.body.action,
        changes: req.body.changes,
        snapshot: req.body.snapshot,
        changeType: req.body.changeType || 'major',
        metadata: {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          sessionId: req.body.sessionId
        }
      };

      const historyEntry = await NoteHistory.createEntry(historyData);

      res.status(201).json({
        success: true,
        data: {
          historyEntry,
          message: 'History entry created successfully'
        }
      });

    } catch (error) {
      console.error('Error creating history entry:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create history entry',
        error: error.message
      });
    }
  }

  // Get history statistics
  static async getHistoryStats(req, res) {
    try {
      const { noteId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(noteId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid note ID format'
        });
      }

      const pipeline = [
        { $match: { noteId: new mongoose.Types.ObjectId(noteId) } },
        {
          $group: {
            _id: null,
            totalEntries: { $sum: 1 },
            actionCounts: {
              $push: {
                action: "$action",
                changeType: "$changeType"
              }
            },
            firstEntry: { $min: "$timestamp" },
            lastEntry: { $max: "$timestamp" },
            contributors: { $addToSet: "$userId" }
          }
        },
        {
          $addFields: {
            contributorCount: { $size: "$contributors" }
          }
        }
      ];

      const result = await NoteHistory.aggregate(pipeline);
      
      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No history found for this note'
        });
      }

      const stats = result[0];
      
      // Count actions
      const actionStats = stats.actionCounts.reduce((acc, curr) => {
        acc[curr.action] = (acc[curr.action] || 0) + 1;
        return acc;
      }, {});

      const changeTypeStats = stats.actionCounts.reduce((acc, curr) => {
        acc[curr.changeType] = (acc[curr.changeType] || 0) + 1;
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          totalEntries: stats.totalEntries,
          contributorCount: stats.contributorCount,
          firstEntry: stats.firstEntry,
          lastEntry: stats.lastEntry,
          actionBreakdown: actionStats,
          changeTypeBreakdown: changeTypeStats,
          timespan: {
            days: Math.ceil((stats.lastEntry - stats.firstEntry) / (1000 * 60 * 60 * 24))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching history stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch history statistics',
        error: error.message
      });
    }
  }

  // Helper methods
  static generateDiffSummary(changes) {
    const summary = [];

    if (changes?.title) {
      summary.push({
        field: 'title',
        type: 'modification',
        from: changes.title.old,
        to: changes.title.new
      });
    }

    if (changes?.content) {
      const oldLength = (changes.content.old || '').length;
      const newLength = (changes.content.new || '').length;
      const diff = newLength - oldLength;

      summary.push({
        field: 'content',
        type: 'modification',
        lengthChange: diff,
        summary: diff > 0 ? `Added ${diff} characters` :
                 diff < 0 ? `Removed ${Math.abs(diff)} characters` :
                 'Content modified'
      });
    }

    return summary;
  }

  static getRelativeTime(timestamp) {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  static calculateDifferences(fromVersion, toVersion) {
    const differences = [];

    // Compare snapshots if available
    if (fromVersion.snapshot && toVersion.snapshot) {
      if (fromVersion.snapshot.title !== toVersion.snapshot.title) {
        differences.push({
          field: 'title',
          from: fromVersion.snapshot.title,
          to: toVersion.snapshot.title,
          type: 'title_change'
        });
      }

      if (fromVersion.snapshot.content !== toVersion.snapshot.content) {
        const fromLength = (fromVersion.snapshot.content || '').length;
        const toLength = (toVersion.snapshot.content || '').length;
        
        differences.push({
          field: 'content',
          from: fromVersion.snapshot.content,
          to: toVersion.snapshot.content,
          type: 'content_change',
          lengthChange: toLength - fromLength
        });
      }
    }

    return differences;
  }
}

module.exports = NoteHistoryController;