import { HeatRiskLevel, HealthAdvice } from '../types/heat';

/**
 * Calculates the Heat Index (in Celsius) using the standard NOAA / Rothfusz regression equation
 * used by meteorology agencies worldwide, including PAGASA in the Philippines.
 *
 * @param tempC - Ambient dry-bulb temperature in degrees Celsius
 * @param relativeHumidity - Relative humidity in percentage (0 - 100)
 * @returns Heat index in degrees Celsius (rounded to 1 decimal place)
 */
export function calculateHeatIndex(tempC: number, relativeHumidity: number): number {
  const rh = Math.min(100, Math.max(0, relativeHumidity));
  const tf = (tempC * 9) / 5 + 32; // Convert to Fahrenheit

  // If temperature is below 80°F (~26.7°C) or RH is extremely low, Heat Index is close to ambient
  if (tf < 80) {
    const simpleHI = 0.5 * (tf + 61.0 + (tf - 68.0) * 1.2 + rh * 0.094);
    if ((simpleHI + tf) / 2 < 80) {
      const c = ((simpleHI - 32) * 5) / 9;
      return Math.round(c * 10) / 10;
    }
  }

  // Rothfusz regression equation
  let hi =
    -42.379 +
    2.04901523 * tf +
    10.14333127 * rh -
    0.22475541 * tf * rh -
    0.00683783 * tf * tf -
    0.05481717 * rh * rh +
    0.00122874 * tf * tf * rh +
    0.00085282 * tf * rh * rh -
    0.00000199 * tf * tf * rh * rh;

  // Adjustment for low relative humidity
  if (rh < 13 && tf >= 80 && tf <= 112) {
    const adj = ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tf - 95)) / 17);
    hi -= adj;
  }
  // Adjustment for high relative humidity
  else if (rh > 85 && tf >= 80 && tf <= 87) {
    const adj = ((rh - 85) / 10) * ((87 - tf) / 5);
    hi += adj;
  }

  // If calculation results in less than ambient when temp is warm, ambient is baseline
  const heatIndexF = Math.max(tf, hi);
  const heatIndexC = ((heatIndexF - 32) * 5) / 9;

  return Math.round(heatIndexC * 10) / 10;
}

/**
 * Calculates dew point temperature using the Magnus formula.
 */
export function calculateDewPoint(tempC: number, rh: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(rh / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return Math.round(dewPoint * 10) / 10;
}

/**
 * Returns the PAGASA heat classification level from a Celsius heat index value.
 */
export function getHeatRiskLevel(heatIndexC: number): HeatRiskLevel {
  if (heatIndexC < 27) return 'safe';
  if (heatIndexC <= 32) return 'caution';
  if (heatIndexC <= 41) return 'extreme_caution';
  if (heatIndexC <= 51) return 'danger';
  return 'extreme_danger';
}

/**
 * Returns comprehensive, real-time health safety advice corresponding to the heat index.
 */
export function getHealthAdvice(heatIndexC: number): HealthAdvice {
  const level = getHeatRiskLevel(heatIndexC);

  switch (level) {
    case 'safe':
      return {
        level: 'safe',
        title: 'Safe / Comfortable',
        badgeText: 'Low Heat Risk',
        colorClass: {
          badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          bgLight: 'bg-emerald-50',
          bgDark: 'dark:bg-emerald-950/20',
          border: 'border-emerald-200 dark:border-emerald-800/40',
          text: 'text-emerald-600 dark:text-emerald-400',
          accent: '#10b981',
        },
        summary: 'Heat conditions are within comfortable and normal human physiological limits.',
        pagasaLevel: 'PAGASA: Below Caution (< 27°C)',
        symptoms: ['Normal body regulation', 'Minimal risk of heat illnesses'],
        hydration: 'Drink 1.5 - 2 liters of water daily to maintain routine hydration.',
        outdoorActivity: 'All outdoor workouts, physical labor, and recreational activities are safe.',
        clothing: 'Standard comfortable everyday attire.',
        vulnerableGroups: 'Safe for infants, elderly, and pets. Ensure regular water access.',
        firstAid: 'No special emergency precautions needed.',
      };

    case 'caution':
      return {
        level: 'caution',
        title: 'Caution (27°C – 32°C)',
        badgeText: 'Caution',
        colorClass: {
          badge: 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border-yellow-500/30',
          bgLight: 'bg-yellow-50',
          bgDark: 'dark:bg-yellow-950/20',
          border: 'border-yellow-200 dark:border-yellow-800/40',
          text: 'text-yellow-600 dark:text-yellow-400',
          accent: '#eab308',
        },
        summary: 'Fatigue is possible with prolonged sun exposure and sustained physical exertion.',
        pagasaLevel: 'PAGASA Caution: 27°C – 32°C',
        symptoms: [
          'Mild fatigue or sluggishness',
          'Mild dehydration headaches',
          'Occasional muscle twitches or cramps with heavy sweating',
        ],
        hydration: 'Drink 2.5 - 3 liters of water. Sip water every 20-30 minutes even before feeling thirsty.',
        outdoorActivity: 'Plan rest breaks during midday. Limit intense outdoor sports between 11 AM - 3 PM.',
        clothing: 'Wear loose-fitting, light-colored, and breathable cotton or moisture-wicking fabrics.',
        vulnerableGroups: 'Remind elderly and young children to drink water. Never leave pets in parked vehicles.',
        firstAid: 'Move to a shaded or air-conditioned area, loosen clothing, and drink cool water.',
      };

    case 'extreme_caution':
      return {
        level: 'extreme_caution',
        title: 'Extreme Caution (33°C – 41°C)',
        badgeText: 'Extreme Caution',
        colorClass: {
          badge: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30',
          bgLight: 'bg-amber-50',
          bgDark: 'dark:bg-amber-950/20',
          border: 'border-amber-200 dark:border-amber-800/40',
          text: 'text-amber-600 dark:text-amber-400',
          accent: '#f59e0b',
        },
        summary: 'Heat cramps and heat exhaustion are possible. Continued activity could lead to heat stroke.',
        pagasaLevel: 'PAGASA Extreme Caution: 33°C – 41°C',
        symptoms: [
          'Painful heat cramps in legs and abdomen',
          'Heavy perspiration, pale or clammy skin',
          'Dizziness, nausea, rapid pulse, and faintness',
        ],
        hydration: 'Drink 3 - 4 liters of liquids. Add oral rehydration salts (ORS) or electrolyte beverages.',
        outdoorActivity: 'Avoid direct midday sun (10 AM - 4 PM). Take 10-minute shade breaks every 30 minutes.',
        clothing: 'Wear wide-brimmed hats, UV-blocking sunglasses, and lightweight breathable clothing.',
        vulnerableGroups: 'Keep infants and seniors in well-ventilated or air-conditioned spaces. Avoid asphalt walks with pets.',
        firstAid: 'Rest in a cool room. Apply damp towels to neck, armpits, and groin. Sip electrolyte water.',
      };

    case 'danger':
      return {
        level: 'danger',
        title: 'Danger (42°C – 51°C)',
        badgeText: 'Danger — High Alert',
        colorClass: {
          badge: 'bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-500/30',
          bgLight: 'bg-orange-50',
          bgDark: 'dark:bg-orange-950/20',
          border: 'border-orange-200 dark:border-orange-800/40',
          text: 'text-orange-600 dark:text-orange-400',
          accent: '#ea580c',
        },
        summary: 'Heat cramps and heat exhaustion are likely. Heat stroke is probable with continued activity.',
        pagasaLevel: 'PAGASA Danger Level: 42°C – 51°C (Official Weather Warning)',
        symptoms: [
          'Severe heat exhaustion, confusion, vomiting',
          'Rapid heartbeat, fainting, elevated core body temperature',
          'Impending risk of life-threatening heat stroke',
        ],
        hydration: 'Sip cool liquids continuously (4+ liters). Avoid caffeinated and alcoholic beverages.',
        outdoorActivity: 'Cancel or suspend non-essential outdoor labor, training, and sports between 10 AM and 5 PM.',
        clothing: 'Minimal, extremely lightweight, breathable clothes. Apply broad-spectrum SPF 50+ sunscreen.',
        vulnerableGroups: 'High hazard for outdoor workers, athletes, elderly, and cardiac patients. Stay in AC cooling centers.',
        firstAid: 'IMMEDIATE ACTION: Move to cold air, mist skin with cold water, fan vigorously. Call local emergency services (e.g. 911 / CDRRMO) if vomiting or altered mental state.',
      };

    case 'extreme_danger':
      return {
        level: 'extreme_danger',
        title: 'Extreme Danger (≥ 52°C)',
        badgeText: 'Extreme Danger — Life Threatening',
        colorClass: {
          badge: 'bg-red-500/20 text-red-800 dark:text-red-300 border-red-500/30',
          bgLight: 'bg-red-50',
          bgDark: 'dark:bg-red-950/30',
          border: 'border-red-300 dark:border-red-700/50',
          text: 'text-red-600 dark:text-red-400',
          accent: '#dc2626',
        },
        summary: 'Heat stroke is imminent! Prolonged exposure outside can be fatal.',
        pagasaLevel: 'PAGASA Extreme Danger: ≥ 52°C (Emergency Level)',
        symptoms: [
          'Core temperature > 40°C (104°F)',
          'Dry, hot, flushed skin (sweating has ceased)',
          'Loss of consciousness, delirium, seizures, organ failure',
        ],
        hydration: 'Drink chilled water and isotonic electrolytes constantly. Wet body with ice water.',
        outdoorActivity: 'STAY INDOORS. Total suspension of outdoor activity and unconditioned workplace operations.',
        clothing: 'Loose cooling garments. Keep indoor rooms darkened with curtains to block thermal radiation.',
        vulnerableGroups: 'All individuals are at severe risk. Check on isolated neighbors and senior citizens.',
        firstAid: 'CRITICAL EMERGENCY: Call emergency rescue immediately! Immerse in cold water bath or pack ice around neck, armpits, and groin until medical responders arrive.',
      };
  }
}

/**
 * Maps WMO weather interpretation codes to human-readable strings and icons.
 */
export function getWeatherDescription(code: number): { label: string; icon: string } {
  switch (code) {
    case 0:
      return { label: 'Clear Sky', icon: 'Sun' };
    case 1:
      return { label: 'Mainly Clear', icon: 'SunMedium' };
    case 2:
      return { label: 'Partly Cloudy', icon: 'CloudSun' };
    case 3:
      return { label: 'Overcast', icon: 'Cloud' };
    case 45:
    case 48:
      return { label: 'Fog / Mist', icon: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { label: 'Drizzle', icon: 'CloudDrizzle' };
    case 61:
    case 63:
    case 65:
      return { label: 'Rain Showers', icon: 'CloudRain' };
    case 80:
    case 81:
    case 82:
      return { label: 'Heavy Rain Showers', icon: 'CloudRain' };
    case 95:
    case 96:
    case 99:
      return { label: 'Thunderstorm', icon: 'CloudLightning' };
    default:
      return { label: 'Cloudy with Heat', icon: 'Sun' };
  }
}
