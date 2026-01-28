import { useState, useEffect } from 'react';
import { cardService } from '../services/api';
import { listService } from '../services/listService';
import ListPanel from '../components/ListPanel';
import './YGOBinder.css';

const YGOBinder = ({ isListOpen, toggleList }) => {
  const [cards, setCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageCache, setImageCache] = useState({});
  const [cardsInList, setCardsInList] = useState({});
  const [exchangeRate, setExchangeRate] = useState(null);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

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
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCards(searchTerm);
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

  const getCardImage = (card) => {
    const key = `${card.id}-${card.set_code}`;
    return imageCache[key] || card.image_url_small || card.image_url || '';
  };

  return (
    <div className="binder-container">
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
      </div>

      {loading ? (
        <div className="loading">Loading cards...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : cards.length === 0 ? (
        <div className="empty-state">
          <p>No cards found in your binder.</p>
          {searchTerm && <p>Try a different search term.</p>}
        </div>
      ) : (
        <>
          <div className="cards-count">
            Showing {cards.length} card{cards.length !== 1 ? 's' : ''}
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
                  <div className="col quantity-col" role="cell" data-label="Quantity">{card.quantity}</div>
                  <div className="col actions-col" role="cell" data-label="Actions">
                    <div className="list-actions">
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <ListPanel 
        isOpen={isListOpen}
        onClose={toggleList}
        showBinderActions={false}
      />
    </div>
  );
};

export default YGOBinder;
