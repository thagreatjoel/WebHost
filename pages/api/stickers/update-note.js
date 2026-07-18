// pages/api/stickers/update-note.js
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { stickerId, userId, publicNote } = req.body;

    if (!stickerId || !userId) {
      return res.status(400).json({ error: 'stickerId and userId are required' });
    }

    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return res.status(503).json({
        error: 'MongoDB not configured',
        message: 'Please set MONGODB_URI environment variable'
      });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    if (!client) {
      return res.status(503).json({
        error: 'MongoDB connection failed',
        message: 'Could not connect to database'
      });
    }

    const db = client.db();
    const collection = db.collection('stickers');

    // Update the note
    const result = await collection.updateOne(
      { _id: new ObjectId(stickerId), userId: userId },
      { $set: { publicNote: publicNote || '' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: 'Sticker not found or you do not have permission to edit it'
      });
    }

    // Get the updated sticker
    const updatedSticker = await collection.findOne({
      _id: new ObjectId(stickerId)
    });

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      sticker: updatedSticker
    });

  } catch (error) {
    console.error('❌ Error updating note:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to update note'
    });
  }
}