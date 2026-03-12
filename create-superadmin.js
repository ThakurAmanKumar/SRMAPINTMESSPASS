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

const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', SuperAdminSchema);

async function createAccount() {
  try {
    const mongoUrl = process.env.MONGODB_URI;
    console.log('🔍 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB\n');

    const email = 'amankumar_thakur@srmap.edu.in';
    const password = 'aman1133';

    // Check if account already exists
    const existing = await SuperAdmin.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log(`⚠️  Account already exists: ${email}`);
      console.log('Deleting old account...');
      await SuperAdmin.deleteOne({ email: email.toLowerCase() });
      console.log('✅ Old account deleted\n');
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    console.log(`✅ Password hashed: ${hashedPassword}\n`);

    // Create account
    console.log('📝 Creating account...');
    const newAccount = await SuperAdmin.create({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    console.log('✅ Account created successfully!\n');
    console.log('📋 Account Details:');
    console.log(`  Email: ${newAccount.email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Created: ${newAccount.createdAt}`);
    console.log('\n🔗 Login URL: http://localhost:3000/SupAdm/login');

    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAccount();
