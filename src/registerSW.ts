/**
 * Safe Service Worker registration for PWA installation on Android, iOS, and Desktop.
 * Gracefully handles sandboxed iframe environments where SW permissions are denied.
 */
export function registerPWA() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('PWA ServiceWorker registered with scope:', registration.scope);
      })
      .catch((error) => {
        // Sandboxed iframes (like dev preview) deny SW registration; top-level browser tabs on Android succeed.
        console.log('SW registration note:', error?.message || error);
      });
  });
}
