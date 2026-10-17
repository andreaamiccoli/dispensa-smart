import React, { useState } from 'react';
import { Users, KeyRound, Sparkles, Check, ArrowRight } from 'lucide-react';
import { saveShareCode } from '../../db/syncService';

export default function ShareCodeModal({ currentCode, onCodeSet, onClose }) {
  const [inputCode, setInputCode] = useState(currentCode || '');
  const [error, setError] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!clean) {
      setError('Inserisci un codice valido (es. CASA-FAMIGLIA, NOSTRA-CASA, 1234)');
      return;
    }
    if (clean.length < 3) {
      setError('Il codice deve contenere almeno 3 caratteri');
      return;
    }
    const saved = saveShareCode(clean);
    onCodeSet(saved);
    if (onClose) onClose();
  };

  const handleGenerateRandom = () => {
    const random = 'CASA-' + Math.floor(1000 + Math.random() * 9000);
    setInputCode(random);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 mx-auto mb-4 shadow-inner">
          <Users className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-black text-center text-gray-900 dark:text-white mb-1.5">
          Dispensa Condivisa
        </h2>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          Inserisci lo stesso codice su tutti i dispositivi (tu e le altre due persone) per sincronizzare la dispensa e la lista spesa in tempo reale.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Codice Condiviso
            </label>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="es. NOSTRA-CASA"
              autoFocus
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-center font-black tracking-widest text-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 uppercase shadow-inner"
            />
            {error && <p className="text-xs text-red-500 font-semibold mt-1.5 text-center">{error}</p>}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleGenerateRandom}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Genera uno nuovo
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                Annulla
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
          >
            <span>Entra nella Dispensa</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>
      </div>
    </div>
  );
}
