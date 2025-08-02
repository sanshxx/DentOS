const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
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
  .get(protect, getInventoryItems)
  .post(protect, createInventoryItem);

router.route('/:id')
  .get(protect, getInventoryItem)
  .put(protect, updateInventoryItem)
  .delete(protect, deleteInventoryItem);

router.route('/:id/stock')
  .patch(protect, updateInventoryStock);

module.exports = router;