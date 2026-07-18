// models/Sticker.js
import mongoose from 'mongoose';

const StickerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  // Add other fields as needed
}, {
  timestamps: true,
});

// Check if model already exists
const Sticker = mongoose.models.Sticker || mongoose.model('Sticker', StickerSchema);

export default Sticker;