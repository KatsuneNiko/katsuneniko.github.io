// Service to manage the card list using sessionStorage
// The list is shared between YGOBinder and YGOBinderEdit pages

const LIST_STORAGE_KEY = 'yugioh_card_list';

class ListService {
  constructor() {
    this.listeners = [];
  }

  // Get the current list from sessionStorage
  getList() {
    try {
      const stored = sessionStorage.getItem(LIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading list from sessionStorage:', error);
      return [];
    }
  }

  // Save list to sessionStorage and notify listeners
  saveList(list) {
    try {
      sessionStorage.setItem(LIST_STORAGE_KEY, JSON.stringify(list));
      this.notifyListeners(list);
    } catch (error) {
      console.error('Error saving list to sessionStorage:', error);
    }
  }

  // Add a card to the list or increase its quantity
  addToList(card, quantity = 1) {
    const list = this.getList();
    const existingIndex = list.findIndex(
      item => item.id === card.id && item.set_code === card.set_code && item.set_rarity === card.set_rarity
    );

    if (existingIndex >= 0) {
      list[existingIndex].quantity += quantity;
    } else {
      list.push({
        id: card.id,
        name: card.name,
        set_code: card.set_code,
        set_rarity: card.set_rarity,
        quantity: quantity,
        tcgplayer_price: card.tcgplayer_price,
        image_url: card.image_url,
        image_url_small: card.image_url_small,
        max_quantity: card.quantity // Store max available in binder
      });
    }

    this.saveList(list);
    return list;
  }

  // Remove a card from the list or decrease its quantity
  removeFromList(card) {
    const list = this.getList();
    const filteredList = list.filter(
      item => !(item.id === card.id && item.set_code === card.set_code && item.set_rarity === card.set_rarity)
    );
    
    this.saveList(filteredList);
    return filteredList;
  }

  // Update the quantity of a card in the list
  updateQuantity(card, newQuantity) {
    const list = this.getList();
    const item = list.find(
      item => item.id === card.id && item.set_code === card.set_code && item.set_rarity === card.set_rarity
    );

    if (item) {
      // Ensure quantity is between 1 and max_quantity
      item.quantity = Math.max(1, Math.min(newQuantity, item.max_quantity));
      this.saveList(list);
    }

    return list;
  }

  // Check if a card is in the list
  isInList(card) {
    const list = this.getList();
    return list.some(
      item => item.id === card.id && item.set_code === card.set_code && item.set_rarity === card.set_rarity
    );
  }

  // Get quantity of a specific card in the list
  getCardQuantity(card) {
    const list = this.getList();
    const item = list.find(
      item => item.id === card.id && item.set_code === card.set_code && item.set_rarity === card.set_rarity
    );
    return item ? item.quantity : 0;
  }

  // Clear all items from the list
  clearList() {
    this.saveList([]);
    return [];
  }

  // Calculate total price of all items in the list
  getTotalPrice() {
    const list = this.getList();
    return list.reduce((total, item) => {
      const price = item.tcgplayer_price || 0;
      return total + (price * item.quantity);
    }, 0);
  }

  // Export list as CSV
  exportToCSV() {
    const list = this.getList();
    return list.map(item => 
      `${item.id},${item.name},${item.set_code},${item.set_rarity},${item.quantity}`
    ).join('\n');
  }

  // Import list from CSV
  // Returns object with success/error info
  async importFromCSV(csvText, availableCards) {
    const lines = csvText.trim().split('\n').filter(line => line.trim());
    const results = {
      success: [],
      partialSuccess: [],
      errors: [],
      warnings: []
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;

      // Skip empty lines
      if (!line) continue;

      // Parse CSV line
      const parts = line.split(',').map(p => p.trim());
      if (parts.length !== 5) {
        results.warnings.push(`Line ${lineNum}: Malformed CSV (expected 5 fields, got ${parts.length}) - skipped`);
        continue;
      }

      const [idStr, name, set_code, set_rarity, quantityStr] = parts;
      const id = parseInt(idStr, 10);
      const quantity = parseInt(quantityStr, 10);

      if (isNaN(id)) {
        results.warnings.push(`Line ${lineNum}: Invalid ID "${idStr}" - skipped`);
        continue;
      }

      if (isNaN(quantity) || quantity < 1) {
        results.warnings.push(`Line ${lineNum}: Invalid quantity "${quantityStr}" - skipped`);
        continue;
      }

      // Find matching card in binder
      let matchedCard = availableCards.find(
        card => card.id === id && card.set_code === set_code && card.set_rarity === set_rarity && card.name === name
      );

      // If exact match not found, try ID-only match
      if (!matchedCard) {
        const idMatches = availableCards.filter(card => card.id === id);
        
        if (idMatches.length === 0) {
          results.errors.push(`Line ${lineNum}: Card "${name}" (ID: ${id}) not found in binder - not added`);
          continue;
        }

        // Check for partial matches
        const partialMatch = idMatches.find(
          card => card.set_code === set_code || card.set_rarity === set_rarity
        );

        if (partialMatch) {
          results.warnings.push(
            `Line ${lineNum}: Mismatch for "${name}" - using "${partialMatch.name}" [${partialMatch.set_code}] ${partialMatch.set_rarity}`
          );
          matchedCard = partialMatch;
        } else {
          // Use cheapest option
          matchedCard = idMatches.reduce((cheapest, card) => {
            const cardPrice = card.tcgplayer_price || 0;
            const cheapestPrice = cheapest.tcgplayer_price || 0;
            return cardPrice < cheapestPrice ? card : cheapest;
          }, idMatches[0]);

          results.warnings.push(
            `Line ${lineNum}: Mismatch for "${name}" - using cheapest option "${matchedCard.name}" [${matchedCard.set_code}] ${matchedCard.set_rarity}`
          );
        }
      }

      // Check quantity availability
      const availableQty = matchedCard.quantity;
      const requestedQty = quantity;

      if (requestedQty <= availableQty) {
        this.addToList(matchedCard, requestedQty);
        results.success.push(`Line ${lineNum}: Added ${requestedQty}x "${matchedCard.name}" [${matchedCard.set_code}]`);
      } else {
        this.addToList(matchedCard, availableQty);
        results.partialSuccess.push(
          `Line ${lineNum}: Only ${availableQty} of ${requestedQty} "${matchedCard.name}" [${matchedCard.set_code}] available - added ${availableQty}`
        );
      }
    }

    return results;
  }

  // Subscribe to list changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Notify all listeners of list changes
  notifyListeners(list) {
    this.listeners.forEach(callback => {
      try {
        callback(list);
      } catch (error) {
        console.error('Error in list listener:', error);
      }
    });
  }

  // Update max quantities for cards already in list (useful when binder data changes)
  updateMaxQuantities(availableCards) {
    const list = this.getList();
    let updated = false;

    list.forEach(item => {
      const card = availableCards.find(
        c => c.id === item.id && c.set_code === item.set_code && c.set_rarity === item.set_rarity
      );
      
      if (card) {
        item.max_quantity = card.quantity;
        // Adjust current quantity if it exceeds max
        if (item.quantity > card.quantity) {
          item.quantity = card.quantity;
          updated = true;
        }
      }
    });

    if (updated) {
      this.saveList(list);
    }

    return list;
  }
}

// Export singleton instance
export const listService = new ListService();
