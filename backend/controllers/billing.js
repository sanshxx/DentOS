const asyncHandler = require('../middleware/async');
const Invoice = require('../models/Invoice');

// Mock data for invoices
const mockInvoices = [
  {
    _id: '60d21b4667d0d8992e610c85',
    invoiceNumber: 'INV-202301-0001',
    patient: {
      _id: '60d21b4667d0d8992e610c01',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210'
    },
    clinic: {
      _id: '60d21b4667d0d8992e610c10',
      name: 'Main Clinic'
    },
    invoiceDate: '2023-01-15T10:00:00.000Z',
    dueDate: '2023-02-15T10:00:00.000Z',
    items: [
      {
        description: 'Dental Cleaning',
        quantity: 1,
        unitPrice: 2000,
        discount: 0,
        tax: 18,
        amount: 2360
      },
      {
        description: 'X-Ray',
        quantity: 1,
        unitPrice: 1500,
        discount: 0,
        tax: 18,
        amount: 1770
      }
    ],
    subtotal: 3500,
    taxAmount: 630,
    discountAmount: 0,
    totalAmount: 4130,
    amountPaid: 4130,
    balanceAmount: 0,
    paymentStatus: 'paid',
    payments: [
      {
        amount: 4130,
        paymentDate: '2023-01-15T10:30:00.000Z',
        paymentMethod: 'credit card',
        transactionId: 'TXN123456',
        receivedBy: '60d21b4667d0d8992e610c20'
      }
    ],
    createdAt: '2023-01-15T10:00:00.000Z',
    updatedAt: '2023-01-15T10:30:00.000Z'
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    invoiceNumber: 'INV-202302-0001',
    patient: {
      _id: '60d21b4667d0d8992e610c02',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '9876543211'
    },
    clinic: {
      _id: '60d21b4667d0d8992e610c11',
      name: 'North Branch'
    },
    invoiceDate: '2023-02-10T11:00:00.000Z',
    dueDate: '2023-03-10T11:00:00.000Z',
    items: [
      {
        description: 'Root Canal Treatment',
        quantity: 1,
        unitPrice: 8000,
        discount: 500,
        tax: 18,
        amount: 8850
      }
    ],
    subtotal: 8000,
    taxAmount: 1350,
    discountAmount: 500,
    totalAmount: 8850,
    amountPaid: 4000,
    balanceAmount: 4850,
    paymentStatus: 'partially paid',
    payments: [
      {
        amount: 4000,
        paymentDate: '2023-02-10T11:30:00.000Z',
        paymentMethod: 'cash',
        receivedBy: '60d21b4667d0d8992e610c21'
      }
    ],
    createdAt: '2023-02-10T11:00:00.000Z',
    updatedAt: '2023-02-10T11:30:00.000Z'
  },
  {
    _id: '60d21b4667d0d8992e610c87',
    invoiceNumber: 'INV-202303-0001',
    patient: {
      _id: '60d21b4667d0d8992e610c03',
      name: 'Robert Johnson',
      email: 'robert@example.com',
      phone: '9876543212'
    },
    clinic: {
      _id: '60d21b4667d0d8992e610c12',
      name: 'South Branch'
    },
    invoiceDate: '2023-03-05T09:00:00.000Z',
    dueDate: '2023-04-05T09:00:00.000Z',
    items: [
      {
        description: 'Dental Crown',
        quantity: 2,
        unitPrice: 5000,
        discount: 1000,
        tax: 18,
        amount: 10620
      },
      {
        description: 'Consultation',
        quantity: 1,
        unitPrice: 500,
        discount: 0,
        tax: 18,
        amount: 590
      }
    ],
    subtotal: 10500,
    taxAmount: 1710,
    discountAmount: 1000,
    totalAmount: 11210,
    amountPaid: 0,
    balanceAmount: 11210,
    paymentStatus: 'unpaid',
    payments: [],
    createdAt: '2023-03-05T09:00:00.000Z',
    updatedAt: '2023-03-05T09:00:00.000Z'
  },
  {
    _id: '60d21b4667d0d8992e610c88',
    invoiceNumber: 'INV-202304-0001',
    patient: {
      _id: '60d21b4667d0d8992e610c04',
      name: 'Emily Davis',
      email: 'emily@example.com',
      phone: '9876543213'
    },
    clinic: {
      _id: '60d21b4667d0d8992e610c10',
      name: 'Main Clinic'
    },
    invoiceDate: '2023-04-20T14:00:00.000Z',
    dueDate: '2023-05-20T14:00:00.000Z',
    items: [
      {
        description: 'Teeth Whitening',
        quantity: 1,
        unitPrice: 4000,
        discount: 400,
        tax: 18,
        amount: 4248
      }
    ],
    subtotal: 4000,
    taxAmount: 648,
    discountAmount: 400,
    totalAmount: 4248,
    amountPaid: 4248,
    balanceAmount: 0,
    paymentStatus: 'paid',
    payments: [
      {
        amount: 4248,
        paymentDate: '2023-04-20T14:30:00.000Z',
        paymentMethod: 'upi',
        transactionId: 'UPI123456',
        receivedBy: '60d21b4667d0d8992e610c22'
      }
    ],
    createdAt: '2023-04-20T14:00:00.000Z',
    updatedAt: '2023-04-20T14:30:00.000Z'
  },
  {
    _id: '60d21b4667d0d8992e610c89',
    invoiceNumber: 'INV-202305-0001',
    patient: {
      _id: '60d21b4667d0d8992e610c05',
      name: 'Michael Wilson',
      email: 'michael@example.com',
      phone: '9876543214'
    },
    clinic: {
      _id: '60d21b4667d0d8992e610c11',
      name: 'North Branch'
    },
    invoiceDate: '2023-05-12T13:00:00.000Z',
    dueDate: '2023-06-12T13:00:00.000Z',
    items: [
      {
        description: 'Dental Implant',
        quantity: 1,
        unitPrice: 25000,
        discount: 2000,
        tax: 18,
        amount: 27140
      },
      {
        description: 'X-Ray',
        quantity: 1,
        unitPrice: 1500,
        discount: 0,
        tax: 18,
        amount: 1770
      }
    ],
    subtotal: 26500,
    taxAmount: 4410,
    discountAmount: 2000,
    totalAmount: 28910,
    amountPaid: 10000,
    balanceAmount: 18910,
    paymentStatus: 'partially paid',
    payments: [
      {
        amount: 10000,
        paymentDate: '2023-05-12T13:30:00.000Z',
        paymentMethod: 'credit card',
        transactionId: 'TXN789012',
        receivedBy: '60d21b4667d0d8992e610c23'
      }
    ],
    createdAt: '2023-05-12T13:00:00.000Z',
    updatedAt: '2023-05-12T13:30:00.000Z'
  }
];

// @desc    Get all invoices
// @route   GET /api/billing
// @access  Private
exports.getInvoices = asyncHandler(async (req, res, next) => {
  // In a real app, we would query the database
  // For now, we'll just return the mock data
  
  res.status(200).json({
    success: true,
    count: mockInvoices.length,
    data: mockInvoices
  });
});

// @desc    Get single invoice
// @route   GET /api/billing/:id
// @access  Private
exports.getInvoice = asyncHandler(async (req, res, next) => {
  const invoice = mockInvoices.find(inv => inv._id === req.params.id);
  
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
});

// @desc    Create new invoice
// @route   POST /api/billing
// @access  Private
exports.createInvoice = asyncHandler(async (req, res, next) => {
  // In a real app, we would create a new invoice in the database
  // For now, we'll just return a success message
  
  res.status(201).json({
    success: true,
    message: 'Invoice created successfully',
    data: {
      _id: '60d21b4667d0d8992e610c90',
      invoiceNumber: 'INV-202306-0001',
      ...req.body
    }
  });
});

// @desc    Update invoice
// @route   PUT /api/billing/:id
// @access  Private
exports.updateInvoice = asyncHandler(async (req, res, next) => {
  const invoice = mockInvoices.find(inv => inv._id === req.params.id);
  
  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found'
    });
  }
  
  // In a real app, we would update the invoice in the database
  // For now, we'll just return a success message
  
  res.status(200).json({
    success: true,
    message: 'Invoice updated successfully',
    data: {
      ...invoice,
      ...req.body,
      updatedAt: new Date().toISOString()
    }
  });
});

// @desc    Delete invoice
// @route   DELETE /api/billing/:id
// @access  Private
exports.deleteInvoice = asyncHandler(async (req, res, next) => {
  const invoice = mockInvoices.find(inv => inv._id === req.params.id);
  
  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found'
    });
  }
  
  // In a real app, we would delete the invoice from the database
  // For now, we'll just return a success message
  
  res.status(200).json({
    success: true,
    message: 'Invoice deleted successfully',
    data: {}
  });
});

// @desc    Add payment to invoice
// @route   POST /api/billing/:id/payment
// @access  Private
exports.addPayment = asyncHandler(async (req, res, next) => {
  const invoice = mockInvoices.find(inv => inv._id === req.params.id);
  
  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found'
    });
  }
  
  // In a real app, we would add the payment to the invoice in the database
  // For now, we'll just return a success message
  
  res.status(200).json({
    success: true,
    message: 'Payment added successfully',
    data: {
      ...invoice,
      payments: [...invoice.payments, req.body],
      amountPaid: invoice.amountPaid + req.body.amount,
      balanceAmount: invoice.totalAmount - (invoice.amountPaid + req.body.amount),
      paymentStatus: invoice.totalAmount <= (invoice.amountPaid + req.body.amount) ? 'paid' : 'partially paid',
      updatedAt: new Date().toISOString()
    }
  });
});