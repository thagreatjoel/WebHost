const mongoose = require('mongoose');

// Your fixed connection string
const MONGODB_URI = MONGO_URI;

console.log('🔗 Testing MongoDB connection...');
console.log('📡 Connecting to Atlas...');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Connected successfully to MongoDB Atlas!');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  process.exit(0);
})
.catch((err) => {
  console.error('❌ Connection failed:', err.message);
  console.error('💡 Make sure your IP is whitelisted in MongoDB Atlas');
  process.exit(1);
});
