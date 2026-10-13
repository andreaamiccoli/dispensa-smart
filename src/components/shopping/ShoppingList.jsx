import React, { useState } from 'react';
import { ShoppingBag, CheckCheck, Trash2 } from 'lucide-react';
import { useShoppingList } from '../../hooks/useShoppingList';
import { useCategories } from '../../hooks/useCategories';
import ShoppingListItem from './ShoppingListItem';
import QuickAddInput from './QuickAddInput';
import { clearCompletedShoppingItems } from '../../db/database';

export default function ShoppingList() {
  const { activeItems, completedItems, isLoading } = useShoppingList();
  const { categories } = useCategories();
  const [showCompleted, setShowCompleted] = useState(true);

  const handleClearCompleted = async () => {
    if (confirm('Eliminare definitivamente tutti gli elementi completati dalla lista?')) {
      await clearCompletedShoppingItems();
    }
  };

  const getCategoryColor = (catName) => {
    const found = categories.find((c) => c.name === catName);
    return found ? found.colorTag : '#6b7280';
  };

  // Raggruppa gli elementi attivi per macro-gruppo (categoria)
  const groupedActiveItems = activeItems.reduce((acc, item) => {
    const cat = item.category || 'Altro';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(item);
    return acc;
  }, {});

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
            <div className="flex items-center justify-between mb-3 px-1">
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
              <div className="space-y-5">
                {Object.entries(groupedActiveItems).map(([catName, itemsInCat]) => {
                  const catColor = getCategoryColor(catName);
                  return (
                    <div
                      key={catName}
                      className="rounded-2xl p-3.5 border transition-all"
                      style={{
                        backgroundColor: `${catColor}0d`, // Tonalità molto scura integrata col tema
                        borderColor: `${catColor}66`,      // Bordo LED
                        boxShadow: `0 0 14px ${catColor}25, 0 0 2px ${catColor}55`, // Effetto LED attorno al macro-gruppo
                      }}
                    >
                      {/* Intestazione Macro Gruppo con LED Glow */}
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm animate-pulse"
                            style={{
                              backgroundColor: catColor,
                              boxShadow: `0 0 8px ${catColor}`,
                            }}
                          />
                          <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-900 dark:text-white">
                            {catName}
                          </h3>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/30 text-gray-600 dark:text-gray-300">
                          {itemsInCat.length}
                        </span>
                      </div>

                      {/* Elementi della categoria */}
                      <div className="space-y-2">
                        {itemsInCat.map((item) => (
                          <ShoppingListItem
                            key={item.id}
                            item={item}
                            categoryColor={catColor}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
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
                    <ShoppingListItem
                      key={item.id}
                      item={item}
                      categoryColor={getCategoryColor(item.category)}
                    />
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
