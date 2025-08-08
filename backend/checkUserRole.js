require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    try {
      // Find user by email
      const user = await User.findOne({ email: 'admin@dentos.com' });
      
      if (user) {
        console.log('User found:');
        console.log('Name:', user.name);
        console.log('Email:', user.email);
        console.log('Role:', user.role);
        console.log('ID:', user._id);
      } else {
        console.log('User not found');
      }
    } catch (err) {
      console.error('Error finding user:', err.message);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));