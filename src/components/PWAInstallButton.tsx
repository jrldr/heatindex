import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-orange-700 active:scale-95 transition"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 transition"
        >
          <Download className="h-3.5 w-3.5 text-orange-500" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-full p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="flex items-start gap-2.5">
                  <div className="rounded-lg bg-orange-100 p-1.5 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <p className="mt-0.5">
                    1. Tap the <strong>Share</strong> icon in the bottom Safari toolbar.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="rounded-lg bg-orange-100 p-1.5 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                    <PlusSquare className="h-4 w-4" />
                  </div>
                  <p className="mt-0.5">
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>

                <p className="text-[11px] text-neutral-400 pt-1">
                  Once installed, Heat Index works full screen with offline support like a native app.
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-orange-600 py-2.5 text-xs font-semibold text-white hover:bg-orange-700 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
