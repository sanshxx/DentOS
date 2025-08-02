const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password, role, clinic } = req.body;
    
    // Generate a unique ID for the new user
    const userId = crypto.randomBytes(12).toString('hex');

    // For testing purposes, create a mock user without database
    const mockUser = {
      _id: userId,
      name,
      email,
      phone,
      role: role || 'dentist', // Default to dentist if no role provided
      clinic: clinic || '64f5b3e745e0c00f8b88c80a' // Default clinic
    };

    // Create a mock token
    const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET || 'mockjwtsecret', {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        clinic: mockUser.clinic
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if password matches the demo password
    if (password !== 'Demo@123') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // For testing purposes, create a mock user based on email
    let mockUser;
    
    switch(email) {
      case 'admin@dentalcrm.com':
        mockUser = {
          _id: '60d0fe4f5311236168a109ca',
          name: 'Admin User',
          email: email,
          role: 'admin',
          clinic: '64f5b3e745e0c00f8b88c80a'
        };
        break;
      case 'manager@dentalcrm.com':
        mockUser = {
          _id: '60d0fe4f5311236168a109cb',
          name: 'Manager User',
          email: email,
          role: 'manager',
          clinic: '64f5b3e745e0c00f8b88c80a'
        };
        break;
      case 'dentist@dentalcrm.com':
        mockUser = {
          _id: '60d0fe4f5311236168a109cc',
          name: 'Dentist User',
          email: email,
          role: 'dentist',
          clinic: '64f5b3e745e0c00f8b88c80a'
        };
        break;
      case 'receptionist@dentalcrm.com':
        mockUser = {
          _id: '60d0fe4f5311236168a109cd',
          name: 'Receptionist User',
          email: email,
          role: 'receptionist',
          clinic: '64f5b3e745e0c00f8b88c80a'
        };
        break;
      case 'assistant@dentalcrm.com':
        mockUser = {
          _id: '60d0fe4f5311236168a109ce',
          name: 'Assistant User',
          email: email,
          role: 'assistant',
          clinic: '64f5b3e745e0c00f8b88c80a'
        };
        break;
      default:
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
    }

    // Create a mock token
    const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET || 'mockjwtsecret', {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        clinic: mockUser.clinic
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    // For testing purposes, create a mock user based on the authenticated user
    const mockUser = {
      _id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      clinic: {
        _id: '64f5b3e745e0c00f8b88c80a',
        name: 'Main Clinic',
        branchCode: 'MC001'
      }
    };

    res.status(200).json({
      success: true,
      data: mockUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

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
    const token = user.getSignedJwtToken();

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
    const token = user.getSignedJwtToken();

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