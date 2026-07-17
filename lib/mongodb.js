// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

// Only try to connect if we have a URI
if (!uri) {
  console.warn('MONGODB_URI is not set. MongoDB features will not work.');
  // Export a placeholder that throws when used
  clientPromise = null;
} else {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;