/**
 * Safe Service Worker registration for PWA installation on Android, iOS, and Desktop.
 * Gracefully handles sandboxed iframe environments where SW permissions are denied.
 */
export function registerPWA() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    const baseUrl = import.meta.env.BASE_URL || './';
    const swPath = `${baseUrl.replace(/\/$/, '')}/sw.js`;

    navigator.serviceWorker
      .register(swPath)
      .then((registration) => {
        console.log('PWA ServiceWorker registered with scope:', registration.scope);
      })
      .catch((error) => {
        // Sandboxed iframes (like dev preview) deny SW registration; top-level browser tabs on Android succeed.
        console.log('SW registration note:', error?.message || error);
      });
  });
}
