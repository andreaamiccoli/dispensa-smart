import React, { useState } from 'react';
import { RefreshCw, Trash2, Plus, Tag, ZoomIn, ZoomOut, Eye, Users, KeyRound } from 'lucide-react';
import { db, seedInitialData } from '../../db/database';
import { useCategories } from '../../hooks/useCategories';
import ShareCodeModal from './ShareCodeModal';

export default function BackupPanel({ shareCode, onChangeCode }) {
  const [statusMsg, setStatusMsg] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const { categories, addCategory, deleteCategory } = useCategories();
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  // Zoom Testo & Accessibilità
  const [fontZoom, setFontZoom] = useState(() => {
    return Number(localStorage.getItem('dispensa_font_zoom') || 100);
  });

  const handleZoomChange = (newZoom) => {
    const clamped = Math.min(150, Math.max(90, newZoom));
    setFontZoom(clamped);
    localStorage.setItem('dispensa_font_zoom', String(clamped));
    document.documentElement.style.fontSize = `${clamped}%`;
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
        Impostazioni
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

      {/* 1. Dispensa Condivisa / Codice Stanza */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Dispensa Condivisa</h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Sincronizzazione in tempo reale</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCodeModal(true)}
            className="px-3 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200 dark:border-emerald-800"
          >
            Cambia codice
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Codice attuale:</span>
          </div>
          <span className="font-mono font-black tracking-wider text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 shadow-2xs">
            {shareCode || 'Nessuno'}
          </span>
        </div>
      </div>

      {showCodeModal && (
        <ShareCodeModal
          currentCode={shareCode}
          onCodeSet={(newCode) => {
            if (onChangeCode) onChangeCode(newCode);
            setShowCodeModal(false);
            setStatusMsg({ type: 'success', text: `Codice aggiornato a: ${newCode}` });
          }}
          onClose={() => setShowCodeModal(false)}
        />
      )}

      {/* 2. Gestione Categorie */}
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

      {/* 3. Dati di Esempio */}
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

      {/* 4. Accessibilità e Zoom Testo */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-500" /> Accessibilità & Zoom Testo
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Aumenta o diminuisci gradualmente la dimensione dei testi dell’app per facilitare la lettura.
        </p>

        {/* Stepper Zoom */}
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-750 p-2 rounded-xl border border-gray-200 dark:border-gray-700 mb-3">
          <button
            type="button"
            onClick={() => handleZoomChange(fontZoom - 10)}
            disabled={fontZoom <= 90}
            className="w-11 h-11 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Riduci dimensione testo"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-lg font-black text-gray-900 dark:text-white">{fontZoom}%</span>
            <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase">
              {fontZoom <= 100 ? 'Standard' : fontZoom <= 120 ? 'Grande' : 'Molto Grande'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleZoomChange(fontZoom + 10)}
            disabled={fontZoom >= 150}
            className="w-11 h-11 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Aumenta dimensione testo"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {/* Preset rapidi */}
        <div className="grid grid-cols-4 gap-1.5">
          {[100, 115, 130, 145].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleZoomChange(preset)}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                fontZoom === preset
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
