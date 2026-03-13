/**
 * Script to fix E11000 duplicate key errors on PassRequest requestNumber
 * 
 * Run this script with: node scripts/fix-duplicate-key.js
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Finds the highest requestNumber value in PassRequest collection
 * 3. Sets the Counter to start from highest value + 1
 * 4. Removes any duplicate requestNumbers (keeping the first one)
 */

const mongoose = require('mongoose');
require('dotenv').config();

const PassRequest = require('../src/models/PassRequest').default;
const Counter = require('../src/models/Counter').default;

async function fixDuplicateKeys() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connected to MongoDB');

    // Find all pass requests and identify duplicates
    const allRequests = await PassRequest.find({}).sort({ requestNumber: 1 });
    console.log(`Found ${allRequests.length} total pass requests`);

    // Get unique requestNumbers to detect duplicates
    const requestNumberMap = {};
    const duplicates = [];

    for (const req of allRequests) {
      if (requestNumberMap[req.requestNumber]) {
        duplicates.push({
          requestNumber: req.requestNumber,
          duplicateId: req._id,
        });
      } else {
        requestNumberMap[req.requestNumber] = req._id;
      }
    }

    // Remove duplicate entries (keep the first one)
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate requestNumbers. Removing duplicates...`);
      for (const dup of duplicates) {
        await PassRequest.deleteOne({ _id: dup.duplicateId });
        console.log(`  Removed duplicate: ${dup.requestNumber} (ID: ${dup.duplicateId})`);
      }
    }

    // Extract the numeric part from requestNumber and find the highest
    let highestNumber = 0;
    for (const reqNumber of Object.keys(requestNumberMap)) {
      // expectation: REQSRMAPIMP123
      const match = reqNumber.match(/REQSRMAPIMP(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > highestNumber) {
          highestNumber = num;
        }
      }
    }

    console.log(`Highest existing requestNumber: REQSRMAPIMP${highestNumber}`);

    // Set counter to highestNumber + 1
    const newCounterValue = highestNumber + 1;
    const counter = await Counter.findOneAndUpdate(
      { name: 'passRequestNumber' },
      { value: newCounterValue },
      { upsert: true, new: true }
    );

    console.log(`✓ Counter updated to: ${counter.value}`);
    console.log(`  Next requestNumber will be: REQSRMAPIMP${counter.value}`);

    console.log('✓ Fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

fixDuplicateKeys();
