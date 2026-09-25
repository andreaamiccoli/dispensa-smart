import Dexie from 'dexie';

export const db = new Dexie('DispensaSmartDB');

db.version(1).stores({
  pantryItems: '++id, name, category, unitType, currentStock, minThreshold, createdAt',
  shoppingList: '++id, pantryItemId, name, checked, source, addedAt',
  categories: '++id, &name, order',
});

/**
 * Aggiorna atomicamente lo stock di un prodotto in dispensa e gestisce l'auto-add
 * alla lista della spesa se currentStock <= minThreshold.
 */
export async function updatePantryStock(id, newStock) {
  return db.transaction('rw', db.pantryItems, db.shoppingList, async () => {
    const item = await db.pantryItems.get(id);
    if (!item) return;

    const sanitizedStock = Math.max(0, Number(newStock));
    const now = new Date().toISOString();

    await db.pantryItems.update(id, {
      currentStock: sanitizedStock,
      updatedAt: now,
    });

    // Controllo soglia atomico nella transazione (se autoAdd non è disabilitato)
    if (item.autoAdd !== false && sanitizedStock <= item.minThreshold) {
      // Verifica se esiste già un item attivo nella lista della spesa per questo prodotto
      const existingActiveShoppingItem = await db.shoppingList
        .where('pantryItemId')
        .equals(id)
        .filter((si) => !si.checked)
        .first();

      if (!existingActiveShoppingItem) {
        // Calcola la quantità da acquistare (differenza rispetto a fullStock o default step)
        const quantityToBuy = Math.max(
          1,
          (item.fullStock || item.minThreshold || 1) - sanitizedStock
        );

        await db.shoppingList.add({
          pantryItemId: item.id,
          name: item.name,
          unitType: item.unitType,
          quantity: quantityToBuy,
          checked: false,
          addedAt: now,
          source: 'auto',
        });
      }
    }
  });
}

/**
 * Incrementa o decrementa lo stock corrente di un delta (es. +step o -step)
 */
export async function adjustPantryStock(id, delta) {
  return db.transaction('rw', db.pantryItems, db.shoppingList, async () => {
    const item = await db.pantryItems.get(id);
    if (!item) return;
    const targetStock = item.currentStock + delta;
    await updatePantryStock(id, targetStock);
  });
}

/**
 * Check/Uncheck di un elemento della lista spesa.
 * Se viene checkato e ha un pantryItemId collegato, aggiorna/ripopola lo stock della dispensa.
 */
export async function toggleShoppingItem(shoppingItemId, isChecked) {
  return db.transaction('rw', db.pantryItems, db.shoppingList, async () => {
    const sItem = await db.shoppingList.get(shoppingItemId);
    if (!sItem) return;

    await db.shoppingList.update(shoppingItemId, { checked: isChecked });

    // Se spuntato (completato) e collegato a un elemento in dispensa
    if (isChecked && sItem.pantryItemId) {
      const pItem = await db.pantryItems.get(sItem.pantryItemId);
      if (pItem) {
        // Usa fullStock se configurato, altrimenti somma la quantità acquistata
        const newStock = pItem.fullStock && pItem.fullStock > 0
          ? pItem.fullStock
          : pItem.currentStock + sItem.quantity;

        const now = new Date().toISOString();
        await db.pantryItems.update(pItem.id, {
          currentStock: newStock,
          updatedAt: now,
        });
      }
    }
  });
}

/**
 * Aggiunge un prodotto in dispensa ed esegue subito il controllo soglia atomico
 */
export async function addPantryItem(itemData) {
  return db.transaction('rw', db.pantryItems, db.shoppingList, async () => {
    const now = new Date().toISOString();
    const newItem = {
      name: itemData.name.trim(),
      category: itemData.category || 'Altro',
      unitType: itemData.unitType || 'unit',
      currentStock: Number(itemData.currentStock ?? 0),
      fullStock: Number(itemData.fullStock ?? itemData.currentStock ?? 1),
      minThreshold: Number(itemData.minThreshold ?? 1),
      step: Number(itemData.step ?? 1),
      autoAdd: itemData.autoAdd !== false,
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.pantryItems.add(newItem);

    // Esegui controllo soglia immediato se autoAdd è attivo
    if (newItem.autoAdd !== false && newItem.currentStock <= newItem.minThreshold) {
      const quantityToBuy = Math.max(1, newItem.fullStock - newItem.currentStock);
      await db.shoppingList.add({
        pantryItemId: id,
        name: newItem.name,
        unitType: newItem.unitType,
        quantity: quantityToBuy,
        checked: false,
        addedAt: now,
        source: 'auto',
      });
    }

    return id;
  });
}

/**
 * Aggiunge un elemento manuale alla lista della spesa
 */
export async function addShoppingItem(itemData) {
  const now = new Date().toISOString();
  return db.shoppingList.add({
    pantryItemId: itemData.pantryItemId || null,
    name: itemData.name.trim(),
    unitType: itemData.unitType || 'unit',
    quantity: Number(itemData.quantity || 1),
    checked: false,
    addedAt: now,
    source: itemData.source || 'manual',
  });
}

/**
 * Elimina gli elementi spuntati/completati dalla lista spesa
 */
export async function clearCompletedShoppingItems() {
  const completedIds = await db.shoppingList
    .filter((item) => !!item.checked)
    .primaryKeys();
  return db.shoppingList.bulkDelete(completedIds);
}

/**
 * Dati di esempio (Seed) per dev e test rapido
 */
export async function seedInitialData() {
  const countCat = await db.categories.count();
  if (countCat === 0) {
    await db.categories.bulkAdd([
      { name: 'Freschi & Latticini', colorTag: '#3b82f6', order: 1 },
      { name: 'Colazione & Dolci', colorTag: '#f59e0b', order: 2 },
      { name: 'Pasta & Riso', colorTag: '#ef4444', order: 3 },
      { name: 'Bevande', colorTag: '#10b981', order: 4 },
      { name: 'Igiene & Casa', colorTag: '#8b5cf6', order: 5 },
      { name: 'Altro', colorTag: '#6b7280', order: 99 },
    ]);
  }

  const countPantry = await db.pantryItems.count();
  if (countPantry === 0) {
    await addPantryItem({
      name: 'Latte Intero',
      category: 'Freschi & Latticini',
      unitType: 'ml',
      currentStock: 500,
      fullStock: 2000,
      minThreshold: 1000,
      step: 250,
    });

    await addPantryItem({
      name: 'Pasta Barilla Spaghettoni',
      category: 'Pasta & Riso',
      unitType: 'g',
      currentStock: 1500,
      fullStock: 2000,
      minThreshold: 500,
      step: 500,
    });

    await addPantryItem({
      name: 'Uova Fresche',
      category: 'Freschi & Latticini',
      unitType: 'unit',
      currentStock: 2,
      fullStock: 6,
      minThreshold: 3,
      step: 1,
    });

    await addPantryItem({
      name: 'Caffè in Polvere',
      category: 'Colazione & Dolci',
      unitType: 'g',
      currentStock: 250,
      fullStock: 500,
      minThreshold: 100,
      step: 250,
    });
  }
}
