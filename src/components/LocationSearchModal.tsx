import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, X, Loader2 } from 'lucide-react';
import { LocationData } from '../types/heat';
import {
  searchLocations,
  reverseGeocodeGPS,
  POPULAR_CAVITE_LOCATIONS,
} from '../services/weatherApi';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: LocationData) => void;
  currentLocation: LocationData;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  currentLocation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchLocations(query);
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleUseGPS = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const loc = await reverseGeocodeGPS(lat, lon);
          onSelectLocation(loc);
          onClose();
        } catch (err) {
          console.error(err);
          setGpsError('Unable to identify location from GPS.');
        } finally {
          setIsGpsLoading(false);
        }
      },
      (err) => {
        setIsGpsLoading(false);
        if (err.code === 1) {
          setGpsError('Location permission denied. Please allow access or search manually.');
        } else if (err.code === 2) {
          setGpsError('GPS position unavailable. Please check your connection.');
        } else {
          setGpsError('Location request timed out. Please try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Search Location
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Check heat index for Cavite or any city worldwide
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* GPS Quick Action */}
        <div className="my-3">
          <button
            onClick={handleUseGPS}
            disabled={isGpsLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-orange-700 active:scale-[0.99] transition disabled:opacity-60"
          >
            {isGpsLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Detecting exact GPS location...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4" />
                Use My Current GPS Location
              </>
            )}
          </button>
          {gpsError && (
            <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 text-center">
              {gpsError}
            </p>
          )}
        </div>

        {/* Search input */}
        <div className="relative my-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type city, municipality, province..."
            autoFocus
            className="w-full rounded-xl border border-neutral-300 bg-neutral-100 pl-10 pr-10 py-3 text-sm text-neutral-950 font-medium placeholder:text-neutral-500 focus:border-orange-500 focus:bg-white focus:text-neutral-950 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-400 dark:focus:bg-neutral-800 dark:focus:text-white dark:focus:border-orange-500 transition-colors shadow-2xs"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto mt-2 space-y-3 pr-1">
          {/* Results if searching */}
          {query.trim().length > 0 ? (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {isSearching ? 'Searching...' : `Results (${results.length})`}
              </div>
              {isSearching && (
                <div className="flex items-center justify-center py-6 text-sm text-neutral-400">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-orange-500" />
                  Looking up live locations...
                </div>
              )}
              {!isSearching && results.length === 0 && (
                <div className="py-6 text-center text-sm text-neutral-500">
                  No matching locations found. Try searching for city or province name.
                </div>
              )}
              <div className="space-y-1">
                {results.map((loc) => (
                  <button
                    key={`${loc.latitude}-${loc.longitude}-${loc.name}`}
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-white">
                          {loc.name}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400">Select</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Preset Cavite Municipalities */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Cavite Municipalities &amp; Cities
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_CAVITE_LOCATIONS.map((loc) => {
                    const isSelected =
                      Math.abs(loc.latitude - currentLocation.latitude) < 0.01 &&
                      Math.abs(loc.longitude - currentLocation.longitude) < 0.01;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => {
                          onSelectLocation(loc);
                          onClose();
                        }}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50 text-orange-950 dark:bg-orange-950/30 dark:text-orange-200'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-800/60 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        <MapPin
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isSelected ? 'text-orange-600' : 'text-neutral-400'
                          }`}
                        />
                        <span className="font-semibold truncate">{loc.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
