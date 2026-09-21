import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';
import PantryList from './components/pantry/PantryList';
import ShoppingList from './components/shopping/ShoppingList';
import BackupPanel from './components/settings/BackupPanel';
import { seedInitialData } from './db/database';

export default function App() {
  useEffect(() => {
    // Inizializza le categorie di default al primo avvio se vuote
    seedInitialData();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans antialiased selection:bg-emerald-500 selection:text-white pb-6">
        <main className="max-w-md mx-auto min-h-screen">
          <Routes>
            <Route path="/" element={<PantryList />} />
            <Route path="/lista" element={<ShoppingList />} />
            <Route path="/impostazioni" element={<BackupPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}
