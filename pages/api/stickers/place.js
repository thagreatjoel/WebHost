import { connectToDatabase } from '../../../lib/mongodb';
import Sticker from '../../../models/Sticker';

export default async function handler(req, res) {
  // Add CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📦 Connecting to MongoDB...');
    await connectToDatabase();
    console.log('✅ MongoDB connected');

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

    console.log('📝 Received data:', { userId, userName, userEmail, emoji, name });

    // Validate required fields
    if (!userId || !userName || !userEmail || !emoji || !name || x === undefined || y === undefined) {
      console.log('❌ Missing fields:', { userId, userName, userEmail, emoji, name, x, y });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already has 2 stickers
    console.log('🔍 Checking existing stickers for user:', userId);
    const existingStickers = await Sticker.find({ userId });
    console.log(`📊 Found ${existingStickers.length} existing stickers`);

    if (existingStickers.length >= 2) {
      return res.status(400).json({ 
        error: 'You already have 2 stickers. Delete one to place a new one.',
        existingStickers
      });
    }

    // Create the sticker
    const sticker = new Sticker({
      userId,
      userName,
      userEmail,
      emoji,
      name,
      imageUrl: imageUrl || '',
      x,
      y,
      scale,
      rotation,
      publicNote: publicNote || '',
      privateNote: privateNote || '',
    });

    console.log('💾 Saving sticker...');
    await sticker.save();
    console.log('✅ Sticker saved with ID:', sticker._id);

    // Return all stickers for this user
    const allUserStickers = await Sticker.find({ userId });

    res.status(201).json({
      success: true,
      sticker,
      userStickers: allUserStickers,
    });
  } catch (error) {
    console.error('❌ Error placing sticker:', error);
    // Send more detailed error
    res.status(500).json({ 
      error: 'Failed to place sticker',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}