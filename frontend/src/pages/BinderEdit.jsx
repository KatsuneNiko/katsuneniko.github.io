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

  useEffect(() => {
    fetchCards();
  }, []);

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
          <div className="cards-grid">
            {cards.map((card) => (
              <div key={card._id} className="card-item edit-mode">
                <div className="card-header">
                  <h3 className="card-name">{card.name}</h3>
                  <span className="card-quantity">×{card.quantity}</span>
                </div>
                <div className="card-details">
                  <div className="card-detail">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">{card.id}</span>
                  </div>
                  <div className="card-detail">
                    <span className="detail-label">Set Code:</span>
                    <span className="detail-value">{card.set_code}</span>
                  </div>
                  <div className="card-detail">
                    <span className="detail-label">Rarity:</span>
                    <span className="detail-value">{card.set_rarity}</span>
                  </div>
                  <div className="card-detail">
                    <span className="detail-label">TCGPlayer Price:</span>
                    <span className="detail-value price">{formatPrice(card.set_price)}</span>
                  </div>
                  {card.last_updated && (
                    <div className="card-detail">
                      <span className="detail-label">Last Updated:</span>
                      <span className="detail-value timestamp">
                        {formatDate(card.last_updated)}
                      </span>
                    </div>
                  )}
                </div>
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
            ))}
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
