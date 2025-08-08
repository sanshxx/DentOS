const User = require('../models/User');
const jwt =require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user with organization
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  console.log('🔍 REGISTER DEBUG: Starting registration process...');
  console.log('🔍 REGISTER DEBUG: Registration attempt with data:', {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    role: req.body.role,
    password: req.body.password ? '[HIDDEN]' : 'MISSING',
    clinic: req.body.clinic,
    organization: req.body.organization
  });
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('🔍 REGISTER DEBUG: Validation errors:', errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { 
    name, 
    email, 
    password, 
    role, 
    phone, 
    clinic,
    organization 
  } = req.body;

  try {
    console.log('🔍 REGISTER DEBUG: Step 1 - Checking if user already exists...');
    // 1. Check if user already exists
    let user = await User.findOne({ email });
    console.log('🔍 REGISTER DEBUG: User exists check result:', user ? 'User found' : 'User not found');

    if (user) {
      console.log('🔍 REGISTER DEBUG: User already exists, returning 400');
      return res.status(400).json({ 
        success: false, 
        errors: [{ msg: 'User already exists' }] 
      });
    }

    console.log('🔍 REGISTER DEBUG: Step 2 - Handling organization assignment...');
    // 2. Handle organization assignment
    let organizationId = null;
    if (organization) {
      console.log('🔍 REGISTER DEBUG: Organization provided, checking if slug exists...');
      const Organization = require('../models/Organization');
      
      // Check if organization slug already exists
      const existingOrg = await Organization.findOne({ slug: organization.slug });
      console.log('🔍 REGISTER DEBUG: Existing organization check:', existingOrg ? 'Found' : 'Not found');
      if (existingOrg) {
        console.log('🔍 REGISTER DEBUG: Organization slug already exists, returning 400');
        return res.status(400).json({
          success: false,
          errors: [{ msg: 'Organization slug already exists' }]
        });
      }

      console.log('🔍 REGISTER DEBUG: Creating new organization...');
      // Create organization
      const newOrganization = await Organization.create({
        ...organization,
        createdBy: null // Will be updated after user creation
      });
      
      organizationId = newOrganization._id;
      console.log('🔍 REGISTER DEBUG: New organization created with ID:', organizationId);
    } else {
      console.log('🔍 REGISTER DEBUG: No organization provided, looking for default organization...');
      // If no organization provided, assign to the default organization
      const Organization = require('../models/Organization');
      const defaultOrganization = await Organization.findOne({ slug: 'dentos-default' });
      
      console.log('🔍 REGISTER DEBUG: Default organization check:', defaultOrganization ? 'Found' : 'Not found');
      if (!defaultOrganization) {
        console.log('🔍 REGISTER DEBUG: Default organization not found, returning 500');
        return res.status(500).json({
          success: false,
          errors: [{ msg: 'Default organization not found. Please contact administrator.' }]
        });
      }
      
      organizationId = defaultOrganization._id;
      console.log('🔍 REGISTER DEBUG: Using default organization ID:', organizationId);
    }

    console.log('🔍 REGISTER DEBUG: Step 3 - Creating new user instance...');
    console.log('🔍 REGISTER DEBUG: About to hash password...');
    // 3. Create new user instance
    user = new User({
      name,
      email,
      phone,
      password,
      role: role || 'admin', // Default to admin for new organizations
      organization: organizationId,
      clinic: clinic || null // Make clinic optional
    });
    console.log('🔍 REGISTER DEBUG: New user object created:', {
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      clinic: user.clinic
    });

    console.log('🔍 REGISTER DEBUG: Step 4 - Saving user to database...');
    // 4. Save the new user to the database
    try {
      await user.save();
      console.log('🔍 REGISTER DEBUG: User saved successfully with ID:', user._id);
    } catch (saveError) {
      console.error('🔍 REGISTER DEBUG: ERROR saving user:', saveError);
      console.error('🔍 REGISTER DEBUG: Error details:', {
        name: saveError.name,
        message: saveError.message,
        code: saveError.code,
        keyValue: saveError.keyValue
      });
      throw saveError;
    }

    console.log('🔍 REGISTER DEBUG: Step 5 - Updating organization with createdBy...');
    // 5. Update organization with createdBy if organization was created
    if (organizationId) {
      const Organization = require('../models/Organization');
      await Organization.findByIdAndUpdate(organizationId, {
        createdBy: user._id
      });
      console.log('🔍 REGISTER DEBUG: Organization updated with createdBy:', user._id);
    }

    console.log('🔍 REGISTER DEBUG: Step 6 - Creating JWT token...');
    console.log('🔍 REGISTER DEBUG: Checking for JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'MISSING!');
    // 6. Create JWT token
    const payload = {
      id: user.id,
      role: user.role,
      organization: user.organization
    };
    console.log('🔍 REGISTER DEBUG: JWT payload:', payload);

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' },
      (err, token) => {
        if (err) {
          console.log('🔍 REGISTER DEBUG: JWT signing error:', err.message);
          throw err;
        }
        console.log('🔍 REGISTER DEBUG: JWT token created successfully');
        
        // 7. Send the token back to the client
        console.log('🔍 REGISTER DEBUG: Step 7 - Sending registration response...');
        res.status(201).json({ 
          success: true, 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization: user.organization
          }
        });
        console.log('🔍 REGISTER DEBUG: Registration response sent successfully');
      }
    );

  } catch (err) {
    console.log('🔍 REGISTER DEBUG: ERROR in registration process:', err.message);
    console.log('🔍 REGISTER DEBUG: Error stack:', err.stack);
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// --- THIS FUNCTION HAS BEEN REPLACED WITH REAL DATABASE LOGIC ---
exports.login = async (req, res) => {
  console.log('🔍 LOGIN DEBUG: Starting login process...');
  console.log('🔍 LOGIN DEBUG: Request body:', { email: req.body.email, password: req.body.password ? '[HIDDEN]' : 'MISSING' });
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('🔍 LOGIN DEBUG: Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  console.log('🔍 LOGIN DEBUG: Login attempt received for:', email);

  try {
    console.log('🔍 LOGIN DEBUG: Step 1 - Searching for user in database...');
    // 1. Find the user in the database by their email
    // We use .select('+password') because the password field is hidden by default in the User model
    let user = await User.findOne({ email }).select('+password');
    console.log('🔍 LOGIN DEBUG: User found in database:', user ? { id: user._id, email: user.email, role: user.role } : 'NOT FOUND');
    console.log('🔍 LOGIN DEBUG: Password field present:', user ? (user.password ? 'YES' : 'NO') : 'N/A');
    console.log('🔍 LOGIN DEBUG: Password field type:', user ? typeof user.password : 'N/A');

    if (!user) {
      console.log('🔍 LOGIN DEBUG: User not found, returning 400');
      return res.status(400).json({ success: false, errors: [{ msg: 'Invalid credentials' }] });
    }

    console.log('🔍 LOGIN DEBUG: Step 2 - Comparing passwords...');
    // 2. Compare the provided password with the hashed password in the database
    // Using the User model's matchPassword method
    const isMatch = await user.matchPassword(password);
    console.log('🔍 LOGIN DEBUG: Password comparison result:', isMatch);

    if (!isMatch) {
      console.log('🔍 LOGIN DEBUG: Password mismatch, returning 400');
      return res.status(400).json({ success: false, errors: [{ msg: 'Invalid credentials' }] });
    }

    console.log('🔍 LOGIN DEBUG: Step 3 - Creating JWT token...');
    console.log('🔍 LOGIN DEBUG: Checking for JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'MISSING!');
    console.log('🔍 LOGIN DEBUG: JWT_EXPIRE:', process.env.JWT_EXPIRE || '30d (default)');
    
    // 3. If credentials are correct, create a real token
    const payload = {
      id: user.id,
      role: user.role,
      organization: user.organization
    };
    console.log('🔍 LOGIN DEBUG: JWT payload:', payload);

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' },
      (err, token) => {
        if (err) {
          console.log('🔍 LOGIN DEBUG: JWT signing error:', err.message);
          throw err;
        }
        console.log('🔍 LOGIN DEBUG: JWT token created successfully');
        // 4. Send the token back to the client
        res.json({ 
          success: true, 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization: user.organization
          }
        });
        console.log('🔍 LOGIN DEBUG: Login response sent successfully');
      }
    );

  } catch (err) {
    console.log('🔍 LOGIN DEBUG: ERROR in login process:', err.message);
    console.log('🔍 LOGIN DEBUG: Error stack:', err.stack);
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
// --- THIS FUNCTION HAS BEEN UPDATED TO USE THE REAL DATABASE ---
exports.getMe = async (req, res) => {
  console.log('🔍 GETME DEBUG: Starting getMe process...');
  console.log('🔍 GETME DEBUG: req.user:', req.user);
  
  try {
    // The auth middleware should have added req.user
    // We find the user by the ID from the token, but exclude the password
    console.log('🔍 GETME DEBUG: Searching for user with ID:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    console.log('🔍 GETME DEBUG: User found:', user ? { id: user._id, email: user.email, role: user.role } : 'NOT FOUND');
    
    if (!user) {
        console.log('🔍 GETME DEBUG: User not found, returning 404');
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log('🔍 GETME DEBUG: Sending user data successfully');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.log('🔍 GETME DEBUG: ERROR in getMe process:', err.message);
    console.log('🔍 GETME DEBUG: Error stack:', err.stack);
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// --- THE FOLLOWING FUNCTIONS FROM YOUR ORIGINAL FILE ARE KEPT AS THEY SEEM CORRECT ---

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link to reset your password: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Email sent'
      });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token or token expired'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Create token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });

    res.status(200).json({
      success: true,
      token,
      message: 'Password reset successful'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    // Create token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });

    res.status(200).json({
      success: true,
      token,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user,
      message: 'User details updated successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Change password (for forced password change)
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    user.forcePasswordChange = false; // Reset the flag
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};

module.exports = {
  register: exports.register,
  login: exports.login,
  getMe: exports.getMe,
  logout: exports.logout,
  forgotPassword: exports.forgotPassword,
  resetPassword: exports.resetPassword,
  updatePassword: exports.updatePassword,
  updateDetails: exports.updateDetails,
  changePassword: exports.changePassword
};
