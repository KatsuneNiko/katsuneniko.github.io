import { useState, useEffect } from 'react';
import { cardService } from '../services/api';
import './Binder.css';

const Binder = () => {
  const [cards, setCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
            <div className="cards-row cards-header" role="row">
              <div className="col image-col" role="columnheader">Card</div>
              <div className="col name-col" role="columnheader">Name</div>
              <div className="col set-col" role="columnheader">Set Code</div>
              <div className="col rarity-col" role="columnheader">Rarity</div>
              <div className="col price-col" role="columnheader">Price</div>
              <div className="col quantity-col" role="columnheader">Qty</div>
            </div>

            {cards.map((card) => {
              const imageSrc = getCardImage(card);

              return (
                <div key={card._id} className="cards-row" role="row">
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
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Binder;
