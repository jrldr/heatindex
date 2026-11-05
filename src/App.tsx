import React, { useState, useEffect, useCallback } from 'react';
import {
  Flame,
  Search,
  Navigation,
  RefreshCw,
  Sun,
  Moon,
  Bell,
  Droplets,
  Thermometer,
  Wind,
  Gauge,
  Eye,
  AlertTriangle,
  Clock,
  Compass,
  CheckCircle2,
  WifiOff,
} from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import {
  LocationData,
  WeatherPayload,
} from './types/heat';
import {
  DEFAULT_CAVITE_LOCATION,
  POPULAR_CAVITE_LOCATIONS,
  fetchLiveWeatherData,
  getLastLocation,
  saveLastLocation,
  reverseGeocodeGPS,
  getCachedWeatherPayload,
} from './services/weatherApi';
import {
  evaluateWeatherAlerts,
  getNotificationSettings,
} from './services/notificationService';
import { HeatChart } from './components/HeatChart';
import { HealthSafetyAdviceCard } from './components/HealthSafetyAdviceCard';
import { LocationSearchModal } from './components/LocationSearchModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useOnlineStatus } from './hooks/useOnlineStatus';

function HeatIndexApp() {
  const { isDark, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();

  const [currentLocation, setCurrentLocation] = useState<LocationData>(getLastLocation);
  const [weatherData, setWeatherData] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  // Load weather data
  const loadWeather = useCallback(async (location: LocationData, isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchLiveWeatherData(location);
      setWeatherData(data);
      setCurrentLocation(data.location);

      // Evaluate notifications if enabled
      evaluateWeatherAlerts(data).catch((err) => {
        console.warn('Notification evaluation err:', err);
      });
    } catch (err: any) {
      console.error('Failed to load weather:', err);
      // Try to load cached data
      const cached = getCachedWeatherPayload();
      if (cached) {
        setWeatherData(cached);
        setError('Working offline. Displaying last saved weather snapshot.');
      } else {
        setError('Unable to fetch live weather data. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWeather(currentLocation);
  }, []);

  // Periodic refresh every 10 minutes when online
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      loadWeather(currentLocation, true);
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentLocation, isOnline, loadWeather]);

  const handleSelectLocation = (loc: LocationData) => {
    setCurrentLocation(loc);
    saveLastLocation(loc);
    loadWeather(loc);
  };

  const handleQuickGPS = () => {
    if (!('geolocation' in navigator)) {
      setError('GPS is not supported on this browser.');
      return;
    }
    setRefreshing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocodeGPS(pos.coords.latitude, pos.coords.longitude);
          handleSelectLocation(loc);
        } catch {
          setError('Could not reverse geocode your GPS coordinates.');
        } finally {
          setRefreshing(false);
        }
      },
      (err) => {
        setRefreshing(false);
        setError('Location permission denied or GPS timed out.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const current = weatherData?.current;
  const advice = weatherData?.healthAdvice;
  const notifSettings = getNotificationSettings();

  const formattedFetchedTime = weatherData?.fetchedAt
    ? new Date(weatherData.fetchedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 transition-colors duration-200 dark:bg-neutral-950 dark:text-neutral-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/90 pt-safe">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-3 sm:px-6 py-2.5">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-xs">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-neutral-900 dark:text-white">
                  HEAT INDEX
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="hidden xs:block text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                PAGASA &amp; NOAA Standard
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <PWAInstallButton />

            {/* Notification alert button */}
            <button
              onClick={() => setIsNotifModalOpen(true)}
              title="Alert Notifications"
              className={`relative rounded-xl p-2 transition ${
                notifSettings.enabled
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
              aria-label="Severe weather notifications"
            >
              <Bell className="h-4 w-4" />
              {notifSettings.enabled && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-orange-600" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="rounded-xl p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-neutral-700" />}
            </button>

            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition"
            >
              <Search className="h-3.5 w-3.5 text-neutral-500" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>

        {/* Location & Quick Municipality Bar */}
        <div className="border-t border-neutral-100 bg-neutral-50/70 px-3 sm:px-6 py-2 dark:border-neutral-800/60 dark:bg-neutral-900/60">
          <div className="mx-auto flex max-w-4xl flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            {/* Current Active Location Pill */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="group flex items-center gap-1.5 font-bold text-neutral-900 hover:text-orange-600 dark:text-white dark:hover:text-orange-400 transition"
              >
                <Compass className="h-4 w-4 text-orange-600 group-hover:rotate-45 transition-transform" />
                <span className="truncate max-w-[200px] sm:max-w-none">
                  {currentLocation.name}
                  {currentLocation.admin1 ? `, ${currentLocation.admin1}` : ''}
                </span>
                <span className="text-[10px] text-neutral-400 group-hover:text-orange-500">
                  (Change)
                </span>
              </button>

              <button
                onClick={handleQuickGPS}
                title="Locate via GPS"
                className="rounded-md bg-white p-1 text-neutral-600 shadow-2xs hover:text-orange-600 dark:bg-neutral-800 dark:text-neutral-300"
              >
                <Navigation className="h-3 w-3" />
              </button>
            </div>

            {/* Quick Municipalities & Refresh */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              <div className="hidden md:flex items-center gap-1 text-[11px] text-neutral-400 mr-1">
                <span>Cavite Cities:</span>
              </div>

              {POPULAR_CAVITE_LOCATIONS.slice(0, 5).map((loc) => {
                const isActive =
                  Math.abs(loc.latitude - currentLocation.latitude) < 0.02 &&
                  Math.abs(loc.longitude - currentLocation.longitude) < 0.02;
                return (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc)}
                    className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                      isActive
                        ? 'bg-orange-600 text-white font-bold'
                        : 'bg-white text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {loc.name}
                  </button>
                );
              })}

              <button
                onClick={() => loadWeather(currentLocation, true)}
                disabled={refreshing}
                title="Refresh Live Data"
                className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 ml-auto sm:ml-0"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin text-orange-500' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-3 sm:px-6 py-4 space-y-4">
        {/* Offline & Cache Notice */}
        {weatherData?.isCached && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Offline Caching Active:</strong> Showing cached weather data from{' '}
                {formattedFetchedTime}.
              </span>
            </div>
            <button
              onClick={() => loadWeather(currentLocation, true)}
              className="font-bold underline hover:text-amber-700"
            >
              Retry Live
            </button>
          </div>
        )}

        {/* Error message */}
        {error && !weatherData?.isCached && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 inline mr-1 text-red-600" />
            {error}
          </div>
        )}

        {/* Skeleton loading */}
        {loading && !weatherData && (
          <div className="space-y-4 animate-pulse">
            <div className="h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-40 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
          </div>
        )}

        {weatherData && current && advice && (
          <>
            {/* PRIMARY HERO CARD: Heat Index & Current Metrics */}
            <div
              className={`relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 transition`}
            >
              {/* Subtle warmth ambient gradient background */}
              <div
                className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full opacity-15 blur-3xl pointer-events-none"
                style={{ backgroundColor: advice.colorClass.accent }}
              />

              {/* Card Top: Region & Last Updated */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {currentLocation.name}
                  </span>
                  <span>•</span>
                  <span>{current.weatherDescription}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-neutral-400" />
                  <span>
                    Updated: {formattedFetchedTime}{' '}
                    {weatherData.isCached ? '(Cached Snapshot)' : '(Live)'}
                  </span>
                </div>
              </div>

              {/* Main Gauge and Heat Level */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Current Calculated Heat Index (Real Feel)
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-6xl sm:text-7xl font-black tracking-tight text-neutral-900 dark:text-white">
                      {current.calculatedHeatIndex}
                    </span>
                    <span className="text-3xl sm:text-4xl font-bold text-orange-600 dark:text-orange-400">
                      °C
                    </span>
                    <span className="text-lg text-neutral-400 font-medium">
                      / {Math.round((current.calculatedHeatIndex * 9) / 5 + 32)}°F
                    </span>
                  </div>

                  {/* Safety Level Badge */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide border ${advice.colorClass.badge}`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: advice.colorClass.accent }}
                      />
                      {advice.title}
                    </span>

                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      {current.calculatedHeatIndex > current.temperature ? (
                        <>
                          Feels{' '}
                          <strong className="text-neutral-900 dark:text-white">
                            +{(current.calculatedHeatIndex - current.temperature).toFixed(1)}°C
                            warmer
                          </strong>{' '}
                          due to {current.relativeHumidity}% humidity
                        </>
                      ) : (
                        'Matches ambient temperature'
                      )}
                    </span>
                  </div>
                </div>

                {/* Daily high/low summary box */}
                <div className="flex sm:flex-col gap-3 sm:gap-2 self-start rounded-2xl border border-neutral-200/80 bg-neutral-50 p-3.5 text-xs dark:border-neutral-800 dark:bg-neutral-800/40">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-neutral-400">
                      Peak Heat Index Today
                    </div>
                    <div className="text-lg font-black text-red-600 dark:text-red-400">
                      {weatherData.daily.maxHeatIndex}°C
                      <span className="text-xs font-medium text-neutral-500 ml-1">
                        around {weatherData.daily.peakHourText}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 border-t border-neutral-200/60 pt-2 dark:border-neutral-700/60 text-neutral-600 dark:text-neutral-400">
                    <div>
                      <span className="text-[10px] text-neutral-400 block">High</span>
                      <strong className="text-neutral-900 dark:text-white">
                        {weatherData.daily.maxTemp}°C
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Low</span>
                      <strong className="text-neutral-900 dark:text-white">
                        {weatherData.daily.minTemp}°C
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block">Max UV</span>
                      <strong className="text-neutral-900 dark:text-white">
                        {weatherData.daily.uvMax}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid of Key Secondary Metrics */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Ambient Temperature */}
                <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3 dark:border-neutral-800/80 dark:bg-neutral-800/30">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <Thermometer className="h-4 w-4 text-sky-500" />
                    <span>Air Temperature</span>
                  </div>
                  <div className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                    {current.temperature}°C
                  </div>
                  <div className="text-[10px] text-neutral-400">Ambient dry bulb</div>
                </div>

                {/* Relative Humidity */}
                <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3 dark:border-neutral-800/80 dark:bg-neutral-800/30">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span>Relative Humidity</span>
                  </div>
                  <div className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                    {current.relativeHumidity}%
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Dew Point: {current.dewPoint}°C
                  </div>
                </div>

                {/* Wind Speed */}
                <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3 dark:border-neutral-800/80 dark:bg-neutral-800/30">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <Wind className="h-4 w-4 text-teal-500" />
                    <span>Wind Speed</span>
                  </div>
                  <div className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                    {current.windSpeed} <span className="text-xs font-normal">km/h</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">Air circulation</div>
                </div>

                {/* Atmospheric Pressure */}
                <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3 dark:border-neutral-800/80 dark:bg-neutral-800/30">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <Gauge className="h-4 w-4 text-purple-500" />
                    <span>Barometer</span>
                  </div>
                  <div className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                    {current.surfacePressure} <span className="text-xs font-normal">hPa</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">Sea-level pressure</div>
                </div>
              </div>
            </div>

            {/* 24-HOUR DUAL LINE TEMPERATURE & HEAT INDEX GRAPH CARD */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    24-Hour Temperature &amp; Heat Index Trend
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Compare ambient air temperature with calculated real feel heat index throughout
                    the day
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-4 rounded-full bg-orange-500" />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      Heat Index
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-4 rounded-full bg-sky-500" />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      Air Temp
                    </span>
                  </div>
                </div>
              </div>

              {/* Dual-line SVG Chart */}
              <HeatChart data={weatherData.hourly24} isDark={isDark} />
            </div>

            {/* HEALTH SAFETY ADVICE CARD */}
            <HealthSafetyAdviceCard
              advice={advice}
              heatIndex={current.calculatedHeatIndex}
            />

            {/* SEVERE WEATHER ALERTS & NOTIFICATION CONFIG BANNER */}
            <div className="rounded-2xl border border-neutral-200 bg-gradient-to-r from-orange-50/50 via-amber-50/30 to-white p-4 sm:p-5 dark:border-neutral-800 dark:from-orange-950/20 dark:via-neutral-900 dark:to-neutral-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-orange-100 p-2 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 shrink-0">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Severe Weather &amp; Heat Stroke Push Alerts
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      Get instant alerts on your phone or tablet when {currentLocation.name} enters
                      PAGASA Danger level (≥{notifSettings.heatThreshold}°C) or severe weather strikes.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsNotifModalOpen(true)}
                  className="self-start sm:self-center shrink-0 rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-orange-700 active:scale-95 transition"
                >
                  {notifSettings.enabled ? 'Manage Alerts' : 'Enable Alerts'}
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Offline Toast */}
      <OfflineIndicator cachedAt={weatherData?.isCached ? weatherData.fetchedAt : undefined} />

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200 bg-white/70 px-4 py-5 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400 pb-safe">
        <div className="mx-auto max-w-4xl space-y-1">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Heat Index Tracker • Live meteorological observations via Open-Meteo WMO
          </p>
          <p className="text-[11px] text-neutral-400">
            Calculations adhere to PAGASA &amp; NOAA Rothfusz regression heat index formulas.
            Offline-ready Progressive Web App with severe weather alert support.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={handleSelectLocation}
        currentLocation={currentLocation}
      />

      <NotificationSettingsModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        locationName={currentLocation.name}
        currentHeatIndex={current?.calculatedHeatIndex || 36}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HeatIndexApp />
    </ThemeProvider>
  );
}
