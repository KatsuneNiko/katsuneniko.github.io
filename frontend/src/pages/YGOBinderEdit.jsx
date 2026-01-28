import { useState, useEffect } from 'react';
import { cardService } from '../services/api';
import { listService } from '../services/listService';
import AddCardModal from '../components/AddCardModal';
import ListPanel from '../components/ListPanel';
import './YGOBinderEdit.css';

const YGOBinderEdit = ({ isListOpen, toggleList }) => {
  const [cards, setCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageCache, setImageCache] = useState({});
  const [cardsInList, setCardsInList] = useState({});
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [exchangeRate, setExchangeRate] = useState(null);

  useEffect(() => {
    fetchCards();
    fetchExchangeRate();

    // Subscribe to list changes
    const unsubscribe = listService.subscribe(() => {
      updateCardsInList();
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!cards.length) return;

    const newEntries = {};

    cards.forEach((card) => {
      const key = `${card.id}-${card.set_code}`;
      const url = card.image_url_small || card.image_url;
      if (url && !imageCache[key]) {
        const img = new Image();
        img.src = url;
        newEntries[key] = url;
      }
    });

    if (Object.keys(newEntries).length) {
      setImageCache((prev) => ({ ...prev, ...newEntries }));
    }
  }, [cards, imageCache]);

  const fetchCards = async (search = '') => {
    try {
      setLoading(true);
      const data = await cardService.getAllCards(search);
      setCards(data);
      setError(null);
      
      // Update max quantities in list when cards change
      listService.updateMaxQuantities(data);
      updateCardsInList();
    } catch (err) {
      setError('Failed to load cards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCardsInList = () => {
    const list = listService.getList();
    const inList = {};
    list.forEach(item => {
      const key = `${item.id}-${item.set_code}-${item.set_rarity}`;
      inList[key] = true;
    });
    setCardsInList(inList);
  };

  const fetchExchangeRate = async () => {
    try {
      const data = await cardService.getExchangeRate();
      setExchangeRate(data.rate);
    } catch (err) {
      console.error('Failed to fetch exchange rate:', err);
      setExchangeRate(1.5); // Fallback rate
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortedCards = () => {
    const sorted = [...cards].sort((a, b) => {
      let aVal, bVal;

      switch (sortColumn) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'set_code':
          aVal = a.set_code.toLowerCase();
          bVal = b.set_code.toLowerCase();
          break;
        case 'set_rarity':
          aVal = a.set_rarity.toLowerCase();
          bVal = b.set_rarity.toLowerCase();
          break;
        case 'tcgplayer_price':
          aVal = a.tcgplayer_price || 0;
          bVal = b.tcgplayer_price || 0;
          break;
        case 'quantity':
          aVal = a.quantity;
          bVal = b.quantity;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const getSortArrow = (column) => {
    if (sortColumn !== column) return ' ↕';
    return sortDirection === 'asc' ? ' ↓' : ' ↑';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCards(searchTerm);
  };

  const handleIncrement = async (cardId) => {
    try {
      await cardService.incrementCard(cardId);
      // Update local state instead of refetching all cards
      setCards(prevCards => 
        prevCards.map(card => 
          card._id === cardId 
            ? { ...card, quantity: card.quantity + 1 }
            : card
        )
      );
    } catch (err) {
      alert('Failed to increment card quantity');
      console.error(err);
    }
  };

  const handleDecrement = async (cardId) => {
    try {
      const result = await cardService.decrementCard(cardId);
      // Update local state - if card was deleted (quantity reached 0), remove it
      setCards(prevCards => {
        const card = prevCards.find(c => c._id === cardId);
        if (card && card.quantity <= 1) {
          // Card will be deleted, remove from list
          return prevCards.filter(c => c._id !== cardId);
        }
        // Just decrement quantity
        return prevCards.map(c => 
          c._id === cardId 
            ? { ...c, quantity: c.quantity - 1 }
            : c
        );
      });
    } catch (err) {
      alert('Failed to decrement card quantity');
      console.error(err);
    }
  };

  const handleDelete = async (cardId) => {
    if (!confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      await cardService.deleteCard(cardId);
      // Remove card from local state
      setCards(prevCards => prevCards.filter(card => card._id !== cardId));
    } catch (err) {
      alert('Failed to delete card');
      console.error(err);
    }
  };

  const handleCardAdded = () => {
    fetchCards(searchTerm);
    setIsModalOpen(false);
  };

  const handleAddToList = (card) => {
    listService.addToList(card, 1);
  };

  const handleRemoveFromList = (card) => {
    listService.removeFromList(card);
  };

  const isCardInList = (card) => {
    const key = `${card.id}-${card.set_code}-${card.set_rarity}`;
    return cardsInList[key] || false;
  };

  const handleAddListToBinder = async () => {
    const list = listService.getList();
    
    if (list.length === 0) {
      alert('List is empty. Add cards to the list first.');
      return;
    }

    const summary = list.map(item => `• ${item.quantity}x ${item.name} [${item.set_code}]`).join('\n');
    
    if (!confirm(`Add the following cards to binder?\n\n${summary}`)) {
      return;
    }

    try {
      for (const item of list) {
        // Find the card in the binder
        const card = cards.find(c => 
          c.id === item.id && c.set_code === item.set_code && c.set_rarity === item.set_rarity
        );
        
        if (card) {
          // Increment the card quantity multiple times
          for (let i = 0; i < item.quantity; i++) {
            await cardService.incrementCard(card._id);
          }
        }
      }
      
      // Clear the list and refresh
      listService.clearList();
      await fetchCards(searchTerm);
      alert('Cards successfully added to binder!');
    } catch (err) {
      console.error('Error adding cards to binder:', err);
      alert('Failed to add cards to binder. Please try again.');
    }
  };

  const handleRemoveListFromBinder = async () => {
    const list = listService.getList();
    
    if (list.length === 0) {
      alert('List is empty. Add cards to the list first.');
      return;
    }

    const summary = list.map(item => `• ${item.quantity}x ${item.name} [${item.set_code}]`).join('\n');
    
    if (!confirm(`Remove the following cards from binder?\n\n${summary}\n\nNote: Cards reduced to 0 will be deleted.`)) {
      return;
    }

    try {
      for (const item of list) {
        // Find the card in the binder
        const card = cards.find(c => 
          c.id === item.id && c.set_code === item.set_code && c.set_rarity === item.set_rarity
        );
        
        if (card) {
          // Decrement the card quantity multiple times
          for (let i = 0; i < item.quantity; i++) {
            await cardService.decrementCard(card._id);
          }
        }
      }
      
      // Clear the list and refresh
      listService.clearList();
      await fetchCards(searchTerm);
      alert('Cards successfully removed from binder!');
    } catch (err) {
      console.error('Error removing cards from binder:', err);
      alert('Failed to remove cards from binder. Please try again.');
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'N/A';
    if (!exchangeRate) return `$${price.toFixed(2)} USD/ea`;
    const priceAUD = price * exchangeRate;
    return `$${priceAUD.toFixed(2)} AUD/ea`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just updated';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getTotalValue = () => {
    return cards.reduce((total, card) => {
      const price = card.tcgplayer_price || 0;
      return total + (price * card.quantity);
    }, 0);
  };

  const formatTotalValue = (usdTotal) => {
    if (!exchangeRate) return `$${usdTotal.toFixed(2)} USD`;
    const audTotal = usdTotal * exchangeRate;
    return `$${audTotal.toFixed(2)} AUD ($${usdTotal.toFixed(2)} USD)`;
  };

  const getCardImage = (card) => {
    const key = `${card.id}-${card.set_code}`;
    return imageCache[key] || card.image_url_small || card.image_url || '';
  };

  return (
    <div className="binder-edit-container">
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search cards by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
        <button 
          className="add-card-button" 
          onClick={() => setIsModalOpen(true)}
        >
          ➕ Add New Card
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading cards...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : cards.length === 0 ? (
        <div className="empty-state">
          <p>No cards found in your binder.</p>
          {searchTerm && <p>Try a different search term.</p>}
          <button 
            className="add-first-card-button" 
            onClick={() => setIsModalOpen(true)}
          >
            Add Your First Card
          </button>
        </div>
      ) : (
        <>
          <div className="cards-count">
            Editing {cards.length} card{cards.length !== 1 ? 's' : ''}
          </div>
          <div className="cards-table" role="table">
            <div className="cards-row cards-header with-actions" role="row">
              <div className="col image-col" role="columnheader">Card</div>
              <div className="col name-col sortable" role="columnheader" onClick={() => handleSort('name')} style={{cursor: 'pointer'}}>
                Name{getSortArrow('name')}
              </div>
              <div className="col set-col sortable" role="columnheader" onClick={() => handleSort('set_code')} style={{cursor: 'pointer'}}>
                Set Code{getSortArrow('set_code')}
              </div>
              <div className="col rarity-col sortable" role="columnheader" onClick={() => handleSort('set_rarity')} style={{cursor: 'pointer'}}>
                Rarity{getSortArrow('set_rarity')}
              </div>
              <div className="col price-col sortable" role="columnheader" onClick={() => handleSort('tcgplayer_price')} style={{cursor: 'pointer'}}>
                Price{getSortArrow('tcgplayer_price')}
              </div>
              <div className="col quantity-col sortable" role="columnheader" onClick={() => handleSort('quantity')} style={{cursor: 'pointer'}}>
                Qty{getSortArrow('quantity')}
              </div>
              <div className="col actions-col" role="columnheader">Actions</div>
            </div>

            {getSortedCards().map((card) => {
              const imageSrc = getCardImage(card);
              const inList = isCardInList(card);

              return (
                <div key={card._id} className="cards-row with-actions" role="row">
                  <div className="col image-col" role="cell" data-label="Card">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={card.name}
                        loading="lazy"
                        className="card-thumb"
                      />
                    ) : (
                      <div className="card-thumb placeholder">No image</div>
                    )}
                  </div>
                  <div className="col name-col" role="cell">
                    <div className="card-name">{card.name}</div>
                    <div className="card-meta">#{card.id}</div>
                  </div>
                  <div className="col set-col" role="cell" data-label="Set Code">{card.set_code}</div>
                  <div className="col rarity-col" role="cell" data-label="Rarity">{card.set_rarity}</div>
                  <div className="col price-col" role="cell" data-label="Price">
                    <div className="price-value">{formatPrice(card.tcgplayer_price)}</div>
                    {card.last_updated && (
                      <div className="timestamp">{formatDate(card.last_updated)}</div>
                    )}
                  </div>
                  <div className="col quantity-col" role="cell" data-label="Quantity">
                    <div className="quantity-controls">
                      <button 
                        className="qty-arrow"
                        onClick={() => handleIncrement(card._id)}
                        title="Add one copy"
                      >
                        ▲
                      </button>
                      <span className="qty-display">{card.quantity}</span>
                      <button 
                        className="qty-arrow"
                        onClick={() => handleDecrement(card._id)}
                        title="Remove one copy"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  <div className="col actions-col" role="cell" data-label="Actions">
                    <div className="card-actions">
                      <button 
                        className="action-button add-to-list"
                        onClick={() => handleAddToList(card)}
                        title="Add to list"
                      >
                        Add to List
                      </button>
                      <button 
                        className="action-button remove-from-list"
                        onClick={() => handleRemoveFromList(card)}
                        disabled={!inList}
                        title="Remove from list"
                      >
                        Remove from List
                      </button>
                      <button 
                        className="action-button delete"
                        onClick={() => handleDelete(card._id)}
                        title="Delete card"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!loading && !error && cards.length > 0 && (
        <div className="total-value-panel">
          <div className="total-value-label">Total Binder Value:</div>
          <div className="total-value-amount">{formatTotalValue(getTotalValue())}</div>
        </div>
      )}

      {isModalOpen && (
        <AddCardModal 
          onClose={() => setIsModalOpen(false)}
          onCardAdded={handleCardAdded}
        />
      )}

      <ListPanel 
        isOpen={isListOpen}
        onClose={toggleList}
        showBinderActions={true}
        onAddToBinder={handleAddListToBinder}
        onRemoveFromBinder={handleRemoveListFromBinder}
      />
    </div>
  );
};

export default YGOBinderEdit;
