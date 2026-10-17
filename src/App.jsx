import React, { useEffect, useState, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';
import PantryList from './components/pantry/PantryList';
import ShoppingList from './components/shopping/ShoppingList';
import BackupPanel from './components/settings/BackupPanel';
import ShareCodeModal from './components/settings/ShareCodeModal';
import { seedInitialData } from './db/database';
import {
  getSavedShareCode,
  initFirestoreSync,
} from './db/syncService';

// Badge di stato sincronizzazione
function SyncBadge({ status }) {
  if (!status || status === 'idle') return null;

  const config = {
    syncing:   { emoji: '🔄', label: 'Sincronizzazione…', cls: 'bg-blue-900/80 text-blue-200 border-blue-700' },
    creating:  { emoji: '☁️', label: 'Creazione stanza…',  cls: 'bg-indigo-900/80 text-indigo-200 border-indigo-700' },
    updating:  { emoji: '🔄', label: 'Aggiornamento…',     cls: 'bg-yellow-900/80 text-yellow-200 border-yellow-700' },
    synced:    { emoji: '✅', label: 'Sincronizzato',       cls: 'bg-emerald-900/80 text-emerald-200 border-emerald-700' },
    error:     { emoji: '⚠️', label: 'Errore sync',         cls: 'bg-red-900/80 text-red-200 border-red-700' },
    offline:   { emoji: '📡', label: 'Offline',             cls: 'bg-gray-800/90 text-gray-300 border-gray-600' },
  };

  const { emoji, label, cls } = config[status] ?? config.syncing;

  return (
    <div
      className={`fixed top-3 right-3 z-50 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-lg backdrop-blur-sm transition-all ${cls}`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  );
}

export default function App() {
  const [shareCode, setShareCode] = useState(() => getSavedShareCode());
  const [syncStatus, setSyncStatus] = useState('idle');
  const unsubRef = useRef(null);

  // Avvia/riavvia il listener Firestore quando cambia il codice
  useEffect(() => {
    if (!shareCode) return;

    // Cancella eventuale listener precedente
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    setSyncStatus('syncing');
    unsubRef.current = initFirestoreSync(shareCode, (status) => {
      setSyncStatus(status);
      // Dopo 3 s, nascondi il badge "synced" per non intasare lo schermo
      if (status === 'synced') {
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    });

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [shareCode]);

  useEffect(() => {
    // Inizializza le categorie di default al primo avvio se vuote
    seedInitialData();

    // Applica lo zoom del testo salvato nelle impostazioni
    const savedZoom = localStorage.getItem('dispensa_font_zoom') || '100';
    document.documentElement.style.fontSize = `${savedZoom}%`;
  }, []);

  // Mostra il modal di accesso se non è stato ancora impostato un codice
  if (!shareCode) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <ShareCodeModal
          onCodeSet={(code) => setShareCode(code)}
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans antialiased selection:bg-emerald-500 selection:text-white pb-6">
        <SyncBadge status={syncStatus} />
        <main className="max-w-md mx-auto min-h-screen">
          <Routes>
            <Route path="/" element={<PantryList />} />
            <Route path="/lista" element={<ShoppingList />} />
            <Route
              path="/impostazioni"
              element={
                <BackupPanel
                  shareCode={shareCode}
                  onChangeCode={(code) => setShareCode(code)}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}
