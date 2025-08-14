const asyncHandler = require('../middleware/async');
const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');
const User = require('../models/User');


// @desc    Get all invoices
// @route   GET /api/billing
// @access  Private
// @desc    Get all invoices
// @route   GET /api/billing
// @access  Private
exports.getInvoices = asyncHandler(async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource - filter by organization
    const baseQuery = { organization: req.user.organization, ...JSON.parse(queryStr) };
    // Apply clinic scope if present
    const scopedBase = req.scope && req.scope.clinicFilter ? { ...baseQuery, ...req.scope.clinicFilter } : baseQuery;
    query = Invoice.find(scopedBase);

    // Handle search
    if (req.query.search) {
      // Get patients matching the search (filtered by organization)
      const patients = await Patient.find({
        organization: req.user.organization,
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { phone: { $regex: req.query.search, $options: 'i' } },
          { patientId: { $regex: req.query.search, $options: 'i' } }
        ]
      }).select('_id');

      const patientIds = patients.map(patient => patient._id);

      // Add to query
      query = query.or([
        { patient: { $in: patientIds } },
        { invoiceNumber: { $regex: req.query.search, $options: 'i' } }
      ]);
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-invoiceDate');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Invoice.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    // Populate
    query = query.populate([
      { path: 'patient', select: 'name phone patientId' },
      { path: 'clinic', select: 'name branchCode' }
    ]);

    // Executing query
    const invoices = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: invoices.length,
      pagination,
      total,
      data: invoices
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Get single invoice
// @route   GET /api/billing/:id
// @access  Private
exports.getInvoice = asyncHandler(async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate([
      { path: 'patient', select: 'name phone patientId email' },
      { path: 'clinic', select: 'name branchCode address' }
    ]);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Create new invoice
// @route   POST /api/billing
// @access  Private
exports.createInvoice = asyncHandler(async (req, res, next) => {
  try {
    // Create invoice (let the model handle invoice number generation)
    const invoice = await Invoice.create({
      ...req.body,
      organization: req.user.organization,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Populate the created invoice with patient and clinic data
    const populatedInvoice = await Invoice.findById(invoice._id).populate([
      { path: 'patient', select: 'name phone patientId email' },
      { path: 'clinic', select: 'name branchCode address' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: populatedInvoice
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Update invoice
// @route   PUT /api/billing/:id
// @access  Private
exports.updateInvoice = asyncHandler(async (req, res, next) => {
  try {
    let invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Update invoice
    invoice = await Invoice.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: new Date() }, 
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', select: 'name phone patientId email' },
      { path: 'clinic', select: 'name branchCode address' }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Delete invoice
// @route   DELETE /api/billing/:id
// @access  Private
exports.deleteInvoice = asyncHandler(async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    await Invoice.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
      data: {}
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Add payment to invoice
// @route   POST /api/billing/:id/payment
// @access  Private
exports.addPayment = asyncHandler(async (req, res, next) => {
  try {
    let invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Calculate new amounts
    const newAmountPaid = invoice.amountPaid + req.body.amount;
    const newBalanceAmount = invoice.totalAmount - newAmountPaid;
    let newPaymentStatus = invoice.paymentStatus;
    
    // Determine payment status
    if (newBalanceAmount <= 0) {
      newPaymentStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newPaymentStatus = 'partially paid';
    }
    
    // Prepare payment data with required fields
    const paymentData = {
      amount: req.body.amount,
      paymentDate: new Date(),
      paymentMethod: req.body.paymentMethod ? req.body.paymentMethod.toLowerCase() : 'cash',
      transactionId: req.body.reference || req.body.transactionId,
      notes: req.body.notes,
      receivedBy: req.user.id // Use the authenticated user as the receiver
    };

    // Add payment and update invoice
    invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        $push: { payments: paymentData },
        amountPaid: newAmountPaid,
        balanceAmount: newBalanceAmount,
        paymentStatus: newPaymentStatus,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', select: 'name phone patientId email' },
      { path: 'clinic', select: 'name branchCode address' }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Payment added successfully',
      data: invoice
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Update payment in invoice
// @route   PUT /api/billing/:id/payment/:paymentId
// @access  Private
exports.updatePayment = asyncHandler(async (req, res, next) => {
  try {
    let invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Find the payment to update
    const paymentIndex = invoice.payments.findIndex(
      payment => payment._id.toString() === req.params.paymentId
    );

    if (paymentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const oldPaymentAmount = invoice.payments[paymentIndex].amount;
    const newPaymentAmount = req.body.amount;

    // Calculate new amounts
    const newAmountPaid = invoice.amountPaid - oldPaymentAmount + newPaymentAmount;
    const newBalanceAmount = invoice.totalAmount - newAmountPaid;
    let newPaymentStatus = invoice.paymentStatus;
    
    // Determine payment status
    if (newBalanceAmount <= 0) {
      newPaymentStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newPaymentStatus = 'partially paid';
    } else {
      newPaymentStatus = 'unpaid';
    }

    // Update the payment
    invoice.payments[paymentIndex] = {
      ...invoice.payments[paymentIndex],
      amount: newPaymentAmount,
      paymentMethod: req.body.paymentMethod ? req.body.paymentMethod.toLowerCase() : invoice.payments[paymentIndex].paymentMethod,
      transactionId: req.body.reference || req.body.transactionId || invoice.payments[paymentIndex].transactionId,
      notes: req.body.notes || invoice.payments[paymentIndex].notes,
      receivedBy: invoice.payments[paymentIndex].receivedBy // Keep the original receivedBy
    };

    // Update invoice totals
    invoice.amountPaid = newAmountPaid;
    invoice.balanceAmount = newBalanceAmount;
    invoice.paymentStatus = newPaymentStatus;
    invoice.updatedAt = new Date();

    await invoice.save();

    // Populate and return updated invoice
    invoice = await Invoice.findById(req.params.id).populate([
      { path: 'patient', select: 'name phone patientId email' },
      { path: 'clinic', select: 'name branchCode address' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: invoice
    });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invoice or payment not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Delete payment from invoice
// @route   DELETE /api/billing/:id/payment/:paymentId
// @access  Private
exports.deletePayment = asyncHandler(async (req, res, next) => {
  try {
    let invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Find the payment to delete
    const paymentIndex = invoice.payments.findIndex(
      payment => payment._id.toString() === req.params.paymentId
    );

    if (paymentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const paymentToDelete = invoice.payments[paymentIndex];

    // Calculate new amounts
    const newAmountPaid = invoice.amountPaid - paymentToDelete.amount;
    const newBalanceAmount = invoice.totalAmount - newAmountPaid;
    let newPaymentStatus = invoice.paymentStatus;
    
    // Determine payment status
    if (newBalanceAmount <= 0) {
      newPaymentStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newPaymentStatus = 'partially paid';
    } else {
      newPaymentStatus = 'unpaid';
    }

    // Remove the payment
    invoice.payments.splice(paymentIndex, 1);

    // Update invoice totals
    invoice.amountPaid = newAmountPaid;
    invoice.balanceAmount = newBalanceAmount;
    invoice.paymentStatus = newPaymentStatus;
    invoice.updatedAt = new Date();

    await invoice.save();

    // Populate and return updated invoice
    invoice = await Invoice.findById(req.params.id).populate([
      { path: 'patient', select: 'name phone patientId email' },
      { path: 'clinic', select: 'name branchCode address' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully',
      data: invoice
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invoice or payment not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});