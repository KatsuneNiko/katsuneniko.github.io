import { useState, useEffect } from 'react';
import { getCardImageKey } from '../utils/cardUtils';

/**
 * Custom hook for managing card image caching
 * Preloads images to improve performance and prevent flickering
 * @param {Array} cards - Array of cards to cache images for
 * @returns {Object} imageCache object and getCardImage function
 */
export const useCardImageCache = (cards) => {
  const [imageCache, setImageCache] = useState({});

  useEffect(() => {
    if (!cards.length) return;

    const newEntries = {};

    cards.forEach((card) => {
      const key = getCardImageKey(card);
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

  const getCardImage = (card) => {
    const key = getCardImageKey(card);
    return imageCache[key] || card.image_url_small || card.image_url || '';
  };

  return { imageCache, getCardImage };
};
