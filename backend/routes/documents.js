const express = require('express');
const router = express.Router({ mergeParams: true });
const { check } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Import controllers
const {
  getPatientDocuments,
  getDocument,
  uploadDocument,
  downloadDocument,
  updateDocument,
  deleteDocument,
  searchDocuments
} = require('../controllers/documents');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Create patient-specific directory
    const patientDir = path.join(uploadDir, req.params.patientId);
    if (!fs.existsSync(patientDir)) {
      fs.mkdirSync(patientDir, { recursive: true });
    }
    
    cb(null, patientDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow only certain file types
  const allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX, XLS, and XLSX files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes

// Search documents
router.get('/search', protect, searchDocuments);

// Get all documents for a patient
router.get('/', protect, getPatientDocuments);

// Upload a document
router.post('/',
  protect,
  upload.single('file'),
  [
    check('category', 'Category is required').not().isEmpty(),
    check('description', 'Description cannot exceed 500 characters').optional().isLength({ max: 500 })
  ],
  uploadDocument
);

// Get a single document
router.get('/:id', protect, getDocument);

// Download a document
router.get('/:id/download', protect, downloadDocument);

// Update document details
router.put('/:id',
  protect,
  [
    check('category', 'Category is required').optional().not().isEmpty(),
    check('description', 'Description cannot exceed 500 characters').optional().isLength({ max: 500 })
  ],
  updateDocument
);

// Delete a document
router.delete('/:id', protect, authorize('admin', 'manager', 'dentist'), deleteDocument);

module.exports = router;