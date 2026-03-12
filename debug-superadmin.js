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

async function debug() {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URI;
    console.log('🔍 Connecting to MongoDB...');
    console.log('Connection URL:', mongoUrl);
    
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB\n');

    // Check collection
    console.log('📊 Checking SuperAdmin collection...');
    const count = await SuperAdmin.countDocuments();
    console.log(`Total SuperAdmin accounts: ${count}\n`);

    // List all SuperAdmin accounts
    console.log('📋 All SuperAdmin accounts:');
    const allAccounts = await SuperAdmin.find({}, { email: 1, createdAt: 1, _id: 0 });
    if (allAccounts.length === 0) {
      console.log('  No accounts found\n');
    } else {
      allAccounts.forEach((account, i) => {
        console.log(`  ${i + 1}. Email: ${account.email} (Created: ${account.createdAt})`);
      });
      console.log('');
    }

    // Check for specific email
    const email = 'amankumar_thakur@srmap.edu.in';
    console.log(`🔎 Searching for email: ${email}`);
    const found = await SuperAdmin.findOne({ email: email.toLowerCase() });
    
    if (found) {
      console.log(`✅ FOUND: ${found.email}\n`);
      console.log('To insert/update with correct password, use:\n');
      console.log('db.superadmins.deleteOne({ email: "amankumar_thakur@srmap.edu.in" })');
      console.log('OR insert directly:');
    } else {
      console.log(`❌ NOT FOUND\n`);
      console.log('📝 To insert the account, run this in MongoDB:\n');
    }

    // Generate hash for the password
    const password = 'SuperAdmin123!';
    const salt = bcryptjs.genSaltSync(10);
    const hash = bcryptjs.hashSync(password, salt);
    
    console.log(`db.superadmins.insertOne({
  email: "${email.toLowerCase()}",
  password: "${hash}",
  createdAt: new Date(),
  updatedAt: new Date()
})\n`);

    console.log('💡 Alternative: Insert via Node.js (in this project):');
    console.log('const SuperAdmin = require("./src/models/SuperAdmin").default;');
    console.log('await SuperAdmin.create({');
    console.log(`  email: "${email}",`);
    console.log(`  password: "${password}"`);
    console.log('});\n');

    await mongoose.connection.close();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debug();
