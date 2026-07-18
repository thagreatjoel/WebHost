// pages/api/stickers/all.js
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📦 Fetching all stickers...');

    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ MONGODB_URI not set');
      return res.status(200).json({
        success: true,
        stickers: [],
        count: 0,
        message: 'MongoDB not configured'
      });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    if (!client) {
      console.error('❌ MongoDB connection failed');
      return res.status(200).json({
        success: true,
        stickers: [],
        count: 0,
        message: 'MongoDB connection failed'
      });
    }

    console.log('✅ MongoDB connected successfully');

    const db = client.db();
    const collection = db.collection('stickers');

    // Find all stickers
    const stickers = await collection
      .find({})
      .sort({ placedAt: -1 })
      .toArray();

    console.log(`✅ Found ${stickers.length} stickers total`);

    return res.status(200).json({
      success: true,
      stickers: stickers,
      count: stickers.length
    });

  } catch (error) {
    console.error('❌ Error fetching stickers:', error);
    return res.status(200).json({
      success: false,
      stickers: [],
      count: 0,
      error: error.message || 'Failed to fetch stickers'
    });
  }
}