const mongoose = require('mongoose');
require('dotenv').config();

const Organization = require('./models/Organization');
const User = require('./models/User');
const TreatmentDefinition = require('./models/TreatmentDefinition');

const createProductionTreatmentDefinitions = async () => {
  try {
    console.log('🏥 Creating treatment definitions for production database...');
    
    // Connect to DentOS database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DentOS database');
    
    // Get the main organization and admin user
    const organization = await Organization.findOne({ slug: 'smile-care-demo' });
    const adminUser = await User.findOne({ email: 'admin@smilecare.com' });
    
    if (!organization) {
      console.log('❌ Organization not found. Please run the demo organization creation script first.');
      return;
    }
    
    if (!adminUser) {
      console.log('❌ Admin user not found. Please ensure demo data is properly migrated.');
      return;
    }
    
    console.log(`📊 Found organization: ${organization.name}`);
    console.log(`👤 Using admin user: ${adminUser.name}`);
    
    // Clear existing treatment definitions
    await TreatmentDefinition.deleteMany({});
    console.log('🧹 Cleared existing treatment definitions');
    
    // Create treatment definitions
    const treatmentDefinitions = [
      {
        name: 'Dental Cleaning',
        code: 'DC001',
        description: 'Professional dental cleaning and scaling',
        category: 'Preventive',
        duration: 60,
        price: 1500,
        organization: organization._id,
        user: adminUser._id,
        isActive: true
      },
      {
        name: 'Root Canal Treatment',
        code: 'RCT001',
        description: 'Endodontic treatment for infected tooth pulp',
        category: 'Endodontic',
        duration: 120,
        price: 8000,
        organization: organization._id,
        user: adminUser._id,
        isActive: true
      },
      {
        name: 'Dental Implant',
        code: 'DI001',
        description: 'Surgical placement of dental implant',
        category: 'Oral Surgery',
        duration: 180,
        price: 45000,
        organization: organization._id,
        user: adminUser._id,
        isActive: true
      },
      {
        name: 'Teeth Whitening',
        code: 'TW001',
        description: 'Professional teeth whitening treatment',
        category: 'Cosmetic',
        duration: 90,
        price: 5000,
        organization: organization._id,
        user: adminUser._id,
        isActive: true
      },
      {
        name: 'Braces',
        code: 'BR001',
        description: 'Orthodontic treatment with braces',
        category: 'Orthodontic',
        duration: 60,
        price: 25000,
        organization: organization._id,
        user: adminUser._id,
        isActive: true
      },
      {
        name: 'Wisdom Tooth Extraction',
        code: 'WTE001',
        description: 'Surgical removal of wisdom teeth',
        category: 'Oral Surgery',
        duration: 120,
        price: 12000,
        organization: organization._id,
        user: adminUser._id,
        isActive: true
      },
      {
        name: 'Dental Filling',
        code: 'DF001',
        description: 'Restorative filling for cavities',
        category: 'Restorative',
        duration: 45,
        price: 2000,
        organization: organization._id,
        user: adminUser._id,
        isActive: true
      },
      {
        name: 'Crown Placement',
        code: 'CP001',
        description: 'Dental crown for damaged teeth',
        category: 'Prosthodontic',
        duration: 90,
        price: 15000,
        organization: organization._id,
        user: adminUser._id,
        isActive: true
      },
      {
        name: 'Orthodontic Consultation',
        code: 'OC001',
        description: 'Initial consultation for orthodontic treatment',
        category: 'Orthodontic',
        duration: 30,
        price: 1000,
        organization: organization._id,
        user: adminUser._id,
        isActive: true
      },
      {
        name: 'Gum Surgery',
        code: 'GS001',
        description: 'Periodontal surgery for gum disease',
        category: 'Periodontic',
        duration: 150,
        price: 18000,
        organization: organization._id,
        user: adminUser._id,
        isActive: true
      }
    ];
    
    // Insert treatment definitions
    const createdDefinitions = await TreatmentDefinition.insertMany(treatmentDefinitions);
    console.log(`✅ Created ${createdDefinitions.length} treatment definitions`);
    
    // Display created definitions
    console.log('\n📋 Created Treatment Definitions:');
    createdDefinitions.forEach((def, index) => {
      console.log(`${index + 1}. ${def.name} - ₹${def.price} (${def.duration} min)`);
    });
    
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
    console.log('\n🎉 Treatment definitions created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating treatment definitions:', error);
    process.exit(1);
  }
};

// Run the script
createProductionTreatmentDefinitions();
