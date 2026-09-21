import { updatePantryStock, adjustPantryStock, toggleShoppingItem } from '../db/database';

/**
 * Hook di convenienza per esporre le azioni atomiche sullo stock della dispensa e soglie
 */
export function useThresholdCheck() {
  return {
    updateStock: updatePantryStock,
    adjustStock: adjustPantryStock,
    toggleItem: toggleShoppingItem,
  };
}
