const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const fixUserPasswords = async () => {
  try {
    console.log('🔧 FIX: Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Demo users with their passwords
    const demoUsers = [
      { email: 'admin@smilecare.com', password: 'Demo@2025', role: 'admin' },
      { email: 'manager@smilecare.com', password: 'Demo@2025', role: 'manager' },
      { email: 'dentist@smilecare.com', password: 'Demo@2025', role: 'dentist' },
      { email: 'receptionist@smilecare.com', password: 'Demo@2025', role: 'receptionist' },
      { email: 'assistant@smilecare.com', password: 'Demo@2025', role: 'assistant' }
    ];
    
    console.log('\n🔧 FIX: Updating passwords for demo users...');
    
    for (const demoUser of demoUsers) {
      console.log(`\n🔧 FIX: Processing ${demoUser.email}...`);
      
      // Find the user
      const user = await User.findOne({ email: demoUser.email });
      
      if (!user) {
        console.log(`   ⚠️  User not found: ${demoUser.email}`);
        continue;
      }
      
      console.log(`   ✅ User found: ${user.name} (${user.role})`);
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(demoUser.password, salt);
      
      // Update the user with the hashed password
      user.password = hashedPassword;
      await user.save();
      
      console.log(`   ✅ Password updated for ${demoUser.email}`);
      
      // Verify the password works
      const isMatch = await user.matchPassword(demoUser.password);
      console.log(`   ✅ Password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    }
    
    // Also fix any other users that might need passwords
    console.log('\n🔧 FIX: Checking for other users without passwords...');
    const allUsers = await User.find({}).select('+password');
    const usersWithoutPasswords = allUsers.filter(u => !u.password);
    
    if (usersWithoutPasswords.length > 0) {
      console.log(`   Found ${usersWithoutPasswords.length} users without passwords:`);
      
      for (const user of usersWithoutPasswords) {
        if (!demoUsers.find(d => d.email === user.email)) {
          console.log(`   ⚠️  ${user.email} (${user.role}) - no password set`);
        }
      }
    } else {
      console.log('   ✅ All users have passwords');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
    console.log('\n🎉 Password fix complete!');
    console.log('📝 Demo credentials:');
    demoUsers.forEach(user => {
      console.log(`   ${user.email} / ${user.password} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the fix script
fixUserPasswords();
