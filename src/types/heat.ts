export interface LocationData {
  id?: string;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  isGPS?: boolean;
}

export type HeatRiskLevel =
  | 'safe'
  | 'caution'
  | 'extreme_caution'
  | 'danger'
  | 'extreme_danger';

export interface HealthAdvice {
  level: HeatRiskLevel;
  title: string;
  badgeText: string;
  colorClass: {
    badge: string;
    bgLight: string;
    bgDark: string;
    border: string;
    text: string;
    accent: string;
  };
  summary: string;
  pagasaLevel: string;
  physiologicalEffect: string;
  workRestCycle: string;
  dohBulletin: string;
  symptoms: string[];
  hydration: {
    targetLiters: string;
    rate: string;
    recommendedDrinks: string[];
    drinksToAvoid: string[];
  };
  outdoorActivity: string;
  clothing: string;
  vulnerableGroups: {
    seniors: string;
    infants: string;
    outdoorWorkers: string;
    pets: string;
  };
  firstAid: {
    exhaustionSteps: string[];
    strokeEmergency: string[];
  };
}

export interface CurrentWeatherData {
  temperature: number;
  apparentTemperature: number;
  calculatedHeatIndex: number;
  relativeHumidity: number;
  windSpeed: number;
  surfacePressure: number;
  uvIndex: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  time: string;
  dewPoint: number;
}

export interface HourlyPoint {
  time: string;
  formattedTime: string;
  isoHour: number;
  temperature: number;
  heatIndex: number;
  relativeHumidity: number;
  weatherCode: number;
  precipitationProb: number;
  isDay: boolean;
}

export interface DailySummary {
  maxTemp: number;
  minTemp: number;
  maxHeatIndex: number;
  peakHourText: string;
  uvMax: number;
}

export interface WeatherPayload {
  location: LocationData;
  current: CurrentWeatherData;
  hourly24: HourlyPoint[];
  daily: DailySummary;
  healthAdvice: HealthAdvice;
  fetchedAt: number; // timestamp
  isCached?: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  heatThreshold: number; // default 38°C
  severeWeather: boolean;
  dailyDigest: boolean;
}
