export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;
      navigator.serviceWorker
        .register(swUrl)
        .then((reg) => {
          console.log('[PWA] Service Worker registrato con successo. Scope:', reg.scope);
          // Forza il controllo degli aggiornamenti ad ogni caricamento
          reg.update();
        })
        .catch((err) => {
          console.error('[PWA] Registrazione Service Worker fallita:', err);
        });
    });
  }
}
