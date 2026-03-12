const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
envFile.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...values] = line.split('=');
    process.env[key.trim()] = values.join('=').trim();
  }
});

// SuperAdmin Schema
const SuperAdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

SuperAdminSchema.methods.comparePassword = async function(password) {
  return await bcryptjs.compare(password, this.password);
};

const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', SuperAdminSchema);

async function testLogin() {
  try {
    const mongoUrl = process.env.MONGODB_URI;
    console.log('🔍 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB\n');

    const email = 'amankumar_thakur@srmap.edu.in';
    const password = 'aman1133';

    // Check if account exists
    console.log(`🔎 Finding account: ${email}`);
    const superAdmin = await SuperAdmin.findOne({ email: email.toLowerCase() });
    
    if (!superAdmin) {
      console.log('❌ Account not found');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('✅ Account found');
    console.log(`  Email: ${superAdmin.email}`);
    console.log(`  Password Hash: ${superAdmin.password.substring(0, 20)}...\n`);

    // Test password comparison
    console.log('🔐 Testing password comparison...');
    const isValid = await superAdmin.comparePassword(password);
    console.log(`  Result: ${isValid ? '✅ Valid' : '❌ Invalid'}\n`);

    if (!isValid) {
      console.log('❌ Password does not match!');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('✅ Password verification successful!');
    console.log('The issue is likely with email sending or OTP creation.');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testLogin();
