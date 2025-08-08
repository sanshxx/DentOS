require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    try {
      // Create admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@dentos.com',
        password: 'Demo@123',
        role: 'admin',
        phone: '1234567890'
      });
      await adminUser.save();
      console.log('Admin user created successfully');
      
      // Create manager user
      const managerUser = new User({
        name: 'Manager User',
        email: 'manager@dentos.com',
        password: 'Demo@123',
        role: 'manager',
        phone: '1234567890'
      });
      await managerUser.save();
      console.log('Manager user created successfully');
      
      console.log('Demo users created successfully');
    } catch (err) {
      console.error('Error creating users:', err.message);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('Error:', err));