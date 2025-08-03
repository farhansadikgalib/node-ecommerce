const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

const createDefaultAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI_LIVE || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('Default admin user already exists!');
      console.log('Email: admin@gmail.com');
      console.log('Password: 123456');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create default admin user
    const adminUser = new User({
      email: 'admin@gmail.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true,
      authProvider: 'local'
    });

    await adminUser.save();
    
    console.log('✅ Default admin user created successfully!');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔑 Password: 123456');
    console.log('👤 Role: admin');
    console.log('');
    console.log('You can now use these credentials to log into the admin panel.');
    
  } catch (error) {
    console.error('❌ Error creating default admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
createDefaultAdmin();
