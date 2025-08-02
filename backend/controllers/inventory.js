const asyncHandler = require('../middleware/async');
const Inventory = require('../models/Inventory');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
exports.getInventoryItems = asyncHandler(async (req, res) => {
  try {
    const inventoryItems = await Inventory.find();
    
    res.status(200).json({
      success: true,
      count: inventoryItems.length,
      data: inventoryItems
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
exports.getInventoryItem = asyncHandler(async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);
    
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private
exports.createInventoryItem = asyncHandler(async (req, res) => {
  try {
    const inventoryItem = await Inventory.create(req.body);
    
    res.status(201).json({
      success: true,
      data: inventoryItem
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
exports.updateInventoryItem = asyncHandler(async (req, res) => {
  try {
    let inventoryItem = await Inventory.findById(req.params.id);
    
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    inventoryItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
exports.deleteInventoryItem = asyncHandler(async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);
    
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    await inventoryItem.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// Legacy mock data for reference
/*
const mockInventoryItems = [
  {
    _id: '60d21b4667d0d8992e610c85',
    itemName: 'Dental Floss',
    itemCode: 'DF-001',
    category: 'Consumables',
    description: 'Waxed dental floss for patient use',
    unit: 'Box',
    unitPrice: 120,
    currentStock: 45,
    minimumStock: 10,
    supplier: {
      name: 'Dental Supplies Ltd',
      contactPerson: 'Rajesh Kumar',
      phone: '9876543210',
      email: 'rajesh@dentalsupplies.com'
    },
    clinic: {
      _id: '60d21b4667d0d8992e610c10',
      name: 'Main Clinic'
    },
    expiryDate: '2024-06-30',
    lastRestocked: '2023-01-10',
    status: 'In Stock'
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    itemName: 'Dental Mirrors',
    itemCode: 'DM-002',
    category: 'Instruments',
    description: 'Stainless steel dental mirrors',
    unit: 'Piece',
    unitPrice: 250,
    currentStock: 20,
    minimumStock: 5,
    supplier: {
      name: 'Medical Instruments Inc',
      contactPerson: 'Priya Sharma',
      phone: '9876543211',
      email: 'priya@medicalinstruments.com'
    },
    clinic: {
      _id: '60d21b4667d0d8992e610c10',
      name: 'Main Clinic'
    },
    expiryDate: null,
    lastRestocked: '2023-02-15',
    status: 'In Stock'
  },
  {
    _id: '60d21b4667d0d8992e610c87',
    itemName: 'Dental Anesthetic',
    itemCode: 'DA-003',
    category: 'Medicines',
    description: 'Local anesthetic for dental procedures',
    unit: 'Box',
    unitPrice: 850,
    currentStock: 8,
    minimumStock: 5,
    supplier: {
      name: 'Pharma Distributors',
      contactPerson: 'Amit Patel',
      phone: '9876543212',
      email: 'amit@pharmadist.com'
    },
    clinic: {
      _id: '60d21b4667d0d8992e610c10',
      name: 'Main Clinic'
    },
    expiryDate: '2023-12-31',
    lastRestocked: '2023-03-05',
    status: 'Low Stock'
  },
  {
    _id: '60d21b4667d0d8992e610c88',
    itemName: 'Dental Chair',
    itemCode: 'DC-004',
    category: 'Equipment',
    description: 'Fully automatic dental chair with LED light',
    unit: 'Piece',
    unitPrice: 250000,
    currentStock: 2,
    minimumStock: 1,
    supplier: {
      name: 'Dental Equipment Co',
      contactPerson: 'Vikram Mehta',
      phone: '9876543213',
      email: 'vikram@dentalequip.com'
    },
    clinic: {
      _id: '60d21b4667d0d8992e610c10',
      name: 'Main Clinic'
    },
    expiryDate: null,
    lastRestocked: '2023-01-20',
    status: 'In Stock'
  },
  {
    _id: '60d21b4667d0d8992e610c89',
    itemName: 'Dental Implants',
    itemCode: 'DI-005',
    category: 'Implants',
    description: 'Titanium dental implants',
    unit: 'Piece',
    unitPrice: 3500,
    currentStock: 0,
    minimumStock: 5,
    supplier: {
      name: 'Implant Specialists',
      contactPerson: 'Neha Gupta',
      phone: '9876543214',
      email: 'neha@implantspecialists.com'
    },
    clinic: {
      _id: '60d21b4667d0d8992e610c10',
      name: 'Main Clinic'
    },
    expiryDate: '2025-06-30',
    lastRestocked: '2022-12-10',
    status: 'Out of Stock'
  }
];

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
exports.getInventoryItems = asyncHandler(async (req, res, next) => {
  // In a real application, you would fetch from the database
  // For now, we'll return mock data
  res.status(200).json({
    success: true,
    count: mockInventoryItems.length,
    data: mockInventoryItems
  });
});

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
exports.getInventoryItem = asyncHandler(async (req, res, next) => {
  const item = mockInventoryItems.find(item => item._id === req.params.id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private
exports.createInventoryItem = asyncHandler(async (req, res, next) => {
  // In a real application, you would create in the database
  // For now, we'll simulate a successful creation
  res.status(201).json({
    success: true,
    message: 'Inventory item created successfully',
    data: {
      _id: '60d21b4667d0d8992e610c90',
      ...req.body
    }
  });
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
exports.updateInventoryItem = asyncHandler(async (req, res, next) => {
  // In a real application, you would update in the database
  // For now, we'll simulate a successful update
  res.status(200).json({
    success: true,
    message: 'Inventory item updated successfully',
    data: {
      _id: req.params.id,
      ...req.body
    }
  });
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
exports.deleteInventoryItem = asyncHandler(async (req, res, next) => {
  // In a real application, you would delete from the database
  // For now, we'll simulate a successful deletion
  res.status(200).json({
    success: true,
    message: 'Inventory item deleted successfully',
    data: {}
  });
});

// @desc    Update inventory stock
// @route   PATCH /api/inventory/:id/stock
// @access  Private
exports.updateInventoryStock = asyncHandler(async (req, res, next) => {
  // In a real application, you would update stock in the database
  // For now, we'll simulate a successful stock update
  res.status(200).json({
    success: true,
    message: 'Inventory stock updated successfully',
    data: {
      _id: req.params.id,
      currentStock: req.body.currentStock,
      lastRestocked: new Date().toISOString().split('T')[0],
      status: req.body.currentStock <= 0 ? 'Out of Stock' : 
              req.body.currentStock <= req.body.minimumStock ? 'Low Stock' : 'In Stock'
    }
  });
});
*/