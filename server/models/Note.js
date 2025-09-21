const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title must not exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [50000, 'Content must not exceed 50000 characters'] // Reasonable limit for notes
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'read-only'],
      default: 'read-only'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag must not exceed 30 characters']
  }],
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient searching and querying
noteSchema.index({ owner: 1 });
noteSchema.index({ title: 'text', content: 'text' });
noteSchema.index({ 'collaborators.user': 1 });
noteSchema.index({ createdAt: -1 });
noteSchema.index({ updatedAt: -1 });
noteSchema.index({ isDeleted: 1 });

// Update the updatedAt field and increment version before saving
noteSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
    this.version += 1;
  }
  next();
});

// Instance method to check if user has permission
noteSchema.methods.hasPermission = function(userId, requiredPermission = 'read-only') {
  // Owner has all permissions
  if (this.owner.toString() === userId.toString()) {
    return true;
  }

  // Check collaborators
  const collaborator = this.collaborators.find(
    collab => collab.user.toString() === userId.toString()
  );

  if (!collaborator) {
    return this.isPublic && requiredPermission === 'read-only';
  }

  // Permission hierarchy: owner > editor > read-only
  const permissions = {
    'read-only': 1,
    'editor': 2,
    'owner': 3
  };

  const userPermission = permissions[collaborator.role] || 0;
  const requiredLevel = permissions[requiredPermission] || 0;

  return userPermission >= requiredLevel;
};

// Instance method to add collaborator
noteSchema.methods.addCollaborator = function(userId, role = 'read-only') {
  // Check if user is already a collaborator
  const existingCollab = this.collaborators.find(
    collab => collab.user.toString() === userId.toString()
  );

  if (existingCollab) {
    existingCollab.role = role;
    existingCollab.addedAt = Date.now();
  } else {
    this.collaborators.push({
      user: userId,
      role: role
    });
  }

  return this.save();
};

// Instance method to remove collaborator
noteSchema.methods.removeCollaborator = function(userId) {
  this.collaborators = this.collaborators.filter(
    collab => collab.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Static method to find notes accessible by user
noteSchema.statics.findAccessibleNotes = function(userId, options = {}) {
  const query = {
    $or: [
      { owner: userId },
      { 'collaborators.user': userId },
      { isPublic: true }
    ],
    isDeleted: false
  };

  // Add case-insensitive title search
  if (options.search) {
    query.$or = query.$or || [];
    query.$or.push({
      title: { $regex: options.search, $options: 'i' }
    });
  }

  let noteQuery = this.find(query)
    .populate('owner', 'username firstName lastName avatar')
    .populate('collaborators.user', 'username firstName lastName avatar')
    .populate('lastEditedBy', 'username firstName lastName avatar');

  // Add sorting
  if (options.sortBy) {
    const sort = {};
    sort[options.sortBy] = options.sortOrder === 'asc' ? 1 : -1;
    noteQuery = noteQuery.sort(sort);
  } else {
    noteQuery = noteQuery.sort({ updatedAt: -1 });
  }

  // Add pagination
  if (options.limit) {
    noteQuery = noteQuery.limit(parseInt(options.limit));
  }
  
  if (options.skip) {
    noteQuery = noteQuery.skip(parseInt(options.skip));
  }

  return noteQuery;
};

// Virtual for collaborator count
noteSchema.virtual('collaboratorCount').get(function() {
  return this.collaborators.length;
});

// Ensure virtual fields are serialized
noteSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Note', noteSchema);