import mongoose from 'mongoose';
import PassRequest from '@/models/PassRequest';
import Counter from '@/models/Counter';
import connectDB from '@/lib/mongodb';

/**
 * Script to fix E11000 duplicate key errors on PassRequest requestNumber
 * 
 * This ensures:
 * 1. No duplicate requestNumbers exist in database
 * 2. Counter is set to start from highest existing requestNumber + 1
 */
async function fixDuplicateKeys() {
  try {
    await connectDB();
    console.log('✓ Connected to MongoDB');

    // Find all pass requests
    const allRequests = await PassRequest.find({}).sort({ requestNumber: 1 });
    console.log(`📊 Found ${allRequests.length} total pass requests`);

    // Identify duplicates
    const requestNumberMap: { [key: string]: string } = {};
    const duplicates: Array<{ requestNumber: string; duplicateId: string }> = [];

    for (const req of allRequests) {
      const id = (req._id as any).toString();
      if (requestNumberMap[req.requestNumber]) {
        duplicates.push({
          requestNumber: req.requestNumber,
          duplicateId: id,
        });
      } else {
        requestNumberMap[req.requestNumber] = id;
      }
    }

    // Remove duplicate entries (keeping the first one)
    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} duplicate requestNumbers. Removing...`);
      for (const dup of duplicates) {
        await PassRequest.deleteOne({ _id: dup.duplicateId });
        console.log(`   ✓ Removed ${dup.requestNumber}`);
      }
    } else {
      console.log('✓ No duplicates found');
    }

    // Find highest requestNumber
    let highestNumber = 0;
    for (const reqNumber of Object.keys(requestNumberMap)) {
      const match = reqNumber.match(/REQSRMAPIMP(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > highestNumber) {
          highestNumber = num;
        }
      }
    }

    console.log(`📈 Highest requestNumber: REQSRMAPIMP${highestNumber}`);

    // Set counter to highestNumber + 1
    const newCounterValue = highestNumber + 1;
    const counter = await Counter.findOneAndUpdate(
      { name: 'passRequestNumber' },
      { $set: { value: newCounterValue } },
      { upsert: true, new: true }
    );

    console.log(`✓ Counter updated to: ${counter.value}`);
    console.log(`✓ Next requestNumber will be: REQSRMAPIMP${counter.value}`);
    console.log('\n✅ Fix completed successfully!');

    await mongoose.connection.close();
  } catch (error: any) {
    console.error('✗ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixDuplicateKeys();
