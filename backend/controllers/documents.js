const PatientDocument = require('../models/PatientDocument');
const Patient = require('../models/Patient');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

// @desc    Get all documents for a patient
// @route   GET /api/patients/:patientId/documents
// @access  Private
exports.getPatientDocuments = async (req, res) => {
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

    // Get documents
    const documents = await PatientDocument.find({ 
      patient: patientId,
      isDeleted: false
    })
    .populate('uploadedBy', 'name')
    .sort('-uploadedAt');

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get a single document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocument = async (req, res) => {
  try {
    const document = await PatientDocument.findById(req.params.id)
      .populate('patient', 'name patientId')
      .populate('uploadedBy', 'name');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Log access
    document.accessLog.push({
      accessedBy: req.user.id,
      action: 'view'
    });
    await document.save();

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Upload a document
// @route   POST /api/patients/:patientId/documents
// @access  Private
exports.uploadDocument = async (req, res) => {
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

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Validate file size (additional check)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxFileSize) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit'
      });
    }

    // Validate file exists on disk
    if (!fs.existsSync(req.file.path)) {
      return res.status(500).json({
        success: false,
        message: 'File upload failed - file not found on disk'
      });
    }

    // Create document
    const document = await PatientDocument.create({
      patient: patientId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      category: req.body.category || 'Other',
      description: req.body.description,
      filePath: req.file.path,
      uploadedBy: req.user.id,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
    });

    // Add initial access log entry
    document.accessLog.push({
      accessedBy: req.user.id,
      action: 'upload'
    });
    await document.save();

    // Populate the document with user info before sending response
    const populatedDocument = await PatientDocument.findById(document._id)
      .populate('uploadedBy', 'name');

    res.status(201).json({
      success: true,
      data: populatedDocument
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Download a document
// @route   GET /api/patients/:patientId/documents/:id/download
// @access  Private
exports.downloadDocument = async (req, res) => {
  try {
    const document = await PatientDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      console.error(`File not found: ${document.filePath}`);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Check if file is readable
    try {
      fs.accessSync(document.filePath, fs.constants.R_OK);
    } catch (error) {
      console.error(`File not readable: ${document.filePath}`, error);
      return res.status(500).json({
        success: false,
        message: 'File access error'
      });
    }

    // Log access
    document.accessLog.push({
      accessedBy: req.user.id,
      action: 'download'
    });
    await document.save();

    // Send file
    res.download(document.filePath, document.fileName);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update document details
// @route   PUT /api/documents/:id
// @access  Private
exports.updateDocument = async (req, res) => {
  try {
    let document = await PatientDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Only allow updating certain fields
    const { category, description, tags } = req.body;
    const updateData = {};
    
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());

    // Log access
    const accessLog = {
      accessedBy: req.user.id,
      action: 'update'
    };

    // Update document
    document = await PatientDocument.findByIdAndUpdate(
      req.params.id,
      { 
        ...updateData,
        $push: { accessLog }
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete a document (soft delete)
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const document = await PatientDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Soft delete
    document.isDeleted = true;
    document.deletedAt = Date.now();
    document.deletedBy = req.user.id;
    
    // Log access
    document.accessLog.push({
      accessedBy: req.user.id,
      action: 'delete'
    });
    
    await document.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Search documents
// @route   GET /api/documents/search
// @access  Private
exports.searchDocuments = async (req, res) => {
  try {
    const { query, patientId, category } = req.query;
    
    const searchQuery = { isDeleted: false };
    
    // Add patient filter if provided
    if (patientId) {
      searchQuery.patient = patientId;
    }
    
    // Add category filter if provided
    if (category) {
      searchQuery.category = category;
    }
    
    // Add text search if query provided
    if (query) {
      searchQuery.$text = { $search: query };
    }
    
    const documents = await PatientDocument.find(searchQuery)
      .populate('patient', 'name patientId')
      .populate('uploadedBy', 'name')
      .sort('-uploadedAt');
    
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};