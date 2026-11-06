import React, { useState } from 'react';
import {
  ShieldAlert,
  Droplets,
  Activity,
  Users,
  AlertTriangle,
  LifeBuoy,
  Shirt,
  Clock,
  HeartPulse,
  Flame,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Info,
  ChevronRight,
  Timer,
} from 'lucide-react';
import { HealthAdvice } from '../types/heat';

interface HealthSafetyAdviceCardProps {
  advice: HealthAdvice;
  heatIndex: number;
}

export const HealthSafetyAdviceCard: React.FC<HealthSafetyAdviceCardProps> = ({
  advice,
  heatIndex,
}) => {
  const [activeTab, setActiveTab] = useState<
    'science' | 'hydration' | 'activity' | 'symptoms' | 'vulnerable' | 'firstaid'
  >('science');

  const isHighDanger = advice.level === 'danger' || advice.level === 'extreme_danger';

  return (
    <div className="w-full rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 transition-colors">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-5 dark:border-neutral-800">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${advice.colorClass.badge} shadow-xs`}
          >
            <ShieldAlert className={`h-6 w-6 ${advice.colorClass.text}`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                Health &amp; Safety Advisory
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${advice.colorClass.badge}`}
              >
                <Flame className="h-3 w-3" />
                {advice.badgeText}
              </span>
            </div>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
              {advice.pagasaLevel}
            </p>
          </div>
        </div>

        {/* Work Rest Cycle Quick Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl bg-neutral-100 dark:bg-neutral-800/80 px-3 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700/60">
          <Timer className="h-4 w-4 text-orange-500 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block leading-tight">
              Work-Rest Protocol
            </span>
            <span className="font-bold text-neutral-800 dark:text-neutral-200 text-[11px]">
              {advice.workRestCycle.split(':')[1]?.trim() || advice.workRestCycle}
            </span>
          </div>
        </div>
      </div>

      {/* Impact Assessment Callout */}
      <div className="mt-4 rounded-2xl bg-neutral-50 p-4 text-xs sm:text-sm text-neutral-700 dark:bg-neutral-800/40 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-neutral-900 dark:text-white font-bold">
              Medical Impact Assessment:
            </strong>{' '}
            {advice.summary}
          </p>
        </div>
      </div>

      {/* DOH Bulletin Banner if High Danger */}
      {isHighDanger && (
        <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <strong className="font-bold uppercase tracking-wider block">
              Official Department of Health (DOH) Warning
            </strong>
            <p className="mt-0.5 leading-relaxed">{advice.dohBulletin}</p>
          </div>
        </div>
      )}

      {/* Actionable Category Tabs */}
      <div className="mt-5 flex gap-1.5 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto pb-1.5 scrollbar-none">
        <button
          onClick={() => setActiveTab('science')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition ${
            activeTab === 'science'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
          Body Science
        </button>

        <button
          onClick={() => setActiveTab('hydration')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition ${
            activeTab === 'hydration'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          <Droplets className="h-3.5 w-3.5 text-sky-400" />
          Hydration Guide
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition ${
            activeTab === 'activity'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          Labor &amp; Sports Limits
        </button>

        <button
          onClick={() => setActiveTab('symptoms')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition ${
            activeTab === 'symptoms'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          Symptoms Triage
        </button>

        <button
          onClick={() => setActiveTab('vulnerable')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition ${
            activeTab === 'vulnerable'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          <Users className="h-3.5 w-3.5 text-purple-400" />
          Seniors, Kids &amp; Pets
        </button>

        <button
          onClick={() => setActiveTab('firstaid')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition ${
            activeTab === 'firstaid'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          <LifeBuoy className="h-3.5 w-3.5 text-red-400" />
          First Aid &amp; Hotlines
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-5 min-h-[160px]">
        {/* TAB 1: BODY SCIENCE & PHYSIOLOGY */}
        {activeTab === 'science' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                <HeartPulse className="h-4 w-4 text-rose-500" />
                Physiological Mechanism at {heatIndex}°C Heat Index
              </div>
              <p className="text-sm font-medium leading-relaxed text-neutral-900 dark:text-white">
                {advice.physiologicalEffect}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-neutral-200 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900 shadow-2xs">
                <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Evaporative Cooling Limit
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Sweating alone does not cool you—it is the <em>evaporation</em> of sweat into air
                  that removes thermal energy. When relative humidity is high, sweat pools on the skin
                  without evaporating, causing core internal heat to spike rapidly.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900 shadow-2xs">
                <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  Cardiovascular Workload
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  To dissipate heat, your heart must pump twice as much blood volume toward skin
                  capillaries. This elevates resting heart rate, reduces blood flow to digestive
                  organs and brain, and triggers fatigue or dizziness.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HYDRATION GUIDE */}
        {activeTab === 'hydration' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  <Droplets className="h-4 w-4" />
                  Target Fluid Intake Today
                </div>
                <div className="mt-1 text-2xl font-black text-sky-950 dark:text-sky-100">
                  {advice.hydration.targetLiters}
                </div>
                <div className="mt-1 text-xs text-sky-800 dark:text-sky-300">
                  {advice.hydration.rate}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-800/40 flex flex-col justify-center">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Hydration Rule
                </div>
                <p className="mt-1 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                  Do not wait until you feel parched. Thirst is a delayed physiological indicator that
                  signals your body is already 1.5% to 2% dehydrated.
                </p>
              </div>
            </div>

            {/* Recommended vs Avoid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Recommended Hydration Sources:
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-800 dark:text-neutral-200">
                  {advice.hydration.recommendedDrinks.map((drink, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{drink}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 dark:border-rose-900/30 dark:bg-rose-950/20">
                <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-2">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  Liquids to Strictly Avoid:
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-800 dark:text-neutral-200">
                  {advice.hydration.drinksToAvoid.map((drink, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{drink}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OUTDOOR & LABOR LIMITS */}
        {activeTab === 'activity' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <Activity className="h-4 w-4 text-emerald-500" />
                Physical Activity &amp; Workplace Schedule
              </div>
              <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white leading-relaxed">
                {advice.outdoorActivity}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-neutral-200 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white mb-1">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Peak Danger Hours: 10:00 AM – 4:00 PM
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Solar radiation and thermal index peak concurrently during midday. If outdoor
                  movement is essential, restrict direct exposure to intervals under 30 minutes with
                  shaded recovery.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white mb-1">
                  <Shirt className="h-4 w-4 text-indigo-500" />
                  Protective Clothing Rules
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {advice.clothing}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYMPTOM TRIAGE MATRIX */}
        {activeTab === 'symptoms' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Typical Symptoms at {heatIndex}°C Heat Index:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {advice.symptoms.map((symptom, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2.5 text-xs font-semibold text-neutral-800 dark:border-neutral-700/60 dark:bg-neutral-900 dark:text-neutral-200 shadow-2xs"
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    <span>{symptom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Differential Comparison: Exhaustion vs Stroke */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <div className="font-black text-amber-900 dark:text-amber-200 text-sm flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
                  Heat Exhaustion (Early Stage)
                </div>
                <ul className="mt-2 space-y-1.5 text-neutral-700 dark:text-neutral-300">
                  <li>• Heavy sweating with cold, pale, clammy skin</li>
                  <li>• Fast, weak pulse with dizziness and faintness</li>
                  <li>• Nausea, vomiting, and painful muscle cramps</li>
                  <li>• Core body temperature under 40°C</li>
                </ul>
                <div className="mt-3 rounded-lg bg-amber-100/80 dark:bg-amber-900/40 p-2 font-bold text-amber-900 dark:text-amber-200 text-[11px]">
                  Action: Move to cool AC room, loosen clothes, sip cool fluids.
                </div>
              </div>

              <div className="rounded-2xl border border-red-300 bg-red-50/80 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                <div className="font-black text-red-900 dark:text-red-200 text-sm flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-full bg-red-600 animate-ping" />
                  Heat Stroke (MEDICAL EMERGENCY)
                </div>
                <ul className="mt-2 space-y-1.5 text-neutral-800 dark:text-neutral-200">
                  <li>• High body temperature: 40°C (104°F) or higher</li>
                  <li>• Hot, red, dry skin (sweating has ceased)</li>
                  <li>• Confusion, slurred speech, delirium, seizures</li>
                  <li>• Rapid, bounding pulse; loss of consciousness</li>
                </ul>
                <div className="mt-3 rounded-lg bg-red-600 text-white p-2 font-bold text-[11px] text-center">
                  CRITICAL: CALL 911 IMMEDIATELY! Cool victim with ice water.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VULNERABLE GROUPS */}
        {activeTab === 'vulnerable' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150 text-xs">
            {/* Seniors */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-1.5">
                <Users className="h-4 w-4 text-purple-500" />
                Senior Citizens (Ages 65+)
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                {advice.vulnerableGroups.seniors}
              </p>
            </div>

            {/* Infants & Toddlers */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-1.5">
                <Users className="h-4 w-4 text-sky-500" />
                Infants &amp; Toddlers
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                {advice.vulnerableGroups.infants}
              </p>
            </div>

            {/* Outdoor Workers */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-1.5">
                <Activity className="h-4 w-4 text-amber-500" />
                Outdoor Laborers &amp; Riders
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                {advice.vulnerableGroups.outdoorWorkers}
              </p>
            </div>

            {/* Domestic Pets */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-1.5">
                <HeartPulse className="h-4 w-4 text-emerald-500" />
                Household Pets &amp; Animals
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                {advice.vulnerableGroups.pets}
              </p>
            </div>
          </div>
        )}

        {/* TAB 6: FIRST AID & EMERGENCY RESCUE */}
        {activeTab === 'firstaid' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/40 dark:bg-red-950/20">
              <div className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5 mb-2">
                <LifeBuoy className="h-4 w-4" />
                Step-by-Step Heat Stroke Emergency Rescue
              </div>
              <ol className="space-y-2 text-xs text-neutral-800 dark:text-neutral-200 font-medium">
                {advice.firstAid.exhaustionSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Hotlines Banner */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Emergency Hotline Quick Reference:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <a
                  href="tel:911"
                  className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 hover:border-red-500 dark:border-neutral-700 dark:bg-neutral-900 transition font-bold text-neutral-900 dark:text-white"
                >
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-red-600" />
                    <span>National Emergency</span>
                  </div>
                  <span className="text-sm font-black text-red-600">911</span>
                </a>

                <a
                  href="tel:143"
                  className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 hover:border-red-500 dark:border-neutral-700 dark:bg-neutral-900 transition font-bold text-neutral-900 dark:text-white"
                >
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-red-600" />
                    <span>Philippine Red Cross</span>
                  </div>
                  <span className="text-sm font-black text-red-600">143</span>
                </a>

                <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold">Cavite CDRRMO</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-500">(046) Area</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
