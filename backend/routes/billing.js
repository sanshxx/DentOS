const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const clinicScope = require('../middleware/clinicScope');
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  addPayment,
  updatePayment,
  deletePayment
} = require('../controllers/billing');

// @route   GET api/billing
// @desc    Get all invoices
// @access  Private
router.get('/', protect, clinicScope, getInvoices);

// @route   GET api/billing/:id
// @desc    Get single invoice
// @access  Private
router.get('/:id', protect, clinicScope, getInvoice);

// @route   POST api/billing
// @desc    Create new invoice
// @access  Private
router.post('/', protect, clinicScope, createInvoice);

// @route   PUT api/billing/:id
// @desc    Update invoice
// @access  Private
router.put('/:id', protect, clinicScope, updateInvoice);

// @route   DELETE api/billing/:id
// @desc    Delete invoice
// @access  Private
router.delete('/:id', protect, clinicScope, deleteInvoice);

// @route   POST api/billing/:id/payment
// @desc    Add payment to invoice
// @access  Private
router.post('/:id/payment', protect, clinicScope, addPayment);

// @route   PUT api/billing/:id/payment/:paymentId
// @desc    Update payment in invoice
// @access  Private
router.put('/:id/payment/:paymentId', protect, clinicScope, updatePayment);

// @route   DELETE api/billing/:id/payment/:paymentId
// @desc    Delete payment from invoice
// @access  Private
router.delete('/:id/payment/:paymentId', protect, clinicScope, deletePayment);

module.exports = router;