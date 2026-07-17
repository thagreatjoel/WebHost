import { connectToDatabase } from '../../../lib/mongodb';
import Sticker from '../../../models/Sticker';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { stickerId, userId } = req.body;

    if (!stickerId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sticker = await Sticker.findById(stickerId);

    if (!sticker) {
      return res.status(404).json({ error: 'Sticker not found' });
    }

    if (sticker.userId !== userId) {
      return res.status(403).json({ error: 'You do not own this sticker' });
    }

    await sticker.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sticker deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting sticker:', error);
    res.status(500).json({ error: 'Failed to delete sticker' });
  }
}