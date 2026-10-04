import React from 'react';
import { Layers, ChevronRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';

export default function CategoryCard({ category, onClick }) {
  const color = category.colorTag || '#6b7280';

  // Conta i prodotti ed i sotto-folder contenuti in questa categoria
  const stats = useLiveQuery(async () => {
    const itemsCount = await db.pantryItems.where('category').equals(category.name).count();
    const folderCount = await db.subFolders.where('category').equals(category.name).count();
    return { itemsCount, folderCount };
  }, [category.name]) || { itemsCount: 0, folderCount: 0 };

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 border-2 transition-all duration-200 cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98]"
      style={{
        borderColor: color,
        boxShadow: `0 0 16px ${color}55, 0 0 2px ${color}`,
      }}
    >
      {/* Top Header con Pallino LED e chevron */}
      <div className="flex items-center justify-between gap-1 mb-3">
        <div className="flex items-center gap-2">
          {/* LED Glow indicator */}
          <span
            className="w-3.5 h-3.5 rounded-full animate-pulse shadow-sm"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Categoria
          </span>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      {/* Nome Categoria */}
      <div className="mb-4">
        <h2 className="font-black text-gray-900 dark:text-white text-base leading-tight line-clamp-2">
          {category.name}
        </h2>
      </div>

      {/* Statistiche Contenuto */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-750 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" style={{ color }} />
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {stats.itemsCount} {stats.itemsCount === 1 ? 'prodotto' : 'prodotti'}
          </span>
        </div>
        {stats.folderCount > 0 && (
          <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-md text-gray-600 dark:text-gray-300">
            {stats.folderCount} {stats.folderCount === 1 ? 'cartella' : 'cartelle'}
          </span>
        )}
      </div>
    </div>
  );
}
