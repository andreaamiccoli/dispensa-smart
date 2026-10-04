import React, { useState } from 'react';
import { Folder, Edit2, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, deleteSubFolder, updateSubFolder } from '../../db/database';

export default function SubFolderCard({ folder, categoryColor, onClick }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  // Conta gli elementi contenuti in questa sotto-cartella
  const itemsCount = useLiveQuery(async () => {
    return db.pantryItems.where('subFolderId').equals(folder.id).count();
  }, [folder.id]);

  const handleSaveRename = async (e) => {
    e.stopPropagation();
    if (editName.trim()) {
      await updateSubFolder(folder.id, { name: editName.trim() });
      setIsEditing(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm(`Eliminare la cartella "${folder.name}" e tutti i prodotti al suo interno?`)) {
      await deleteSubFolder(folder.id);
    }
  };

  return (
    <div
      onClick={isEditing ? undefined : onClick}
      className="relative flex flex-col justify-between bg-white dark:bg-gray-800 rounded-2xl p-3 border transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer select-none border-gray-200 dark:border-gray-700 hover:border-emerald-400"
      style={{
        boxShadow: categoryColor ? `0 0 10px ${categoryColor}33` : undefined,
        borderColor: categoryColor ? `${categoryColor}88` : undefined,
      }}
    >
      {/* Intestazione Cartella: Icona + Azioni */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Folder className="w-5 h-5 fill-emerald-500/20" />
        </div>

        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Rinomina cartella"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Elimina cartella"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Nome e Modifica Rinomina */}
      <div className="mb-2">
        {isEditing ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-emerald-500 rounded-lg text-xs font-bold text-gray-900 dark:text-white"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(e)}
            />
            <button
              type="button"
              onClick={handleSaveRename}
              className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
            >
              OK
            </button>
          </div>
        ) : (
          <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight">
            {folder.name}
          </h3>
        )}
      </div>

      {/* Conteggio elementi contenuti */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-750 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          Cartella
        </span>
        <span className="font-medium text-[11px]">
          {itemsCount ?? 0} {itemsCount === 1 ? 'prodotto' : 'prodotti'}
        </span>
      </div>
    </div>
  );
}
