const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Drop the username index
    try {
      await usersCollection.dropIndex('username_1');
      console.log('✅ Dropped username_1 index successfully');
    } catch (error) {
      console.log('ℹ️  username_1 index does not exist or already dropped');
    }

    // List all indexes
    const indexes = await usersCollection.indexes();
    console.log('\nCurrent indexes:', indexes);

    await mongoose.connection.close();
    console.log('\n✅ Done! You can now restart the server.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixIndexes();
