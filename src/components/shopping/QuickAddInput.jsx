import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addShoppingItem } from '../../db/database';
import { UNIT_CONFIG } from '../../utils/unitHelpers';

export default function QuickAddInput() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitType, setUnitType] = useState('unit');
  const [selectedPantryItemId, setSelectedPantryItemId] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const pantryItems = useLiveQuery(() => db.pantryItems.toArray()) || [];

  const handleInputChange = (e) => {
    const val = e.target.value;
    setName(val);
    setSelectedPantryItemId(null);

    if (val.trim().length >= 2) {
      const matches = pantryItems.filter((i) =>
        i.name.toLowerCase().includes(val.toLowerCase().trim())
      );
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (pItem) => {
    setName(pItem.name);
    setUnitType(pItem.unitType);
    setSelectedPantryItemId(pItem.id);

    const conf = UNIT_CONFIG[pItem.unitType];
    const defaultQty = pItem.fullStock ? Math.max(1, pItem.fullStock - pItem.currentStock) : (conf?.defaultStep || 1);
    setQuantity(defaultQty);

    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addShoppingItem({
      name: name.trim(),
      quantity: Number(quantity),
      unitType,
      pantryItemId: selectedPantryItemId,
      source: 'manual',
    });

    setName('');
    setQuantity(1);
    setUnitType('unit');
    setSelectedPantryItemId(null);
    setShowSuggestions(false);
  };

  return (
    <div className="relative mb-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={name}
            onChange={handleInputChange}
            placeholder="Aggiungi alla lista spesa..."
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Prodotti in dispensa
              </div>
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectSuggestion(item)}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-750 last:border-none"
                >
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                  <span className="text-xs text-gray-400">({item.category})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          aria-label="Aggiungi alla lista"
          className="w-12 h-12 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl shadow-sm transition-all shrink-0"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
}
