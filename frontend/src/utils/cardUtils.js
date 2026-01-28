// Shared utility functions for card operations

/**
 * Format card price with exchange rate
 * @param {number} price - Price in USD
 * @param {number|null} exchangeRate - Exchange rate from USD to AUD
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, exchangeRate = null) => {
  if (!price || price === 0) return 'N/A';
  if (!exchangeRate) return `$${price.toFixed(2)} USD/ea`;
  const priceAUD = price * exchangeRate;
  return `$${priceAUD.toFixed(2)} AUD/ea`;
};

/**
 * Format timestamp relative to now
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just updated';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/**
 * Format total value with exchange rate
 * @param {number} usdTotal - Total in USD
 * @param {number|null} exchangeRate - Exchange rate from USD to AUD
 * @returns {string} Formatted total string
 */
export const formatTotalValue = (usdTotal, exchangeRate = null) => {
  if (!exchangeRate) return `$${usdTotal.toFixed(2)} USD`;
  const audTotal = usdTotal * exchangeRate;
  return `$${audTotal.toFixed(2)} AUD ($${usdTotal.toFixed(2)} USD)`;
};

/**
 * Sort cards by specified column and direction
 * @param {Array} cards - Array of cards to sort
 * @param {string} sortColumn - Column to sort by
 * @param {string} sortDirection - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted cards array
 */
export const sortCards = (cards, sortColumn, sortDirection) => {
  return [...cards].sort((a, b) => {
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
};

/**
 * Get sort arrow indicator for table headers
 * @param {string} column - Current column
 * @param {string} sortColumn - Active sort column
 * @param {string} sortDirection - Sort direction ('asc' or 'desc')
 * @returns {string} Arrow indicator
 */
export const getSortArrow = (column, sortColumn, sortDirection) => {
  if (sortColumn !== column) return ' ↕';
  return sortDirection === 'asc' ? ' ↓' : ' ↑';
};

/**
 * Generate unique key for card identification
 * @param {Object} card - Card object
 * @returns {string} Unique key
 */
export const getCardKey = (card) => {
  return `${card.id}-${card.set_code}-${card.set_rarity}`;
};

/**
 * Generate cache key for card image
 * @param {Object} card - Card object
 * @returns {string} Cache key
 */
export const getCardImageKey = (card) => {
  return `${card.id}-${card.set_code}`;
};

/**
 * Calculate total value of cards
 * @param {Array} cards - Array of cards
 * @returns {number} Total value in USD
 */
export const calculateTotalValue = (cards) => {
  return cards.reduce((total, card) => {
    const price = card.tcgplayer_price || 0;
    return total + (price * card.quantity);
  }, 0);
};
