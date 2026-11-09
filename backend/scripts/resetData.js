import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Worker from '../models/Worker.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homecare';

async function resetData() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const targetCollections = [
    'bookings',
    'disputes',
    'wallettransactions',
    'withdrawrequests',
    'notifications',
    'reviews',
  ];

  console.log('\n--- 1. Clearing operational / transaction collections ---');
  for (const colName of targetCollections) {
    try {
      const res = await db.collection(colName).deleteMany({});
      console.log(`- Cleared ${colName}: deleted ${res.deletedCount} documents.`);
    } catch (err) {
      console.warn(`- Collection ${colName} error or not found:`, err.message);
    }
  }

  console.log('\n--- 2. Resetting User wallets & operational state ---');
  // Reset all users default wallet and clear violations
  const allUsersResult = await User.updateMany(
    {},
    {
      $set: {
        'wallet.available': 0,
        'wallet.locked': 0,
        violations: [],
        jobClaimLockedUntil: null,
        isAvailableForJobs: true,
      },
    }
  );
  console.log(`- Reset defaults for ${allUsersResult.modifiedCount} users.`);

  // Restore seed balance and linkage for helper Lan Nguyen
  const lanUser = await User.findOne({ email: 'lan.nguyen@giupviec24.vn' });
  if (lanUser) {
    lanUser.wallet = { available: 1500000, locked: 0 };
    await lanUser.save();

    await Worker.findOneAndUpdate(
      { code: 'W-01' },
      { $set: { userId: lanUser._id, jobsDone: 0 } }
    );
    console.log('- Re-linked Worker W-01 and restored 1,500,000 VND wallet for Lan Nguyen.');
  }

  // Restore seed balance for enterprise CleanPro
  const cleanProUser = await User.findOne({ email: 'dn@cleanpro.vn' });
  if (cleanProUser) {
    cleanProUser.wallet = { available: 5200000, locked: 0 };
    if (cleanProUser.employees && cleanProUser.employees.length > 0) {
      cleanProUser.employees.forEach((emp) => {
        emp.status = 'AVAILABLE';
      });
    }
    await cleanProUser.save();
    console.log('- Restored 5,200,000 VND wallet and AVAILABLE employee status for CleanPro.');
  }

  console.log('\n--- 3. Verifying remaining counts in database ---');
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`  * ${c.name}: ${count}`);
  }

  console.log('\nReset completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

resetData().catch((err) => {
  console.error('Error during resetData:', err);
  process.exit(1);
});
