import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceArea, ReferenceLine,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useApp, BIOMARKER_COLORS, BIOMARKER_LABELS, BIOMARKER_UNITS } from '../context/AppContext';

// ─── Biomarker keys ──────────────────────────────────────────────────────────
const BIOMARKER_KEYS = [
  'glucose', 'insulin', 'glycogen', 'autophagy', 'ketones',
  'ghrelin', 'stemCellsIntestinal', 'stemCellsHematopoietic', 'immuneReboot', 'hydration',
] as const;

// ─── Value Formatter ─────────────────────────────────────────────────────────
function formatRaw(key: string, raw: number): string {
  const unit = BIOMARKER_UNITS[key] ?? '';
  switch (key) {
    case 'glucose':
    case 'insulin':
      return `${raw.toFixed(1)} ${unit}`;
    case 'ketones':
      return `${raw.toFixed(2)} ${unit}`;
    case 'stemCellsIntestinal':
    case 'stemCellsHematopoietic':
      return `${raw.toFixed(1)}${unit}`;
    case 'glycogen':
    case 'autophagy':
    case 'ghrelin':
    case 'immuneReboot':
    case 'hydration':
      return `${Math.round(raw)}${unit}`;
    default:
      return `${raw.toFixed(1)} ${unit}`;
  }
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: number;
  activeLines: Record<string, boolean>;
  fastStart: string;
}

function ChartTooltip({ active, payload, label, activeLines, fastStart }: TooltipProps) {
  if (!active || !payload || payload.length === 0 || label === undefined) return null;

  const hour = label;
  const startDate = new Date(fastStart);
  const pointDate = new Date(startDate.getTime() + hour * 3_600_000);
  const dateStr = pointDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = pointDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const dataPoint = payload[0]?.payload;

  return (
    <div
      style={{
        background: 'var(--sys-surface)',
        border: '1px solid var(--sys-outline-variant)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        padding: 12,
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        minWidth: 180,
      }}
    >
      <div style={{ color: 'var(--sys-on-surface-variant)', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--sys-on-surface)' }}>
          Hour {hour}
        </span>
        <span style={{ margin: '0 6px' }}>·</span>
        {dateStr} {timeStr}
      </div>
      {BIOMARKER_KEYS.filter(k => activeLines[k]).map(key => {
        const rawKey = `${key}Raw`;
        const rawVal = dataPoint?.[rawKey];
        if (rawVal === undefined) return null;
        return (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '3px 0',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: BIOMARKER_COLORS[key],
                flexShrink: 0,
              }}
            />
            <span style={{ color: 'var(--sys-on-surface-variant)', flex: 1 }}>
              {BIOMARKER_LABELS[key]}
            </span>
            <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--sys-on-surface)' }}>
              {formatRaw(key, rawVal)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function BiomarkerChart() {
  const { chartData, phases, hoursElapsed, totalHours, activeLines, toggleLine, fastStart } = useApp();

  // Generate tick marks every 12 hours
  const ticks = useMemo(() => {
    const t: number[] = [];
    for (let h = 0; h <= totalHours; h += 12) t.push(h);
    return t;
  }, [totalHours]);

  // X-axis label formatter
  const tickFormatter = (hour: number) => {
    if (hour % 24 === 0) return `D${hour / 24}`;
    return '+12h';
  };

  return (
    <div>
      {/* ── Biomarker Selector Chips ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {BIOMARKER_KEYS.map(key => {
          const isActive = activeLines[key];
          const color = BIOMARKER_COLORS[key];
          return (
            <button
              key={key}
              onClick={() => toggleLine(key)}
              className={isActive ? 'chip' : 'chip chip-inactive'}
              style={isActive ? {
                background: `${color}26`,
                color: color,
                borderColor: `${color}4D`,
              } : undefined}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                }}
              />
              {BIOMARKER_LABELS[key]}
            </button>
          );
        })}
      </div>

      {/* ── Chart Card ── */}
      <div className="surface-card" style={{ padding: 16 }}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 25, right: 20, bottom: 5, left: 0 }}>
            {/* ── Gradient Definitions ── */}
            <defs>
              {BIOMARKER_KEYS.filter(k => activeLines[k]).map(key => (
                <linearGradient key={`gradient-${key}`} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BIOMARKER_COLORS[key]} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={BIOMARKER_COLORS[key]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            {/* ── Grid ── */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--sys-outline-variant)"
              opacity={0.3}
              horizontal={true}
              vertical={false}
            />

            {/* ── Axes ── */}
            <XAxis
              dataKey="hour"
              type="number"
              domain={[0, totalHours]}
              ticks={ticks}
              tickFormatter={tickFormatter}
              tick={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fill: 'var(--sys-on-surface-variant)',
              }}
              axisLine={{ stroke: 'var(--sys-outline-variant)' }}
              tickLine={{ stroke: 'var(--sys-outline-variant)' }}
            />
            <YAxis domain={[0, 120]} hide={true} />

            {/* ── Phase Background Bands ── */}
            {phases.map((phase, i) => (
              <ReferenceArea
                key={`bg-${i}`}
                x1={phase.start}
                x2={phase.end}
                y1={0}
                y2={105}
                fill={phase.color}
                fillOpacity={0.04}
                ifOverflow="extendDomain"
              />
            ))}

            {/* ── Top Segmented Tracker Bar ── */}
            {phases.map((phase, i) => {
              let opacity: number;
              if (phase.end <= hoursElapsed) {
                opacity = 0.45; // passed
              } else if (phase.start <= hoursElapsed && hoursElapsed < phase.end) {
                opacity = 0.85; // active
              } else {
                opacity = 0.2; // upcoming
              }
              const isActive = phase.start <= hoursElapsed && hoursElapsed < phase.end;
              return (
                <ReferenceArea
                  key={`tracker-${i}`}
                  x1={phase.start}
                  x2={phase.end}
                  y1={108}
                  y2={120}
                  fill={phase.color}
                  fillOpacity={opacity}
                  radius={[4, 4, 4, 4]}
                  ifOverflow="extendDomain"
                  label={isActive ? {
                    value: phase.name,
                    position: 'center',
                    fill: phase.color,
                    fontSize: 10,
                    fontWeight: 600,
                    fontFamily: 'var(--font-heading)',
                  } : undefined}
                />
              );
            })}

            {/* ── NOW Line ── */}
            {hoursElapsed <= totalHours && (
              <ReferenceLine
                x={hoursElapsed}
                stroke="var(--accent-yellow)"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: '📍 NOW',
                  position: 'top',
                  fill: 'var(--accent-yellow)',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                }}
              />
            )}

            {/* ── Area Curves ── */}
            {BIOMARKER_KEYS.filter(k => activeLines[k]).map(key => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={BIOMARKER_COLORS[key]}
                fill={`url(#gradient-${key})`}
                strokeWidth={2}
                dot={false}
                animationDuration={800}
              />
            ))}

            {/* ── Tooltip ── */}
            <Tooltip
              content={<ChartTooltip activeLines={activeLines} fastStart={fastStart} />}
              cursor={{ stroke: 'var(--sys-on-surface-muted)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
