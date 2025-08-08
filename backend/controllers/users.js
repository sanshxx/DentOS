const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Get all users in organization
// @route   GET /api/users
// @access  Private (Admin only)
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ organization: req.user.organization })
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user belongs to the same organization
  if (user.organization.toString() !== req.user.organization) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this user'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user belongs to the same organization
  if (user.organization.toString() !== req.user.organization.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this user'
    });
  }

  // Only admins can update other users
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update other users'
    });
  }

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user belongs to the same organization
  if (user.organization.toString() !== req.user.organization.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this user'
    });
  }

  // Prevent admin from deleting themselves
  if (req.user.id === req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
}); 