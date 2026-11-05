import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, ShieldCheck, X, AlertTriangle, Send } from 'lucide-react';
import { NotificationSettings } from '../types/heat';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  sendTestNotification,
  isNotificationSupported,
} from '../services/notificationService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  currentHeatIndex: number;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  locationName,
  currentHeatIndex,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  const handleEnableToggle = async () => {
    if (!settings.enabled) {
      setIsRequesting(true);
      const perm = await requestNotificationPermission();
      setPermission(perm);
      setIsRequesting(false);

      if (perm === 'granted') {
        const updated = { ...settings, enabled: true };
        setSettings(updated);
        saveNotificationSettings(updated);
      }
    } else {
      const updated = { ...settings, enabled: false };
      setSettings(updated);
      saveNotificationSettings(updated);
    }
  };

  const handleThresholdChange = (val: number) => {
    const updated = { ...settings, heatThreshold: val };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleSevereWeatherToggle = () => {
    const updated = { ...settings, severeWeather: !settings.severeWeather };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleTriggerTest = async () => {
    setTestSent(true);
    await sendTestNotification(locationName, currentHeatIndex);
    setTimeout(() => setTestSent(false), 3000);
  };

  if (!isOpen) return null;

  const supported = isNotificationSupported();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-orange-100 p-2 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Severe Weather &amp; Heat Alerts
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Push notifications for {locationName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!supported ? (
          <div className="my-4 rounded-xl bg-amber-50 p-4 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            Push notifications are not supported in this browser environment.
          </div>
        ) : (
          <div className="my-4 space-y-4 text-sm">
            {/* Status & Master Switch */}
            <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3.5 border border-neutral-200/80 dark:bg-neutral-800/40 dark:border-neutral-800">
              <div>
                <div className="font-semibold text-neutral-900 dark:text-white">
                  Real-Time Weather Alerts
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {permission === 'granted'
                    ? 'Notifications are permitted'
                    : permission === 'denied'
                    ? 'Notifications blocked in browser'
                    : 'Requires permission prompt'}
                </div>
              </div>

              <button
                onClick={handleEnableToggle}
                disabled={isRequesting}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.enabled && permission === 'granted'
                    ? 'bg-orange-600'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings.enabled && permission === 'granted'
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {permission === 'denied' && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Notifications are blocked. Click the lock/tune icon beside your address bar to allow notifications for this site.
              </div>
            )}

            {/* Threshold Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Heat Index Warning Threshold
                </span>
                <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">
                  {settings.heatThreshold}°C (PAGASA {settings.heatThreshold >= 42 ? 'Danger' : 'Extreme Caution'})
                </span>
              </div>
              <input
                type="range"
                min="32"
                max="48"
                step="1"
                value={settings.heatThreshold}
                onChange={(e) => handleThresholdChange(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>32°C (Caution)</span>
                <span>41°C (PAGASA Standard)</span>
                <span>48°C (Severe Danger)</span>
              </div>
            </div>

            {/* Severe Thunderstorm toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.severeWeather}
                onChange={handleSevereWeatherToggle}
                className="h-4 w-4 rounded accent-orange-600 text-orange-600 focus:ring-orange-500"
              />
              <div>
                <div className="font-medium text-xs text-neutral-900 dark:text-white">
                  Severe Thunderstorm &amp; Torrential Rain Alerts
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Notify when extreme storm cells or heavy downpours are forecast
                </div>
              </div>
            </label>

            {/* Live Test Notification Button */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={handleTriggerTest}
                disabled={permission !== 'granted'}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-800 transition disabled:opacity-40"
              >
                {testSent ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    Push Alert Dispatched! Check Notifications.
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 text-orange-500" />
                    Send Live Test Notification Now
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-neutral-900 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
