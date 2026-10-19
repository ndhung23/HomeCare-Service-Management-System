import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const statusMap = {
  'Chờ người nhận': 'PENDING',
  'Sắp diễn ra': 'UPCOMING',
  'Đang thực hiện': 'IN_PROGRESS',
  'Đã hoàn thành': 'COMPLETED',
  'Đã hủy': 'CANCELLED',
};

async function migrate() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/homecare';
  await mongoose.connect(uri);
  console.log('Connected to DB for migration');

  const bookingsCol = mongoose.connection.db.collection('bookings');
  const all = await bookingsCol.find({}).toArray();

  let migratedCount = 0;
  for (const b of all) {
    const updates = {};
    if (statusMap[b.status]) {
      updates.status = statusMap[b.status];
    }
    // calculate startAt & endAt if missing
    if ((!b.startAt || !b.endAt) && b.date && b.time) {
      try {
        const start = new Date(`${b.date}T${b.time}:00`);
        if (!isNaN(start.getTime())) {
          updates.startAt = start;
          const duration = b.durationHours || 2;
          updates.endAt = new Date(start.getTime() + duration * 60 * 60 * 1000);
        }
      } catch (e) {}
    }

    if (Object.keys(updates).length > 0) {
      await bookingsCol.updateOne({ _id: b._id }, { $set: updates });
      migratedCount++;
    }
  }

  console.log(`Migration finished. Updated ${migratedCount}/${all.length} bookings.`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

