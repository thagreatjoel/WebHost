// pages/api/stickers/place.js
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📦 Connecting to MongoDB...');

    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return res.status(503).json({
        error: 'MongoDB not configured',
        message: 'Please set MONGODB_URI environment variable'
      });
    }

    // Get the client and ensure connection
    const client = await clientPromise;
    if (!client) {
      return res.status(503).json({
        error: 'MongoDB connection failed',
        message: 'Could not connect to database'
      });
    }

    console.log('✅ MongoDB connected');

    const db = client.db();
    const collection = db.collection('stickers');

    // Get data from request body
    const {
      userId,
      userName,
      userEmail,
      emoji,
      name,
      imageUrl,
      x,
      y,
      scale,
      rotation,
      publicNote,
      privateNote
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    console.log('📝 Received data:', { userId, userName, userEmail, emoji, name });
    console.log('🔍 Checking existing stickers for user:', userId);

    // Check if user already has this sticker
    const existingSticker = await collection.findOne({
      userId: userId,
      name: name
    });

    if (existingSticker) {
      console.log('ℹ️ Sticker already exists for this user');
      return res.status(200).json({
        success: true,
        message: 'Sticker already exists',
        sticker: existingSticker
      });
    }

    // Create new sticker
    const newSticker = {
      userId,
      userName: userName || '',
      userEmail: userEmail || '',
      emoji: emoji || '📌',
      name: name || 'Sticker',
      imageUrl: imageUrl || '',
      x: x || 100,
      y: y || 100,
      scale: scale || 1,
      rotation: rotation || 0,
      publicNote: publicNote || '',
      privateNote: privateNote || '',
      placedAt: new Date(),
    };

    console.log('💾 Saving new sticker...');
    const result = await collection.insertOne(newSticker);
    console.log('✅ Sticker saved successfully!');

    // Get updated user stickers
    const userStickers = await collection
      .find({ userId: userId })
      .sort({ placedAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      message: 'Sticker placed successfully!',
      sticker: {
        ...newSticker,
        _id: result.insertedId,
      },
      userStickers: userStickers,
    });

  } catch (error) {
    console.error('❌ Error placing sticker:', error);

    // Handle specific MongoDB errors
    if (error.name === 'MongoServerSelectionError') {
      return res.status(503).json({
        error: 'Database connection error',
        message: 'Could not connect to MongoDB. Please check your connection string.'
      });
    }

    if (error.name === 'MongoTimeoutError' || error.message?.includes('buffering timed out')) {
      return res.status(504).json({
        error: 'Database timeout',
        message: 'The database operation took too long. Please try again.'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to place sticker'
    });
  }
}