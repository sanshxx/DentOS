const asyncHandler = require('../middleware/async');
const Inventory = require('../models/Inventory');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
exports.getInventoryItems = asyncHandler(async (req, res) => {
  try {
    // Filter by clinic scope if provided; inventory stores per-clinic in clinics array
    const base = { organization: req.user.organization };
    let match = base;
    if (req.scope && req.scope.clinicFilter && req.scope.clinicFilter.clinic) {
      match = {
        ...base,
        'clinics.clinic': req.scope.clinicFilter.clinic
      };
    }
    const inventoryItems = await Inventory.find(match);
    
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
    // Add user and organization to req.body
    req.body.createdBy = req.user.id;
    req.body.organization = req.user.organization;
    
    const inventoryItem = await Inventory.create(req.body);
    
    res.status(201).json({
      success: true,
      data: inventoryItem
    });
  } catch (err) {
    console.error('Error creating inventory item:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Item code already exists. Please use a unique item code.'
      });
    }
    
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
    
    await Inventory.findByIdAndDelete(req.params.id);
    
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

// @desc    Update inventory stock
// @route   PUT /api/inventory/:id/stock
// @access  Private
exports.updateInventoryStock = asyncHandler(async (req, res) => {
  try {
    let inventoryItem = await Inventory.findById(req.params.id);
    
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    const { updateAmount, clinicId } = req.body;
    
    if (!updateAmount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an update amount'
      });
    }
    
    // Find the clinic in the clinics array
    const clinicIndex = inventoryItem.clinics.findIndex(
      clinic => clinic.clinic.toString() === clinicId
    );
    
    if (clinicIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found in inventory item'
      });
    }
    
    // Update the stock for the specific clinic
    inventoryItem.clinics[clinicIndex].currentStock += parseInt(updateAmount, 10);
    
    // Ensure stock doesn't go below 0
    if (inventoryItem.clinics[clinicIndex].currentStock < 0) {
      inventoryItem.clinics[clinicIndex].currentStock = 0;
    }
    
    // Update the last stock update timestamp
    inventoryItem.lastStockUpdate = Date.now();
    
    // Calculate status based on current stock and minimum stock
    const totalStock = inventoryItem.clinics.reduce((sum, clinic) => sum + clinic.currentStock, 0);
    
    // Use proper status values that match the enum
    if (totalStock <= 0) {
      inventoryItem.status = 'out of stock';
    } else if (inventoryItem.clinics.some(clinic => clinic.currentStock <= clinic.minStockLevel)) {
      inventoryItem.status = 'low stock';
    } else {
      inventoryItem.status = 'active';
    }
    
    await inventoryItem.save();
    
    inventoryItem = await Inventory.findById(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Inventory stock updated successfully',
      data: inventoryItem
    });
  } catch (err) {
    console.error('Stock update error:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});