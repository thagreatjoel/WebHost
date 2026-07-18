// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

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

// Export the connection function
export async function connectToDatabase() {
  if (!clientPromise) {
    throw new Error('MongoDB not configured. Please set MONGODB_URI environment variable.');
  }
  const client = await clientPromise;
  const db = client.db(); // Use your database name here
  return { client, db };
}

export default clientPromise;