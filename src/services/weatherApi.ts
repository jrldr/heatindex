import {
  LocationData,
  WeatherPayload,
  HourlyPoint,
  DailySummary,
  CurrentWeatherData,
} from '../types/heat';
import {
  calculateHeatIndex,
  calculateDewPoint,
  getHealthAdvice,
  getWeatherDescription,
} from '../utils/heatIndex';

export const DEFAULT_CAVITE_LOCATION: LocationData = {
  id: 'cavite-default',
  name: 'Cavite',
  admin1: 'Calabarzon',
  country: 'Philippines',
  latitude: 14.4791,
  longitude: 120.8969,
  timezone: 'Asia/Manila',
};

export const POPULAR_CAVITE_LOCATIONS: LocationData[] = [
  {
    id: 'cavite-province',
    name: 'Cavite',
    admin1: 'Calabarzon',
    country: 'Philippines',
    latitude: 14.4791,
    longitude: 120.8969,
  },
  {
    id: 'dasmarinas',
    name: 'Dasmariñas',
    admin1: 'Cavite',
    country: 'Philippines',
    latitude: 14.3294,
    longitude: 120.9367,
  },
  {
    id: 'bacoor',
    name: 'Bacoor',
    admin1: 'Cavite',
    country: 'Philippines',
    latitude: 14.4589,
    longitude: 120.9419,
  },
  {
    id: 'imus',
    name: 'Imus',
    admin1: 'Cavite',
    country: 'Philippines',
    latitude: 14.4295,
    longitude: 120.9367,
  },
  {
    id: 'tagaytay',
    name: 'Tagaytay',
    admin1: 'Cavite',
    country: 'Philippines',
    latitude: 14.1153,
    longitude: 120.9621,
  },
  {
    id: 'gentrias',
    name: 'General Trias',
    admin1: 'Cavite',
    country: 'Philippines',
    latitude: 14.3853,
    longitude: 120.8808,
  },
  {
    id: 'cavitecity',
    name: 'Cavite City',
    admin1: 'Cavite',
    country: 'Philippines',
    latitude: 14.4833,
    longitude: 120.9000,
  },
  {
    id: 'silang',
    name: 'Silang',
    admin1: 'Cavite',
    country: 'Philippines',
    latitude: 14.2319,
    longitude: 120.9750,
  },
];

const CACHE_KEY = 'heat_index_weather_cache_v1';
const LAST_LOCATION_KEY = 'heat_index_last_location_v1';

/**
 * Searches locations in real-time via Open-Meteo Geocoding API.
 */
export async function searchLocations(query: string): Promise<LocationData[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=10&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoding HTTP error: ${res.status}`);
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: any) => ({
      id: `${item.id || item.latitude}_${item.longitude}`,
      name: item.name,
      admin1: item.admin1 || item.admin2 || '',
      country: item.country || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'auto',
    }));
  } catch (err) {
    console.error('Error searching locations:', err);
    return [];
  }
}

/**
 * Reverse geocodes coordinates to a recognizable location name.
 */
export async function reverseGeocodeGPS(lat: number, lon: number): Promise<LocationData> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.village ||
        addr.suburb ||
        addr.county ||
        'Current Location';
      const state = addr.state || addr.province || addr.region || '';
      const country = addr.country || 'Philippines';

      return {
        id: `gps_${lat.toFixed(4)}_${lon.toFixed(4)}`,
        name: cityName,
        admin1: state,
        country: country,
        latitude: lat,
        longitude: lon,
        isGPS: true,
      };
    }
  } catch (e) {
    console.warn('Reverse geocode fallback:', e);
  }

  return {
    id: `gps_${lat.toFixed(4)}_${lon.toFixed(4)}`,
    name: 'Current Location',
    admin1: `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`,
    country: 'GPS Detection',
    latitude: lat,
    longitude: lon,
    isGPS: true,
  };
}

/**
 * Gets cached weather payload from localStorage if available.
 */
export function getCachedWeatherPayload(): WeatherPayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: WeatherPayload = JSON.parse(raw);
    parsed.isCached = true;
    return parsed;
  } catch (err) {
    console.warn('Failed to parse cached weather data:', err);
    return null;
  }
}

/**
 * Saves last loaded location to localStorage.
 */
export function saveLastLocation(loc: LocationData): void {
  try {
    localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(loc));
  } catch (err) {
    console.warn('Failed to save last location:', err);
  }
}

/**
 * Gets the last saved location from localStorage, or defaults to Cavite.
 */
export function getLastLocation(): LocationData {
  try {
    const raw = localStorage.getItem(LAST_LOCATION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read last location:', err);
  }
  return DEFAULT_CAVITE_LOCATION;
}

/**
 * Fetches live weather data from Open-Meteo API with offline fallback.
 */
export async function fetchLiveWeatherData(
  location: LocationData
): Promise<WeatherPayload> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,is_day&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,precipitation_probability,uv_index&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,uv_index_max&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather service returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const currentRaw = data.current;
    const hourlyRaw = data.hourly;
    const dailyRaw = data.daily;

    const temp = Math.round(currentRaw.temperature_2m * 10) / 10;
    const rh = Math.round(currentRaw.relative_humidity_2m);
    const calculatedHI = calculateHeatIndex(temp, rh);
    const dewPoint = calculateDewPoint(temp, rh);
    const weatherInfo = getWeatherDescription(currentRaw.weather_code);

    const current: CurrentWeatherData = {
      temperature: temp,
      apparentTemperature: Math.round(currentRaw.apparent_temperature * 10) / 10,
      calculatedHeatIndex: calculatedHI,
      relativeHumidity: rh,
      windSpeed: Math.round(currentRaw.wind_speed_10m * 10) / 10,
      surfacePressure: Math.round(currentRaw.surface_pressure),
      uvIndex: hourlyRaw.uv_index ? hourlyRaw.uv_index[0] ?? 0 : 0,
      weatherCode: currentRaw.weather_code,
      weatherDescription: weatherInfo.label,
      isDay: currentRaw.is_day === 1,
      time: currentRaw.time,
      dewPoint,
    };

    // Build the 24-hour sequence starting from the current hour
    const nowTimeStr = currentRaw.time; // e.g. "2026-11-05T09:00"
    const hourlyTimes: string[] = hourlyRaw.time || [];
    let startIndex = hourlyTimes.findIndex((t) => t >= nowTimeStr);
    if (startIndex === -1) startIndex = 0;

    const hourly24: HourlyPoint[] = [];
    const endIndex = Math.min(hourlyTimes.length, startIndex + 24);

    let maxHourlyHeatIndex = calculatedHI;
    let peakHourStr = '';

    for (let i = startIndex; i < endIndex; i++) {
      const isoTime = hourlyTimes[i];
      const hTemp = Math.round(hourlyRaw.temperature_2m[i] * 10) / 10;
      const hRh = Math.round(hourlyRaw.relative_humidity_2m[i]);
      const hHI = calculateHeatIndex(hTemp, hRh);
      const hCode = hourlyRaw.weather_code[i];
      const hPop = hourlyRaw.precipitation_probability ? hourlyRaw.precipitation_probability[i] || 0 : 0;

      const dateObj = new Date(isoTime);
      const hourNum = dateObj.getHours();
      const formattedTime = dateObj.toLocaleTimeString([], {
        hour: 'numeric',
        hour12: true,
      });

      if (hHI > maxHourlyHeatIndex) {
        maxHourlyHeatIndex = hHI;
        peakHourStr = formattedTime;
      }

      hourly24.push({
        time: isoTime,
        formattedTime,
        isoHour: hourNum,
        temperature: hTemp,
        heatIndex: hHI,
        relativeHumidity: hRh,
        weatherCode: hCode,
        precipitationProb: hPop,
        isDay: hourNum >= 6 && hourNum < 18,
      });
    }

    const daily: DailySummary = {
      maxTemp: dailyRaw?.temperature_2m_max ? Math.round(dailyRaw.temperature_2m_max[0] * 10) / 10 : temp,
      minTemp: dailyRaw?.temperature_2m_min ? Math.round(dailyRaw.temperature_2m_min[0] * 10) / 10 : temp,
      maxHeatIndex: maxHourlyHeatIndex,
      peakHourText: peakHourStr || 'Midday',
      uvMax: dailyRaw?.uv_index_max ? Math.round(dailyRaw.uv_index_max[0] * 10) / 10 : 7,
    };

    const healthAdvice = getHealthAdvice(calculatedHI);

    const payload: WeatherPayload = {
      location,
      current,
      hourly24,
      daily,
      healthAdvice,
      fetchedAt: Date.now(),
      isCached: false,
    };

    // Cache locally for offline access
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      saveLastLocation(location);
    } catch (err) {
      console.warn('Failed to cache weather data in localStorage:', err);
    }

    return payload;
  } catch (error) {
    console.error('Network fetch failed, attempting cache retrieval:', error);
    const cached = getCachedWeatherPayload();
    if (cached) {
      // Return cached with indicator
      return {
        ...cached,
        isCached: true,
      };
    }
    throw error;
  }
}
