import React, { useState } from 'react';
import { Search, PackagePlus, Sparkles, X, ArrowLeft, FolderPlus, Plus, ChevronRight } from 'lucide-react';
import { usePantryItems } from '../../hooks/usePantryItems';
import { useCategories } from '../../hooks/useCategories';
import { useSubFolders } from '../../hooks/useSubFolders';
import PantryCard from './PantryCard';
import CategoryCard from './CategoryCard';
import SubFolderCard from './SubFolderCard';
import PantryItemForm from './PantryItemForm';
import SubFolderForm from './SubFolderForm';
import FAB from '../layout/FAB';
import { seedInitialData } from '../../db/database';

export default function PantryList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Stato navigazione nidificata: activeCategory (null = home), activeSubFolder (null o oggetto {id, name})
  const [activeCategory, setActiveCategory] = useState(null);
  const [subFolderStack, setSubFolderStack] = useState([]); // array di oggetti cartella per breadcrumb

  const currentSubFolder = subFolderStack.length > 0 ? subFolderStack[subFolderStack.length - 1] : null;

  // Form Modals
  const [editingItem, setEditingItem] = useState(null);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isFolderFormOpen, setIsFolderFormOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  const { items, isLoading: isItemsLoading } = usePantryItems(searchQuery, activeCategory?.name || '');
  const { categories, isLoading: isCatLoading } = useCategories();
  const { subFolders } = useSubFolders(activeCategory?.name || null, currentSubFolder?.id || null);

  // Filtra i prodotti per il livello corrente se non stiamo cercando
  const currentLevelItems = searchQuery.trim()
    ? items
    : items.filter((item) => {
        if (!activeCategory) return false;
        if (item.category !== activeCategory.name) return false;
        if (currentSubFolder) {
          return Number(item.subFolderId) === Number(currentSubFolder.id);
        } else {
          return !item.subFolderId; // Solo prodotti nella radice della categoria
        }
      });

  const handleOpenCategory = (cat) => {
    setActiveCategory(cat);
    setSubFolderStack([]);
  };

  const handleEnterSubFolder = (folder) => {
    setSubFolderStack((prev) => [...prev, folder]);
  };

  const handleNavigateBack = () => {
    if (subFolderStack.length > 0) {
      setSubFolderStack((prev) => prev.slice(0, prev.length - 1));
    } else if (activeCategory) {
      setActiveCategory(null);
    }
  };

  const handleOpenNewItemForm = () => {
    setEditingItem(null);
    setIsFabMenuOpen(false);
    setIsItemFormOpen(true);
  };

  const handleOpenNewFolderForm = () => {
    setIsFabMenuOpen(false);
    setIsFolderFormOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsItemFormOpen(true);
  };

  const getCategoryColor = (catName) => {
    const found = categories.find((c) => c.name === catName);
    return found ? found.colorTag : '#6b7280';
  };

  const toggleSearch = () => {
    if (isSearchOpen) {
      setSearchQuery('');
    }
    setIsSearchOpen((prev) => !prev);
  };

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-4">
      {/* Header principale con Pulsante Indietro e Lente di Ingrandimento */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {(activeCategory || subFolderStack.length > 0) && (
            <button
              type="button"
              onClick={handleNavigateBack}
              className="p-2 -ml-1 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors shrink-0"
              aria-label="Torna indietro"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight truncate">
            {currentSubFolder
              ? currentSubFolder.name
              : activeCategory
              ? activeCategory.name
              : 'Dispensa'}
          </h1>
        </div>

        <button
          type="button"
          onClick={toggleSearch}
          aria-label={isSearchOpen ? 'Chiudi ricerca' : 'Apri ricerca'}
          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all shrink-0 ${
            isSearchOpen
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
          }`}
        >
          {isSearchOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Search className="w-5 h-5 stroke-[2.5]" />}
        </button>
      </div>

      {/* Breadcrumb del percorso corrente */}
      {(activeCategory || subFolderStack.length > 0) && !isSearchOpen && (
        <div className="flex items-center gap-1 mb-4 text-xs font-bold text-gray-500 dark:text-gray-400 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setActiveCategory(null);
              setSubFolderStack([]);
            }}
            className="hover:underline hover:text-emerald-600"
          >
            Dispensa
          </button>
          {activeCategory && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
              <button
                type="button"
                onClick={() => setSubFolderStack([])}
                className="hover:underline hover:text-emerald-600 truncate"
              >
                {activeCategory.name}
              </button>
            </>
          )}
          {subFolderStack.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
              <button
                type="button"
                onClick={() => setSubFolderStack((prev) => prev.slice(0, index + 1))}
                className={`truncate ${
                  index === subFolderStack.length - 1 ? 'text-emerald-600 dark:text-emerald-400' : 'hover:underline'
                }`}
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Input Ricerca */}
      {isSearchOpen && (
        <div className="mb-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca in tutta la dispensa..."
            autoFocus
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white shadow-xs"
          />
        </div>
      )}

      {/* --- LIVELLO 0: GRIGLIA MACRO CATEGORIE CON EFFETTO LED --- */}
      {!activeCategory && !searchQuery.trim() ? (
        <div className="space-y-3">
          <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1">
            Seleziona Categoria
          </p>
          <div className="grid grid-cols-2 gap-3.5">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onClick={() => handleOpenCategory(cat)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* --- LIVELLO 1 / 2: GRIGLIA SOTTO-CARTELLE ED ELEMENTI --- */
        <div className="space-y-4">
          {/* Se non ci sono cartelle né prodotti */}
          {subFolders.length === 0 && currentLevelItems.length === 0 ? (
            <div className="py-12 px-4 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 my-4">
              <PackagePlus className="w-12 h-12 mx-auto text-gray-400 mb-3 stroke-1" />
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base mb-1">
                Cartella o Categoria vuota
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-4">
                Aggiungi un nuovo prodotto o crea una sotto-cartella personalizzata!
              </p>
              <div className="flex flex-col gap-2 max-w-xs mx-auto">
                <button
                  onClick={handleOpenNewItemForm}
                  className="py-2.5 px-4 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Aggiungi Prodotto
                </button>
                <button
                  onClick={handleOpenNewFolderForm}
                  className="py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FolderPlus className="w-4 h-4 text-emerald-600" /> Nuova Sotto-Cartella
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {/* Sotto-cartelle (renderizzate per prime nella griglia) */}
              {subFolders.map((folder) => (
                <SubFolderCard
                  key={folder.id}
                  folder={folder}
                  categoryColor={getCategoryColor(folder.category)}
                  onClick={() => handleEnterSubFolder(folder)}
                />
              ))}

              {/* Prodotti alimentari */}
              {currentLevelItems.map((item) => (
                <PantryCard
                  key={item.id}
                  item={item}
                  categoryColor={getCategoryColor(item.category)}
                  onEdit={handleEditItem}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAB Menu per scelta (Prodotto o Cartella) se in una categoria */}
      {isFabMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex items-end justify-end p-4 pb-24">
          <div className="flex flex-col items-end gap-2 max-w-xs w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
            {activeCategory && (
              <button
                type="button"
                onClick={handleOpenNewFolderForm}
                className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full justify-between hover:bg-gray-50"
              >
                <span>Crea Sotto-Cartella</span>
                <FolderPlus className="w-5 h-5 text-emerald-600" />
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenNewItemForm}
              className="flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl border border-emerald-500 w-full justify-between hover:bg-emerald-700"
            >
              <span>Aggiungi Prodotto</span>
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* FAB Bottone (+) */}
      <FAB onClick={() => setIsFabMenuOpen(!isFabMenuOpen)} />

      {/* Modal Form Prodotto */}
      {isItemFormOpen && (
        <PantryItemForm
          initialItem={editingItem}
          defaultCategory={activeCategory?.name || ''}
          defaultSubFolderId={currentSubFolder?.id || null}
          onClose={() => setIsItemFormOpen(false)}
        />
      )}

      {/* Modal Form Sotto-Cartella */}
      {isFolderFormOpen && (
        <SubFolderForm
          defaultCategory={activeCategory?.name || 'Altro'}
          parentSubFolderId={currentSubFolder?.id || null}
          onClose={() => setIsFolderFormOpen(false)}
        />
      )}
    </div>
  );
}
