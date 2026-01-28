import mongoose from 'mongoose';

const exchangeRateSchema = new mongoose.Schema({
  from_currency: {
    type: String,
    default: 'USD'
  },
  to_currency: {
    type: String,
    default: 'AUD'
  },
  rate: {
    type: Number,
    required: true
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('ExchangeRate', exchangeRateSchema, 'exchange-rates');
