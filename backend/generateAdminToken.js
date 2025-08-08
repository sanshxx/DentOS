require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    try {
      // Find admin user
      const adminUser = await User.findOne({ email: 'admin@dentos.com' });
      
      if (adminUser) {
        console.log('Admin user found:');
        console.log('Name:', adminUser.name);
        console.log('Email:', adminUser.email);
        console.log('Role:', adminUser.role);
        console.log('ID:', adminUser._id);
        
        // Generate token
        const payload = {
          user: {
            id: adminUser._id
          }
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: '30d'
        });
        
        console.log('\nGenerated token for admin user:');
        console.log(token);
        console.log('\nUse this token in the browser by running this in the console:');
        console.log(`localStorage.setItem('token', '${token}');`);
        console.log('Then refresh the page.');
      } else {
        console.log('Admin user not found');
      }
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));