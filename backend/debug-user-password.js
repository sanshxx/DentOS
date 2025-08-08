const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const debugUserPassword = async () => {
  try {
    console.log('🔍 DEBUG: Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    console.log('\n🔍 DEBUG: Searching for admin user...');
    const user = await User.findOne({ email: 'admin@smilecare.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    
    console.log('\n🔍 DEBUG: Password field analysis:');
    console.log('   Password field exists:', user.password ? 'YES' : 'NO');
    console.log('   Password field type:', typeof user.password);
    console.log('   Password field length:', user.password ? user.password.length : 'N/A');
    console.log('   Password field starts with $2b$:', user.password ? user.password.startsWith('$2b$') : 'N/A');
    
    // Check if password is properly hashed
    if (user.password) {
      console.log('\n🔍 DEBUG: Testing password comparison...');
      try {
        const isMatch = await user.matchPassword('Demo@2025');
        console.log('   Password comparison result:', isMatch);
      } catch (error) {
        console.log('   Password comparison error:', error.message);
      }
    }
    
    // Check all users to see if any have passwords
    console.log('\n🔍 DEBUG: Checking all users for password fields...');
    const allUsers = await User.find({}).select('+password');
    console.log('   Total users:', allUsers.length);
    
    allUsers.forEach((u, index) => {
      console.log(`   User ${index + 1}: ${u.email} - Password: ${u.password ? 'Present' : 'Missing'}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the debug script
debugUserPassword();
