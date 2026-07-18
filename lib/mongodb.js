// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000, // 5 seconds
  socketTimeoutMS: 45000, // 45 seconds
  connectTimeoutMS: 10000, // 10 seconds
  waitQueueTimeoutMS: 10000, // 10 seconds
};

let client;
let clientPromise;
let isConnected = false;

if (!uri) {
  console.warn('⚠️ MONGODB_URI is not set. MongoDB features will not work.');
  clientPromise = null;
} else {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect()
        .then(() => {
          console.log('✅ MongoDB connected successfully');
          isConnected = true;
          return client;
        })
        .catch((err) => {
          console.error('❌ MongoDB connection error:', err);
          return null;
        });
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect()
      .then(() => {
        console.log('✅ MongoDB connected successfully');
        isConnected = true;
        return client;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        return null;
      });
  }
}

export async function connectToDatabase() {
  if (!clientPromise) {
    throw new Error('MongoDB not configured');
  }
  
  try {
    const client = await clientPromise;
    if (!client) {
      throw new Error('MongoDB connection failed');
    }
    const db = client.db();
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default clientPromise;