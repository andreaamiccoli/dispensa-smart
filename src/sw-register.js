export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // In Vite, sw.js is located in the public directory
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;
      navigator.serviceWorker
        .register(swUrl)
        .then((reg) => {
          console.log('[PWA] Service Worker registrato con successo. Scope:', reg.scope);
        })
        .catch((err) => {
          console.error('[PWA] Registrazione Service Worker fallita:', err);
        });
    });
  }
}
