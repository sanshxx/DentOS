const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  addPayment
} = require('../controllers/billing');

// @route   GET api/billing
// @desc    Get all invoices
// @access  Private
router.get('/', protect, getInvoices);

// @route   GET api/billing/:id
// @desc    Get single invoice
// @access  Private
router.get('/:id', protect, getInvoice);

// @route   POST api/billing
// @desc    Create new invoice
// @access  Private
router.post('/', protect, createInvoice);

// @route   PUT api/billing/:id
// @desc    Update invoice
// @access  Private
router.put('/:id', protect, updateInvoice);

// @route   DELETE api/billing/:id
// @desc    Delete invoice
// @access  Private
router.delete('/:id', protect, deleteInvoice);

// @route   POST api/billing/:id/payment
// @desc    Add payment to invoice
// @access  Private
router.post('/:id/payment', protect, addPayment);

module.exports = router;