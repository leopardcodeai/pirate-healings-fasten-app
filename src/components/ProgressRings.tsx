import { useApp } from '../context/AppContext';

const OUTER_R = 90;
const INNER_R = 70;
const OUTER_CIRC = 2 * Math.PI * OUTER_R;
const INNER_CIRC = 2 * Math.PI * INNER_R;

export default function ProgressRings() {
  const { fastingCompletionPercent, currentHydration } = useApp();

  const fastPct = Math.min(Math.max(fastingCompletionPercent, 0), 100);
  const hydrPct = Math.min(Math.max(currentHydration, 0), 100);

  const outerOffset = OUTER_CIRC * (1 - fastPct / 100);
  const innerOffset = INNER_CIRC * (1 - hydrPct / 100);

  // Dynamic hydration color
  const hydrationColor =
    currentHydration >= 70
      ? 'var(--accent-blue)'
      : currentHydration >= 45
        ? 'var(--accent-yellow)'
        : 'var(--accent-red)';

  return (
    <div className="surface-card p-6 flex flex-col items-center gap-5 animate-fade-in-up">
      {/* ── SVG Rings ──────────────────────────── */}
      <div className="relative">
        <svg viewBox="0 0 200 200" width={200} height={200} className="block">
          {/* Outer track */}
          <circle
            cx={100}
            cy={100}
            r={OUTER_R}
            fill="none"
            stroke="var(--sys-outline-variant)"
            strokeWidth={8}
            opacity={0.3}
          />
          {/* Outer progress */}
          <circle
            cx={100}
            cy={100}
            r={OUTER_R}
            fill="none"
            stroke="var(--accent-blue)"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={OUTER_CIRC}
            strokeDashoffset={outerOffset}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />

          {/* Inner track */}
          <circle
            cx={100}
            cy={100}
            r={INNER_R}
            fill="none"
            stroke="var(--sys-outline-variant)"
            strokeWidth={8}
            opacity={0.3}
          />
          {/* Inner progress */}
          <circle
            cx={100}
            cy={100}
            r={INNER_R}
            fill="none"
            stroke={hydrationColor}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={INNER_CIRC}
            strokeDashoffset={innerOffset}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease' }}
          />

          {/* Center text */}
          <text
            x={100}
            y={90}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--sys-on-surface)"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700 }}
          >
            {Math.round(fastPct)}%
          </text>
          <text
            x={100}
            y={110}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--sys-on-surface-variant)"
            style={{ fontFamily: 'var(--font-body)', fontSize: '11px' }}
          >
            Protocol
          </text>
          <text
            x={100}
            y={132}
            textAnchor="middle"
            dominantBaseline="central"
            fill={hydrationColor}
            style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, transition: 'fill 0.5s ease' }}
          >
            {Math.round(hydrPct)}%
          </text>
          <text
            x={100}
            y={147}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--sys-on-surface-variant)"
            style={{ fontFamily: 'var(--font-body)', fontSize: '10px' }}
          >
            Hydration
          </text>
        </svg>
      </div>

      {/* ── Stat pills ─────────────────────────── */}
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            background: 'color-mix(in srgb, var(--accent-blue) 12%, transparent)',
            color: 'var(--accent-blue)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--accent-blue)' }}
          />
          Fasting: {Math.round(fastPct)}%
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            background: `color-mix(in srgb, ${hydrationColor} 12%, transparent)`,
            color: hydrationColor,
            transition: 'all 0.5s ease',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: hydrationColor, transition: 'background 0.5s ease' }}
          />
          Hydration: {Math.round(hydrPct)}%
        </span>
      </div>

      {/* ── Dehydration Banner ─────────────────── */}
      {currentHydration < 50 && (
        <div className="dehydration-banner w-full animate-fade-in">
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--accent-orange)' }}
          >
            ⚠️ Dehydration risk: low body volume level. Intake water with minerals.
          </p>
        </div>
      )}
    </div>
  );
}
