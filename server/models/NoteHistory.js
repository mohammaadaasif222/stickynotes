const mongoose = require('mongoose');

const noteHistorySchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted', 'restored'],
    required: true
  },
  changes: {
    title: {
      old: String,
      new: String
    },
    content: {
      old: String,
      new: String
    }
  },
  // Store the full snapshot for major changes
  snapshot: {
    title: String,
    content: String,
    version: Number
  },
  changeType: {
    type: String,
    enum: ['major', 'minor', 'auto-save'],
    default: 'major'
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    sessionId: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
noteHistorySchema.index({ noteId: 1, timestamp: -1 });
noteHistorySchema.index({ userId: 1 });
noteHistorySchema.index({ timestamp: -1 });

// Static method to create history entry
noteHistorySchema.statics.createEntry = async function(data) {
  const historyEntry = new this(data);
  await historyEntry.save();

  // Keep only the last 10 entries per note
  const allEntries = await this.find({ noteId: data.noteId })
    .sort({ timestamp: -1 });

  if (allEntries.length > 10) {
    const entriesToDelete = allEntries.slice(10);
    const idsToDelete = entriesToDelete.map(entry => entry._id);
    await this.deleteMany({ _id: { $in: idsToDelete } });
  }

  return historyEntry;
};

// Static method to get note history
noteHistorySchema.statics.getNoteHistory = function(noteId, limit = 10) {
  return this.find({ noteId })
    .populate('userId', 'username firstName lastName avatar')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get user's recent activity
noteHistorySchema.statics.getUserActivity = function(userId, limit = 20) {
  return this.find({ userId })
    .populate('noteId', 'title')
    .populate('userId', 'username firstName lastName avatar')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Instance method to generate diff summary
noteHistorySchema.methods.getDiffSummary = function() {
  const summary = [];

  if (this.changes.title) {
    summary.push({
      field: 'title',
      type: 'modification',
      from: this.changes.title.old,
      to: this.changes.title.new
    });
  }

  if (this.changes.content) {
    const oldLength = (this.changes.content.old || '').length;
    const newLength = (this.changes.content.new || '').length;
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
};

// Virtual for formatted timestamp
noteHistorySchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

// Ensure virtual fields are serialized
noteHistorySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('NoteHistory', noteHistorySchema);