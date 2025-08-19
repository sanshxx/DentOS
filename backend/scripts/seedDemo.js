/*
 Seed Smile Care demo organization with rich, varied data.
 Usage: MONGODB_URI must be set in backend/.env or environment.
 Run: npm run seed:demo
*/

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

// Models
const Organization = require('../models/Organization');
const Clinic = require('../models/Clinic');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');
const TreatmentDefinition = require('../models/TreatmentDefinition');
const Appointment = require('../models/Appointment');
const Drug = require('../models/Drug');
const Prescription = require('../models/Prescription');
const Invoice = require('../models/Invoice');
const Inventory = require('../models/Inventory');

// Helpers
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const maybe = (prob = 0.5) => Math.random() < prob;

const femaleNames = ['Sneha', 'Aisha', 'Priya', 'Zara', 'Ananya', 'Kavya', 'Meera', 'Rhea', 'Isha', 'Aarohi'];
const maleNames = ['Arjun', 'Rahul', 'Aman', 'Vikram', 'Sahil', 'Rohan', 'Neel', 'Aditya', 'Kabir', 'Ishaan'];
const surnames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kapoor', 'Khan', 'Mehta', 'Bose', 'Nair', 'Reddy'];
const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Maharashtra', 'Telangana'];
const procedures = [
  ['Tooth Extraction', 'Oral Surgery', 2500, 30],
  ['Root Canal Treatment', 'Endodontic', 6500, 60],
  ['Dental Filling', 'Restorative', 1500, 30],
  ['Teeth Cleaning', 'Preventive', 1200, 30],
  ['Crown Placement', 'Prosthodontic', 9000, 90],
  ['Implant Placement', 'Oral Surgery', 35000, 120],
  ['Braces Adjustment', 'Orthodontic', 2000, 30],
  ['Teeth Whitening', 'Cosmetic', 8000, 60],
  ['Gum Treatment', 'Periodontic', 4000, 45],
  ['Pediatric Checkup', 'Pediatric', 1000, 20],
  ['OPG X-Ray', 'Diagnostic', 800, 15],
  ['Night Guard', 'Preventive', 3000, 30],
  ['Scaling and Polishing', 'Preventive', 1500, 30],
  ['Retainer Check', 'Orthodontic', 1200, 20],
  ['Temporary Filling', 'Restorative', 800, 20],
  ['Veneer Placement', 'Cosmetic', 12000, 90],
  ['Bridge Work', 'Prosthodontic', 18000, 120],
  ['Sinus Lift', 'Oral Surgery', 20000, 120],
  ['Apicoectomy', 'Endodontic', 14000, 90],
  ['Inlay/Onlay', 'Restorative', 7000, 60]
];

const drugCatalog = [
  ['Amoxicillin', '500mg', 'tablet', 'antibiotic'],
  ['Ibuprofen', '400mg', 'tablet', 'analgesic'],
  ['Paracetamol', '650mg', 'tablet', 'analgesic'],
  ['Metronidazole', '400mg', 'tablet', 'antibiotic'],
  ['Clofenac', '50mg', 'tablet', 'anti-inflammatory'],
  ['Azithromycin', '500mg', 'tablet', 'antibiotic'],
  ['Pantoprazole', '40mg', 'tablet', 'antiulcer'],
  ['Chlorhexidine', '0.2%', 'liquid', 'antiseptic'],
  ['Lidocaine', '2%', 'injection', 'anesthetic'],
  ['Nystatin', '100000 IU', 'suspension', 'antifungal'],
  ['Cetirizine', '10mg', 'tablet', 'antihistamine'],
  ['Dentinox', '10ml', 'drops', 'herbal'],
  ['Hydrogen Peroxide', '3%', 'liquid', 'antiseptic'],
  ['Hexidine', '0.2%', 'liquid', 'antiseptic'],
  ['Amoxiclav', '625mg', 'tablet', 'antibiotic'],
  ['Mefenamic Acid', '500mg', 'tablet', 'analgesic'],
  ['Benzocaine', '20%', 'gel', 'anesthetic'],
  ['Diclofenac', '75mg', 'injection', 'anti-inflammatory'],
  ['Vitamin C', '500mg', 'tablet', 'vitamin'],
  ['Calcium', '500mg', 'tablet', 'mineral']
];

const inventoryItems = [
  // Consumables
  ['Dental Floss', 'Consumables', 'Piece', 50, 80, 'Johnson & Johnson', 'Dental Supplies Co.'],
  ['Cotton Rolls', 'Consumables', 'Pack', 120, 180, 'Dentsply', 'Dental Supplies Co.'],
  ['Gauze Pads', 'Consumables', 'Pack', 100, 150, '3M', 'Dental Supplies Co.'],
  ['Rubber Dam', 'Consumables', 'Piece', 25, 40, 'Coltene', 'Dental Supplies Co.'],
  ['Articulating Paper', 'Consumables', 'Pack', 200, 300, 'Bausch', 'Dental Supplies Co.'],
  
  // Instruments
  ['Scaler', 'Instruments', 'Set', 2500, 3500, 'Hu-Friedy', 'Dental Instruments Ltd.'],
  ['Mirror', 'Instruments', 'Piece', 800, 1200, 'Hu-Friedy', 'Dental Instruments Ltd.'],
  ['Explorer', 'Instruments', 'Piece', 600, 900, 'Hu-Friedy', 'Dental Instruments Ltd.'],
  ['Forceps', 'Instruments', 'Set', 1800, 2500, 'Hu-Friedy', 'Dental Instruments Ltd.'],
  ['Curette', 'Instruments', 'Piece', 1200, 1800, 'Hu-Friedy', 'Dental Instruments Ltd.'],
  
  // Equipment
  ['Dental Chair', 'Equipment', 'Piece', 150000, 200000, 'A-Dec', 'Dental Equipment Co.'],
  ['X-Ray Machine', 'Equipment', 'Piece', 800000, 1000000, 'Sirona', 'Dental Equipment Co.'],
  ['Autoclave', 'Equipment', 'Piece', 120000, 150000, 'Tuttnauer', 'Dental Equipment Co.'],
  ['Compressor', 'Equipment', 'Piece', 45000, 60000, 'Kaeser', 'Dental Equipment Co.'],
  ['Suction Unit', 'Equipment', 'Piece', 35000, 45000, 'Dentsply', 'Dental Equipment Co.'],
  
  // Medicines
  ['Lidocaine Gel', 'Medicines', 'Tube', 150, 250, 'Sun Pharma', 'Pharma Distributors'],
  ['Chlorhexidine Mouthwash', 'Medicines', 'Bottle', 200, 350, 'Colgate', 'Pharma Distributors'],
  ['Dental Cement', 'Medicines', 'Kit', 800, 1200, '3M', 'Pharma Distributors'],
  ['Bleaching Gel', 'Medicines', 'Syringe', 1200, 1800, 'Philips', 'Pharma Distributors'],
  ['Filling Material', 'Medicines', 'Pack', 600, 900, 'Dentsply', 'Pharma Distributors'],
  
  // Implants
  ['Dental Implant', 'Implants', 'Piece', 8000, 12000, 'Nobel Biocare', 'Implant Solutions'],
  ['Abutment', 'Implants', 'Piece', 3000, 4500, 'Nobel Biocare', 'Implant Solutions'],
  ['Healing Cap', 'Implants', 'Piece', 500, 800, 'Nobel Biocare', 'Implant Solutions'],
  
  // Orthodontic Supplies
  ['Braces Bracket', 'Orthodontic Supplies', 'Set', 2500, 3500, '3M', 'Orthodontic Supplies'],
  ['Arch Wire', 'Orthodontic Supplies', 'Piece', 800, 1200, '3M', 'Orthodontic Supplies'],
  ['Elastic Bands', 'Orthodontic Supplies', 'Pack', 300, 450, '3M', 'Orthodontic Supplies'],
  ['Retainer Wire', 'Orthodontic Supplies', 'Piece', 1200, 1800, '3M', 'Orthodontic Supplies'],
  
  // Office Supplies
  ['Patient Forms', 'Office Supplies', 'Pack', 100, 150, 'Local Printers', 'Office Supplies Co.'],
  ['Appointment Cards', 'Office Supplies', 'Pack', 500, 750, 'Local Printers', 'Office Supplies Co.'],
  ['Pen', 'Office Supplies', 'Piece', 15, 25, 'Pilot', 'Office Supplies Co.'],
  ['Notebook', 'Office Supplies', 'Piece', 80, 120, 'Classmate', 'Office Supplies Co.']
];

async function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dentos';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function findOrCreateOrganization() {
  let org = await Organization.findOne({ slug: 'smile-care' });
  if (!org) {
    org = await Organization.create({
      name: 'Smile Care Dental Clinic',
      slug: 'smile-care',
      description: 'Demo organization for DentOS',
      contactInfo: { email: 'contact@smilecare.com', phone: '9123456789', website: 'https://smilecare.example.com' },
      address: { street: '123 Dental Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
      settings: { timezone: 'Asia/Kolkata', currency: 'INR' }
    });
  }
  return org;
}

async function upsertUsers(org) {
  // Ensure demo users exist (by README credentials)
  const baseUsers = [
    ['Admin', 'admin@smilecare.com', 'admin'],
    ['Manager', 'manager@smilecare.com', 'manager'],
    ['Dentist', 'dentist@smilecare.com', 'dentist'],
    ['Receptionist', 'receptionist@smilecare.com', 'receptionist'],
    ['Assistant', 'assistant@smilecare.com', 'assistant']
  ];
  let created = [];
  for (const [name, email, role] of baseUsers) {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ 
        name: `Dr. ${name}`, 
        email, 
        role, 
        password: 'Demo@2025', 
        organization: org._id 
      });
    } else if (!user.organization || user.organization.toString() !== org._id.toString()) {
      // Update existing user to link to this organization
      user.organization = org._id;
      await user.save();
    }
    created.push(user);
  }
  return created;
}

async function upsertClinics(org) {
  const targets = 5;
  const existing = await Clinic.find({ organization: org._id });
  const toCreate = Math.max(0, targets - existing.length);
  const clinics = [...existing];
  for (let i = 0; i < toCreate; i++) {
    const idx = existing.length + i + 1;
    const city = randomChoice(cities);
    const state = states[cities.indexOf(city)] || 'Maharashtra';
    const clinic = await Clinic.create({
      organization: org._id,
      name: `Smile Care ${idx}`,
      branchCode: `SC-${String(idx).padStart(2, '0')}`,
      address: { street: `${100 + idx} Dental Street`, city, state, pincode: String(400000 + idx), country: 'India' },
      contactNumbers: [`91${randomInt(1000000000, 9999999999)}`.slice(0, 10)],
      email: `branch${idx}@smilecare.com`,
      numberOfChairs: randomInt(2, 6),
      isHeadOffice: idx === 1
    });
    clinics.push(clinic);
  }
  return clinics;
}

async function upsertStaff(org, clinics, createdBy) {
  const targets = 9; // 8-10
  const current = await Staff.countDocuments({ organization: org._id });
  const toCreate = Math.max(0, targets - current);
  const staff = await Staff.find({ organization: org._id });
  for (let i = 0; i < toCreate; i++) {
    const isDentist = i < 5; // ensure dentists for appointments
    const first = isDentist ? randomChoice([...maleNames, ...femaleNames]) : randomChoice(['Ravi', 'Pooja', 'Aarti', 'Mahesh']);
    const last = randomChoice(surnames);
    const role = isDentist ? 'dentist' : randomChoice(['receptionist', 'nurse', 'technician', 'manager']);
    const clinic = randomChoice(clinics);
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${randomInt(10,99)}@smilecare.com`;
    const s = await Staff.create({
      organization: org._id,
      firstName: first,
      lastName: last,
      email,
      phone: String(randomInt(6000000000, 9999999999)),
      role,
      specialization: isDentist ? randomChoice(['General Dentistry', 'Endodontics', 'Orthodontics', 'Prosthodontics']) : undefined,
      primaryClinic: clinic._id,
      clinics: [clinic._id],
      password: 'Demo@2025',
      createdBy: createdBy._id
    });
    staff.push(s);
  }
  return staff;
}

async function upsertTreatmentDefinitions(org, createdBy) {
  const targets = 20;
  const existing = await TreatmentDefinition.find({ organization: org._id });
  const toCreate = Math.max(0, targets - existing.length);
  const defs = [...existing];
  for (let i = 0; i < toCreate; i++) {
    const [name, category, price, duration] = procedures[i % procedures.length];
    const code = `${name.split(' ').map(s=>s[0]).join('').toUpperCase()}-${String(i+1).padStart(3,'0')}`;
    const d = await TreatmentDefinition.create({
      name,
      code,
      category,
      description: `${name} procedure`,
      price,
      duration,
      requiredEquipment: maybe(0.4) ? ['Suction', 'Scaler'] : [],
      notes: maybe(0.3) ? 'Special care needed' : '',
      user: createdBy._id,
      organization: org._id
    });
    defs.push(d);
  }
  return defs;
}

async function upsertDrugs(org, createdBy) {
  const targets = 20;
  const existing = await Drug.find({ organization: org._id });
  const toCreate = Math.max(0, targets - existing.length);
  const drugs = [...existing];
  for (let i = 0; i < toCreate; i++) {
    const [name, strength, form, category] = drugCatalog[i % drugCatalog.length];
    const d = await Drug.create({
      organization: org._id,
      name,
      strength,
      form,
      category,
      description: maybe(0.5) ? `${name} ${strength} for dental use.` : undefined,
      createdBy: createdBy._id
    });
    drugs.push(d);
  }
  return drugs;
}

async function upsertInventory(org, clinics, createdBy) {
  const targets = 30;
  const existing = await Inventory.countDocuments({ organization: org._id });
  const toCreate = Math.max(0, targets - existing);
  const inventory = await Inventory.find({ organization: org._id });
  
  console.log(`Creating ${toCreate} inventory items (existing: ${existing}, target: ${targets})...`);
  
  for (let i = 0; i < toCreate; i++) {
    try {
      const [name, category, unit, costPrice, sellingPrice, manufacturer, supplierName] = inventoryItems[i % inventoryItems.length];
      const itemCode = `${name.split(' ').map(s => s[0]).join('').toUpperCase()}-${String(i + 1).padStart(3, '0')}`;
      
      console.log(`Creating inventory item ${i + 1}: ${name} (${category})`);
      
      // Create clinic-specific stock entries
      const clinicStock = clinics.map(clinic => ({
        clinic: clinic._id,
        currentStock: randomInt(5, 100),
        minStockLevel: randomInt(3, 15),
        location: randomChoice(['Main Storage', 'Clinic A', 'Clinic B', 'Storage Room', 'Cabinet 1'])
      }));
      
      const expiryDate = maybe(0.3) ? new Date(Date.now() + randomInt(30, 365) * 24 * 60 * 60 * 1000) : undefined;
      const purchaseDate = new Date(Date.now() - randomInt(0, 180) * 24 * 60 * 60 * 1000);
      
      const inv = await Inventory.create({
        organization: org._id,
        itemName: name,
        itemCode,
        category,
        description: maybe(0.5) ? `${name} for dental use` : undefined,
        unit,
        clinics: clinicStock,
        manufacturer,
        supplier: {
          name: supplierName,
          contactPerson: randomChoice(['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Neha Singh']),
          phone: String(randomInt(6000000000, 9999999999)),
          email: `${supplierName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          address: `${randomInt(1, 100)} Supplier Street, ${randomChoice(cities)}, ${randomChoice(states)}`
        },
        costPrice,
        sellingPrice,
        expiryDate,
        batchNumber: maybe(0.4) ? `BATCH-${randomInt(1000, 9999)}` : undefined,
        purchaseDate,
        status: randomChoice(['active', 'active', 'active', 'low stock', 'out of stock']),
        notes: maybe(0.3) ? 'Regular stock item' : undefined,
        createdBy: createdBy._id
      });
      inventory.push(inv);
      console.log(`Successfully created: ${name}`);
    } catch (error) {
      console.error(`Error creating inventory item ${i + 1}:`, error.message);
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          console.error(`  ${key}:`, error.errors[key].message);
        });
      }
    }
  }
  return inventory;
}

function randomDOB() {
  const start = new Date(1960, 0, 1).getTime();
  const end = new Date(2012, 0, 1).getTime();
  return new Date(randomInt(start, end));
}

async function ensurePatients(org, clinics, createdBy) {
  const targets = 30;
  const patients = await Patient.find({ organization: org._id });
  const toCreate = Math.max(0, targets - patients.length);
  for (let i = 0; i < toCreate; i++) {
    const isMale = maybe();
    const name = `${randomChoice(isMale ? maleNames : femaleNames)} ${randomChoice(surnames)}`;
    const phone = String(randomInt(6000000000, 9999999999));
    const clinic = randomChoice(clinics);
    await Patient.create({
      organization: org._id,
      name,
      email: maybe(0.6) ? `${name.toLowerCase().replace(/\s+/g,'')}@example.com` : undefined,
      phone,
      gender: isMale ? 'male' : 'female',
      dateOfBirth: randomDOB(),
      address: {
        street: `${randomInt(1, 300)} MG Road`,
        city: clinic.address.city,
        state: clinic.address.state,
        pincode: clinic.address.pincode,
        country: 'India'
      },
      occupation: maybe(0.4) ? randomChoice(['Engineer','Teacher','Student','Business','Homemaker']) : undefined,
      bloodGroup: maybe(0.2) ? randomChoice(['A+','A-','B+','B-','AB+','AB-','O+','O-']) : 'Unknown',
      medicalHistory: maybe(0.5) ? { allergies: maybe(0.5) ? ['Penicillin'] : [], diabetic: maybe(0.2), hypertension: maybe(0.2) } : {},
      registeredClinic: clinic._id,
      createdBy: createdBy._id
    });
  }
  return Patient.find({ organization: org._id });
}

function randomDateWithinMonths(offsetMonthsMin, offsetMonthsMax) {
  const now = new Date();
  const monthsOffset = randomInt(offsetMonthsMin, offsetMonthsMax);
  const d = new Date(now);
  d.setMonth(now.getMonth() + monthsOffset);
  d.setDate(randomInt(1, 28));
  d.setHours(randomInt(9, 19), randomInt(0, 59), 0, 0);
  return d;
}

async function ensureAppointments(org, clinics, staff, patients, defs, createdBy) {
  const targets = 30;
  const current = await Appointment.countDocuments({ organization: org._id });
  const toCreate = Math.max(0, targets - current);
  for (let i = 0; i < toCreate; i++) {
    const clinic = randomChoice(clinics);
    const patient = randomChoice(patients);
    const dentist = randomChoice(staff.filter(s => s.role === 'dentist'));
    const date = randomDateWithinMonths(-3, 2); // past/present/future
    const duration = randomChoice([30, 45, 60, 90]);
    await Appointment.create({
      organization: org._id,
      patient: patient._id,
      clinic: clinic._id,
      dentist: dentist._id,
      appointmentDate: date,
      duration,
      appointmentType: randomChoice(['New Consultation','Follow-up','Emergency','Cleaning','Other']),
      reasonForVisit: randomChoice(['Tooth pain','Cleaning','Follow-up visit','Braces check','Cavity treatment']),
      notes: maybe(0.4) ? 'Bring previous reports if available.' : '',
      treatment: maybe(0.5) ? randomChoice(defs)._id : undefined,
      createdBy: createdBy._id
    });
  }
}

async function ensurePrescriptions(org, clinics, users, patients, appointments, drugs, createdBy) {
  const targets = 30;
  const current = await Prescription.countDocuments({ organization: org._id });
  const toCreate = Math.max(0, targets - current);
  for (let i = 0; i < toCreate; i++) {
    const clinic = randomChoice(clinics);
    const patient = randomChoice(patients);
    const appt = maybe(0.6) ? randomChoice(appointments) : null;
    const doctor = users.find(u => u.role === 'dentist') || users[0];
    const medsCount = randomInt(1, 3);
    const meds = [];
    for (let m = 0; m < medsCount; m++) {
      const drug = randomChoice(drugs);
      meds.push({
        drug: drug._id,
        dosage: randomChoice(['1 tab','5ml','2 puffs','1 cap']),
        frequency: randomChoice(['BD','TDS','QID','HS']),
        duration: randomChoice(['3 days','5 days','1 week']),
        instructions: maybe(0.5) ? randomChoice(['After meals','Before meals','As needed']) : '',
        quantity: randomInt(10, 30),
        unit: randomChoice(['tablets', 'capsules', 'ml', 'mg', 'units', 'puffs'])
      });
    }
    const isIssued = maybe(0.5);
    
    // Generate a unique prescription number
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const prescriptionNumber = `RX${timestamp}${randomSuffix}`;
    
    await Prescription.create({
      organization: org._id,
      clinic: clinic._id,
      patient: patient._id,
      doctor: doctor._id,
      appointment: appt?._id,
      prescriptionNumber,
      diagnosis: maybe(0.7) ? randomChoice(['Pulpitis','Caries','Gingivitis','Sensitivity']) : '',
      medications: meds,
      instructions: maybe(0.5) ? 'Drink plenty of water.' : '',
      followUpDate: maybe(0.4) ? randomDateWithinMonths(0, 1) : undefined,
      status: randomChoice(['active','completed','cancelled','expired']),
      isIssuedToPatient: isIssued,
      issuedToPatientDate: isIssued ? randomDateWithinMonths(-1, 0) : undefined,
      createdBy: createdBy._id
    });
  }
}

function buildInvoiceItems(defs) {
  const itemCount = randomInt(1, 3);
  const items = [];
  let subtotal = 0;
  let discount = 0;
  let tax = 0;
  for (let i = 0; i < itemCount; i++) {
    const def = randomChoice(defs);
    const qty = randomInt(1, 2);
    const lineSubtotal = def.price * qty;
    const lineDiscount = maybe(0.3) ? Math.round(lineSubtotal * 0.05) : 0;
    const lineTax = Math.round((lineSubtotal - lineDiscount) * 0.18);
    const lineAmount = lineSubtotal - lineDiscount + lineTax;
    items.push({ description: def.name, quantity: qty, unitPrice: def.price, discount: lineDiscount, tax: lineTax, amount: lineAmount });
    subtotal += lineSubtotal;
    discount += lineDiscount;
    tax += lineTax;
  }
  const totalAmount = subtotal - discount + tax;
  return { items, subtotal, discountAmount: discount, taxAmount: tax, totalAmount };
}

async function ensureInvoices(org, clinics, patients, defs, createdBy) {
  const targets = 100;
  const current = await Invoice.countDocuments({ organization: org._id });
  const toCreate = Math.max(0, targets - current);
  for (let i = 0; i < toCreate; i++) {
    const patient = randomChoice(patients);
    const clinic = randomChoice(clinics);
    const invoiceDate = randomDateWithinMonths(-11, 0); // spread across last 12 months
    const dueDate = new Date(invoiceDate); dueDate.setDate(invoiceDate.getDate() + randomInt(7, 30));
    const { items, subtotal, discountAmount, taxAmount, totalAmount } = buildInvoiceItems(defs);
    const amountPaid = maybe(0.3) ? 0 : maybe(0.5) ? Math.round(totalAmount * randomChoice([0.3, 0.5, 0.7])) : totalAmount;
    await Invoice.create({
      organization: org._id,
      patient: patient._id,
      clinic: clinic._id,
      invoiceDate,
      dueDate,
      items,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      amountPaid,
      payments: amountPaid > 0 ? [{ amount: amountPaid, paymentMethod: randomChoice(['cash','upi','credit card']), receivedBy: createdBy._id, paymentDate: invoiceDate }] : [],
      createdBy: createdBy._id,
      notes: maybe(0.3) ? 'Thank you for your visit.' : undefined,
      termsAndConditions: maybe(0.2) ? 'Payment due within 15 days.' : undefined
    });
  }
}

async function clearExistingDemoData(org) {
  console.log('Clearing existing demo data...');
  await Promise.all([
    Prescription.deleteMany({ organization: org._id }),
    Appointment.deleteMany({ organization: org._id }),
    Invoice.deleteMany({ organization: org._id }),
    Patient.deleteMany({ organization: org._id }),
    Staff.deleteMany({ organization: org._id }),
    TreatmentDefinition.deleteMany({ organization: org._id }),
    Drug.deleteMany({ organization: org._id }),
    Inventory.deleteMany({ organization: org._id })
  ]);
  console.log('Existing demo data cleared');
}

async function main() {
  try {
    await connect();
    console.log('Connected to DB');
    
    const org = await findOrCreateOrganization();
    console.log('Organization:', org.name);
    
    // Clear existing demo data to avoid conflicts
    await clearExistingDemoData(org);
    
    const users = await upsertUsers(org);
    console.log('Users created:', users.length);
    
    const adminUser = users.find(u => u.role === 'admin') || users[0];
    if (!adminUser) {
      throw new Error('No admin user found or created');
    }
    console.log('Using admin user:', adminUser.name);
    
    const clinics = await upsertClinics(org);
    console.log('Clinics created:', clinics.length);
    
    const staff = await upsertStaff(org, clinics, adminUser);
    console.log('Staff created:', staff.length);
    
    const defs = await upsertTreatmentDefinitions(org, adminUser);
    console.log('Treatment definitions created:', defs.length);
    
    const drugs = await upsertDrugs(org, adminUser);
    console.log('Drugs created:', drugs.length);

    const inventory = await upsertInventory(org, clinics, adminUser);
    console.log('Inventory items created:', inventory.length);
    
    const patients = await ensurePatients(org, clinics, adminUser);
    console.log('Patients created:', patients.length);

    await ensureAppointments(org, clinics, staff, patients, defs, adminUser);
    const appointments = await Appointment.find({ organization: org._id });
    console.log('Appointments created:', appointments.length);

    await ensurePrescriptions(org, clinics, users, patients, appointments, drugs, adminUser);
    await ensureInvoices(org, clinics, patients, defs, adminUser);

    const summary = await Promise.all([
      Clinic.countDocuments({ organization: org._id }),
      Staff.countDocuments({ organization: org._id }),
      Patient.countDocuments({ organization: org._id }),
      TreatmentDefinition.countDocuments({ organization: org._id }),
      Drug.countDocuments({ organization: org._id }),
      Prescription.countDocuments({ organization: org._id }),
      Appointment.countDocuments({ organization: org._id }),
      Invoice.countDocuments({ organization: org._id }),
      Inventory.countDocuments({ organization: org._id })
    ]);

    console.log('Seeding complete for Smile Care. Counts:', {
      clinics: summary[0], staff: summary[1], patients: summary[2], treatments: summary[3], drugs: summary[4], prescriptions: summary[5], appointments: summary[6], invoices: summary[7], inventory: summary[8]
    });
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
