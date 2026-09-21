import React, { useState } from 'react';
import { ShoppingBag, CheckCheck, Trash2 } from 'lucide-react';
import { useShoppingList } from '../../hooks/useShoppingList';
import ShoppingListItem from './ShoppingListItem';
import QuickAddInput from './QuickAddInput';
import { clearCompletedShoppingItems } from '../../db/database';

export default function ShoppingList() {
  const { activeItems, completedItems, isLoading } = useShoppingList();
  const [showCompleted, setShowCompleted] = useState(true);

  const handleClearCompleted = async () => {
    if (confirm('Eliminare definitivamente tutti gli elementi completati dalla lista?')) {
      await clearCompletedShoppingItems();
    }
  };

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
          Lista della Spesa
        </h1>

        {/* Input per aggiunta rapida */}
        <QuickAddInput />
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Caricamento lista...</div>
      ) : (
        <div className="space-y-6">
          {/* Da Comprare */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600" /> Da Comprare ({activeItems.length})
              </h2>
            </div>

            {activeItems.length === 0 ? (
              <div className="py-8 px-4 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 my-2">
                <CheckCheck className="w-10 h-10 mx-auto text-emerald-500 mb-2 stroke-1" />
                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                  Nessun prodotto da acquistare!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  I prodotti aggiunti manualmente o finiti sotto soglia in dispensa appariranno qui.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeItems.map((item) => (
                  <ShoppingListItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Completati */}
          {completedItems.length > 0 && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2 px-1">
                <button
                  type="button"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1.5"
                >
                  Completati ({completedItems.length})
                </button>

                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Pulisci completati
                </button>
              </div>

              {showCompleted && (
                <div className="space-y-2 opacity-80">
                  {completedItems.map((item) => (
                    <ShoppingListItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
