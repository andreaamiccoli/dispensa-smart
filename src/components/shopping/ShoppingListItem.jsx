import React from 'react';
import { Check, Trash2, RefreshCw } from 'lucide-react';
import { formatQuantity } from '../../utils/unitHelpers';
import { toggleShoppingItem, db } from '../../db/database';

export default function ShoppingListItem({ item }) {
  const isAuto = item.source === 'auto';

  const handleToggleCheck = async (e) => {
    e.stopPropagation();
    await toggleShoppingItem(item.id, !item.checked);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await db.shoppingList.delete(item.id);
  };

  return (
    <div
      className={`group relative flex items-center justify-between p-3.5 bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200 min-h-[56px] shadow-2xs ${
        item.checked
          ? 'border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-850/50 opacity-60'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Pulsante quadrato a sinistra con touch target minimo 44x44px per evitare selezioni accidentali durante lo scroll */}
        <button
          type="button"
          onClick={handleToggleCheck}
          aria-label={item.checked ? `Deseleziona ${item.name}` : `Seleziona ${item.name}`}
          className="w-11 h-11 flex items-center justify-center -ml-1 shrink-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors focus:outline-none"
        >
          <div
            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
              item.checked
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-gray-300 dark:border-gray-500 hover:border-emerald-500'
            }`}
          >
            {item.checked && <Check className="w-4 h-4 stroke-[3]" />}
          </div>
        </button>

        {/* Info Prodotto con quantità ben visibile (es. "2 pz x Latte") */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-bold text-base truncate ${
                item.checked
                  ? 'line-through text-gray-400 dark:text-gray-500'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold mr-1">
                {formatQuantity(item.quantity, item.unitType)} x
              </span>
              {item.name}
            </span>

            {/* Tag Auto senza emoji, solo icona e scritta auto */}
            {isAuto && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                <RefreshCw className="w-3 h-3" /> auto
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pulsante di eliminazione */}
      <button
        type="button"
        onClick={handleDelete}
        className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
        aria-label="Rimuovi dalla lista"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
