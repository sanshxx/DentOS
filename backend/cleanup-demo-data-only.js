const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const Organization = require('./models/Organization');
const User = require('./models/User');
const Clinic = require('./models/Clinic');
const Patient = require('./models/Patient');
const Staff = require('./models/Staff');
const TreatmentDefinition = require('./models/TreatmentDefinition');
const Treatment = require('./models/Treatment');
const Inventory = require('./models/Inventory');
const Invoice = require('./models/Invoice');
const Appointment = require('./models/Appointment');
const PatientDocument = require('./models/PatientDocument');
const Communication = require('./models/Communication');
const Notification = require('./models/Notification');
const JoinRequest = require('./models/JoinRequest');

const cleanupDemoDataOnly = async () => {
  try {
    console.log('🧹 CLEANUP: Starting database cleanup to keep only demo data...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Find the Smile Care Dental Clinic organization
    console.log('\n🔍 CLEANUP: Finding Smile Care Dental Clinic organization...');
    const demoOrganization = await Organization.findOne({ slug: 'smile-care-demo' });
    
    if (!demoOrganization) {
      console.log('❌ Demo organization not found. Cannot proceed with cleanup.');
      return;
    }
    
    console.log(`✅ Found demo organization: ${demoOrganization.name} (ID: ${demoOrganization._id})`);
    
    // Get all demo users (the 5 we fixed)
    const demoUserEmails = [
      'admin@smilecare.com',
      'manager@smilecare.com', 
      'dentist@smilecare.com',
      'receptionist@smilecare.com',
      'assistant@smilecare.com'
    ];
    
    console.log('\n🔍 CLEANUP: Finding demo users...');
    const demoUsers = await User.find({ email: { $in: demoUserEmails } });
    console.log(`✅ Found ${demoUsers.length} demo users`);
    
    const demoUserIds = demoUsers.map(user => user._id);
    
    // Cleanup process
    console.log('\n🧹 CLEANUP: Starting data cleanup...');
    
    // 1. Remove non-demo organizations
    console.log('\n1️⃣ Removing non-demo organizations...');
    const orgResult = await Organization.deleteMany({ 
      _id: { $ne: demoOrganization._id } 
    });
    console.log(`   ✅ Removed ${orgResult.deletedCount} non-demo organizations`);
    
    // 2. Remove non-demo users
    console.log('\n2️⃣ Removing non-demo users...');
    const userResult = await User.deleteMany({ 
      email: { $nin: demoUserEmails } 
    });
    console.log(`   ✅ Removed ${userResult.deletedCount} non-demo users`);
    
    // 3. Remove clinics not associated with demo organization
    console.log('\n3️⃣ Removing non-demo clinics...');
    const clinicResult = await Clinic.deleteMany({ 
      organization: { $ne: demoOrganization._id } 
    });
    console.log(`   ✅ Removed ${clinicResult.deletedCount} non-demo clinics`);
    
    // 4. Remove patients not associated with demo organization
    console.log('\n4️⃣ Removing non-demo patients...');
    const patientResult = await Patient.deleteMany({ 
      organization: { $ne: demoOrganization._id } 
    });
    console.log(`   ✅ Removed ${patientResult.deletedCount} non-demo patients`);
    
    // 5. Remove staff not associated with demo organization
    console.log('\n5️⃣ Removing non-demo staff...');
    const staffResult = await Staff.deleteMany({ 
      organization: { $ne: demoOrganization._id } 
    });
    console.log(`   ✅ Removed ${staffResult.deletedCount} non-demo staff`);
    
    // 6. Remove treatment definitions not associated with demo organization
    console.log('\n6️⃣ Removing non-demo treatment definitions...');
    const treatmentDefResult = await TreatmentDefinition.deleteMany({ 
      organization: { $ne: demoOrganization._id } 
    });
    console.log(`   ✅ Removed ${treatmentDefResult.deletedCount} non-demo treatment definitions`);
    
    // 7. Remove treatments not associated with demo organization
    console.log('\n7️⃣ Removing non-demo treatments...');
    const treatmentResult = await Treatment.deleteMany({ 
      organization: { $ne: demoOrganization._id } 
    });
    console.log(`   ✅ Removed ${treatmentResult.deletedCount} non-demo treatments`);
    
    // 8. Remove inventory not associated with demo organization
    console.log('\n8️⃣ Removing non-demo inventory...');
    const inventoryResult = await Inventory.deleteMany({ 
      organization: { $ne: demoOrganization._id } 
    });
    console.log(`   ✅ Removed ${inventoryResult.deletedCount} non-demo inventory items`);
    
    // 9. Remove invoices not associated with demo organization
    console.log('\n9️⃣ Removing non-demo invoices...');
    const invoiceResult = await Invoice.deleteMany({ 
      organization: { $ne: demoOrganization._id } 
    });
    console.log(`   ✅ Removed ${invoiceResult.deletedCount} non-demo invoices`);
    
    // 10. Remove appointments not associated with demo organization
    console.log('\n🔟 Removing non-demo appointments...');
    const appointmentResult = await Appointment.deleteMany({ 
      organization: { $ne: demoOrganization._id } 
    });
    console.log(`   ✅ Removed ${appointmentResult.deletedCount} non-demo appointments`);
    
    // 11. Remove patient documents not associated with demo patients
    console.log('\n1️⃣1️⃣ Removing non-demo patient documents...');
    const demoPatients = await Patient.find({ organization: demoOrganization._id });
    const demoPatientIds = demoPatients.map(patient => patient._id);
    
    const documentResult = await PatientDocument.deleteMany({ 
      patient: { $nin: demoPatientIds } 
    });
    console.log(`   ✅ Removed ${documentResult.deletedCount} non-demo patient documents`);
    
    // 12. Remove communications not associated with demo patients
    console.log('\n1️⃣2️⃣ Removing non-demo communications...');
    const communicationResult = await Communication.deleteMany({ 
      patient: { $nin: demoPatientIds } 
    });
    console.log(`   ✅ Removed ${communicationResult.deletedCount} non-demo communications`);
    
    // 13. Remove notifications not associated with demo users
    console.log('\n1️⃣3️⃣ Removing non-demo notifications...');
    const notificationResult = await Notification.deleteMany({ 
      user: { $nin: demoUserIds } 
    });
    console.log(`   ✅ Removed ${notificationResult.deletedCount} non-demo notifications`);
    
    // 14. Remove join requests not associated with demo organization
    console.log('\n1️⃣4️⃣ Removing non-demo join requests...');
    const joinRequestResult = await JoinRequest.deleteMany({ 
      organization: { $ne: demoOrganization._id } 
    });
    console.log(`   ✅ Removed ${joinRequestResult.deletedCount} non-demo join requests`);
    
    // Final verification
    console.log('\n📊 CLEANUP: Final data count verification...');
    
    const finalCounts = {
      organizations: await Organization.countDocuments(),
      users: await User.countDocuments(),
      clinics: await Clinic.countDocuments(),
      patients: await Patient.countDocuments(),
      staff: await Staff.countDocuments(),
      treatmentDefinitions: await TreatmentDefinition.countDocuments(),
      treatments: await Treatment.countDocuments(),
      inventory: await Inventory.countDocuments(),
      invoices: await Invoice.countDocuments(),
      appointments: await Appointment.countDocuments(),
      patientDocuments: await PatientDocument.countDocuments(),
      communications: await Communication.countDocuments(),
      notifications: await Notification.countDocuments(),
      joinRequests: await JoinRequest.countDocuments()
    };
    
    console.log('\n📋 Final Data Counts:');
    Object.entries(finalCounts).forEach(([collection, count]) => {
      console.log(`   ${collection}: ${count}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
    
    console.log('\n🎉 Database cleanup complete!');
    console.log('📝 Only demo data for Smile Care Dental Clinic remains.');
    console.log('\n🔑 Demo credentials:');
    demoUserEmails.forEach(email => {
      console.log(`   ${email} / Demo@2025`);
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
};

// Run the cleanup script
cleanupDemoDataOnly();
