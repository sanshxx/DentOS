const mongoose = require('mongoose');
const User = require('../models/User');

// Reads desired clinic scope from header or query and enforces access
// Header: X-Clinic-Scope: "all" | "<clinicId>"
module.exports = async function clinicScope(req, res, next) {
  try {
    const scopeHeader = req.headers['x-clinic-scope'];
    const desired = scopeHeader || req.query.clinicScope || 'all';

    // Default: all clinics
    let scope = { type: 'all', clinicId: null };

    if (desired && desired !== 'all') {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(desired)) {
        return res.status(400).json({ success: false, message: 'Invalid clinic scope' });
      }
      scope = { type: 'single', clinicId: new mongoose.Types.ObjectId(desired) };
    }

    // Fetch user to verify clinicAccess
    const user = await User.findById(req.user.id).select('role clinicAccess');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Admins always allowed to select any scope
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      const access = user.clinicAccess || { type: 'all', clinics: [] };
      if (scope.type === 'all') {
        if (access.type !== 'all') {
          return res.status(403).json({ success: false, message: 'Not allowed to view all clinics' });
        }
      } else {
        if (access.type === 'subset') {
          const allowed = (access.clinics || []).map(String);
          if (!allowed.includes(String(scope.clinicId))) {
            return res.status(403).json({ success: false, message: 'Not allowed to access this clinic' });
          }
        }
      }
    }

    // Attach filter helper to request
    req.scope = {
      clinicFilter: scope.type === 'single' ? { clinic: scope.clinicId } : {},
      patientClinicFilter: scope.type === 'single' ? { registeredClinic: scope.clinicId } : {}
    };

    next();
  } catch (err) {
    console.error('Clinic scope middleware error:', err);
    res.status(500).json({ success: false, message: 'Server error (clinic scope)' });
  }
};


