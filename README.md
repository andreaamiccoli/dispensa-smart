# 🛒 Dispensa Smart (PWA Client-Side)

**Dispensa Smart** è una Progressive Web App (PWA) 100% client-side progetta per la gestione della dispensa domestica e l'automazione della lista della spesa. Quando la quantità di un prodotto scende sotto una soglia minima impostata, il prodotto viene inserito automaticamente nella lista della spesa.

L'applicazione funziona interamente offline dopo il primo caricamento, non richiede backend o autenticazione ed è pronta per il deployment gratuito su **GitHub Pages**.

---

## 🛠️ Tech Stack & Architettura

- **Frontend Core**: React 19 (scaffolded con Vite)
- **Database Locale**: [Dexie.js](https://dexie.org/) per l'interazione reattiva con **IndexedDB** (`dexie-react-hooks`)
- **PWA & Offline**: Custom Service Worker (`public/sw.js`) con strategia **Cache-First** per l'App Shell + Web App Manifest (`public/manifest.json`)
- **Routing**: `react-router-dom` con `HashRouter` per compatibilità nativa con GitHub Pages (nessun problema di subpath 404)
- **Styling**: Tailwind CSS v4 (mobile-first, touch-friendly con touch target $\ge$ 44x44px)
- **Deployment Target**: GitHub Pages via package `gh-pages`

---

## 🚀 Guida all'Installazione e Sviluppo Locale

### 1. Clonare il repository e installare le dipendenze
```bash
git clone <URL_REPOSITORIO>
cd DISPENSA
npm install
```

### 2. Avviare il server di sviluppo
```bash
npm run dev
```
Apri il browser all'indirizzo [http://localhost:5173](http://localhost:5173).

### 3. Effettuare la Build per Produzione
```bash
npm run build
```
Genera la build ottimizzata nella cartella `dist/`.

---

## 🌐 Deployment su GitHub Pages

Il progetto è preconfigurato per il deploy su GitHub Pages:

1. Assicurati che nel tuo file `package.json` o nel repository remoto Git sia impostato l'URL di destinazione.
2. Esegui il comando di deploy:
```bash
npm run deploy
```
Il comando eseguirà automaticamente `npm run build` e pubblicherà la cartella `dist` nel ramo `gh-pages` del tuo repository.

---

## 📐 Scelte Architetturali & Risoluzione Ambiguità

1. **Gestione Atomica delle Transazioni Dexie (Feature Core A & C)**:
   - Il controllo della soglia minima (`currentStock <= minThreshold`) non è gestito in un `useEffect` React (che causerebbe race condition), ma direttamente all'interno delle transazioni in scrittura di Dexie (`db.transaction('rw', ...)`).
   - Quando uno stock viene ridotto sotto la soglia, l'inserimento con `source: 'auto'` viene eseguito nello stesso ciclo atomico della scrittura DB.
   - Quando un elemento della lista spesa viene completato (`checked: true`), lo stock del prodotto in dispensa viene ripopolato automaticamente usando `fullStock` (se configurato) o sommando la quantità acquistata.

2. **Gestione Offline & Service Worker (PWA)**:
   - `sw.js` utilizza una strategia **Cache First** per l'App Shell (pagine HTML, JavaScript, CSS, Manifest e Icone SVG/PNG).
   - I dati applicativi risiedono esclusivamente in IndexDB gestito da Dexie.js e non passano attraverso la cache del Service Worker.

3. **Gesti Mobile (Swipe)**:
   - È stato implementato un gesture handler leggero e nativo basato su `onTouchStart` / `onTouchMove` / `onTouchEnd` sia nelle card dispensa (swipe-left per decremento rapido dello stock) sia negli elementi della lista spesa (swipe-right per spuntare l'elemento acquistato).

4. **Autocomplete & Backup JSON (Feature D & E)**:
   - L'autocomplete attinge dallo storico dei prodotti in dispensa e suggerisce le configurazioni precedenti (unità, soglie, quantità piena tipica).
   - Nel pannello **Impostazioni**, i pulsanti **Esporta Backup** e **Importa Backup** gestiscono la persistenza ed il ripristino di tutte le tabelle IndexedDB in formato file `.json`.

---

## 📦 Struttura del Progetto

```
src/
├── db/
│   └── database.js          # Inizializzazione Dexie, schema, transazioni atomiche
├── hooks/
│   ├── usePantryItems.js    # Hook live query per la dispensa
│   ├── useShoppingList.js   # Hook live query per la lista spesa
│   ├── useCategories.js     # Hook live query per le categorie
│   └── useThresholdCheck.js # Wrapper helper per azioni stock
├── components/
│   ├── layout/
│   │   ├── BottomNav.jsx    # Navigazione fissa mobile a 2 tab + impostazioni
│   │   └── FAB.jsx          # Floating Action Button
│   ├── pantry/
│   │   ├── PantryList.jsx   # Vista principale dispensa con filtri e ricerca
│   │   ├── PantryCard.jsx   # Card prodotto con stepper +/- inline e badge sotto-soglia
│   │   └── PantryItemForm.jsx # Form aggiunta/modifica con autocomplete
│   ├── shopping/
│   │   ├── ShoppingList.jsx # Lista spesa divisi tra "Da comprare" e "Completati"
│   │   ├── ShoppingListItem.jsx # Item con tag "🔄 auto" o "manual" e touch target grandi
│   │   └── QuickAddInput.jsx # Input rapido con suggerimenti
│   ├── settings/
│   │   └── BackupPanel.jsx  # Export/Import JSON e gestione categorie
│   └── shared/
│       ├── UnitStepper.jsx  # Stepper touch +/- riusabile per unità/g/ml
│       └── CategoryBadge.jsx# Badge colorato categoria
├── utils/
│   └── unitHelpers.js       # Formattatori e step di default per unit/g/ml
├── App.jsx
├── main.jsx
└── sw-register.js           # Registrazione Service Worker
public/
├── manifest.json            # Web App Manifest PWA
├── icons/                   # Icone placeholder 192x192, 512x512 e SVG
└── sw.js                    # Cache-First Service Worker
```
