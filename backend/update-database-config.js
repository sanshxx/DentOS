const fs = require('fs');
const path = require('path');

const updateDatabaseConfig = () => {
  try {
    console.log('🔧 Updating database configuration for production...');
    
    const envPath = path.join(__dirname, '.env');
    
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found. Please create it manually.');
      console.log('\n📝 Add this line to your .env file:');
      console.log('MONGODB_URI=mongodb+srv://DentOS_admin:EaGfDQRtwRM91GEZ@dentos-db.pfbhq2n.mongodb.net/DentOS?retryWrites=true&w=majority&appName=DentOS-db');
      return;
    }
    
    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update MongoDB URI to use DentOS database
    const oldUri = /MONGODB_URI=.*/;
    const newUri = 'MONGODB_URI=mongodb+srv://DentOS_admin:EaGfDQRtwRM91GEZ@dentos-db.pfbhq2n.mongodb.net/DentOS?retryWrites=true&w=majority&appName=DentOS-db';
    
    if (oldUri.test(envContent)) {
      envContent = envContent.replace(oldUri, newUri);
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Updated .env file to use DentOS database');
    } else {
      console.log('❌ MONGODB_URI not found in .env file');
      console.log('\n📝 Please manually add this line to your .env file:');
      console.log('MONGODB_URI=mongodb+srv://DentOS_admin:EaGfDQRtwRM91GEZ@dentos-db.pfbhq2n.mongodb.net/DentOS?retryWrites=true&w=majority&appName=DentOS-db');
    }
    
    console.log('\n📊 Database Configuration Summary:');
    console.log('   Development Database: test');
    console.log('   Production Database: DentOS');
    console.log('   Connection String: Updated to use DentOS database');
    
    console.log('\n📝 Next steps:');
    console.log('1. Run the migration script: node migrate-to-production-db.js');
    console.log('2. Test the application with the new database');
    console.log('3. Deploy to production');
    
  } catch (error) {
    console.error('❌ Error updating database configuration:', error);
  }
};

// Run the update
updateDatabaseConfig();
