import { useState } from 'react';
import { cardService } from '../services/api';
import './AddCardModal.css';

const AddCardModal = ({ onClose, onCardAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a card name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await cardService.searchYGOPro(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        setError('No cards found. Try a different search.');
      }
    } catch (err) {
      setError('Failed to search cards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (card, setCode, setRarity) => {
    try {
      await cardService.addCard({
        id: card.id,
        name: card.name,
        set_code: setCode,
        set_rarity: setRarity,
        quantity: 1
      });
      
      onCardAdded();
    } catch (err) {
      alert('Failed to add card: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Card</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Enter card name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          {loading && <div className="loading">Searching cards...</div>}

          {searchResults.length > 0 && (
            <div className="results-container">
              <p className="results-count">Found {searchResults.length} card(s)</p>
              <div className="results-list">
                {searchResults.map((card) => (
                  <div key={card.id} className="result-card">
                    <div className="result-card-header">
                      {card.card_images && card.card_images[0] && (
                        <img 
                          src={card.card_images[0].image_url_small} 
                          alt={card.name}
                          className="card-thumbnail"
                        />
                      )}
                      <div className="card-info">
                        <h3>{card.name}</h3>
                        <p className="card-type">{card.type}</p>
                        {card.desc && (
                          <p className="card-description">
                            {card.desc.substring(0, 100)}
                            {card.desc.length > 100 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {card.card_sets && card.card_sets.length > 0 && (
                      <div className="card-sets">
                        <h4>Available Sets:</h4>
                        <div className="sets-list">
                          {card.card_sets.map((set, index) => (
                            <div key={index} className="set-item">
                              <div className="set-info">
                                <span className="set-name">{set.set_name}</span>
                                <span className="set-code">{set.set_code}</span>
                                <span className="set-rarity">{set.set_rarity}</span>
                                {set.set_price && (
                                  <span className="set-price">${set.set_price}</span>
                                )}
                              </div>
                              <button 
                                className="add-button"
                                onClick={() => handleAddCard(card, set.set_code, set.set_rarity)}
                              >
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCardModal;
