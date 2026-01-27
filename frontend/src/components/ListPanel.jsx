import { useState, useEffect } from 'react';
import { listService } from '../services/listService';
import './ListPanel.css';

const ListPanel = ({ isOpen, onClose, showBinderActions = false, onAddToBinder, onRemoveFromBinder }) => {
  const [list, setList] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResults, setImportResults] = useState(null);
  const [availableCards, setAvailableCards] = useState([]);

  useEffect(() => {
    // Load initial list
    setList(listService.getList());

    // Subscribe to list changes
    const unsubscribe = listService.subscribe((updatedList) => {
      setList(updatedList);
    });

    return unsubscribe;
  }, []);

  const handleQuantityChange = (card, delta) => {
    const newQuantity = card.quantity + delta;
    listService.updateQuantity(card, newQuantity);
  };

  const handleRemoveItem = (card) => {
    if (confirm(`Remove "${card.name}" from list?`)) {
      listService.removeFromList(card);
    }
  };

  const handleClearAll = () => {
    if (list.length === 0) return;
    
    if (confirm('Remove all items from list?')) {
      listService.clearList();
    }
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleCopyToClipboard = () => {
    const csv = listService.exportToCSV();
    navigator.clipboard.writeText(csv).then(() => {
      alert('CSV copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    });
  };

  const handleImport = () => {
    setImportText('');
    setImportResults(null);
    setShowImportModal(true);
  };

  const handleImportSubmit = async () => {
    if (!importText.trim()) {
      alert('Please paste CSV data');
      return;
    }

    // Get available cards from parent component via callback
    // For now, we'll need to pass this data
    const { cardService } = await import('../services/api');
    const cards = await cardService.getAllCards();
    
    const results = await listService.importFromCSV(importText, cards);
    setImportResults(results);
  };

  const getTotalPrice = () => {
    return listService.getTotalPrice();
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'N/A';
    return `$${price.toFixed(2)} ea`;
  };

  return (
    <>
      {/* List Panel */}
      <div className={`list-panel ${isOpen ? 'open' : ''}`}>
        <div className="list-panel-content">
          <div className="list-header">
            <h3>Card List</h3>
            <button className="close-panel" onClick={onClose} aria-label="Close list">
              <span className="close-triangle"></span>
            </button>
          </div>

          {list.length === 0 ? (
            <div className="list-empty">
              <p>Your list is empty</p>
              <p className="list-empty-hint">Add cards from the binder or import a list to get started</p>
              <button className="empty-import-btn" onClick={handleImport}>
                📥 Import List
              </button>
            </div>
          ) : (
            <>
              <div className="list-items">
                {list.map((card) => (
                  <div key={`${card.id}-${card.set_code}-${card.set_rarity}`} className="list-item">
                    <div className="list-item-image">
                      {card.image_url_small || card.image_url ? (
                        <img src={card.image_url_small || card.image_url} alt={card.name} />
                      ) : (
                        <div className="list-item-placeholder">No image</div>
                      )}
                    </div>
                    <div className="list-item-details">
                      <div className="list-item-name">{card.name}</div>
                      <div className="list-item-meta">
                        {card.set_code} • {card.set_rarity}
                      </div>
                      <div className="list-item-price">{formatPrice(card.tcgplayer_price)}</div>
                    </div>
                    <div className="list-item-controls">
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(card, 1)}
                          disabled={card.quantity >= card.max_quantity}
                          aria-label="Increase quantity"
                        >
                          ▲
                        </button>
                        <span className="qty-value">{card.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(card, -1)}
                          disabled={card.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          ▼
                        </button>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveItem(card)}
                        aria-label="Remove from list"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="list-footer">
                <div className="list-total">
                  <span className="total-label">Total Price:</span>
                  <span className="total-value">{formatPrice(getTotalPrice())}</span>
                </div>

                <button className="clear-all-btn" onClick={handleClearAll}>
                  Clear All Items
                </button>

                <div className="list-import-export-actions">
                  <button className="list-action-btn export-btn" onClick={handleExport}>
                    📤 Export
                  </button>
                  <button className="list-action-btn import-btn" onClick={handleImport}>
                    📥 Import
                  </button>
                </div>

                {showBinderActions && (
                  <div className="binder-actions">
                    <button 
                      className="binder-action-btn add-to-binder"
                      onClick={onAddToBinder}
                    >
                      ➕ Add List to Binder
                    </button>
                    <button 
                      className="binder-action-btn remove-from-binder"
                      onClick={onRemoveFromBinder}
                    >
                      ➖ Remove List from Binder
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content export-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Export Card List</h3>
              <button className="modal-close" onClick={() => setShowExportModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="export-info">CSV Format: id,name,set_code,set_rarity,quantity</p>
              <textarea 
                className="export-textarea"
                value={listService.exportToCSV()}
                readOnly
                rows={Math.min(list.length + 1, 15)}
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn copy-btn" onClick={handleCopyToClipboard}>
                📋 Copy to Clipboard
              </button>
              <button className="modal-btn cancel-btn" onClick={() => setShowExportModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content import-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Import Card List</h3>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="import-info">Paste your CSV data below (id,name,set_code,set_rarity,quantity)</p>
              <textarea 
                className="import-textarea"
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Paste CSV here..."
                rows={10}
              />
              
              {importResults && (
                <div className="import-results">
                  {importResults.success.length > 0 && (
                    <div className="result-section success">
                      <h4>✅ Successfully Added ({importResults.success.length})</h4>
                      <ul>
                        {importResults.success.map((msg, i) => <li key={i}>{msg}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {importResults.partialSuccess.length > 0 && (
                    <div className="result-section partial">
                      <h4>⚠️ Partially Added ({importResults.partialSuccess.length})</h4>
                      <ul>
                        {importResults.partialSuccess.map((msg, i) => <li key={i}>{msg}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {importResults.warnings.length > 0 && (
                    <div className="result-section warning">
                      <h4>⚠️ Warnings ({importResults.warnings.length})</h4>
                      <ul>
                        {importResults.warnings.map((msg, i) => <li key={i}>{msg}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {importResults.errors.length > 0 && (
                    <div className="result-section error">
                      <h4>❌ Errors ({importResults.errors.length})</h4>
                      <ul>
                        {importResults.errors.map((msg, i) => <li key={i}>{msg}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-btn import-submit-btn" onClick={handleImportSubmit}>
                Import
              </button>
              <button className="modal-btn cancel-btn" onClick={() => setShowImportModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListPanel;
