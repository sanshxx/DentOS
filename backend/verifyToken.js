require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');

// The token from the browser
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjVmMzA1YzRmMzY0YzQwMDFjMDVkYTQwIn0sImlhdCI6MTcxMDQxNDI3NiwiZXhwIjoxNzEzMDQyMjc2fQ.sFNkzBsJ-QYmm3k5L5aIXi-rtB7Y_mI5DQNv71rHl_M';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token is valid');
      console.log('Decoded token:', decoded);
      
      // Find the user from the token
      if (decoded.user && decoded.user.id) {
        const user = await User.findById(decoded.user.id);
        
        if (user) {
          console.log('User found:');
          console.log('Name:', user.name);
          console.log('Email:', user.email);
          console.log('Role:', user.role);
          console.log('ID:', user._id);
        } else {
          console.log('User not found in database');
        }
      } else {
        console.log('No user ID in token');
      }
    } catch (err) {
      console.error('Token verification failed:', err.message);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));