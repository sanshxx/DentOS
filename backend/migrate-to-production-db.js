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

const migrateToProductionDB = async () => {
  try {
    console.log('🚀 Starting migration from test database to DentOS database...');
    
    // Connect to test database (current)
    const testUri = process.env.MONGODB_URI.replace('/DentOS?', '/test?');
    console.log('📊 Connecting to test database...');
    await mongoose.connect(testUri);
    console.log('✅ Connected to test database');
    
    // Extract data from test database
    console.log('\n📥 Extracting data from test database...');
    
    const organizations = await Organization.find({});
    const users = await User.find({});
    const clinics = await Clinic.find({});
    const patients = await Patient.find({});
    const staff = await Staff.find({});
    const treatmentDefinitions = await TreatmentDefinition.find({});
    const treatments = await Treatment.find({});
    const inventory = await Inventory.find({});
    const invoices = await Invoice.find({});
    const appointments = await Appointment.find({});
    const patientDocuments = await PatientDocument.find({});
    const communications = await Communication.find({});
    const notifications = await Notification.find({});
    const joinRequests = await JoinRequest.find({});
    
    console.log(`📊 Data extracted:`);
    console.log(`   Organizations: ${organizations.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Clinics: ${clinics.length}`);
    console.log(`   Patients: ${patients.length}`);
    console.log(`   Staff: ${staff.length}`);
    console.log(`   Treatment Definitions: ${treatmentDefinitions.length}`);
    console.log(`   Treatments: ${treatments.length}`);
    console.log(`   Inventory: ${inventory.length}`);
    console.log(`   Invoices: ${invoices.length}`);
    console.log(`   Appointments: ${appointments.length}`);
    console.log(`   Patient Documents: ${patientDocuments.length}`);
    console.log(`   Communications: ${communications.length}`);
    console.log(`   Notifications: ${notifications.length}`);
    console.log(`   Join Requests: ${joinRequests.length}`);
    
    // Disconnect from test database
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from test database');
    
    // Connect to DentOS database (production)
    const productionUri = process.env.MONGODB_URI.replace('/test?', '/DentOS?');
    console.log('📊 Connecting to DentOS database...');
    await mongoose.connect(productionUri);
    console.log('✅ Connected to DentOS database');
    
    // Clear existing data in DentOS database (if any)
    console.log('\n🧹 Clearing existing data in DentOS database...');
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Clinic.deleteMany({});
    await Patient.deleteMany({});
    await Staff.deleteMany({});
    await TreatmentDefinition.deleteMany({});
    await Treatment.deleteMany({});
    await Inventory.deleteMany({});
    await Invoice.deleteMany({});
    await Appointment.deleteMany({});
    await PatientDocument.deleteMany({});
    await Communication.deleteMany({});
    await Notification.deleteMany({});
    await JoinRequest.deleteMany({});
    console.log('✅ Cleared existing data');
    
    // Insert data into DentOS database
    console.log('\n📤 Inserting data into DentOS database...');
    
    if (organizations.length > 0) {
      await Organization.insertMany(organizations);
      console.log(`✅ Inserted ${organizations.length} organizations`);
    }
    
    if (users.length > 0) {
      await User.insertMany(users);
      console.log(`✅ Inserted ${users.length} users`);
    }
    
    if (clinics.length > 0) {
      await Clinic.insertMany(clinics);
      console.log(`✅ Inserted ${clinics.length} clinics`);
    }
    
    if (patients.length > 0) {
      await Patient.insertMany(patients);
      console.log(`✅ Inserted ${patients.length} patients`);
    }
    
    if (staff.length > 0) {
      await Staff.insertMany(staff);
      console.log(`✅ Inserted ${staff.length} staff members`);
    }
    
    if (treatmentDefinitions.length > 0) {
      // Handle TreatmentDefinition validation by inserting one by one
      let insertedCount = 0;
      for (const treatmentDef of treatmentDefinitions) {
        try {
          await TreatmentDefinition.create(treatmentDef);
          insertedCount++;
        } catch (error) {
          console.log(`⚠️  Skipped treatment definition: ${treatmentDef.name || treatmentDef._id} - ${error.message}`);
        }
      }
      console.log(`✅ Inserted ${insertedCount} treatment definitions`);
    }
    
    if (treatments.length > 0) {
      await Treatment.insertMany(treatments);
      console.log(`✅ Inserted ${treatments.length} treatments`);
    }
    
    if (inventory.length > 0) {
      await Inventory.insertMany(inventory);
      console.log(`✅ Inserted ${inventory.length} inventory items`);
    }
    
    if (invoices.length > 0) {
      await Invoice.insertMany(invoices);
      console.log(`✅ Inserted ${invoices.length} invoices`);
    }
    
    if (appointments.length > 0) {
      await Appointment.insertMany(appointments);
      console.log(`✅ Inserted ${appointments.length} appointments`);
    }
    
    if (patientDocuments.length > 0) {
      await PatientDocument.insertMany(patientDocuments);
      console.log(`✅ Inserted ${patientDocuments.length} patient documents`);
    }
    
    if (communications.length > 0) {
      await Communication.insertMany(communications);
      console.log(`✅ Inserted ${communications.length} communications`);
    }
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`✅ Inserted ${notifications.length} notifications`);
    }
    
    if (joinRequests.length > 0) {
      await JoinRequest.insertMany(joinRequests);
      console.log(`✅ Inserted ${joinRequests.length} join requests`);
    }
    
    // Disconnect from DentOS database
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from DentOS database');
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📊 Your data has been moved from test database to DentOS database');
    console.log('\n📝 Next steps:');
    console.log('1. Test the application with the new database');
    console.log('2. Verify all features work correctly');
    console.log('3. Deploy to production');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateToProductionDB();
