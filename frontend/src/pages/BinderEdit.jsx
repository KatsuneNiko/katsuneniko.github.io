import { useState, useEffect } from 'react';
import { cardService } from '../services/api';
import AddCardModal from '../components/AddCardModal';
import './BinderEdit.css';

const BinderEdit = () => {
  const [cards, setCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageCache, setImageCache] = useState({});

  useEffect(() => {
    fetchCards();
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
    } catch (err) {
      setError('Failed to load cards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCards(searchTerm);
  };

  const handleIncrement = async (cardId) => {
    try {
      await cardService.incrementCard(cardId);
      fetchCards(searchTerm);
    } catch (err) {
      alert('Failed to increment card quantity');
      console.error(err);
    }
  };

  const handleDecrement = async (cardId) => {
    try {
      await cardService.decrementCard(cardId);
      fetchCards(searchTerm);
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
      fetchCards(searchTerm);
    } catch (err) {
      alert('Failed to delete card');
      console.error(err);
    }
  };

  const handleCardAdded = () => {
    fetchCards(searchTerm);
    setIsModalOpen(false);
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'N/A';
    return `$${price.toFixed(2)}`;
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
              <div className="col name-col" role="columnheader">Name</div>
              <div className="col set-col" role="columnheader">Set Code</div>
              <div className="col rarity-col" role="columnheader">Rarity</div>
              <div className="col price-col" role="columnheader">Price</div>
              <div className="col quantity-col" role="columnheader">Qty</div>
              <div className="col actions-col" role="columnheader">Actions</div>
            </div>

            {cards.map((card) => {
              const imageSrc = getCardImage(card);

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
                  <div className="col quantity-col" role="cell" data-label="Quantity">×{card.quantity}</div>
                  <div className="col actions-col" role="cell" data-label="Actions">
                    <div className="card-actions">
                      <button 
                        className="action-button increment"
                        onClick={() => handleIncrement(card._id)}
                        title="Add one copy"
                      >
                        ➕ Add Copy
                      </button>
                      <button 
                        className="action-button decrement"
                        onClick={() => handleDecrement(card._id)}
                        title="Remove one copy"
                      >
                        ➖ Remove Copy
                      </button>
                      <button 
                        className="action-button delete"
                        onClick={() => handleDelete(card._id)}
                        title="Delete card"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {isModalOpen && (
        <AddCardModal 
          onClose={() => setIsModalOpen(false)}
          onCardAdded={handleCardAdded}
        />
      )}
    </div>
  );
};

export default BinderEdit;
