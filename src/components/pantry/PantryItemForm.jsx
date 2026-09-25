import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addPantryItem } from '../../db/database';
import { useCategories } from '../../hooks/useCategories';
import { UNIT_CONFIG, UNIT_TYPES } from '../../utils/unitHelpers';

export default function PantryItemForm({ initialItem = null, onClose, onSaved }) {
  const { categories } = useCategories();

  const [name, setName] = useState(initialItem?.name || '');
  const [category, setCategory] = useState(initialItem?.category || '');
  const [unitType, setUnitType] = useState(initialItem?.unitType || 'unit');
  const [currentStock, setCurrentStock] = useState(initialItem?.currentStock ?? 1);
  const [fullStock, setFullStock] = useState(initialItem?.fullStock ?? 2);
  const [minThreshold, setMinThreshold] = useState(initialItem?.minThreshold ?? 1);
  const [step, setStep] = useState(initialItem?.step ?? 1);
  const [autoAdd, setAutoAdd] = useState(initialItem?.autoAdd !== false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Recupera tutti i prodotti esistenti in dispensa per autocomplete (Feature D)
  const existingItems = useLiveQuery(() => db.pantryItems.toArray()) || [];

  useEffect(() => {
    if (!category && categories.length > 0) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  // Aggiorna i default dei numerici quando cambia unitType se è un nuovo item
  const handleUnitTypeChange = (newUnit) => {
    setUnitType(newUnit);
    if (!initialItem) {
      const conf = UNIT_CONFIG[newUnit];
      if (conf) {
        setStep(conf.defaultStep);
        setMinThreshold(conf.defaultThreshold);
        setFullStock(conf.defaultFullStock);
        setCurrentStock(conf.defaultFullStock);
      }
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);

    if (val.trim().length >= 2 && !initialItem) {
      const matches = existingItems.filter(i =>
        i.name.toLowerCase().includes(val.toLowerCase().trim())
      );
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (sug) => {
    setName(sug.name);
    setCategory(sug.category);
    setUnitType(sug.unitType);
    setFullStock(sug.fullStock);
    setMinThreshold(sug.minThreshold);
    setStep(sug.step);
    setCurrentStock(sug.fullStock);
    setAutoAdd(sug.autoAdd !== false);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialItem) {
      await db.pantryItems.update(initialItem.id, {
        name: name.trim(),
        category,
        unitType,
        currentStock: Number(currentStock),
        fullStock: Number(fullStock),
        minThreshold: Number(minThreshold),
        step: Number(step),
        autoAdd: autoAdd,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await addPantryItem({
        name,
        category: category || (categories[0]?.name ?? 'Altro'),
        unitType,
        currentStock: Number(currentStock),
        fullStock: Number(fullStock),
        minThreshold: Number(minThreshold),
        step: Number(step),
        autoAdd: autoAdd,
      });
    }

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {initialItem ? 'Modifica Prodotto' : 'Nuovo Prodotto in Dispensa'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Nome Prodotto con Autocomplete */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Nome Prodotto *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              onFocus={() => name.length >= 2 && setSuggestions(existingItems.filter(i => i.name.toLowerCase().includes(name.toLowerCase().trim())))}
              placeholder="es. Latte Intero, Pasta Spaghettoni..."
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            {/* Dropdown Suggerimenti Storico */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Suggeriti dallo storico
                </div>
                {suggestions.map((sug) => (
                  <button
                    key={sug.id}
                    type="button"
                    onClick={() => selectSuggestion(sug)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-750 last:border-none"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">{sug.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{sug.category} ({sug.unitType})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Categoria con Toggle Switch Orizzontale ON-OFF per Auto-Add spesa di fianco */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Categoria *
            </label>
            <div className="flex items-center gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none min-w-0"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
                {categories.length === 0 && <option value="Altro">Altro</option>}
              </select>

              {/* Toggle Switch Orizzontale On-Off */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shrink-0 h-[46px]">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Auto-add
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoAdd}
                  onClick={() => setAutoAdd(!autoAdd)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoAdd ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      autoAdd ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-xs font-extrabold w-6 ${autoAdd ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                  {autoAdd ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>

          {/* Unità di Misura */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Unità di misura *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(UNIT_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleUnitTypeChange(key)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    unitType === key
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantità Corrente & Quantità Piena (Full Stock) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Stock Corrente
              </label>
              <input
                type="number"
                min="0"
                step={step}
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Stock Pieno (Full)
              </label>
              <input
                type="number"
                min="1"
                step={step}
                value={fullStock}
                onChange={(e) => setFullStock(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Soglia Minima & Step di Incremento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Soglia Minima (Auto-add)
              </label>
              <input
                type="number"
                min="0"
                step={step}
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Step Stepper +/-
              </label>
              <input
                type="number"
                min="1"
                value={step}
                onChange={(e) => setStep(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors text-base"
            >
              {initialItem ? 'Salva Modifiche' : 'Aggiungi alla Dispensa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
