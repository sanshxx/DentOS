const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes that require authentication
 * Verifies the JWT token and adds the user to the request object
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mockjwtsecret');

    // Extract user info from token
    // For a real app, we would fetch the user from the database
    // For this mock implementation, we'll use the token ID to determine the user
    let userRole = 'dentist'; // Default role
    let userName = 'User';
    let userEmail = 'user@dentalcrm.com';
    
    // Map user IDs to roles and names based on our demo credentials
    switch(decoded.id) {
      case '60d0fe4f5311236168a109ca':
        userRole = 'admin';
        userName = 'Admin User';
        userEmail = 'admin@dentalcrm.com';
        break;
      case '60d0fe4f5311236168a109cb':
        userRole = 'manager';
        userName = 'Manager User';
        userEmail = 'manager@dentalcrm.com';
        break;
      case '60d0fe4f5311236168a109cc':
        userRole = 'dentist';
        userName = 'Dentist User';
        userEmail = 'dentist@dentalcrm.com';
        break;
      case '60d0fe4f5311236168a109cd':
        userRole = 'receptionist';
        userName = 'Receptionist User';
        userEmail = 'receptionist@dentalcrm.com';
        break;
      case '60d0fe4f5311236168a109ce':
        userRole = 'assistant';
        userName = 'Assistant User';
        userEmail = 'assistant@dentalcrm.com';
        break;
    }
    
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      name: userName,
      email: userEmail,
      role: userRole
    };

    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

/**
 * Middleware to authorize specific roles
 * @param {...string} roles - Roles allowed to access the route
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};