import React, { useState } from 'react';
import { AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import UnitStepper from '../shared/UnitStepper';
import CategoryBadge from '../shared/CategoryBadge';
import { updatePantryStock, db } from '../../db/database';

export default function PantryCard({ item, categoryColor, onEdit }) {
  const [touchStartX, setTouchStartX] = useState(null);
  const [swipingLeft, setSwipingLeft] = useState(false);

  const isLowStock = item.currentStock <= item.minThreshold;

  const handleStockChange = async (newVal) => {
    await updatePantryStock(item.id, newVal);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm(`Eliminare "${item.name}" dalla dispensa?`)) {
      await db.pantryItems.delete(item.id);
    }
  };

  // Touch gesture support for swipe-left decrement
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartX - currentX;
    if (diff > 50) {
      setSwipingLeft(true);
    } else {
      setSwipingLeft(false);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX !== null && swipingLeft) {
      // Rapid decrement on swipe left
      const nextVal = Math.max(0, item.currentStock - item.step);
      updatePantryStock(item.id, nextVal);
    }
    setTouchStartX(null);
    setSwipingLeft(false);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative bg-white dark:bg-gray-800 rounded-xl p-4 border transition-all duration-200 shadow-sm hover:shadow-md ${
        isLowStock
          ? 'border-amber-400 dark:border-amber-500/60 bg-amber-50/20 dark:bg-amber-950/10'
          : 'border-gray-200 dark:border-gray-700'
      } ${swipingLeft ? '-translate-x-3 bg-red-50 dark:bg-red-950/20' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <CategoryBadge categoryName={item.category} colorTag={categoryColor} />
            {isLowStock && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                <AlertTriangle className="w-3 h-3" /> Sotto soglia
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
            {item.name}
          </h3>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Modifica prodotto"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Elimina prodotto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stepper + Details */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-750">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div>Min: <span className="font-medium text-gray-700 dark:text-gray-300">{item.minThreshold}</span></div>
          <div>Max: <span className="font-medium text-gray-700 dark:text-gray-300">{item.fullStock || '-'}</span></div>
        </div>

        {/* Stepper inline sempre visibile */}
        <UnitStepper
          value={item.currentStock}
          step={item.step}
          unitType={item.unitType}
          onChange={handleStockChange}
        />
      </div>
    </div>
  );
}
