import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { formatQuantity } from '../../utils/unitHelpers';

export default function UnitStepper({
  value,
  step = 1,
  unitType = 'unit',
  onChange,
  disabled = false,
  compact = false,
}) {
  const handleDecrement = (e) => {
    e.stopPropagation();
    if (disabled) return;
    const nextVal = Math.max(0, value - step);
    onChange(nextVal);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (disabled) return;
    const nextVal = value + step;
    onChange(nextVal);
  };

  return (
    <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= 0}
        aria-label="Decrementa quantità"
        className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors select-none"
      >
        <Minus className="w-5 h-5 stroke-[2.5]" />
      </button>

      <span className={`px-2 font-semibold text-center select-none text-gray-800 dark:text-gray-100 ${compact ? 'text-xs min-w-[3.5rem]' : 'text-sm min-w-[4.5rem]'}`}>
        {formatQuantity(value, unitType)}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled}
        aria-label="Incrementa quantità"
        className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors select-none"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
}
