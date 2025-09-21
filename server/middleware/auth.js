const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        message: 'No token, authorization denied',
        code: 'NO_TOKEN' 
      });
    }

    // Check if token starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Invalid token format. Use: Bearer <token>',
        code: 'INVALID_TOKEN_FORMAT' 
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided',
        code: 'NO_TOKEN' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found, token invalid',
        code: 'USER_NOT_FOUND' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED' 
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during authentication',
      code: 'SERVER_ERROR' 
    });
  }
};

// Middleware to check if user is the owner of a resource
const ownerMiddleware = (resourceField = 'owner') => {
  return (req, res, next) => {
    const resource = req.resource;
    
    if (!resource) {
      return res.status(500).json({ 
        message: 'Resource not found in request context',
        code: 'RESOURCE_NOT_FOUND' 
      });
    }

    const ownerId = resource[resourceField];
    
    if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS' 
      });
    }

    next();
  };
};

// Middleware to check specific permissions for notes
const notePermissionMiddleware = (requiredPermission = 'read-only') => {
  return async (req, res, next) => {
    try {
      const note = req.resource || req.note;
      
      if (!note) {
        return res.status(404).json({ 
          message: 'Note not found',
          code: 'NOTE_NOT_FOUND' 
        });
      }

      // Check if user has required permission
      const hasPermission = note.hasPermission(req.user._id, requiredPermission);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Access denied. Required permission: ${requiredPermission}`,
          code: 'INSUFFICIENT_PERMISSIONS' 
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ 
        message: 'Server error checking permissions',
        code: 'SERVER_ERROR' 
      });
    }
  };
};

// Optional auth middleware - doesn't fail if no token
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // Silently continue without user for optional auth
    next();
  }
};

module.exports = {
  authMiddleware,
  ownerMiddleware,
  notePermissionMiddleware,
  optionalAuthMiddleware
};