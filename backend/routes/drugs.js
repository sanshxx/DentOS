const express = require('express');
const {
  getDrugs,
  getDrug,
  createDrug,
  updateDrug,
  deleteDrug,
  getDrugCategories,
  getDrugForms,
  checkDrugInteractions,
  bulkImportDrugs
} = require('../controllers/drugs');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const clinicScope = require('../middleware/clinicScope');

// Apply middleware to all routes
router.use(protect);
router.use(clinicScope);

// Routes
router.route('/')
  .get(getDrugs)
  .post(authorize('doctor', 'admin'), createDrug);

router.route('/categories')
  .get(getDrugCategories);

router.route('/forms')
  .get(getDrugForms);

router.route('/check-interactions')
  .post(authorize('doctor', 'admin'), checkDrugInteractions);

router.route('/bulk-import')
  .post(authorize('admin'), bulkImportDrugs);

router.route('/:id')
  .get(getDrug)
  .put(authorize('doctor', 'admin'), updateDrug)
  .delete(authorize('admin'), deleteDrug);

module.exports = router;
