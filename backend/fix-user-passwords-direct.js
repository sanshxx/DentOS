const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const fixUserPasswordsDirect = async () => {
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
    
    console.log('\n🔧 FIX: Updating passwords for demo users (direct update)...');
    
    for (const demoUser of demoUsers) {
      console.log(`\n🔧 FIX: Processing ${demoUser.email}...`);
      
      // Hash the password manually
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(demoUser.password, salt);
      
      // Update the user directly in the database to avoid the pre-save hook
      const result = await mongoose.connection.db.collection('users').updateOne(
        { email: demoUser.email },
        { $set: { password: hashedPassword } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`   ✅ Password updated for ${demoUser.email}`);
        
        // Verify the password works
        const user = await mongoose.connection.db.collection('users').findOne({ email: demoUser.email });
        const isMatch = await bcrypt.compare(demoUser.password, user.password);
        console.log(`   ✅ Password verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
      } else {
        console.log(`   ⚠️  User not found: ${demoUser.email}`);
      }
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
fixUserPasswordsDirect();
