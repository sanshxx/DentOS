const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes that require authentication
 * Verifies the JWT token and adds the user to the request object
 */
exports.protect = async (req, res, next) => {
  console.log('🔍 AUTH MIDDLEWARE DEBUG: Starting protect middleware...');
  console.log('🔍 AUTH MIDDLEWARE DEBUG: Request headers:', {
    authorization: req.headers.authorization ? 'Bearer [TOKEN]' : 'MISSING',
    'content-type': req.headers['content-type']
  });
  
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
    console.log('🔍 AUTH MIDDLEWARE DEBUG: Token extracted from header');
  }

  // Check if token exists
  if (!token) {
    console.log('🔍 AUTH MIDDLEWARE DEBUG: No token found, returning 401');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    console.log('🔍 AUTH MIDDLEWARE DEBUG: Verifying JWT token...');
    console.log('🔍 AUTH MIDDLEWARE DEBUG: JWT_SECRET available:', process.env.JWT_SECRET ? 'YES' : 'NO');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 AUTH MIDDLEWARE DEBUG: Token decoded successfully:', { id: decoded.id, role: decoded.role });

    // Fetch the user from the database using the ID from the token
    console.log('🔍 AUTH MIDDLEWARE DEBUG: Searching for user with ID:', decoded.id);
    const user = await User.findById(decoded.id);
    console.log('🔍 AUTH MIDDLEWARE DEBUG: User found in database:', user ? { id: user._id, email: user.email, role: user.role } : 'NOT FOUND');
    
    if (!user) {
      console.log('🔍 AUTH MIDDLEWARE DEBUG: User not found in database, returning 401');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add user to request object
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization
    };
    console.log('🔍 AUTH MIDDLEWARE DEBUG: User added to request object:', { id: req.user.id, email: req.user.email, role: req.user.role });

    next();
  } catch (err) {
    console.log('🔍 AUTH MIDDLEWARE DEBUG: ERROR in protect middleware:', err.message);
    console.log('🔍 AUTH MIDDLEWARE DEBUG: Error stack:', err.stack);
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