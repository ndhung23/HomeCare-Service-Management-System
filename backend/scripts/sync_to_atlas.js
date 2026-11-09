import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.production' });

async function syncLocalToAtlas() {
  console.log('Connecting to Local MongoDB...');
  const localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/homecare').asPromise();
  console.log('✓ Connected to Local MongoDB');

  console.log('Connecting to Atlas MongoDB...');
  const atlasConn = await mongoose.createConnection(process.env.MONGO_URI).asPromise();
  console.log('✓ Connected to Atlas MongoDB');

  const collections = await localConn.db.listCollections().toArray();
  console.log(`Found ${collections.length} collections in Local DB:`, collections.map(c => c.name));

  for (const col of collections) {
    const colName = col.name;
    if (colName.startsWith('system.')) continue;

    const localDocs = await localConn.db.collection(colName).find({}).toArray();
    console.log(`- Migrating ${localDocs.length} documents for collection [${colName}]...`);

    if (localDocs.length > 0) {
      // Clear atlas collection first and insert local docs
      await atlasConn.db.collection(colName).deleteMany({});
      await atlasConn.db.collection(colName).insertMany(localDocs);
    }
  }

  console.log('🎉 Successfully synced all collections from Local to Atlas MongoDB!');

  await localConn.close();
  await atlasConn.close();
}

syncLocalToAtlas().catch(console.error);
