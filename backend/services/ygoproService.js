import axios from 'axios';
import CardInfo from '../models/CardInfo.js';
import Card from '../models/Card.js';

const YGOPRODECK_API = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

// Initialize and cache YGOProDeck database
export const initializeYGOProDeckCache = async () => {
  try {
    console.log('🔄 Checking YGOProDeck cache...');

    // Check if cache exists and when it was last updated
    const cacheCount = await CardInfo.countDocuments();
    
    if (cacheCount > 0) {
      // Get the oldest cached card
      const oldestCard = await CardInfo.findOne().sort({ last_cached: 1 });
      const daysSinceCache = (new Date() - new Date(oldestCard.last_cached)) / (1000 * 60 * 60 * 24);

      if (daysSinceCache < 7) {
        console.log(`✅ YGOProDeck cache is up to date (${cacheCount} cards, ${daysSinceCache.toFixed(1)} days old)`);
        return;
      }

      console.log(`⚠️  Cache is ${daysSinceCache.toFixed(1)} days old. Updating...`);
    } else {
      console.log('📥 No cache found. Downloading YGOProDeck database...');
    }

    // Fetch all cards from YGOProDeck API
    const response = await axios.get(YGOPRODECK_API);
    const cards = response.data.data;

    console.log(`📦 Downloaded ${cards.length} cards from YGOProDeck`);

    // Clear old cache
    await CardInfo.deleteMany({});

    // Insert new cache in batches to avoid memory issues
    const batchSize = 500;
    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize);
      const cardsToInsert = batch.map(card => ({
        ...card,
        last_cached: new Date()
      }));
      await CardInfo.insertMany(cardsToInsert);
      console.log(`  ✓ Cached ${Math.min(i + batchSize, cards.length)}/${cards.length} cards`);
    }

    console.log('✅ YGOProDeck cache updated successfully');
  } catch (error) {
    console.error('❌ Error caching YGOProDeck data:', error.message);
    // Don't crash the server if caching fails
  }
};

// Update prices for all cards in user's collection (daily task)
export const updatePricesDaily = async () => {
  try {
    console.log('🔄 Updating prices for user collection...');

    const cards = await Card.find({});
    let updatedCount = 0;

    for (const card of cards) {
      const now = new Date();
      const hoursSinceUpdate = (now - new Date(card.last_updated)) / (1000 * 60 * 60);

      // Only update if older than 24 hours
      if (hoursSinceUpdate > 24) {
        const newPrice = await updateCardPrice(card.set_code);
        if (newPrice !== null) {
          card.set_price = newPrice;
          card.last_updated = now;
          await card.save();
          updatedCount++;
        }
      }
    }

    console.log(`✅ Updated prices for ${updatedCount} cards`);
  } catch (error) {
    console.error('❌ Error updating prices:', error.message);
  }
};

// Get price for a specific card by set code
export const updateCardPrice = async (setCode) => {
  try {
    // Search for the card in cached data by set_code
    const cardInfo = await CardInfo.findOne({
      'card_sets.set_code': setCode
    });

    if (!cardInfo) {
      return null;
    }

    // 1) Prefer tcgplayer_price from card_prices
    const tcgPriceString = cardInfo.card_prices?.[0]?.tcgplayer_price;
    const tcgPrice = tcgPriceString ? parseFloat(tcgPriceString) : null;

    if (tcgPrice !== null && !Number.isNaN(tcgPrice)) {
      return tcgPrice;
    }

    // 2) Fallback to set_price matched by set_code
    const cardSet = cardInfo.card_sets?.find(set => set.set_code === setCode);
    if (!cardSet || !cardSet.set_price) {
      return null;
    }

    const setPrice = parseFloat(cardSet.set_price);
    return Number.isNaN(setPrice) ? null : setPrice;
  } catch (error) {
    console.error('Error fetching card price:', error.message);
    return null;
  }
};

// Search cached cards by name
export const searchCardsByName = async (name, limit = 50) => {
  try {
    const cards = await CardInfo.find({
      name: { $regex: name, $options: 'i' }
    })
    .limit(limit)
    .select('id name type desc card_sets card_images');

    return cards;
  } catch (error) {
    console.error('Error searching cards:', error.message);
    return [];
  }
};
