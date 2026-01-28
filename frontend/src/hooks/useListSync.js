import { useState, useEffect } from 'react';
import { listService } from '../services/listService';
import { getCardKey } from '../utils/cardUtils';

/**
 * Custom hook for synchronizing with the list service
 * Tracks which cards are in the list and subscribes to list changes
 * @returns {Object} cardsInList state and utility functions
 */
export const useListSync = () => {
  const [cardsInList, setCardsInList] = useState({});

  const updateCardsInList = () => {
    const list = listService.getList();
    const inList = {};
    list.forEach(item => {
      const key = getCardKey(item);
      inList[key] = true;
    });
    setCardsInList(inList);
  };

  const isCardInList = (card) => {
    const key = getCardKey(card);
    return cardsInList[key] || false;
  };

  const handleAddToList = (card, quantity = 1) => {
    listService.addToList(card, quantity);
  };

  const handleRemoveFromList = (card) => {
    listService.removeFromList(card);
  };

  useEffect(() => {
    // Initialize list state
    updateCardsInList();

    // Subscribe to list changes
    const unsubscribe = listService.subscribe(() => {
      updateCardsInList();
    });

    return unsubscribe;
  }, []);

  return {
    cardsInList,
    isCardInList,
    handleAddToList,
    handleRemoveFromList,
    updateCardsInList
  };
};
