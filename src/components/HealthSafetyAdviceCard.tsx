import React, { useState } from 'react';
import {
  ShieldAlert,
  Droplets,
  Activity,
  Users,
  AlertTriangle,
  LifeBuoy,
  Shirt,
  ChevronDown,
  ChevronUp,
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
  const [activeTab, setActiveTab] = useState<'hydration' | 'activity' | 'symptoms' | 'firstaid'>(
    'hydration'
  );
  const [showFirstAidModal, setShowFirstAidModal] = useState(false);

  const isHighDanger = advice.level === 'danger' || advice.level === 'extreme_danger';

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${advice.colorClass.badge}`}
          >
            <ShieldAlert className={`h-6 w-6 ${advice.colorClass.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Health &amp; Safety Advisory
              </h3>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${advice.colorClass.badge}`}
              >
                {advice.badgeText}
              </span>
            </div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {advice.pagasaLevel}
            </p>
          </div>
        </div>

        {isHighDanger && (
          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">
            <AlertTriangle className="h-4 w-4 animate-bounce" />
            Official Heat Warning Active
          </div>
        )}
      </div>

      {/* Advisory Summary Text */}
      <div className="mt-4 rounded-xl bg-neutral-50 p-3.5 text-sm text-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-800">
        <p className="leading-relaxed">
          <strong className="text-neutral-900 dark:text-white">Impact Assessment: </strong>
          {advice.summary}
        </p>
      </div>

      {/* Actionable Tabs */}
      <div className="mt-4 flex gap-1 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('hydration')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
            activeTab === 'hydration'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          <Droplets className="h-3.5 w-3.5 text-sky-400" />
          Hydration Rules
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
            activeTab === 'activity'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          Outdoor &amp; Labor Limits
        </button>

        <button
          onClick={() => setActiveTab('symptoms')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
            activeTab === 'symptoms'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          Symptoms to Watch
        </button>

        <button
          onClick={() => setActiveTab('firstaid')}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
            activeTab === 'firstaid'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          <LifeBuoy className="h-3.5 w-3.5 text-red-400" />
          Emergency First Aid
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-4 min-h-[110px]">
        {activeTab === 'hydration' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-start gap-3">
              <Droplets className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Recommended Daily Fluid Intake
                </h4>
                <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
                  {advice.hydration}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <Shirt className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Clothing Strategy
                </h4>
                <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
                  {advice.clothing}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Activity &amp; Work Guidance
                </h4>
                <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
                  {advice.outdoorActivity}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <Users className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Vulnerable Demographics &amp; Pets
                </h4>
                <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
                  {advice.vulnerableGroups}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'symptoms' && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Heat-Related Symptoms Reported at {heatIndex}°C:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {advice.symptoms.map((symptom, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 p-2.5 text-xs font-medium text-neutral-800 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-200"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <span>{symptom}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'firstaid' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-3.5 dark:border-red-900/40 dark:bg-red-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
                <LifeBuoy className="h-4 w-4" />
                Immediate Heat Stroke &amp; Exhaustion Protocol
              </h4>
              <p className="mt-1.5 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
                {advice.firstAid}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 text-xs text-neutral-500 dark:text-neutral-400">
              <span>National Emergency Hotline: <strong>911</strong></span>
              <span>•</span>
              <span>Philippine Red Cross: <strong>143</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
