import Dexie from 'dexie';

export const db = new Dexie('DispensaSmartDB');

db.version(1).stores({
  pantryItems: '++id, name, category, unitType, currentStock, minThreshold, createdAt',
  shoppingList: '++id, pantryItemId, name, checked, source, addedAt',
  categories: '++id, &name, order',
});

// Schema v2 per supporto sotto-cartelle nidificate
db.version(2).stores({
  pantryItems: '++id, name, category, subFolderId, unitType, currentStock, minThreshold, createdAt',
  shoppingList: '++id, pantryItemId, name, checked, source, addedAt',
  categories: '++id, &name, order',
  subFolders: '++id, name, category, parentSubFolderId, createdAt',
});

/**
 * Aggiorna atomicamente lo stock di un prodotto in dispensa e gestisce l'auto-add
 * o l'auto-remove dalla lista della spesa.
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

    const existingActiveShoppingItem = await db.shoppingList
      .where('pantryItemId')
      .equals(id)
      .filter((si) => !si.checked && si.source === 'auto')
      .first();

    // Controllo soglia atomico nella transazione (se autoAdd non è disabilitato)
    if (item.autoAdd !== false && sanitizedStock <= item.minThreshold) {
      const quantityToBuy = Math.max(
        1,
        (item.fullStock || item.minThreshold || 1) - sanitizedStock
      );

      if (!existingActiveShoppingItem) {
        await db.shoppingList.add({
          pantryItemId: item.id,
          name: item.name,
          unitType: item.unitType,
          quantity: quantityToBuy,
          checked: false,
          addedAt: now,
          source: 'auto',
        });
      } else {
        await db.shoppingList.update(existingActiveShoppingItem.id, {
          quantity: quantityToBuy,
          name: item.name,
          unitType: item.unitType,
        });
      }
    } else {
      if (existingActiveShoppingItem) {
        await db.shoppingList.delete(existingActiveShoppingItem.id);
      }
    }
  });
}

/**
 * Incrementa o decrementa lo stock corrente di un delta
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
 * Elimina un prodotto dalla dispensa e rimuove automaticamente gli elementi correlati nella lista spesa.
 */
export async function deletePantryItem(id) {
  return db.transaction('rw', db.pantryItems, db.shoppingList, async () => {
    await db.pantryItems.delete(id);
    const relatedShoppingItems = await db.shoppingList
      .where('pantryItemId')
      .equals(id)
      .filter((si) => !si.checked)
      .primaryKeys();

    if (relatedShoppingItems.length > 0) {
      await db.shoppingList.bulkDelete(relatedShoppingItems);
    }
  });
}

/**
 * Check/Uncheck di un elemento della lista spesa.
 */
export async function toggleShoppingItem(shoppingItemId, isChecked) {
  return db.transaction('rw', db.pantryItems, db.shoppingList, async () => {
    const sItem = await db.shoppingList.get(shoppingItemId);
    if (!sItem) return;

    await db.shoppingList.update(shoppingItemId, { checked: isChecked });

    if (isChecked && sItem.pantryItemId) {
      const pItem = await db.pantryItems.get(sItem.pantryItemId);
      if (pItem) {
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
 * Aggiunge un nuovo prodotto in dispensa
 */
export async function addPantryItem(itemData) {
  return db.transaction('rw', db.pantryItems, db.shoppingList, async () => {
    const now = new Date().toISOString();
    const newItem = {
      name: itemData.name.trim(),
      category: itemData.category || 'Altro',
      subFolderId: itemData.subFolderId ? Number(itemData.subFolderId) : null,
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
 * Aggiorna i dettagli di un prodotto in dispensa
 */
export async function updatePantryItemDetails(id, itemData) {
  return db.transaction('rw', db.pantryItems, db.shoppingList, async () => {
    const now = new Date().toISOString();
    const updatedFields = {
      name: itemData.name.trim(),
      category: itemData.category,
      subFolderId: itemData.subFolderId ? Number(itemData.subFolderId) : null,
      unitType: itemData.unitType,
      currentStock: Number(itemData.currentStock),
      fullStock: Number(itemData.fullStock),
      minThreshold: Number(itemData.minThreshold),
      step: Number(itemData.step),
      autoAdd: itemData.autoAdd !== false,
      updatedAt: now,
    };

    await db.pantryItems.update(id, updatedFields);
    await updatePantryStock(id, updatedFields.currentStock);
  });
}

/**
 * Gestione Sotto-cartelle (subFolders)
 */
export async function addSubFolder({ name, category, parentSubFolderId = null }) {
  const now = new Date().toISOString();
  return db.subFolders.add({
    name: name.trim(),
    category: category || 'Altro',
    parentSubFolderId: parentSubFolderId ? Number(parentSubFolderId) : null,
    createdAt: now,
  });
}

export async function updateSubFolder(id, { name }) {
  return db.subFolders.update(id, { name: name.trim() });
}

export async function deleteSubFolder(id) {
  return db.transaction('rw', db.pantryItems, db.shoppingList, db.subFolders, async () => {
    // Trova tutte le sotto-cartelle figlie ed eliminale ricorsivamente
    const childFolders = await db.subFolders.where('parentSubFolderId').equals(id).toArray();
    for (const child of childFolders) {
      await deleteSubFolder(child.id);
    }

    // Trova i prodotti contenuti in questa cartella ed eliminali (o scollega)
    const itemsInFolder = await db.pantryItems.where('subFolderId').equals(id).toArray();
    for (const item of itemsInFolder) {
      await deletePantryItem(item.id);
    }

    await db.subFolders.delete(id);
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
      { name: 'Carne', colorTag: '#ef4444', order: 1 },
      { name: 'Freschi & Latticini', colorTag: '#3b82f6', order: 2 },
      { name: 'Colazione & Dolci', colorTag: '#f59e0b', order: 3 },
      { name: 'Pasta & Riso', colorTag: '#10b981', order: 4 },
      { name: 'Bevande', colorTag: '#06b6d4', order: 5 },
      { name: 'Igiene & Casa', colorTag: '#8b5cf6', order: 6 },
      { name: 'Altro', colorTag: '#6b7280', order: 99 },
    ]);
  }

  const countPantry = await db.pantryItems.count();
  if (countPantry === 0) {
    // Esempio dell'utente:
    // Carne -> Pollo (sotto-cartella) -> Alette di pollo, Cotolette
    // Carne -> Coscia di maiale, Hamburger di manzo
    const polloFolderId = await addSubFolder({
      name: 'Pollo',
      category: 'Carne',
      parentSubFolderId: null,
    });

    await addPantryItem({
      name: 'Alette di pollo',
      category: 'Carne',
      subFolderId: polloFolderId,
      unitType: 'unit',
      currentStock: 6,
      fullStock: 12,
      minThreshold: 4,
      step: 2,
    });

    await addPantryItem({
      name: 'Cotolette di pollo',
      category: 'Carne',
      subFolderId: polloFolderId,
      unitType: 'unit',
      currentStock: 2,
      fullStock: 4,
      minThreshold: 2,
      step: 1,
    });

    await addPantryItem({
      name: 'Coscia di maiale',
      category: 'Carne',
      subFolderId: null,
      unitType: 'unit',
      currentStock: 1,
      fullStock: 3,
      minThreshold: 1,
      step: 1,
    });

    await addPantryItem({
      name: 'Hamburger di manzo',
      category: 'Carne',
      subFolderId: null,
      unitType: 'unit',
      currentStock: 4,
      fullStock: 6,
      minThreshold: 2,
      step: 2,
    });

    await addPantryItem({
      name: 'Latte Intero',
      category: 'Freschi & Latticini',
      unitType: 'ml',
      currentStock: 500,
      fullStock: 2000,
      minThreshold: 1000,
      step: 250,
    });
  }
}
