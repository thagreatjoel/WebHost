import { connectToDatabase } from '../../../lib/mongodb';
import Sticker from '../../../models/Sticker';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { stickerId, userId, x, y } = req.body;

    if (!stickerId || !userId || x === undefined || y === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sticker = await Sticker.findById(stickerId);

    if (!sticker) {
      return res.status(404).json({ error: 'Sticker not found' });
    }

    if (sticker.userId !== userId) {
      return res.status(403).json({ error: 'You do not own this sticker' });
    }

    sticker.x = x;
    sticker.y = y;
    await sticker.save();

    res.status(200).json({
      success: true,
      message: 'Sticker position updated successfully',
    });
  } catch (error) {
    console.error('Error updating sticker:', error);
    res.status(500).json({ error: 'Failed to update sticker' });
  }
}