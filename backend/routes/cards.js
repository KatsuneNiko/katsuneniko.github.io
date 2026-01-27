import express from 'express';
import Card from '../models/Card.js';
import CardInfo from '../models/CardInfo.js';
import { authenticateToken } from '../middleware/auth.js';
import { updateCardPrice } from '../services/ygoproService.js';

const router = express.Router();

// Get all cards (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = { name: { $regex: search, $options: 'i' } };
    }

    const cards = await Card.find(query).sort({ name: 1 });

    // Load cached card info once for all cards (images + set prices)
    const cardInfos = await CardInfo.find({ id: { $in: cards.map((card) => card.id) } })
      .select('id card_images card_sets');
    const cardInfoMap = new Map(cardInfos.map((info) => [info.id, info]));

    // Update prices if older than 24 hours
    const updatedCards = await Promise.all(
      cards.map(async (card) => {
        const cardObj = card.toObject();
        const now = new Date();
        const hoursSinceUpdate = (now - new Date(card.last_updated)) / (1000 * 60 * 60);
        const cardInfo = cardInfoMap.get(card.id);
        let changed = false;

        // Attach cached images if missing
        const imageSmall = card.image_url_small || cardInfo?.card_images?.[0]?.image_url_small || cardInfo?.card_images?.[0]?.image_url || '';
        const imageLarge = card.image_url || cardInfo?.card_images?.[0]?.image_url || '';

        if (!card.image_url_small && imageSmall) {
          card.image_url_small = imageSmall;
          cardObj.image_url_small = imageSmall;
          changed = true;
        } else {
          cardObj.image_url_small = card.image_url_small || '';
        }

        if (!card.image_url && imageLarge) {
          card.image_url = imageLarge;
          cardObj.image_url = imageLarge;
          changed = true;
        } else {
          cardObj.image_url = card.image_url || '';
        }

        if (hoursSinceUpdate > 24) {
          // Update price from cached card info when available
          let updatedPrice = null;

          if (cardInfo?.card_sets?.length) {
            const matchingSet = cardInfo.card_sets.find((set) => set.set_code === card.set_code);
            const price = matchingSet?.set_price ? parseFloat(matchingSet.set_price) : null;
            if (price !== null && !Number.isNaN(price)) {
              updatedPrice = price;
            }
          }

          // Fallback to existing helper if cache lookup failed
          if (updatedPrice === null) {
            updatedPrice = await updateCardPrice(card.set_code);
          }

          if (updatedPrice !== null) {
            card.tcgplayer_price = updatedPrice;
            card.last_updated = now;
            cardObj.tcgplayer_price = updatedPrice;
            cardObj.last_updated = now;
            changed = true;
          }
        }

        if (changed) {
          await card.save();
        }

        return cardObj;
      })
    );

    res.json(updatedCards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Add new card (protected route)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id, name, set_code, set_rarity, quantity = 1 } = req.body;

    // Validate required fields
    if (!id || !name || !set_code || !set_rarity) {
      return res.status(400).json({ 
        error: 'Missing required fields: id, name, set_code, set_rarity' 
      });
    }

    const cardInfo = await CardInfo.findOne({ id }).select('card_images card_sets');
    const imageSmall = cardInfo?.card_images?.[0]?.image_url_small || cardInfo?.card_images?.[0]?.image_url || '';
    const imageLarge = cardInfo?.card_images?.[0]?.image_url || '';

    const getSetPriceFromInfo = () => {
      if (!cardInfo?.card_sets?.length) return null;
      const matchingSet = cardInfo.card_sets.find((set) => set.set_code === set_code);
      if (!matchingSet?.set_price) return null;
      const price = parseFloat(matchingSet.set_price);
      return Number.isNaN(price) ? null : price;
    };

    // Check if card already exists
    const existingCard = await Card.findOne({ id, set_code });
    if (existingCard) {
      // Update quantity instead of creating duplicate
      existingCard.quantity += quantity;
      if (!existingCard.image_url_small && imageSmall) {
        existingCard.image_url_small = imageSmall;
      }
      if (!existingCard.image_url && imageLarge) {
        existingCard.image_url = imageLarge;
      }
      await existingCard.save();
      return res.json({ 
        message: 'Card quantity updated', 
        card: existingCard 
      });
    }

    // Get price from cached data
    const price = getSetPriceFromInfo() ?? await updateCardPrice(set_code);

    // Create new card
    const newCard = new Card({
      id,
      name,
      set_code,
      set_rarity,
      quantity,
      tcgplayer_price: price || 0,
      image_url: imageLarge,
      image_url_small: imageSmall,
      last_updated: new Date()
    });

    await newCard.save();
    res.status(201).json({ 
      message: 'Card added successfully', 
      card: newCard 
    });
  } catch (error) {
    console.error('Error adding card:', error);
    res.status(500).json({ error: 'Failed to add card' });
  }
});

// Update card quantity (protected route)
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (quantity !== undefined) {
      card.quantity = quantity;
      
      // Remove card if quantity reaches 0
      if (quantity <= 0) {
        await Card.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Card removed (quantity reached 0)' });
      }
      
      await card.save();
    }

    res.json({ message: 'Card updated', card });
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Increment card quantity (protected route)
router.post('/:id/increment', authenticateToken, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    card.quantity += 1;
    await card.save();

    res.json({ message: 'Card quantity incremented', card });
  } catch (error) {
    console.error('Error incrementing card:', error);
    res.status(500).json({ error: 'Failed to increment card' });
  }
});

// Decrement card quantity (protected route)
router.post('/:id/decrement', authenticateToken, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    card.quantity -= 1;

    // Remove card if quantity reaches 0
    if (card.quantity <= 0) {
      await Card.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Card removed (quantity reached 0)' });
    }

    await card.save();
    res.json({ message: 'Card quantity decremented', card });
  } catch (error) {
    console.error('Error decrementing card:', error);
    res.status(500).json({ error: 'Failed to decrement card' });
  }
});

// Delete card (protected route)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// Search YGOProDeck cached data
router.get('/search/ygopro', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Search name is required' });
    }

    const cards = await CardInfo.find({
      name: { $regex: name, $options: 'i' }
    }).limit(50);

    res.json(cards);
  } catch (error) {
    console.error('Error searching cards:', error);
    res.status(500).json({ error: 'Failed to search cards' });
  }
});

export default router;
