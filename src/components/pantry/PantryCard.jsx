import React, { useState } from 'react';
import { AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import UnitStepper from '../shared/UnitStepper';
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

  const handleTouchEnd = () => {
    if (touchStartX !== null && swipingLeft) {
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
      className={`relative flex flex-col justify-between bg-white dark:bg-gray-800 rounded-2xl p-3 border transition-all duration-200 shadow-xs hover:shadow-md ${
        isLowStock
          ? 'border-amber-400 dark:border-amber-500/60 bg-amber-50/30 dark:bg-amber-950/20'
          : 'border-gray-200 dark:border-gray-700'
      } ${swipingLeft ? '-translate-x-2 bg-red-50 dark:bg-red-950/20' : ''}`}
    >
      {/* Top row: Indicator color tag + action buttons */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: categoryColor }}
          title={item.category}
        />

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Modifica prodotto"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Elimina prodotto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main product info */}
      <div className="mb-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight mb-1" title={item.name}>
          {item.name}
        </h3>

        {isLowStock && (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-700">
            <AlertTriangle className="w-2.5 h-2.5" /> Sotto soglia
          </span>
        )}
      </div>

      {/* Stepper +/- visibile e compatto */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-750 flex flex-col items-center gap-1">
        <UnitStepper
          value={item.currentStock}
          step={item.step}
          unitType={item.unitType}
          onChange={handleStockChange}
          compact={true}
        />
      </div>
    </div>
  );
}
