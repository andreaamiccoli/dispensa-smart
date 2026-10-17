import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { db } from './database';

const CODE_KEY = 'dispensa_share_code';

export function getSavedShareCode() {
  return localStorage.getItem(CODE_KEY) || '';
}

export function saveShareCode(code) {
  const sanitized = code.trim().toUpperCase();
  localStorage.setItem(CODE_KEY, sanitized);
  return sanitized;
}

export function removeShareCode() {
  localStorage.removeItem(CODE_KEY);
}

// Flag per evitare loop di sincronizzazione tra listener Firestore e salvataggi locali
let isRemoteUpdating = false;

/**
 * Invia l'intero stato locale a Firestore per il codice stanza specificato
 */
export async function pushLocalDataToCloud(roomCode = getSavedShareCode()) {
  if (!roomCode || isRemoteUpdating) return;
  try {
    const [pantryItems, shoppingList, categories, subFolders] = await Promise.all([
      db.pantryItems.toArray(),
      db.shoppingList.toArray(),
      db.categories.toArray(),
      db.subFolders.toArray(),
    ]);

    const roomRef = doc(firestore, 'dispense', roomCode);
    await setDoc(
      roomRef,
      {
        pantryItems,
        shoppingList,
        categories,
        subFolders,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('[Firebase Sync] Errore upload:', err);
  }
}

/**
 * Inizializza l'ascolto in tempo reale da Firestore per il codice stanza
 */
export function initFirestoreSync(roomCode, onSyncStatusChange) {
  if (!roomCode) return () => {};

  const roomRef = doc(firestore, 'dispense', roomCode);

  const unsubscribe = onSnapshot(
    roomRef,
    async (snapshot) => {
      if (!snapshot.exists()) {
        // La stanza non esiste ancora in remoto, carichiamo lo stato locale attuale
        if (onSyncStatusChange) onSyncStatusChange('creating');
        await pushLocalDataToCloud(roomCode);
        if (onSyncStatusChange) onSyncStatusChange('synced');
        return;
      }

      const remoteData = snapshot.data();
      if (!remoteData) return;

      isRemoteUpdating = true;
      try {
        if (onSyncStatusChange) onSyncStatusChange('updating');

        await db.transaction('rw', db.pantryItems, db.shoppingList, db.categories, db.subFolders, async () => {
          if (Array.isArray(remoteData.categories)) {
            await db.categories.clear();
            await db.categories.bulkPut(remoteData.categories);
          }
          if (Array.isArray(remoteData.subFolders)) {
            await db.subFolders.clear();
            await db.subFolders.bulkPut(remoteData.subFolders);
          }
          if (Array.isArray(remoteData.pantryItems)) {
            await db.pantryItems.clear();
            await db.pantryItems.bulkPut(remoteData.pantryItems);
          }
          if (Array.isArray(remoteData.shoppingList)) {
            await db.shoppingList.clear();
            await db.shoppingList.bulkPut(remoteData.shoppingList);
          }
        });

        if (onSyncStatusChange) onSyncStatusChange('synced');
      } catch (err) {
        console.error('[Firebase Sync] Errore applicazione dati remoti:', err);
        if (onSyncStatusChange) onSyncStatusChange('error');
      } finally {
        setTimeout(() => {
          isRemoteUpdating = false;
        }, 300);
      }
    },
    (error) => {
      console.error('[Firebase Sync] Errore listener Firestore:', error);
      if (onSyncStatusChange) onSyncStatusChange('error');
    }
  );

  return unsubscribe;
}
