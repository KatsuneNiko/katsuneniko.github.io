import mongoose from 'mongoose';

const cardInfoSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  type: String,
  desc: String,
  atk: Number,
  def: Number,
  level: Number,
  race: String,
  attribute: String,
  card_sets: [{
    set_name: String,
    set_code: String,
    set_rarity: String,
    set_price: String
  }],
  card_images: [{
    id: Number,
    image_url: String,
    image_url_small: String
  }],
  card_prices: [{
    cardmarket_price: String,
    tcgplayer_price: String,
    ebay_price: String,
    amazon_price: String,
    coolstuffinc_price: String
  }],
  last_cached: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster name searches
cardInfoSchema.index({ name: 'text' });

export default mongoose.model('CardInfo', cardInfoSchema, 'yugioh-cardinfo');
