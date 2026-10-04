import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { addSubFolder } from '../../db/database';

export default function SubFolderForm({ defaultCategory, parentSubFolderId = null, onClose, onSaved }) {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addSubFolder({
      name: name.trim(),
      category: defaultCategory,
      parentSubFolderId: parentSubFolderId ? Number(parentSubFolderId) : null,
    });

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-emerald-600" /> Nuova Cartella
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Nome Cartella *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Pollo, Bibite gassate, Salumi..."
              autoFocus
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Categoria di appartenenza: <span className="font-bold text-gray-800 dark:text-gray-200">{defaultCategory}</span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors text-sm"
            >
              Crea Cartella
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
