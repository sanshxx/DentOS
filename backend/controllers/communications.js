const Communication = require('../models/Communication');
const Patient = require('../models/Patient');
const { validationResult } = require('express-validator');

// @desc    Get all communications for a patient
// @route   GET /api/patients/:patientId/communications
// @access  Private
exports.getPatientCommunications = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get communications
    const communications = await Communication.find({ patient: patientId })
      .populate('sentBy', 'name')
      .sort('-sentAt');

    res.status(200).json({
      success: true,
      count: communications.length,
      data: communications
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get a single communication
// @route   GET /api/communications/:id
// @access  Private
exports.getCommunication = async (req, res) => {
  try {
    const communication = await Communication.findById(req.params.id)
      .populate('patient', 'name patientId phone email')
      .populate('sentBy', 'name');

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: 'Communication not found'
      });
    }

    res.status(200).json({
      success: true,
      data: communication
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Communication not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Send a communication
// @route   POST /api/patients/:patientId/communications
// @access  Private
exports.sendCommunication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { patientId } = req.params;
    
    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const { type, channel, message, subject, template, templateData, triggerEvent, reference } = req.body;

    // Validate required fields based on channel
    if (channel === 'Email' && !subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required for email communications'
      });
    }

    // Create communication record
    const communication = await Communication.create({
      patient: patientId,
      type: type || 'Manual',
      channel,
      message,
      subject,
      sentBy: req.user.id,
      status: 'Pending',
      template,
      templateData,
      triggerEvent,
      reference
    });

    // Here you would integrate with actual SMS/WhatsApp/Email service
    // For now, we'll simulate sending and update the status

    // Simulate sending
    setTimeout(async () => {
      try {
        // Update status to sent
        communication.status = 'Sent';
        communication.statusUpdatedAt = new Date();
        communication.deliveryDetails = {
          ...communication.deliveryDetails,
          externalId: `sim-${Date.now()}`
        };
        await communication.save();

        // Simulate delivery after a delay (for WhatsApp and SMS)
        if (channel === 'SMS' || channel === 'WhatsApp') {
          setTimeout(async () => {
            try {
              communication.status = 'Delivered';
              communication.statusUpdatedAt = new Date();
              communication.deliveryDetails.deliveredAt = new Date();
              await communication.save();
            } catch (error) {
              console.error('Error updating delivery status:', error);
            }
          }, 5000); // 5 seconds delay
        }
      } catch (error) {
        console.error('Error updating sent status:', error);
      }
    }, 2000); // 2 seconds delay

    res.status(201).json({
      success: true,
      data: communication
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update communication status
// @route   PUT /api/communications/:id/status
// @access  Private
exports.updateCommunicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Sent', 'Delivered', 'Read', 'Failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    let communication = await Communication.findById(req.params.id);

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: 'Communication not found'
      });
    }

    // Update status and related fields
    const updateData = {
      status,
      statusUpdatedAt: new Date()
    };

    // Update delivery details based on status
    if (status === 'Delivered') {
      updateData['deliveryDetails.deliveredAt'] = new Date();
    } else if (status === 'Read') {
      updateData['deliveryDetails.readAt'] = new Date();
    } else if (status === 'Failed') {
      updateData['deliveryDetails.failedAt'] = new Date();
      updateData.errorMessage = req.body.errorMessage || 'Failed to deliver';
    }

    communication = await Communication.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: communication
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Communication not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get communication statistics
// @route   GET /api/communications/stats
// @access  Private
exports.getCommunicationStats = async (req, res) => {
  try {
    // Get counts by status
    const statusStats = await Communication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get counts by channel
    const channelStats = await Communication.aggregate([
      { $group: { _id: '$channel', count: { $sum: 1 } } }
    ]);

    // Get counts by type
    const typeStats = await Communication.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Get counts by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await Communication.aggregate([
      { 
        $match: { 
          sentAt: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$sentAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats: statusStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        channelStats: channelStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        typeStats: typeStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        dailyStats
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

// @desc    Send bulk communications
// @route   POST /api/communications/bulk
// @access  Private (Admin/Manager only)
exports.sendBulkCommunications = async (req, res) => {
  try {
    const { patientIds, message, channel, subject, template, triggerEvent } = req.body;

    // Validate input
    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient IDs are required'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (!channel) {
      return res.status(400).json({
        success: false,
        message: 'Channel is required'
      });
    }

    // Check if user has permission for bulk sending
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send bulk communications'
      });
    }

    // Verify all patients exist
    const patients = await Patient.find({ _id: { $in: patientIds } });
    if (patients.length !== patientIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more patients not found'
      });
    }

    // Create communication records for each patient
    const communications = [];
    for (const patient of patients) {
      const communication = await Communication.create({
        patient: patient._id,
        type: 'Manual',
        channel,
        message,
        subject,
        sentBy: req.user.id,
        status: 'Pending',
        template,
        triggerEvent
      });
      communications.push(communication);

      // Simulate sending (in a real app, you would use a queue system)
      setTimeout(async () => {
        try {
          communication.status = 'Sent';
          communication.statusUpdatedAt = new Date();
          await communication.save();
        } catch (error) {
          console.error('Error updating bulk message status:', error);
        }
      }, 2000); // 2 seconds delay
    }

    res.status(201).json({
      success: true,
      count: communications.length,
      data: communications
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};