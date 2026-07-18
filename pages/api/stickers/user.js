// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (!uri) {
  console.warn('MONGODB_URI is not set. MongoDB features will not work.');
  clientPromise = null;
} else {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

// Helper to ensure connection
export async function connectToDatabase() {
  if (!clientPromise) {
    throw new Error('MongoDB not configured');
  }
  
  try {
    const client = await clientPromise;
    const db = client.db();
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default clientPromise;