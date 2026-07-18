// pages/api/stickers/all.js
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const stickers = await db.collection('stickers').find({}).toArray();
    
    res.status(200).json({ stickers });
  } catch (error) {
    console.error('Error fetching stickers:', error);
    res.status(500).json({ error: 'Failed to fetch stickers' });
  }
}