import React from 'react';
import { Plus } from 'lucide-react';

export default function FAB({ onClick, label = 'Aggiungi prodotto' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-20 right-4 z-40 flex items-center justify-center w-14 h-14 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-800"
    >
      <Plus className="w-7 h-7 stroke-[2.5]" />
    </button>
  );
}
