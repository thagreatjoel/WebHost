// pages/api/stickers/user.js
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    
    // Always return a valid response even if userId is missing
    if (!userId) {
      console.log('⚠️ No userId provided, returning empty array');
      return res.status(200).json({ 
        success: true,
        stickers: [],
        count: 0,
        message: 'No userId provided'
      });
    }

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

    console.log(`🔍 Fetching stickers for user: ${userId}`);

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

    const db = client.db();
    const collection = db.collection('stickers');

    // Find stickers for this user
    const stickers = await collection
      .find({ userId: userId })
      .sort({ placedAt: -1 })
      .toArray();

    console.log(`✅ Found ${stickers.length} stickers for user`);

    return res.status(200).json({
      success: true,
      stickers: stickers,
      count: stickers.length
    });

  } catch (error) {
    console.error('❌ Error fetching user stickers:', error);
    // Always return a 200 with empty array instead of 500
    return res.status(200).json({
      success: false,
      stickers: [],
      count: 0,
      error: error.message || 'Failed to fetch stickers'
    });
  }
}