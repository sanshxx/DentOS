const Organization = require('../models/Organization');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Private
exports.createOrganization = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const {
      name,
      slug,
      description,
      type,
      contactInfo,
      address,
      businessInfo
    } = req.body;

    // Check if organization slug already exists
    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Organization slug already exists'
      });
    }

    // Create organization
    const organization = await Organization.create({
      name,
      slug,
      description,
      type,
      contactInfo,
      address,
      businessInfo,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: organization
    });
  } catch (err) {
    console.error('Error creating organization:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Organization slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get organization details
// @route   GET /api/organizations/:id
// @access  Private
exports.getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user belongs to this organization
    if (req.user.organization.toString() !== organization._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this organization'
      });
    }

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (err) {
    console.error('Error getting organization:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private
exports.updateOrganization = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    let organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user belongs to this organization and has admin role
    if (req.user.organization.toString() !== organization._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this organization'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update organization details'
      });
    }

    organization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (err) {
    console.error('Error updating organization:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get organization statistics
// @route   GET /api/organizations/:id/stats
// @access  Private
exports.getOrganizationStats = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user belongs to this organization
    if (req.user.organization.toString() !== organization._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this organization'
      });
    }

    // Get counts from different models
    const Patient = require('../models/Patient');
    const Appointment = require('../models/Appointment');
    const Clinic = require('../models/Clinic');
    const User = require('../models/User');

    const stats = await Promise.all([
      Patient.countDocuments({ organization: organization._id }),
      Appointment.countDocuments({ organization: organization._id }),
      Clinic.countDocuments({ organization: organization._id }),
      User.countDocuments({ organization: organization._id })
    ]);

    res.status(200).json({
      success: true,
      data: {
        organization,
        stats: {
          patients: stats[0],
          appointments: stats[1],
          clinics: stats[2],
          users: stats[3]
        }
      }
    });
  } catch (err) {
    console.error('Error getting organization stats:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get user's organization
// @route   GET /api/organizations/my
// @access  Private
exports.getMyOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (err) {
    console.error('Error getting my organization:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Setup organization for existing user
// @route   PUT /api/organizations/setup
// @access  Private
exports.setupOrganization = async (req, res) => {
  try {
    const { name, slug, type, description, contactInfo, address, businessInfo } = req.body;

    // Validate required fields
    if (!name || !slug || !type || !contactInfo?.email || !contactInfo?.phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required organization details'
      });
    }

    // Check if slug already exists
    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Organization slug already exists. Please choose a different one.'
      });
    }

    // Create new organization
    const organization = await Organization.create({
      name,
      slug,
      type,
      description,
      contactInfo,
      address,
      businessInfo,
      createdBy: req.user.id
    });

    // Update user's organization
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      organization: organization._id
    });

    res.status(200).json({
      success: true,
      message: 'Organization setup completed successfully',
      data: organization
    });

  } catch (error) {
    console.error('Organization setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during organization setup'
    });
  }
};

// @desc    Search organizations
// @route   GET /api/organizations/search
// @access  Private
exports.searchOrganizations = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const organizations = await Organization.find({
      $and: [
        { slug: { $ne: 'dentos-default' } }, // Exclude default organization
        {
          $or: [
            { name: searchRegex },
            { slug: searchRegex },
            { 'address.city': searchRegex },
            { 'address.state': searchRegex }
          ]
        }
      ]
    })
    .select('name slug type address contactInfo')
    .limit(10);

    res.status(200).json({
      success: true,
      data: organizations
    });

  } catch (error) {
    console.error('Organization search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during organization search'
    });
  }
};

// @desc    Request to join organization
// @route   POST /api/organizations/:id/join-request
// @access  Private
exports.requestJoinOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Check if organization exists
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user already has a pending request
    const JoinRequest = require('../models/JoinRequest');
    const existingRequest = await JoinRequest.findOne({
      user: req.user.id,
      organization: id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request to join this organization'
      });
    }

    // Check if user is already a member
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (user.organization.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this organization'
      });
    }

    // Create join request
    const joinRequest = await JoinRequest.create({
      user: req.user.id,
      organization: id,
      message: message || ''
    });

    res.status(201).json({
      success: true,
      message: 'Join request sent successfully',
      data: joinRequest
    });

  } catch (error) {
    console.error('Join request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during join request'
    });
  }
};

// @desc    Get pending join requests for organization
// @route   GET /api/organizations/:id/join-requests
// @access  Private (Admin only)
exports.getJoinRequests = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin of this organization
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (req.user.organization.toString() !== id || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view join requests for this organization'
      });
    }

    const JoinRequest = require('../models/JoinRequest');
    const joinRequests = await JoinRequest.find({
      organization: id,
      status: 'pending'
    })
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: joinRequests
    });

  } catch (error) {
    console.error('Get join requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting join requests'
    });
  }
};

// @desc    Approve or deny join request
// @route   PUT /api/organizations/:id/join-requests/:requestId
// @access  Private (Admin only)
exports.handleJoinRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const { action, response } = req.body; // action: 'approve' or 'deny'

    if (!['approve', 'deny'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "deny"'
      });
    }

    // Check if user is admin of this organization
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (req.user.organization.toString() !== id || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to handle join requests for this organization'
      });
    }

    const JoinRequest = require('../models/JoinRequest');
    const User = require('../models/User');

    const joinRequest = await JoinRequest.findById(requestId);
    if (!joinRequest || joinRequest.organization.toString() !== id) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Join request has already been processed'
      });
    }

    // Update join request
    joinRequest.status = action === 'approve' ? 'approved' : 'denied';
    joinRequest.adminResponse = response || '';
    joinRequest.respondedBy = req.user.id;
    joinRequest.respondedAt = new Date();
    await joinRequest.save();

    if (action === 'approve') {
      // Add user to organization
      await User.findByIdAndUpdate(joinRequest.user, {
        organization: id
      });
    }

    res.status(200).json({
      success: true,
      message: `Join request ${action}d successfully`,
      data: joinRequest
    });

  } catch (error) {
    console.error('Handle join request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error handling join request'
    });
  }
};

// @desc    Create new user (Admin only)
// @route   POST /api/organizations/:id/users
// @access  Private (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, temporaryPassword } = req.body;

    // Check if user is admin of this organization
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (req.user.organization.toString() !== id || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create users for this organization'
      });
    }

    // Check if user already exists
    const User = require('../models/User');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password: temporaryPassword,
      role: role || 'receptionist',
      organization: id,
      forcePasswordChange: true
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        forcePasswordChange: user.forcePasswordChange
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating user'
    });
  }
};