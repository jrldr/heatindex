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
        title: 'Safe / Comfortable (< 27°C)',
        badgeText: 'Low Heat Risk',
        colorClass: {
          badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          bgLight: 'bg-emerald-50',
          bgDark: 'dark:bg-emerald-950/20',
          border: 'border-emerald-200 dark:border-emerald-800/40',
          text: 'text-emerald-600 dark:text-emerald-400',
          accent: '#10b981',
        },
        summary: 'Atmospheric conditions allow unrestricted natural evaporative cooling through sweat. Risk of thermal stress is minimal for the general population.',
        pagasaLevel: 'PAGASA: Below Caution (< 27°C)',
        physiologicalEffect: 'The body effortlessly maintains a steady 37°C core temperature. Skin blood vessels and sweat glands operate at resting baseline without cardiovascular strain.',
        workRestCycle: 'Normal unrestricted schedule. Standard workplace rest intervals apply.',
        dohBulletin: 'Department of Health: Maintain baseline healthy habits, adequate hydration, and sun protection during peak UV hours.',
        symptoms: ['Normal skin temperature and steady heart rate', 'Zero significant thermal distress'],
        hydration: {
          targetLiters: '2.0 – 2.5 Liters daily',
          rate: 'Drink at regular intervals with meals and whenever thirsty.',
          recommendedDrinks: ['Fresh tap or filtered water', 'Infused fruit water', 'Natural fruit juices'],
          drinksToAvoid: ['Excessive sugary sodas that cause energy crashes'],
        },
        outdoorActivity: 'All outdoor workouts, construction labor, sports, and recreational events are safe without thermal restriction.',
        clothing: 'Standard comfortable everyday attire.',
        vulnerableGroups: {
          seniors: 'Safe for normal daily walking and outdoor recreation.',
          infants: 'Ensure regular hydration; maintain comfortable room ventilation.',
          outdoorWorkers: 'Standard shift schedules; stay hydrated during midday hours.',
          pets: 'Safe for long walks and playtime. Keep fresh water accessible.',
        },
        firstAid: {
          exhaustionSteps: ['No active heat injury triage required under comfortable baseline conditions.'],
          strokeEmergency: ['No heat stroke hazard present from atmospheric thermal index alone.'],
        },
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
        summary: 'Fatigue and mild dehydration headaches are possible with prolonged sun exposure and sustained physical exertion. Sweating efficiency begins to decrease slightly with elevated humidity.',
        pagasaLevel: 'PAGASA Caution Level: 27°C – 32°C',
        physiologicalEffect: 'The cardiovascular system works slightly harder to pump blood to dilated capillaries at the skin surface to radiate excess heat. Mild fluid and electrolyte losses occur through active perspiration.',
        workRestCycle: 'Recommended: 50 minutes of continuous labor followed by 10 minutes of shaded rest and water intake.',
        dohBulletin: 'DOH Advisory: Remind children, construction personnel, and athletes to drink fluids before feeling parched to prevent early dehydration.',
        symptoms: [
          'Mild lethargy, heavy legs, and sluggish reaction times',
          'Tension headache caused by low vascular fluid volume',
          'Occasional muscle twitches in calves or arms after heavy sweating',
        ],
        hydration: {
          targetLiters: '2.5 – 3.5 Liters daily',
          rate: 'Sip 200–250 mL (1 cup) every 30 to 45 minutes during outdoor activity.',
          recommendedDrinks: ['Cool water', 'Fresh coconut water (buko)', 'Lemon-infused mineral water'],
          drinksToAvoid: ['Alcoholic beverages (accelerate kidney fluid excretion)', 'Heavy caffeinated energy drinks'],
        },
        outdoorActivity: 'Plan rest breaks in the shade between 11:00 AM and 3:00 PM. Shift strenuous cardiovascular training to early morning (before 9 AM) or sunset.',
        clothing: 'Loose, light-colored breathable cotton, linen, or moisture-wicking technical fabrics to facilitate airflow.',
        vulnerableGroups: {
          seniors: 'Remind elderly relatives to drink water; thirst sensation diminishes naturally with age.',
          infants: 'Never leave babies or toddlers unattended in closed rooms or parked vehicles even for a minute.',
          outdoorWorkers: 'Provide accessible shaded resting stations and potable drinking water points.',
          pets: 'Walk dogs in shaded grass areas; check asphalt temperatures before extended walking.',
        },
        firstAid: {
          exhaustionSteps: [
            'Move immediately into an air-conditioned room or tree canopy shade.',
            'Loosen collars, tight belts, shoes, and socks.',
            'Sip cool (not ice-cold) water slowly over 15 minutes.',
          ],
          strokeEmergency: [
            'Monitor for sudden dizziness, disorientation, or vomiting. If symptoms persist over 30 minutes, consult a physician.',
          ],
        },
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
        summary: 'Heat cramps and heat exhaustion are likely with sustained exposure or vigorous activity. Continuing physical work without cooling breaks can quickly transition into heat stroke.',
        pagasaLevel: 'PAGASA Extreme Caution: 33°C – 41°C',
        physiologicalEffect: 'High relative humidity severely restricts sweat evaporation. Because sweat cannot evaporate efficiently into saturated air, thermal energy remains trapped inside the body, increasing heart rate by 10–25 beats per minute.',
        workRestCycle: 'Recommended: 40 minutes work / 20 minutes shaded rest with active hydration. Limit continuous outdoor sports to 45-minute blocks.',
        dohBulletin: 'DOH Heat Advisory: High risk of heat-induced hypotension and salt-depletion cramps. Take oral rehydration solutions if sweating heavily for more than 1 hour.',
        symptoms: [
          'Painful involuntary muscle spasms in calves, thighs, and abdomen (Heat Cramps)',
          'Heavy clammy perspiration with cold, pale skin',
          'Dizziness, lightheadedness upon standing (orthostatic hypotension)',
          'Nausea, loss of appetite, or general physical weakness',
        ],
        hydration: {
          targetLiters: '3.5 – 4.5 Liters daily',
          rate: 'Drink 250 mL (1 full glass) every 20 minutes while outdoors or sweating.',
          recommendedDrinks: [
            'Oral Rehydration Salt (ORS) solutions',
            'Electrolyte sports drinks (Pocari Sweat, Gatorade) diluted 50/50 with water',
            'Fresh buko juice (natural potassium and magnesium)',
          ],
          drinksToAvoid: [
            'Beer and liquor (cause severe peripheral vasodilation and dehydration)',
            'Carbonated sodas with high fructose corn syrup',
          ],
        },
        outdoorActivity: 'Avoid direct sun between 10:00 AM and 4:00 PM. Move physical education classes, construction heavy lifting, and marathon training to covered courts or evening hours.',
        clothing: 'Broad-brimmed hats (minimum 3-inch brim), UV400 polarized sunglasses, SPF 50+ sunscreen, and featherweight ventilated apparel.',
        vulnerableGroups: {
          seniors: 'Keep in ventilated rooms with electric fans or air conditioning. Watch for signs of lethargy.',
          infants: 'Dress infants in single-layer cotton onesies. Monitor wet diapers (at least 4–6 daily) to ensure hydration.',
          outdoorWorkers: 'Establish mandatory hydration buddy systems. Supervise workers for signs of slurred speech or dizziness.',
          pets: 'Asphalt can reach 55°C+ in this tier! Use the 7-second back-of-hand test on pavement. Provide ice cubes in water bowls.',
        },
        firstAid: {
          exhaustionSteps: [
            'Stop all activity immediately and lie down in a cool, ventilated area with feet slightly elevated (15–30 cm).',
            'Apply cool damp cloths or ice packs to the neck, armpits, and groin area (major superficial arteries).',
            'Slowly sip 500 mL of oral rehydration fluid or salted water (1/2 tsp salt in 1 liter water).',
            'Gently massage and stretch cramping muscles without forceful resistance.',
          ],
          strokeEmergency: [
            'If vomiting occurs, or if confusion and fainting set in, call 911 immediately. This is a medical emergency.',
          ],
        },
      };

    case 'danger':
      return {
        level: 'danger',
        title: 'Danger (42°C – 51°C)',
        badgeText: 'Danger — Official Warning',
        colorClass: {
          badge: 'bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-500/30',
          bgLight: 'bg-orange-50',
          bgDark: 'dark:bg-orange-950/20',
          border: 'border-orange-200 dark:border-orange-800/40',
          text: 'text-orange-600 dark:text-orange-400',
          accent: '#ea580c',
        },
        summary: 'Heat cramps and severe heat exhaustion are imminent. Life-threatening Heat Stroke is probable with sustained outdoor activity. This triggers official PAGASA and Department of Education (DepEd) class suspensions.',
        pagasaLevel: 'PAGASA Danger Level: 42°C – 51°C (Severe Warning)',
        physiologicalEffect: 'Core temperature rises dangerously toward 39°C–40°C. Sweating mechanisms become overwhelmed and blood volume drops, drastically reducing cerebral and cardiac perfusion. Blood pressure fluctuates rapidly.',
        workRestCycle: 'CRITICAL LIMIT: Maximum 20–30 minutes work followed by 30–40 minutes mandatory air-conditioned or ventilated rest. Suspend all heavy physical labor between 10:00 AM and 4:30 PM.',
        dohBulletin: 'Department of Health & NDRRMC Emergency Alert: High risk of circulatory collapse. Schools are advised to shift to modular distance learning. Public cooling centers should be utilized.',
        symptoms: [
          'Severe heat exhaustion with persistent vomiting or intense nausea',
          'Rapid, bounding or thready pulse with hyperventilation',
          'Mental fog, extreme irritability, staggering gait, or disorientation',
          'Sudden cessation of sweating despite intense burning heat (imminent heat stroke)',
        ],
        hydration: {
          targetLiters: '4.5 – 6.0 Liters throughout the day',
          rate: 'Sip 250–300 mL of electrolyte-rich fluids every 15 minutes continuously.',
          recommendedDrinks: [
            'Clinical Oral Rehydration Salts (ORS) packets dissolved in clean water',
            'Hypotonic electrolyte drinks with sodium and potassium',
            'Chilled mineral water',
          ],
          drinksToAvoid: [
            'ALL alcoholic drinks (high risk of precipitating acute heat stroke)',
            'Coffee, energy drinks, and heavily sweetened milk teas',
          ],
        },
        outdoorActivity: 'STAY INDOORS. Cancel non-essential travel, outdoor physical training, cycling, and roofing/paving work. Seek air-conditioned malls, offices, or community cooling centers.',
        clothing: 'Loose, ultra-lightweight, UV-protective clothing. Wet head and neck with cold water frequently.',
        vulnerableGroups: {
          seniors: 'Extremely vulnerable to cardiac arrest and acute stroke. Keep inside air-conditioned rooms at 24°C–26°C.',
          infants: 'Do NOT drape blankets or covers over baby strollers—traps hot air and creates an oven effect.',
          outdoorWorkers: 'Enforce DOLE Labor Advisory on heat stress. Suspend unshaded outdoor tasks between 10 AM and 4 PM.',
          pets: 'Dogs and cats can suffer fatal heat stroke in under 15 minutes. Keep indoors on tiled floors with fans.',
        },
        firstAid: {
          exhaustionSteps: [
            'ACT IMMEDIATELY: Move victim to air-conditioned shelter or vehicle instantly.',
            'Remove excess clothing down to bare layer; spray or sponge whole body with cool water and fan vigorously.',
            'Place cold wet packs or ice packs over carotid arteries (neck), axillae (armpits), and femoral arteries (groin).',
          ],
          strokeEmergency: [
            'IF UNRESPONSIVE OR CONFUSED: CALL 911 / 143 (Red Cross) IMMEDIATELY!',
            'Do NOT administer fluids by mouth to a confused or vomiting person (aspiration risk).',
            'Position on their side (recovery position) to keep airway open while awaiting emergency rescue.',
          ],
        },
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
        summary: 'EMERGENCY DISASTER TIER: Heat stroke is imminent and often fatal within 30 to 45 minutes of unprotected outdoor exposure. Complete shutdown of non-essential outdoor operations is warranted.',
        pagasaLevel: 'PAGASA Extreme Danger: ≥ 52°C (State of Red Heat Emergency)',
        physiologicalEffect: 'Thermoregulatory failure. The hypothalamus loses the ability to regulate temperature. Core body temperature exceeds 40.5°C (105°F), causing cellular protein denaturation, acute cerebral edema, rhabdomyolysis, and multi-organ failure.',
        workRestCycle: 'TOTAL SUSPENSION: Complete shutdown of all outdoor work, sports, deliveries, and school gatherings. Strict indoor refuge.',
        dohBulletin: 'DOH & NDRRMO Red Advisory: All citizens must remain indoors. Local Disaster Risk Reduction (CDRRMO) units on standby for heat stroke casualties.',
        symptoms: [
          'Core body temperature > 40°C (104°F+)',
          'Red, hot, bone-dry skin or paradoxical profuse sweating with neurological collapse',
          'Delirium, hallucinations, slurred speech, seizures, combativeness',
          'Loss of consciousness, coma, cardiovascular collapse',
        ],
        hydration: {
          targetLiters: '5.0 – 7.0 Liters consumed systematically',
          rate: 'Sip chilled oral rehydration solutions every 10–15 minutes while conscious.',
          recommendedDrinks: [
            'Medical-grade Oral Rehydration Salts (WHO formula)',
            'Chilled isotonic electrolyte solutions',
            'Iced water with electrolytes',
          ],
          drinksToAvoid: [
            'All alcohol, caffeine, diuretics, and hot broths',
          ],
        },
        outdoorActivity: 'DO NOT GO OUTDOORS. Keep windows closed with blackout thermal curtains during daylight hours to prevent thermal radiation from baking indoor spaces.',
        clothing: 'Minimal damp cooling garments. Regularly shower or sponge body with cold water throughout the day.',
        vulnerableGroups: {
          seniors: 'Immediate high hazard. Check on elderly neighbors every 2 hours. Keep electric fans pointed away if room temp exceeds 35°C (fans act as convection ovens above 35°C without AC).',
          infants: 'Keep in coolest air-conditioned room. Sponge forehead and limbs with lukewarm water if feverish.',
          outdoorWorkers: 'Total stoppage of outdoor tasks; non-compliance poses immediate employer liability and hazard to life.',
          pets: 'Emergency danger for all domestic animals. Keep inside cool rooms with tile floors and unlimited cold water.',
        },
        firstAid: {
          exhaustionSteps: [
            'TREAT EVERY VICTIM AS A POTENTIAL HEAT STROKE EMERGENCY.',
            'Immerse victim in cold water bath (cold water immersion is the #1 gold standard for saving lives in heat stroke).',
            'If tub is unavailable, saturate body in ice water sheets while fanning continuously.',
          ],
          strokeEmergency: [
            'CALL 911 / 143 (Philippine Red Cross) / CDRRMO HOTLINE IMMEDIATELY!',
            'Aggressive rapid cooling until core temp drops below 38.5°C.',
            'Place in recovery position on side. Clear mouth of vomit. Start CPR immediately if pulse stops.',
          ],
        },
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
