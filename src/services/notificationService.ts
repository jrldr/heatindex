import { NotificationSettings, WeatherPayload } from '../types/heat';

const NOTIFICATION_SETTINGS_KEY = 'heat_index_notif_settings_v1';
const LAST_ALERT_TIMESTAMP_KEY = 'heat_index_last_alert_ts_v1';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  heatThreshold: 41, // 41°C starts the Danger zone in PAGASA
  severeWeather: true,
  dailyDigest: true,
};

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load notification settings:', e);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save notification settings:', e);
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Dispatches a system push notification via Service Worker or Web Notification API.
 */
export async function showPushAlert(title: string, options: NotificationOptions = {}): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const defaultOptions: any = {
    icon: '/pwa-192x192.png',
    badge: '/favicon.ico',
    tag: 'heat-alert',
    renotify: true,
    silent: false,
    body: options.body || 'Severe weather or heat advisory detected.',
    ...options,
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, defaultOptions);
        return true;
      }
    }
  } catch (swErr) {
    console.warn('Service worker notification failed, trying native window Notification:', swErr);
  }

  try {
    new Notification(title, defaultOptions);
    return true;
  } catch (err) {
    console.error('Failed to trigger native Notification:', err);
    return false;
  }
}

/**
 * Checks weather data for conditions that trigger a severe weather alert.
 */
export async function evaluateWeatherAlerts(payload: WeatherPayload): Promise<void> {
  const settings = getNotificationSettings();
  if (!settings.enabled || Notification.permission !== 'granted') {
    return;
  }

  // Prevent spamming alerts within a 2-hour window unless emergency
  const lastAlert = Number(localStorage.getItem(LAST_ALERT_TIMESTAMP_KEY) || '0');
  const now = Date.now();
  const twoHours = 2 * 60 * 60 * 1000;

  const currentHI = payload.current.calculatedHeatIndex;
  const isSevereThunderstorm = [95, 96, 99].includes(payload.current.weatherCode);

  let alertTitle = '';
  let alertBody = '';

  if (currentHI >= 52) {
    alertTitle = `🚨 PAGASA EXTREME DANGER: ${currentHI}°C Heat Index!`;
    alertBody = `Extreme danger in ${payload.location.name}! Heat stroke is imminent. Stay indoors and avoid physical activity.`;
  } else if (currentHI >= 42) {
    alertTitle = `⚠️ Severe Heat Danger Alert: ${currentHI}°C in ${payload.location.name}`;
    alertBody = `Heat Index has reached ${currentHI}°C (PAGASA Danger Level). High risk of heat exhaustion and cramps. Hydrate immediately.`;
  } else if (currentHI >= settings.heatThreshold) {
    alertTitle = `🔥 Heat Alert: Exceeded ${settings.heatThreshold}°C in ${payload.location.name}`;
    alertBody = `Current Heat Index is ${currentHI}°C (Real Feel). Stay hydrated and seek shaded cooling spaces.`;
  } else if (settings.severeWeather && isSevereThunderstorm) {
    alertTitle = `⛈️ Severe Thunderstorm Warning: ${payload.location.name}`;
    alertBody = `Heavy rain and thunder detected in your region. Watch out for flash floods and lightning hazards.`;
  }

  if (alertTitle && (now - lastAlert > twoHours || currentHI >= 52)) {
    localStorage.setItem(LAST_ALERT_TIMESTAMP_KEY, String(now));
    await showPushAlert(alertTitle, {
      body: alertBody,
      data: { url: window.location.href },
    });
  }
}

/**
 * Sends a live interactive test notification so the user can immediately experience the feature.
 */
export async function sendTestNotification(locationName: string, heatIndex: number): Promise<boolean> {
  return await showPushAlert(`🔥 [TEST] Heat Index Alert: ${locationName}`, {
    body: `Live alert active! Current heat index is ${heatIndex}°C. Real-time severe weather push notifications are active for ${locationName}.`,
  });
}
