import { useState } from 'react';
import { useApp } from '../context/AppContext';

const DURATION_PRESETS = [18, 24, 48, 72, 120, 168] as const;

export default function QuickConfigPanel() {
  const { protocol, updateProtocol, fastStart, setFastStart } = useApp();
  const [isCustom, setIsCustom] = useState(
    () => !DURATION_PRESETS.includes(protocol.fastDuration as typeof DURATION_PRESETS[number])
  );

  // Convert ISO string → datetime-local value
  const toDatetimeLocal = (iso: string): string => {
    const d = new Date(iso);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60_000);
    return local.toISOString().slice(0, 16);
  };

  // Convert datetime-local value → ISO string
  const fromDatetimeLocal = (dtl: string): string => {
    return new Date(dtl).toISOString();
  };

  const handlePresetClick = (hours: number) => {
    setIsCustom(false);
    updateProtocol({ fastDuration: hours });
  };

  const handleCustomToggle = () => {
    setIsCustom(true);
  };

  return (
    <div className="surface-card p-5 animate-fade-in-up">
      <div className="flex flex-wrap gap-6 items-end">
        {/* ── Fasting Duration ──────────────────── */}
        <div className="flex flex-col gap-2 min-w-0">
          <Label>Fasting Duration</Label>
          <div className="flex flex-wrap items-center gap-1.5">
            {DURATION_PRESETS.map((h) => {
              const isActive = !isCustom && protocol.fastDuration === h;
              return (
                <button
                  key={h}
                  onClick={() => handlePresetClick(h)}
                  className={isActive ? 'chip' : 'chip chip-inactive'}
                  style={
                    isActive
                      ? {
                          background: 'color-mix(in srgb, var(--accent-blue) 15%, transparent)',
                          color: 'var(--accent-blue)',
                          borderColor: 'color-mix(in srgb, var(--accent-blue) 30%, transparent)',
                        }
                      : undefined
                  }
                >
                  {h}h
                </button>
              );
            })}
            <button
              onClick={handleCustomToggle}
              className={isCustom ? 'chip' : 'chip chip-inactive'}
              style={
                isCustom
                  ? {
                      background: 'color-mix(in srgb, var(--accent-blue) 15%, transparent)',
                      color: 'var(--accent-blue)',
                      borderColor: 'color-mix(in srgb, var(--accent-blue) 30%, transparent)',
                    }
                  : undefined
              }
            >
              Custom
            </button>
          </div>
          {isCustom && (
            <input
              type="number"
              min={1}
              className="input-field w-28 animate-fade-in"
              value={protocol.fastDuration}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 1) updateProtocol({ fastDuration: v });
              }}
              placeholder="Hours"
            />
          )}
        </div>

        {/* ── Pre-Fast Hours ───────────────────── */}
        <div className="flex flex-col gap-2">
          <Label>Pre-Fast Hours</Label>
          <input
            type="number"
            min={0}
            className="input-field w-24"
            value={protocol.preFastHours}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 0) updateProtocol({ preFastHours: v });
            }}
          />
        </div>

        {/* ── Refeed Days ──────────────────────── */}
        <div className="flex flex-col gap-2">
          <Label>Refeed Days</Label>
          <input
            type="number"
            min={0}
            className="input-field w-24"
            value={protocol.refeedDays}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 0) updateProtocol({ refeedDays: v });
            }}
          />
        </div>

        {/* ── Start Date & Time ────────────────── */}
        <div className="flex flex-col gap-2">
          <Label>Start Date &amp; Time</Label>
          <input
            type="datetime-local"
            className="input-field w-52"
            value={toDatetimeLocal(fastStart)}
            onChange={(e) => {
              if (e.target.value) setFastStart(fromDatetimeLocal(e.target.value));
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Label sub-component ──────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs font-medium uppercase tracking-wider"
      style={{ color: 'var(--sys-on-surface-variant)' }}
    >
      {children}
    </span>
  );
}
