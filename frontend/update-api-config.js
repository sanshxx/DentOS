const fs = require('fs');
const path = require('path');

// Files that need to be updated to use centralized API configuration
const filesToUpdate = [
  'src/pages/reports/Reports.js',
  'src/pages/billing/ViewInvoice.js',
  'src/pages/billing/InvoiceDetails.js',
  'src/pages/billing/Invoices.js',
  'src/pages/billing/CreateInvoice.js',
  'src/pages/billing/EditInvoice.js',
  'src/pages/billing/RecordPayment.js',
  'src/pages/inventory/InventoryDetails.js',
  'src/pages/inventory/Inventory.js',
  'src/pages/inventory/AddInventory.js',
  'src/pages/inventory/EditInventory.js',
  'src/pages/clinics/ClinicDetails.js',
  'src/pages/clinics/Clinics.js',
  'src/pages/treatments/TreatmentDetails.js',
  'src/pages/treatments/Treatments.js',
  'src/pages/treatments/EditTreatment.js',
  'src/pages/treatments/AddTreatment.js',
  'src/pages/treatments/TreatmentPlans.js',
  'src/pages/patients/EditPatient.js',
  'src/pages/patients/PatientDetails.js',
  'src/pages/patients/Patients.js',
  'src/pages/patients/AddPatient.js',
  'src/pages/patients/PatientList.js',
  'src/pages/settings/Profile.js',
  'src/pages/staff/StaffDetails.js',
  'src/pages/staff/Staff.js',
  'src/pages/team/Team.js',
  'src/pages/dashboard/Dashboard.js',
  'src/pages/auth/ChangePassword.js',
  'src/pages/auth/JoinOrganization.js',
  'src/pages/auth/OrganizationSetup.js',
  'src/pages/appointments/EditAppointment.js',
  'src/pages/appointments/AppointmentCalendar.js',
  'src/pages/appointments/AppointmentDetails.js',
  'src/pages/appointments/AddAppointment.js',
  'src/pages/appointments/AppointmentList.js',
  'src/components/routing/OrganizationCheck.js'
];

const updateFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if file already uses centralized config
    if (content.includes("import { API_URL } from '../utils/apiConfig'") || 
        content.includes("import { API_URL } from '../../utils/apiConfig'") ||
        content.includes("import { API_URL } from '../../../utils/apiConfig'")) {
      console.log(`✅ Already updated: ${filePath}`);
      return true;
    }
    
    // Find the correct relative path to utils/apiConfig
    const depth = filePath.split('/').length - 2; // -2 for 'src' and filename
    const relativePath = '../'.repeat(depth) + 'utils/apiConfig';
    
    // Replace the API_URL definition
    const oldPattern = /const API_URL = process\.env\.REACT_APP_API_URL \|\| 'http:\/\/localhost:5000\/api';/;
    const newImport = `import { API_URL } from '${relativePath}';`;
    
    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, newImport);
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  No API_URL pattern found in: ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
};

console.log('🔧 Updating API configuration across all files...\n');

let updatedCount = 0;
let totalCount = filesToUpdate.length;

filesToUpdate.forEach(file => {
  if (updateFile(file)) {
    updatedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Total files: ${totalCount}`);
console.log(`   Updated: ${updatedCount}`);
console.log(`   Skipped: ${totalCount - updatedCount}`);

console.log('\n✅ API configuration update complete!');
console.log('📝 Next steps:');
console.log('1. Test the application locally');
console.log('2. Deploy to Vercel with updated configuration');
console.log('3. Verify login works with correct API endpoints');
