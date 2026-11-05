import React, { useState, useId } from 'react';
import { HourlyPoint } from '../types/heat';
import { getHeatRiskLevel } from '../utils/heatIndex';

interface HeatChartProps {
  data: HourlyPoint[];
  isDark: boolean;
}

export const HeatChart: React.FC<HeatChartProps> = ({ data, isDark }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartId = useId();

  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-neutral-400">
        Loading 24-hour temperature trend...
      </div>
    );
  }

  // Calculate scales
  const allTemps = data.map((d) => d.temperature);
  const allHeat = data.map((d) => d.heatIndex);
  const combined = [...allTemps, ...allHeat];

  const rawMin = Math.min(...combined);
  const rawMax = Math.max(...combined);

  // Pad the Y-axis slightly for comfortable headroom
  const minY = Math.floor(rawMin - 2);
  const maxY = Math.ceil(rawMax + 3);
  const rangeY = maxY - minY || 1;

  // Chart dimensions
  const width = 800;
  const height = 260;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 35;
  const paddingBottom = 45;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (index: number) => paddingLeft + (index / (data.length - 1)) * chartW;
  const getY = (val: number) => paddingTop + chartH - ((val - minY) / rangeY) * chartH;

  // Find peak heat index index
  let peakIndex = 0;
  let maxHeat = -Infinity;
  data.forEach((d, i) => {
    if (d.heatIndex > maxHeat) {
      maxHeat = d.heatIndex;
      peakIndex = i;
    }
  });

  // Build SVG path strings
  const tempPoints = data.map((d, i) => `${getX(i)},${getY(d.temperature)}`);
  const heatPoints = data.map((d, i) => `${getX(i)},${getY(d.heatIndex)}`);

  const tempLinePath = `M ${tempPoints.join(' L ')}`;
  const heatLinePath = `M ${heatPoints.join(' L ')}`;

  // Area under heat line
  const heatAreaPath = `M ${getX(0)},${getY(data[0].heatIndex)} L ${heatPoints.join(
    ' L '
  )} L ${getX(data.length - 1)},${paddingTop + chartH} L ${getX(0)},${paddingTop + chartH} Z`;

  // Grid steps (3-4 horizontal lines)
  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }).map((_, i) => {
    const val = Math.round(minY + (rangeY / gridSteps) * i);
    const y = getY(val);
    return { val, y };
  });

  // Current active point for inspection (default to peak or hovered)
  const activePoint = hoverIndex !== null ? data[hoverIndex] : data[peakIndex];
  const activeX = hoverIndex !== null ? getX(hoverIndex) : getX(peakIndex);
  const activeLevel = activePoint ? getHeatRiskLevel(activePoint.heatIndex) : 'safe';

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'danger':
      case 'extreme_danger':
        return 'bg-red-500 text-white font-bold';
      case 'extreme_caution':
        return 'bg-amber-500 text-white font-bold';
      case 'caution':
        return 'bg-yellow-500 text-neutral-900 font-bold';
      default:
        return 'bg-emerald-500 text-white font-semibold';
    }
  };

  return (
    <div className="w-full select-none">
      {/* Active inspect summary bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            {hoverIndex !== null ? 'Selected Time:' : 'Peak Heat Today:'}
          </span>
          <span className="font-bold text-neutral-900 dark:text-white">
            {activePoint?.formattedTime}
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] uppercase tracking-wide ${getBadgeStyle(
              activeLevel
            )}`}
          >
            {activeLevel.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-orange-400/30" />
            <span className="text-neutral-600 dark:text-neutral-400">Heat Index:</span>
            <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">
              {activePoint?.heatIndex}°C
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500 ring-2 ring-sky-400/30" />
            <span className="text-neutral-600 dark:text-neutral-400">Ambient:</span>
            <span className="font-bold text-sky-600 dark:text-sky-400 text-sm">
              {activePoint?.temperature}°C
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
            <span>RH:</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {activePoint?.relativeHumidity}%
            </span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden rounded-xl border border-neutral-200 bg-white p-2 shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 sm:h-64 cursor-crosshair touch-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            const clampedX = Math.max(paddingLeft, Math.min(width - paddingRight, mouseX));
            const frac = (clampedX - paddingLeft) / chartW;
            const idx = Math.min(data.length - 1, Math.max(0, Math.round(frac * (data.length - 1))));
            setHoverIndex(idx);
          }}
          onTouchMove={(e) => {
            if (e.touches.length > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              const touchX = ((e.touches[0].clientX - rect.left) / rect.width) * width;
              const clampedX = Math.max(paddingLeft, Math.min(width - paddingRight, touchX));
              const frac = (clampedX - paddingLeft) / chartW;
              const idx = Math.min(data.length - 1, Math.max(0, Math.round(frac * (data.length - 1))));
              setHoverIndex(idx);
            }
          }}
          onMouseLeave={() => setHoverIndex(null)}
          onTouchEnd={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={`heatGrad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={isDark ? 0.35 : 0.25} />
              <stop offset="90%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={`tempGrad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={isDark ? 0.2 : 0.15} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y labels */}
          {gridLines.map(({ val, y }, idx) => (
            <g key={`grid-${idx}`}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke={isDark ? '#262626' : '#e5e7eb'}
                strokeWidth="1"
                strokeDasharray={idx === 0 || idx === gridLines.length - 1 ? '' : '3 3'}
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill={isDark ? '#a3a3a3' : '#6b7280'}
                fontWeight="500"
              >
                {val}°C
              </text>
            </g>
          ))}

          {/* Fill under Heat Index */}
          <path d={heatAreaPath} fill={`url(#heatGrad-${chartId})`} />

          {/* Ambient Temperature Line */}
          <path
            d={tempLinePath}
            fill="none"
            stroke={isDark ? '#38bdf8' : '#0284c7'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Real Feel Heat Index Line */}
          <path
            d={heatLinePath}
            fill="none"
            stroke={isDark ? '#fb923c' : '#ea580c'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points on Heat Index line */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.heatIndex);
            const isPeak = i === peakIndex;
            return (
              <g key={`heat-dot-${i}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isPeak ? 5 : 2.5}
                  fill={isPeak ? '#ef4444' : isDark ? '#fb923c' : '#ea580c'}
                  stroke={isDark ? '#0a0a0a' : '#ffffff'}
                  strokeWidth={isPeak ? 2 : 1}
                />
                {isPeak && (
                  <g transform={`translate(${cx}, ${cy - 12})`}>
                    <rect
                      x="-28"
                      y="-16"
                      width="56"
                      height="18"
                      rx="4"
                      fill="#ef4444"
                    />
                    <text
                      x="0"
                      y="-4"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      MAX {d.heatIndex}°
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Ambient temp dots every 3 hours */}
          {data.map((d, i) => {
            if (i % 3 !== 0) return null;
            const cx = getX(i);
            const cy = getY(d.temperature);
            return (
              <circle
                key={`temp-dot-${i}`}
                cx={cx}
                cy={cy}
                r={2.5}
                fill={isDark ? '#38bdf8' : '#0284c7'}
                stroke={isDark ? '#0a0a0a' : '#ffffff'}
                strokeWidth="1"
              />
            );
          })}

          {/* Vertical scrubber indicator on hover */}
          {activePoint && (
            <g>
              <line
                x1={activeX}
                y1={paddingTop - 10}
                x2={activeX}
                y2={paddingTop + chartH}
                stroke={isDark ? '#f59e0b' : '#d97706'}
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <circle
                cx={activeX}
                cy={getY(activePoint.heatIndex)}
                r="6"
                fill="#f97316"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle
                cx={activeX}
                cy={getY(activePoint.temperature)}
                r="5"
                fill="#0ea5e9"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* X-axis labels (every 3 to 4 hours) */}
          {data.map((d, i) => {
            if (i % 3 !== 0 && i !== data.length - 1) return null;
            const x = getX(i);
            const y = height - paddingBottom + 20;
            return (
              <g key={`x-lbl-${i}`}>
                <line
                  x1={x}
                  y1={height - paddingBottom}
                  x2={x}
                  y2={height - paddingBottom + 5}
                  stroke={isDark ? '#525252' : '#9ca3af'}
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize="11"
                  fill={isDark ? '#d4d4d4' : '#4b5563'}
                  fontWeight="600"
                >
                  {d.formattedTime}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 px-2 pt-2 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-5 rounded-full bg-orange-500" />
              Real Feel Heat Index
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-5 rounded-full bg-sky-500" />
              Actual Temperature
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
            Swipe or scrub chart to inspect hourly fluctuation
          </span>
        </div>
      </div>
    </div>
  );
};
