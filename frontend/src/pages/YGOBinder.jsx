import { useState, useEffect } from 'react';
import { cardService } from '../services/api';
import { listService } from '../services/listService';
import ListPanel from '../components/ListPanel';
import { useCardImageCache } from '../hooks/useCardImageCache';
import { useListSync } from '../hooks/useListSync';
import { formatPrice, formatDate, sortCards, getSortArrow } from '../utils/cardUtils';
import './YGOBinderShared.css';
import './YGOBinder.css';

const YGOBinder = ({ isListOpen, toggleList }) => {
  const [cards, setCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Custom hooks
  const { getCardImage } = useCardImageCache(cards);
  const { isCardInList, handleAddToList, handleRemoveFromList, updateCardsInList } = useListSync();

  useEffect(() => {
    fetchCards();
    fetchExchangeRate();
  }, []);

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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCards(searchTerm);
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
                Name{getSortArrow('name', sortColumn, sortDirection)}
              </div>
              <div className="col set-col sortable" role="columnheader" onClick={() => handleSort('set_code')} style={{cursor: 'pointer'}}>
                Set Code{getSortArrow('set_code', sortColumn, sortDirection)}
              </div>
              <div className="col rarity-col sortable" role="columnheader" onClick={() => handleSort('set_rarity')} style={{cursor: 'pointer'}}>
                Rarity{getSortArrow('set_rarity', sortColumn, sortDirection)}
              </div>
              <div className="col price-col sortable" role="columnheader" onClick={() => handleSort('tcgplayer_price')} style={{cursor: 'pointer'}}>
                Price{getSortArrow('tcgplayer_price', sortColumn, sortDirection)}
              </div>
              <div className="col quantity-col sortable" role="columnheader" onClick={() => handleSort('quantity')} style={{cursor: 'pointer'}}>
                Qty{getSortArrow('quantity', sortColumn, sortDirection)}
              </div>
              <div className="col actions-col" role="columnheader">Actions</div>
            </div>

            {sortCards(cards, sortColumn, sortDirection).map((card) => {
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
                    <div className="price-value">{formatPrice(card.tcgplayer_price, exchangeRate)}</div>
                    {card.last_updated && (
                      <div className="timestamp">{formatDate(card.last_updated)}</div>
                    )}
                  </div>
                  <div className="col quantity-col" role="cell" data-label="Quantity">{card.quantity}</div>
                  <div className="col actions-col" role="cell" data-label="Actions">
                    <div className="list-actions">
                      <button 
                        className="action-button add-to-list"
                        onClick={() => {
                          handleAddToList(card);
                          if (!isListOpen) toggleList();
                        }}
                        title="Add to list"
                      >
                        Add to List
                      </button>
                      <button 
                        className="action-button remove-from-list"
                        onClick={() => {
                          handleRemoveFromList(card);
                          if (!isListOpen) toggleList();
                        }}
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
