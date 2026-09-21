import React, { useState } from 'react';
import { Check, Trash2, RefreshCw } from 'lucide-react';
import { formatQuantity } from '../../utils/unitHelpers';
import { toggleShoppingItem, db } from '../../db/database';

export default function ShoppingListItem({ item }) {
  const [touchStartX, setTouchStartX] = useState(null);
  const [swipingRight, setSwipingRight] = useState(false);

  const isAuto = item.source === 'auto';

  const handleToggleCheck = async () => {
    await toggleShoppingItem(item.id, !item.checked);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await db.shoppingList.delete(item.id);
  };

  // Touch gesture support for swipe-right to check item
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    if (diff > 50) {
      setSwipingRight(true);
    } else {
      setSwipingRight(false);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && swipingRight) {
      handleToggleCheck();
    }
    setTouchStartX(null);
    setSwipingRight(false);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleToggleCheck}
      className={`group relative flex items-center justify-between p-3.5 bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200 cursor-pointer min-h-[56px] shadow-2xs select-none ${
        item.checked
          ? 'border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-850/50 opacity-60'
          : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
      } ${swipingRight ? 'translate-x-3 bg-emerald-50 dark:bg-emerald-950/20' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Checkbox Touch Target min 44x44px */}
        <div
          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
            item.checked
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-gray-300 dark:border-gray-600 group-hover:border-emerald-500'
          }`}
        >
          {item.checked && <Check className="w-5 h-5 stroke-[3]" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold text-base truncate ${
                item.checked
                  ? 'line-through text-gray-400 dark:text-gray-500'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {item.name}
            </span>

            {/* Tag Auto vs Manual */}
            {isAuto && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" /> 🔄 auto
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Da acquistare: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatQuantity(item.quantity, item.unitType)}</span>
          </div>
        </div>
      </div>

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
