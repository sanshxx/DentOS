const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

const createDemoOrganization = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Clean up existing demo organization if it exists
    console.log('\n🧹 Cleaning up existing demo data...');
    const existingOrg = await Organization.findOne({ slug: 'smile-care-demo' });
    if (existingOrg) {
      console.log('Removing existing demo organization and all related data...');
      
      // Delete all related data
      await User.deleteMany({ organization: existingOrg._id });
      await Clinic.deleteMany({ organization: existingOrg._id });
      await Patient.deleteMany({ organization: existingOrg._id });
      await Staff.deleteMany({ organization: existingOrg._id });
      await TreatmentDefinition.deleteMany({ organization: existingOrg._id });
      await Treatment.deleteMany({ organization: existingOrg._id });
      await Inventory.deleteMany({ organization: existingOrg._id });
      await Invoice.deleteMany({ organization: existingOrg._id });
      await Appointment.deleteMany({ organization: existingOrg._id });
      
      // Delete the organization
      await Organization.deleteOne({ _id: existingOrg._id });
      console.log('✅ Existing demo data cleaned up');
    }

    // 2. Create Demo Organization
    console.log('\n🏢 Creating Demo Organization...');
    const organization = await Organization.create({
      name: 'Smile Care Dental Clinic',
      slug: 'smile-care-demo',
      description: 'Premium dental care services with state-of-the-art facilities',
      type: 'dental_clinic',
      contactInfo: {
        email: 'info@smilecare.com',
        phone: '9876543210',
        website: 'https://smilecare.com'
      },
      address: {
        street: '123 Dental Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      businessInfo: {
        registrationNumber: 'REG123456',
        gstNumber: '27ABCDE1234F1Z5',
        panNumber: 'ABCDE1234F'
      },
      settings: {
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        workingHours: {
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' },
          saturday: { start: '09:00', end: '14:00' }
        }
      },
      status: 'active'
    });
    console.log(`✅ Organization created: ${organization.name}`);

    // 3. Create Demo Users with different roles
    console.log('\n👥 Creating Demo Users...');
    const users = [];
    
    const userData = [
      {
        name: 'Dr. Rajesh Kumar',
        email: 'admin@smilecare.com',
        phone: '9876543210',
        password: 'Demo@2025',
        role: 'admin'
      },
      {
        name: 'Priya Sharma',
        email: 'manager@smilecare.com',
        phone: '9876543211',
        password: 'Demo@2025',
        role: 'manager'
      },
      {
        name: 'Dr. Anita Patel',
        email: 'dentist@smilecare.com',
        phone: '9876543212',
        password: 'Demo@2025',
        role: 'dentist'
      },
      {
        name: 'Rohit Gupta',
        email: 'receptionist@smilecare.com',
        phone: '9876543213',
        password: 'Demo@2025',
        role: 'receptionist'
      },
      {
        name: 'Kavya Singh',
        email: 'assistant@smilecare.com',
        phone: '9876543214',
        password: 'Demo@2025',
        role: 'assistant'
      }
    ];

    for (const user of userData) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = await User.create({
        ...user,
        password: hashedPassword,
        organization: organization._id,
        forcePasswordChange: false
      });
      users.push(newUser);
      console.log(`✅ User created: ${user.name} (${user.role})`);
    }

    // 3. Create Demo Clinics
    console.log('\n🏥 Creating Demo Clinics...');
    const clinics = [];
    
    const clinicData = [
      {
        name: 'Smile Care Main Branch',
        branchCode: 'SMC001',
        address: {
          street: '123 Dental Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        contactNumbers: ['02212345678'],
        email: 'main@smilecare.com',
        facilities: ['X-Ray', 'Laser Dentistry', 'Implant Center', 'Root Canal Specialist'],
        numberOfChairs: 8,
        operatingHours: {
          monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          saturday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
          sunday: { isOpen: false, openTime: '10:00', closeTime: '14:00' }
        },
        organization: organization._id,
        createdBy: users[0]._id
      },
      {
        name: 'Smile Care Andheri Branch',
        branchCode: 'SMC002',
        address: {
          street: '456 Health Plaza',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400053',
          country: 'India'
        },
        contactNumbers: ['02287654321'],
        email: 'andheri@smilecare.com',
        facilities: ['Orthodontics', 'Cosmetic Dentistry', 'Pediatric Dentistry'],
        numberOfChairs: 5,
        operatingHours: {
          monday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
          tuesday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
          wednesday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
          thursday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
          friday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
          saturday: { isOpen: true, openTime: '10:00', closeTime: '15:00' },
          sunday: { isOpen: false, openTime: '10:00', closeTime: '14:00' }
        },
        organization: organization._id,
        createdBy: users[0]._id
      }
    ];

    for (const clinic of clinicData) {
      const newClinic = await Clinic.create(clinic);
      clinics.push(newClinic);
      console.log(`✅ Clinic created: ${clinic.name}`);
    }

    // 4. Create Demo Staff
    console.log('\n👨‍⚕️ Creating Demo Staff...');
    const staffData = [
      {
        firstName: 'Dr. Suresh',
        lastName: 'Reddy',
        email: 'suresh.reddy@smilecare.com',
        phone: '9876543215',
        password: 'Staff@2025',
        role: 'dentist',
        specialization: 'Endodontics',
        qualification: 'BDS, MDS Endodontics',
        experience: 8,
        joinDate: new Date('2020-01-15'),
        salary: 75000,
        clinic: clinics[0]._id,
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      },
      {
        firstName: 'Dr. Meera',
        lastName: 'Joshi',
        email: 'meera.joshi@smilecare.com',
        phone: '9876543216',
        password: 'Staff@2025',
        role: 'dentist',
        specialization: 'Orthodontics',
        qualification: 'BDS, MDS Orthodontics',
        experience: 6,
        joinDate: new Date('2021-03-10'),
        salary: 70000,
        clinic: clinics[1]._id,
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      }
    ];

    const staff = [];
    for (const staffMember of staffData) {
      const newStaff = await Staff.create(staffMember);
      staff.push(newStaff);
      console.log(`✅ Staff created: Dr. ${staffMember.firstName} ${staffMember.lastName}`);
    }

    // 5. Create Demo Patients
    console.log('\n🧑‍🦲 Creating Demo Patients...');
    const patients = [];
    
    const patientData = [
      {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@email.com',
        phone: '9876543217',
        gender: 'male',
        dateOfBirth: new Date('1985-06-15'),
        address: {
          street: '789 Patient Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002',
          country: 'India'
        },
        medicalHistory: {
          allergies: ['Penicillin'],
          medications: ['Blood pressure medication'],
          conditions: ['Hypertension']
        },
        emergencyContact: {
          name: 'Sunita Mehta',
          relationship: 'Wife',
          phone: '9876543218'
        },
        registeredClinic: clinics[0]._id,
        patientId: 'SMC001-001',
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      },
      {
        name: 'Sneha Agarwal',
        email: 'sneha.agarwal@email.com',
        phone: '9876543219',
        gender: 'female',
        dateOfBirth: new Date('1992-03-22'),
        address: {
          street: '321 Health Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400003',
          country: 'India'
        },
        medicalHistory: {
          allergies: [],
          medications: [],
          conditions: []
        },
        emergencyContact: {
          name: 'Rajesh Agarwal',
          relationship: 'Father',
          phone: '9876543220'
        },
        registeredClinic: clinics[0]._id,
        patientId: 'SMC001-002',
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@email.com',
        phone: '9876543221',
        gender: 'male',
        dateOfBirth: new Date('1978-11-08'),
        address: {
          street: '654 Wellness Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400004',
          country: 'India'
        },
        medicalHistory: {
          allergies: ['Latex'],
          medications: ['Diabetes medication'],
          conditions: ['Type 2 Diabetes']
        },
        emergencyContact: {
          name: 'Pooja Singh',
          relationship: 'Wife',
          phone: '9876543222'
        },
        registeredClinic: clinics[1]._id,
        patientId: 'SMC002-001',
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      }
    ];

    for (const patient of patientData) {
      const newPatient = await Patient.create(patient);
      patients.push(newPatient);
      console.log(`✅ Patient created: ${patient.name}`);
    }

    // 6. Create Demo Treatment Definitions
    console.log('\n🦷 Creating Demo Treatment Definitions...');
    const treatmentDefinitions = [];
    
    const treatmentDefData = [
      {
        name: 'Dental Cleaning',
        code: 'CLN001',
        category: 'Preventive',
        description: 'Professional teeth cleaning and polishing',
        price: 1500,
        duration: 30,
        requiredEquipment: ['Ultrasonic scaler', 'Polishing paste'],
        notes: 'Recommended every 6 months',
        user: users[0]._id,
        organization: organization._id,
        createdBy: users[0]._id
      },
      {
        name: 'Root Canal Treatment',
        code: 'RCT001',
        category: 'Endodontic',
        description: 'Single sitting root canal treatment',
        price: 8000,
        duration: 90,
        requiredEquipment: ['Rotary files', 'Apex locator', 'Obturation system'],
        notes: 'May require multiple sittings for complex cases',
        user: users[0]._id,
        organization: organization._id,
        createdBy: users[0]._id
      },
      {
        name: 'Dental Implant',
        code: 'IMP001',
        category: 'Oral Surgery',
        description: 'Single tooth implant placement',
        price: 25000,
        duration: 120,
        requiredEquipment: ['Implant kit', 'Surgical instruments', 'X-ray'],
        notes: 'Requires healing period of 3-6 months',
        user: users[2]._id,
        organization: organization._id,
        createdBy: users[0]._id
      },
      {
        name: 'Teeth Whitening',
        code: 'WHT001',
        category: 'Cosmetic',
        description: 'Professional teeth whitening treatment',
        price: 5000,
        duration: 60,
        requiredEquipment: ['Whitening gel', 'LED light', 'Mouth guard'],
        notes: 'Results may vary based on initial tooth color',
        user: users[2]._id,
        organization: organization._id,
        createdBy: users[0]._id
      },
      {
        name: 'Orthodontic Consultation',
        code: 'ORT001',
        category: 'Orthodontic',
        description: 'Initial orthodontic evaluation and treatment planning',
        price: 2000,
        duration: 45,
        requiredEquipment: ['Cephalometric X-ray', 'Study models'],
        notes: 'Includes treatment plan and cost estimate',
        user: users[2]._id,
        organization: organization._id,
        createdBy: users[0]._id
      }
    ];

    for (const treatmentDef of treatmentDefData) {
      const newTreatmentDef = await TreatmentDefinition.create(treatmentDef);
      treatmentDefinitions.push(newTreatmentDef);
      console.log(`✅ Treatment Definition created: ${treatmentDef.name}`);
    }

    // 7. Create Demo Inventory
    console.log('\n📦 Creating Demo Inventory...');
    const inventoryData = [
      {
        itemName: 'Dental Composite Resin',
        itemCode: 'COMP001',
        category: 'Consumables',
        description: 'Light-cured composite resin for fillings',
        clinics: [
          {
            clinic: clinics[0]._id,
            totalStock: 25,
            minStockLevel: 5,
            maxStockLevel: 50
          },
          {
            clinic: clinics[1]._id,
            totalStock: 15,
            minStockLevel: 3,
            maxStockLevel: 30
          }
        ],
        unit: 'Piece',
        costPrice: 800,
        unitPrice: 1200,
        supplier: 'Dental Supply Co.',
        expiryDate: new Date('2025-12-31'),
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      },
      {
        itemName: 'Surgical Gloves',
        itemCode: 'GLV001',
        category: 'Consumables',
        description: 'Sterile surgical gloves - Size M',
        clinics: [
          {
            clinic: clinics[0]._id,
            totalStock: 500,
            minStockLevel: 50,
            maxStockLevel: 1000
          }
        ],
        unit: 'Box',
        costPrice: 10,
        unitPrice: 15,
        supplier: 'Medical Equipment Ltd.',
        expiryDate: new Date('2026-06-30'),
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      },
      {
        itemName: 'Dental Drill Bits',
        itemCode: 'DRL001',
        category: 'Instruments',
        description: 'High-speed dental drill bits set',
        clinics: [
          {
            clinic: clinics[0]._id,
            totalStock: 12,
            minStockLevel: 2,
            maxStockLevel: 20
          }
        ],
        unit: 'Set',
        costPrice: 600,
        unitPrice: 800,
        supplier: 'Precision Tools Inc.',
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      },
      {
        itemName: 'Digital X-Ray Sensor',
        itemCode: 'XRY001',
        category: 'Equipment',
        description: 'Digital intraoral X-ray sensor',
        clinics: [
          {
            clinic: clinics[0]._id,
            totalStock: 2,
            minStockLevel: 1,
            maxStockLevel: 3
          }
        ],
        unit: 'Piece',
        costPrice: 120000,
        unitPrice: 150000,
        supplier: 'Imaging Solutions Ltd.',
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      }
    ];

    for (const item of inventoryData) {
      const newItem = await Inventory.create(item);
      console.log(`✅ Inventory item created: ${item.itemName}`);
    }

    // 8. Create Demo Appointments
    console.log('\n📅 Creating Demo Appointments...');
    const appointments = [];
    
    const appointmentData = [
      {
        patient: patients[0]._id,
        clinic: clinics[0]._id,
        dentist: staff[0]._id,
        appointmentDate: new Date('2025-01-10T10:00:00Z'),
        appointmentType: 'New Consultation',
        duration: 30,
        status: 'scheduled',
        notes: 'Regular checkup appointment',
        reasonForVisit: 'Regular dental checkup',
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      },
      {
        patient: patients[1]._id,
        clinic: clinics[0]._id,
        dentist: staff[0]._id,
        appointmentDate: new Date('2025-01-11T14:00:00Z'),
        appointmentType: 'Cleaning',
        duration: 60,
        status: 'scheduled',
        notes: 'Dental cleaning appointment',
        reasonForVisit: 'Professional teeth cleaning',
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      },
      {
        patient: patients[2]._id,
        clinic: clinics[1]._id,
        dentist: staff[1]._id,
        appointmentDate: new Date('2025-01-12T11:00:00Z'),
        appointmentType: 'Follow-up',
        duration: 30,
        status: 'scheduled',
        notes: 'Post-treatment follow-up',
        reasonForVisit: 'Follow-up after orthodontic consultation',
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      },
      // Past appointments for demo data
      {
        patient: patients[0]._id,
        clinic: clinics[0]._id,
        dentist: staff[0]._id,
        appointmentDate: new Date('2024-12-15T10:00:00Z'),
        appointmentType: 'Root Canal',
        duration: 90,
        status: 'completed',
        notes: 'Root canal treatment completed',
        reasonForVisit: 'Severe tooth pain and infection',
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      },
      {
        patient: patients[1]._id,
        clinic: clinics[0]._id,
        dentist: staff[0]._id,
        appointmentDate: new Date('2024-12-20T15:00:00Z'),
        appointmentType: 'Other',
        duration: 60,
        status: 'completed',
        notes: 'Teeth whitening completed',
        reasonForVisit: 'Cosmetic teeth whitening procedure',
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      }
    ];

    for (const appointment of appointmentData) {
      const newAppointment = await Appointment.create(appointment);
      appointments.push(newAppointment);
      console.log(`✅ Appointment created for ${appointment.appointmentType}`);
    }

    // 9. Create Demo Treatments
    console.log('\n🩺 Creating Demo Treatments...');
    const treatments = [];
    
    const treatmentData = [
      {
        patient: patients[0]._id,
        clinic: clinics[0]._id,
        treatmentPlanId: 'TP001',
        diagnosis: 'Dental caries in upper right molar',
        chiefComplaint: 'Tooth pain while eating',
        treatmentPlan: [
          {
            procedure: treatmentDefinitions[1]._id, // Root Canal
            tooth: '16',
            cost: 8000,
            status: 'completed',
            completedDate: new Date('2024-12-15')
          }
        ],
        totalCost: 8000,
        finalAmount: 8000,
        status: 'completed',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-15'),
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      },
      {
        patient: patients[1]._id,
        clinic: clinics[0]._id,
        treatmentPlanId: 'TP002',
        diagnosis: 'Tooth discoloration',
        chiefComplaint: 'Wants whiter teeth',
        treatmentPlan: [
          {
            procedure: treatmentDefinitions[3]._id, // Teeth Whitening
            tooth: 'All',
            cost: 5000,
            status: 'completed',
            completedDate: new Date('2024-12-20')
          }
        ],
        totalCost: 5000,
        finalAmount: 5000,
        status: 'completed',
        startDate: new Date('2024-12-20'),
        endDate: new Date('2024-12-20'),
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      },
      {
        patient: patients[2]._id,
        clinic: clinics[1]._id,
        treatmentPlanId: 'TP003',
        diagnosis: 'Orthodontic evaluation required',
        chiefComplaint: 'Crooked teeth alignment',
        treatmentPlan: [
          {
            procedure: treatmentDefinitions[4]._id, // Orthodontic Consultation
            tooth: 'All',
            cost: 2000,
            status: 'active'
          }
        ],
        totalCost: 2000,
        finalAmount: 2000,
        status: 'active',
        startDate: new Date('2024-12-25'),
        organization: organization._id,
        createdBy: users[0]._id,
        createdBy: users[0]._id
      }
    ];

    for (const treatment of treatmentData) {
      const newTreatment = await Treatment.create(treatment);
      treatments.push(newTreatment);
      console.log(`✅ Treatment created: ${treatment.treatmentPlanId}`);
    }

    // 10. Create Demo Invoices
    console.log('\n🧾 Creating Demo Invoices...');
    const invoiceData = [
      {
        patient: patients[0]._id,
        clinic: clinics[0]._id,
        invoiceDate: new Date('2024-12-15'),
        dueDate: new Date('2024-12-30'),
        items: [
          {
            description: 'Root Canal Treatment',
            quantity: 1,
            unitPrice: 8000,
            amount: 8000
          }
        ],
        subtotal: 8000,
        taxAmount: 1440, // 18% GST
        totalAmount: 9440,
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        gstDetails: {
          isGstInvoice: true,
          gstNumber: 'GST123456789',
          cgst: 9,
          sgst: 9,
          igst: 0,
          hsnCode: '998313'
        },
        organization: organization._id,
        createdBy: users[0]._id
      },
      {
        patient: patients[1]._id,
        clinic: clinics[0]._id,
        invoiceDate: new Date('2024-12-20'),
        dueDate: new Date('2025-01-05'),
        items: [
          {
            description: 'Teeth Whitening Treatment',
            quantity: 1,
            unitPrice: 5000,
            amount: 5000
          }
        ],
        subtotal: 5000,
        taxAmount: 900, // 18% GST
        totalAmount: 5900,
        paymentStatus: 'paid',
        paymentMethod: 'card',
        gstDetails: {
          isGstInvoice: true,
          gstNumber: 'GST123456789',
          cgst: 9,
          sgst: 9,
          igst: 0,
          hsnCode: '998313'
        },
        organization: organization._id,
        createdBy: users[0]._id
      },
      {
        patient: patients[2]._id,
        clinic: clinics[1]._id,
        invoiceDate: new Date('2024-12-25'),
        dueDate: new Date('2025-01-10'),
        items: [
          {
            description: 'Orthodontic Consultation',
            quantity: 1,
            unitPrice: 2000,
            amount: 2000
          }
        ],
        subtotal: 2000,
        taxAmount: 360, // 18% GST
        totalAmount: 2360,
        paymentStatus: 'unpaid',
        paymentMethod: null,
        gstDetails: {
          isGstInvoice: true,
          gstNumber: 'GST123456789',
          cgst: 9,
          sgst: 9,
          igst: 0,
          hsnCode: '998313'
        },
        organization: organization._id,
        createdBy: users[0]._id
      }
    ];

    for (const invoice of invoiceData) {
      const newInvoice = await Invoice.create(invoice);
      console.log(`✅ Invoice created: ${newInvoice.invoiceNumber}`);
    }

    console.log('\n🎉 Demo organization setup completed successfully!');
    console.log('\n📋 DEMO CREDENTIALS:');
    console.log('==========================================');
    console.log('Organization: Smile Care Dental Clinic');
    console.log('');
    console.log('👤 ADMIN ACCESS:');
    console.log('Email: admin@smilecare.com');
    console.log('Password: Demo@2025');
    console.log('');
    console.log('👤 MANAGER ACCESS:');
    console.log('Email: manager@smilecare.com');
    console.log('Password: Demo@2025');
    console.log('');
    console.log('👤 DENTIST ACCESS:');
    console.log('Email: dentist@smilecare.com');
    console.log('Password: Demo@2025');
    console.log('');
    console.log('👤 RECEPTIONIST ACCESS:');
    console.log('Email: receptionist@smilecare.com');
    console.log('Password: Demo@2025');
    console.log('');
    console.log('👤 ASSISTANT ACCESS:');
    console.log('Email: assistant@smilecare.com');
    console.log('Password: Demo@2025');
    console.log('==========================================');
    console.log('\n📊 DEMO DATA CREATED:');
    console.log('• 1 Organization');
    console.log('• 5 Users (all RBAC roles)');
    console.log('• 2 Clinics');
    console.log('• 2 Staff members');
    console.log('• 3 Patients');
    console.log('• 5 Treatment definitions');
    console.log('• 3 Treatments');
    console.log('• 4 Inventory items');
    console.log('• 5 Appointments');
    console.log('• 3 Invoices');
    console.log('==========================================');

    process.exit(0);
  } catch (error) {
    console.error('Error creating demo organization:', error);
    process.exit(1);
  }
};

createDemoOrganization();