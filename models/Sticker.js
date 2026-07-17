import mongoose from 'mongoose';

const StickerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  scale: {
    type: Number,
    required: true,
    default: 1,
  },
  rotation: {
    type: Number,
    required: true,
    default: 0,
  },
  publicNote: {
    type: String,
    default: '',
    maxlength: 200,
  },
  privateNote: {
    type: String,
    default: '',
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only have 2 stickers
StickerSchema.index({ userId: 1, createdAt: -1 });

// Prevent model recompilation in development
export default mongoose.models.Sticker || mongoose.model('Sticker', StickerSchema);