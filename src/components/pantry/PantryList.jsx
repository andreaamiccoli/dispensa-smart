import React, { useState } from 'react';
import { Search, PackagePlus, Sparkles, X } from 'lucide-react';
import { usePantryItems } from '../../hooks/usePantryItems';
import { useCategories } from '../../hooks/useCategories';
import PantryCard from './PantryCard';
import PantryItemForm from './PantryItemForm';
import FAB from '../layout/FAB';
import { seedInitialData } from '../../db/database';

export default function PantryList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { items, isLoading } = usePantryItems(searchQuery, selectedCategory);
  const { categories } = useCategories();

  const handleOpenNewForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const getCategoryColor = (catName) => {
    const found = categories.find((c) => c.name === catName);
    return found ? found.colorTag : '#6b7280';
  };

  const toggleSearch = () => {
    if (isSearchOpen) {
      setSearchQuery('');
      setSelectedCategory('ALL');
    }
    setIsSearchOpen((prev) => !prev);
  };

  // Raggruppamento per macrocategorie
  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'Altro';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-4">
      {/* Header con Titolo a sinistra e Lente di ingrandimento in alto a destra */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Dispensa
        </h1>

        <button
          type="button"
          onClick={toggleSearch}
          aria-label={isSearchOpen ? 'Chiudi ricerca' : 'Apri ricerca'}
          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
            isSearchOpen
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
          }`}
        >
          {isSearchOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Search className="w-5 h-5 stroke-[2.5]" />}
        </button>
      </div>

      {/* Barra di Ricerca e Categorie visualizzate solo se la lente è premuta */}
      {isSearchOpen && (
        <div className="mb-5 space-y-3 bg-white dark:bg-gray-850 p-3.5 rounded-2xl border border-gray-200 dark:border-gray-750 shadow-xs animate-in fade-in duration-200">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca in dispensa..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filtri Categoria a Scorrimento Orizzontale */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Tutti ({items.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat.name
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.colorTag }}
                />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Item List raggruppata per Macrocategorie in Griglia da 2 elementi in orizzontale */}
      {isLoading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Caricamento dispensa...</div>
      ) : items.length === 0 ? (
        <div className="py-12 px-4 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 my-4">
          <PackagePlus className="w-12 h-12 mx-auto text-gray-400 mb-3 stroke-1" />
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base mb-1">
            La dispensa è vuota
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-4">
            Non ci sono prodotti presenti. Aggiungi il tuo primo prodotto!
          </p>
          <div className="flex flex-col gap-2 max-w-xs mx-auto">
            <button
              onClick={handleOpenNewForm}
              className="py-2.5 px-4 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Aggiungi Prodotto
            </button>
            <button
              onClick={() => seedInitialData()}
              className="py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Carica Dati Esempio
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([catName, catItems]) => (
            <div key={catName} className="space-y-2.5">
              {/* Titolo Macrocategoria */}
              <div className="flex items-center gap-2 px-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(catName) }}
                />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {catName} <span className="text-xs text-gray-400 font-normal">({catItems.length})</span>
                </h2>
              </div>

              {/* Griglia da 2 elementi per riga */}
              <div className="grid grid-cols-2 gap-3">
                {catItems.map((item) => (
                  <PantryCard
                    key={item.id}
                    item={item}
                    categoryColor={getCategoryColor(item.category)}
                    onEdit={handleEditItem}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB per aggiunta rapida */}
      <FAB onClick={handleOpenNewForm} />

      {/* Form Modal */}
      {isFormOpen && (
        <PantryItemForm
          initialItem={editingItem}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
