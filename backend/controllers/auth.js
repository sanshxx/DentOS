const User = require('../models/User');
const jwt =require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
// --- THIS FUNCTION HAS BEEN REPLACED WITH REAL DATABASE LOGIC ---
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, role, phone, clinic } = req.body;

  try {
    // 1. Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // 2. Create new user instance (password will be hashed by the User model pre-save hook)
    user = new User({
      name,
      email,
      phone,
      password,
      role: role || 'dentist', // Default to dentist if not provided
      clinic
    });

    // 3. Save the new user to the database
    await user.save();

    // 4. Create a real JSON Web Token (JWT)
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' },
      (err, token) => {
        if (err) throw err;
        // 5. Send the token back to the client
        res.status(201).json({ success: true, token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// --- THIS FUNCTION HAS BEEN REPLACED WITH REAL DATABASE LOGIC ---
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // 1. Find the user in the database by their email
    // We use .select('+password') because the password field is hidden by default in the User model
    let user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, errors: [{ msg: 'Invalid credentials' }] });
    }

    // 2. Compare the provided password with the hashed password in the database
    // Your User model must have a "matchPassword" method for this to work
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, errors: [{ msg: 'Invalid credentials' }] });
    }

    // 3. If credentials are correct, create a real token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' },
      (err, token) => {
        if (err) throw err;
        // 4. Send the token back to the client
        res.json({ success: true, token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
// --- THIS FUNCTION HAS BEEN UPDATED TO USE THE REAL DATABASE ---
exports.getMe = async (req, res) => {
  try {
    // The auth middleware should have added req.user
    // We find the user by the ID from the token, but exclude the password
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
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
