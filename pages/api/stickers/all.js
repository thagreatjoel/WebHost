import { connectToDatabase } from '../../../lib/mongodb';
import Sticker from '../../../models/Sticker';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const stickers = await Sticker.find()
      .sort({ createdAt: -1 })
      .limit(1000);

    res.status(200).json({
      success: true,
      stickers,
    });
  } catch (error) {
    console.error('Error fetching stickers:', error);
    res.status(500).json({ error: 'Failed to fetch stickers' });
  }
}