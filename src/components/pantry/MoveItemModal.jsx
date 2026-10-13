import React, { useState, useEffect } from 'react';
import { X, FolderInput, Check } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { useCategories } from '../../hooks/useCategories';

export default function MoveItemModal({ item, onClose, onMoved }) {
  const { categories } = useCategories();
  const [targetCategory, setTargetCategory] = useState(item.category || '');
  const [targetSubFolderId, setTargetSubFolderId] = useState(item.subFolderId ? String(item.subFolderId) : '');

  // Recupera le sotto-cartelle appartenenti alla categoria di destinazione selezionata
  const availableSubFolders = useLiveQuery(async () => {
    if (!targetCategory) return [];
    return db.subFolders.where('category').equals(targetCategory).toArray();
  }, [targetCategory]) || [];

  useEffect(() => {
    // Reset sotto-cartella se si cambia categoria
    if (targetCategory !== item.category) {
      setTargetSubFolderId('');
    }
  }, [targetCategory, item.category]);

  const handleMove = async (e) => {
    e.preventDefault();
    if (!targetCategory) return;

    const newSubFolderId = targetSubFolderId ? Number(targetSubFolderId) : null;

    await db.pantryItems.update(item.id, {
      category: targetCategory,
      subFolderId: newSubFolderId,
      updatedAt: new Date().toISOString(),
    });

    if (onMoved) onMoved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate">
            <FolderInput className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Sposta "{item.name}"</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleMove} className="p-5 space-y-4">
          {/* Selezione Categoria Destinazione */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Categoria di Destinazione *
            </label>
            <select
              value={targetCategory}
              onChange={(e) => setTargetCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selezione Sotto-Cartella Destinazione */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Cartella / Sotto-Cartella
            </label>
            <select
              value={targetSubFolderId}
              onChange={(e) => setTargetSubFolderId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">(Nessuna cartella - Radice Categoria)</option>
              {availableSubFolders.map((sf) => (
                <option key={sf.id} value={sf.id}>
                  📁 {sf.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Conferma Spostamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
