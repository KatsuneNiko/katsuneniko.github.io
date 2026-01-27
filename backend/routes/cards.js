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

    // Update prices if older than 24 hours
    const updatedCards = await Promise.all(
      cards.map(async (card) => {
        const cardObj = card.toObject();
        const now = new Date();
        const hoursSinceUpdate = (now - new Date(card.last_updated)) / (1000 * 60 * 60);

        if (hoursSinceUpdate > 24) {
          // Update price from cache
          const updatedPrice = await updateCardPrice(card.set_code);
          if (updatedPrice !== null) {
            card.set_price = updatedPrice;
            card.last_updated = now;
            await card.save();
            cardObj.set_price = updatedPrice;
            cardObj.last_updated = now;
          }
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

// Get single card by ID
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(card);
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({ error: 'Failed to fetch card' });
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

    // Check if card already exists
    const existingCard = await Card.findOne({ id, set_code });
    if (existingCard) {
      // Update quantity instead of creating duplicate
      existingCard.quantity += quantity;
      await existingCard.save();
      return res.json({ 
        message: 'Card quantity updated', 
        card: existingCard 
      });
    }

    // Get price from cached data
    const price = await updateCardPrice(set_code);

    // Create new card
    const newCard = new Card({
      id,
      name,
      set_code,
      set_rarity,
      quantity,
      set_price: price || 0,
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
