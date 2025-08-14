const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const clinicScope = require('../middleware/clinicScope');
const {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateInventoryStock
} = require('../controllers/inventory');

// Inventory routes
router.route('/')
  .get(protect, clinicScope, getInventoryItems)
  .post(protect, clinicScope, createInventoryItem);

router.route('/:id')
  .get(protect, clinicScope, getInventoryItem)
  .put(protect, clinicScope, updateInventoryItem)
  .delete(protect, clinicScope, deleteInventoryItem);

router.route('/:id/stock')
  .put(protect, clinicScope, updateInventoryStock);

module.exports = router;