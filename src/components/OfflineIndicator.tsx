import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  cachedAt?: number;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ cachedAt }) => {
  const isOnline = useOnlineStatus();

  if (isOnline && !cachedAt) return null;

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-40 flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500 px-4 py-2.5 text-xs font-semibold text-white shadow-xl shadow-amber-500/20 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4 animate-pulse" />
          <span>Offline Mode — Showing last cached weather snapshot.</span>
        </div>
      </div>
    );
  }

  return null;
};
