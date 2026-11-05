import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, MoreVertical, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-orange-700 active:scale-95 transition"
        title="Install Heat Index App"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Install App</span>
      </button>

      {/* Guide Modal for iOS, Android, and Desktop */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-orange-100 p-1.5 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                  <Smartphone className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Install Heat Index
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isIOS ? (
              /* iOS Safari Instructions */
              <div className="mt-4 space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Install on iPhone / iPad (Safari):
                </p>
                <div className="flex items-start gap-2.5">
                  <div className="rounded-lg bg-orange-100 p-1.5 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 shrink-0">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <p className="mt-0.5">
                    1. Tap the <strong>Share</strong> button in the bottom Safari toolbar.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="rounded-lg bg-orange-100 p-1.5 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 shrink-0">
                    <PlusSquare className="h-4 w-4" />
                  </div>
                  <p className="mt-0.5">
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>
            ) : (
              /* Android & Chrome Instructions */
              <div className="mt-4 space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Install on Android (Google Chrome):
                </p>
                <div className="flex items-start gap-2.5">
                  <div className="rounded-lg bg-orange-100 p-1.5 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </div>
                  <p className="mt-0.5">
                    1. Tap the <strong>three dots (⋮)</strong> menu in the top right corner of Chrome.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="rounded-lg bg-orange-100 p-1.5 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 shrink-0">
                    <Download className="h-4 w-4" />
                  </div>
                  <p className="mt-0.5">
                    2. Tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>).
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-2.5 text-[11px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-400">
                  <strong>Note on Dev Preview:</strong> The private AI Studio dev URL is behind Google authentication. For the full standalone Android APK, sync and open your live <strong>GitHub Pages</strong> URL.
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-orange-600 py-2.5 text-xs font-semibold text-white hover:bg-orange-700 transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
