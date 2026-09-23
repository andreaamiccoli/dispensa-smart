import React, { useState } from 'react';
import { Download, Upload, Database, RefreshCw, Trash2, Plus, Tag } from 'lucide-react';
import { db, seedInitialData } from '../../db/database';
import { useCategories } from '../../hooks/useCategories';

export default function BackupPanel() {
  const [statusMsg, setStatusMsg] = useState(null);
  const { categories, addCategory, deleteCategory } = useCategories();
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  // Esporta il backup in formato JSON
  const handleExportBackup = async () => {
    try {
      const pantryItems = await db.pantryItems.toArray();
      const shoppingList = await db.shoppingList.toArray();
      const catList = await db.categories.toArray();

      const backupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        tables: {
          pantryItems,
          shoppingList,
          categories: catList,
        },
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dispensa-smart-backup-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatusMsg({ type: 'success', text: 'Backup esportato con successo!' });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Errore durante l’esportazione del backup.' });
    }
  };

  // Importa il backup da file JSON
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!json.tables) {
          throw new Error('Formato backup non valido');
        }

        if (confirm('L’importazione sovrascriverà tutti i dati attuali. Continuare?')) {
          await db.transaction('rw', db.pantryItems, db.shoppingList, db.categories, async () => {
            await db.pantryItems.clear();
            await db.shoppingList.clear();
            await db.categories.clear();

            if (json.tables.pantryItems?.length) {
              await db.pantryItems.bulkAdd(json.tables.pantryItems);
            }
            if (json.tables.shoppingList?.length) {
              await db.shoppingList.bulkAdd(json.tables.shoppingList);
            }
            if (json.tables.categories?.length) {
              await db.categories.bulkAdd(json.tables.categories);
            }
          });

          setStatusMsg({ type: 'success', text: 'Backup ripristinato con successo!' });
        }
      } catch (err) {
        console.error(err);
        setStatusMsg({ type: 'error', text: 'File di backup non valido o corrotto.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddCat = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory(newCatName, newCatColor);
    setNewCatName('');
  };

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-4 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
        Impostazioni & Backup
      </h1>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="text-xs font-bold underline ml-2">
            OK
          </button>
        </div>
      )}

      {/* Backup & Data Protection */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" /> Backup Dati Manuale
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Esporta tutti i prodotti e la lista spesa in un file JSON per proteggerti dalla cancellazione della cache o per trasferirli.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Esporta Backup
          </button>

          <label className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl text-sm transition-colors cursor-pointer border border-gray-300 dark:border-gray-600">
            <Upload className="w-4 h-4" /> Importa Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Seed Demo Data */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-amber-500" /> Dati di Esempio
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Popola il database locale con prodotti di test predefiniti (se vuoto).
        </p>
        <button
          onClick={async () => {
            await seedInitialData();
            setStatusMsg({ type: 'success', text: 'Dati di esempio caricati!' });
          }}
          className="w-full py-2.5 px-4 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold rounded-xl text-xs hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors border border-amber-200 dark:border-amber-800"
        >
          Carica Dati Demo
        </button>
      </div>

      {/* Gestione Categorie */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-500" /> Gestione Categorie
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Personalizza le categorie della tua dispensa.
        </p>

        <form onSubmit={handleAddCat} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nuova categoria..."
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
          />
          <button
            type="submit"
            aria-label="Aggiungi categoria"
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 bg-slate-100 dark:bg-gray-700/80 rounded-xl border border-slate-200 dark:border-gray-600 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 shrink-0" style={{ backgroundColor: cat.colorTag }} />
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{cat.name}</span>
              </div>
              <button
                type="button"
                onClick={() => deleteCategory(cat.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Elimina categoria"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
