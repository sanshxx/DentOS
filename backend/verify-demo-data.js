const mongoose = require('mongoose');
require('dotenv').config();

// Import models
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

const verifyDemoData = async () => {
  try {
    console.log('🔍 VERIFY: Verifying final demo data state...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Get the demo organization
    const demoOrg = await Organization.findOne({ slug: 'smile-care-demo' });
    console.log(`\n🏢 Organization: ${demoOrg.name}`);
    
    // Get all demo users
    const demoUsers = await User.find({});
    console.log('\n👥 Demo Users:');
    demoUsers.forEach(user => {
      console.log(`   ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Get all clinics
    const clinics = await Clinic.find({});
    console.log('\n🏥 Clinics:');
    clinics.forEach(clinic => {
      console.log(`   ${clinic.name} - ${clinic.location}`);
    });
    
    // Get all patients
    const patients = await Patient.find({});
    console.log('\n👤 Patients:');
    patients.forEach(patient => {
      console.log(`   ${patient.name} (${patient.email}) - ${patient.phone}`);
    });
    
    // Get all staff
    const staff = await Staff.find({});
    console.log('\n👨‍⚕️ Staff:');
    staff.forEach(member => {
      console.log(`   ${member.name} - ${member.role} - ${member.specialization || 'N/A'}`);
    });
    
    // Get treatment definitions
    const treatments = await TreatmentDefinition.find({});
    console.log('\n🦷 Treatment Definitions:');
    treatments.forEach(treatment => {
      console.log(`   ${treatment.name} - ₹${treatment.price} (${treatment.duration} min)`);
    });
    
    // Get inventory items
    const inventory = await Inventory.find({});
    console.log('\n📦 Inventory Items:');
    inventory.forEach(item => {
      console.log(`   ${item.name} - Stock: ${item.stockQuantity} - ₹${item.price}`);
    });
    
    // Get invoices
    const invoices = await Invoice.find({});
    console.log('\n💰 Invoices:');
    invoices.forEach(invoice => {
      console.log(`   ${invoice.invoiceNumber} - ${invoice.patientName} - ₹${invoice.totalAmount}`);
    });
    
    // Get appointments
    const appointments = await Appointment.find({});
    console.log('\n📅 Appointments:');
    appointments.forEach(appointment => {
      console.log(`   ${appointment.patientName} - ${appointment.treatmentName} - ${appointment.appointmentDate}`);
    });
    
    // Get patient documents
    const documents = await PatientDocument.find({});
    console.log('\n📄 Patient Documents:');
    documents.forEach(doc => {
      console.log(`   ${doc.fileName} - ${doc.fileType} - ${doc.fileSize} bytes`);
    });
    
    // Get notifications
    const notifications = await Notification.find({});
    console.log('\n🔔 Notifications:');
    notifications.forEach(notification => {
      console.log(`   ${notification.title} - ${notification.type} - ${notification.createdAt}`);
    });
    
    // Final counts
    console.log('\n📊 Final Data Summary:');
    console.log(`   Organizations: ${await Organization.countDocuments()}`);
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Clinics: ${await Clinic.countDocuments()}`);
    console.log(`   Patients: ${await Patient.countDocuments()}`);
    console.log(`   Staff: ${await Staff.countDocuments()}`);
    console.log(`   Treatment Definitions: ${await TreatmentDefinition.countDocuments()}`);
    console.log(`   Treatments: ${await Treatment.countDocuments()}`);
    console.log(`   Inventory Items: ${await Inventory.countDocuments()}`);
    console.log(`   Invoices: ${await Invoice.countDocuments()}`);
    console.log(`   Appointments: ${await Appointment.countDocuments()}`);
    console.log(`   Patient Documents: ${await PatientDocument.countDocuments()}`);
    console.log(`   Communications: ${await Communication.countDocuments()}`);
    console.log(`   Notifications: ${await Notification.countDocuments()}`);
    console.log(`   Join Requests: ${await JoinRequest.countDocuments()}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run verification
verifyDemoData();
