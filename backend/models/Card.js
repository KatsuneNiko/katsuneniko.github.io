import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  set_code: {
    type: String,
    required: true
  },
  set_rarity: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },
  tcgplayer_price: {
    type: Number,
    default: 0
  },
  image_url: {
    type: String,
    default: ''
  },
  image_url_small: {
    type: String,
    default: ''
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for faster queries
cardSchema.index({ name: 'text' });

export default mongoose.model('Card', cardSchema, 'cards');
