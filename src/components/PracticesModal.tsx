import { useState, useMemo } from 'react';
import Modal from './ui/Modal';
import { useApp } from '../context/AppContext';
import { Droplets, Activity, X, ChevronDown, ChevronUp } from 'lucide-react';

const PRACTICES = [
  { id: 'yoga', label: 'Morning Yoga Sequence' },
  { id: 'prep', label: 'Shankhaprakshalana Preparation' },
  { id: 'rounds', label: 'Salt Water Rounds (6x)' },
  { id: 'rest', label: 'Rest & Recovery' },
] as const;

type PracticeStatus = 'not_started' | 'in_progress' | 'complete';

function getStatusDot(status: PracticeStatus) {
  const base = 'inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors duration-200';
  switch (status) {
    case 'complete':
      return <span className={base} style={{ backgroundColor: 'var(--accent-green)' }} />;
    case 'in_progress':
      return <span className={`${base} animate-pulse`} style={{ backgroundColor: 'var(--accent-yellow)' }} />;
    default:
      return (
        <span
          className={base}
          style={{ border: '2px solid var(--sys-outline)', backgroundColor: 'transparent' }}
        />
      );
  }
}

export default function PracticesModal() {
  const {
    showPractices,
    setShowPractices,
    tbw,
    waterTarget,
    waterEntries,
    addWaterEntry,
    deleteWaterEntry,
  } = useApp();

  // ── Practice checklist state ─────────
  const [checked, setChecked] = useState<Record<string, boolean>>({
    yoga: false,
    prep: false,
    rounds: false,
    rest: false,
  });
  const [showProtocol, setShowProtocol] = useState(false);

  // ── Today's water entries ────────────
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEntries = useMemo(
    () => waterEntries.filter((e) => e.timestamp.slice(0, 10) === todayStr),
    [waterEntries, todayStr],
  );
  const todayTotal = useMemo(
    () => todayEntries.reduce((sum, e) => sum + e.amount, 0),
    [todayEntries],
  );

  const togglePractice = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const getPracticeStatus = (id: string): PracticeStatus => {
    const idx = PRACTICES.findIndex((p) => p.id === id);
    if (checked[id]) return 'complete';
    // Mark as in_progress if previous items are all checked
    if (idx > 0 && PRACTICES.slice(0, idx).every((p) => checked[p.id])) return 'in_progress';
    if (idx === 0 && !checked[id]) return 'in_progress';
    return 'not_started';
  };

  return (
    <Modal
      isOpen={showPractices}
      onClose={() => setShowPractices(false)}
      title="Practices"
      maxWidth="max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Left Pane: Hydration ───────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Droplets size={18} style={{ color: 'var(--accent-blue)' }} />
            <h3
              className="text-base font-semibold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--sys-on-surface)' }}
            >
              Hydration
            </h3>
          </div>

          {/* TBW & Target pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className="chip"
              style={{
                backgroundColor: 'rgba(0, 113, 227, 0.1)',
                color: 'var(--accent-blue)',
                borderColor: 'var(--accent-blue)',
                cursor: 'default',
              }}
            >
              TBW: {tbw.toFixed(1)}L
            </span>
            <span
              className="chip"
              style={{
                backgroundColor: 'rgba(52, 199, 89, 0.1)',
                color: 'var(--accent-green)',
                borderColor: 'var(--accent-green)',
                cursor: 'default',
              }}
            >
              Target: {waterTarget.toFixed(1)}L/day
            </span>
          </div>

          {/* Quick-add buttons */}
          <div className="flex gap-2 mb-4">
            <button
              className="btn-secondary flex-1"
              style={{ height: '38px', fontSize: '14px' }}
              onClick={() => addWaterEntry(250)}
            >
              +250ml
            </button>
            <button
              className="btn-primary flex-1"
              style={{ height: '38px', fontSize: '14px' }}
              onClick={() => addWaterEntry(500)}
            >
              +500ml
            </button>
          </div>

          {/* Today's entries */}
          <div
            className="rounded-xl p-3 space-y-1"
            style={{ backgroundColor: 'var(--sys-surface-container)' }}
          >
            {todayEntries.length === 0 ? (
              <p
                className="text-sm text-center py-3"
                style={{ color: 'var(--sys-on-surface-muted)' }}
              >
                No water logged today
              </p>
            ) : (
              <>
                {todayEntries.map((entry) => {
                  const time = new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const ml = Math.round(entry.amount * 1000);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors duration-150 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--sys-on-surface-muted)' }}>
                          {time}
                        </span>
                        <span className="text-sm font-medium" style={{ color: 'var(--sys-on-surface)' }}>
                          {ml}ml
                        </span>
                      </div>
                      <button
                        onClick={() => deleteWaterEntry(entry.id)}
                        className="p-1 rounded-full transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                        style={{ color: 'var(--sys-on-surface-muted)' }}
                        aria-label="Remove entry"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
                <div
                  className="flex items-center justify-between pt-2 mt-1"
                  style={{ borderTop: '1px solid var(--sys-outline-variant)' }}
                >
                  <span className="text-xs font-medium" style={{ color: 'var(--sys-on-surface-variant)' }}>
                    Total
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--accent-blue)' }}
                  >
                    {(todayTotal * 1000).toFixed(0)}ml
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Right Pane: Practices ──────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} style={{ color: 'var(--accent-purple)' }} />
            <h3
              className="text-base font-semibold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--sys-on-surface)' }}
            >
              Practices
            </h3>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            {PRACTICES.map((practice) => {
              const isChecked = checked[practice.id];
              const status = getPracticeStatus(practice.id);
              return (
                <button
                  key={practice.id}
                  type="button"
                  onClick={() => togglePractice(practice.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: isChecked
                      ? 'rgba(52, 199, 89, 0.08)'
                      : 'var(--sys-surface-container)',
                    border: `1px solid ${isChecked ? 'var(--accent-green)' : 'var(--sys-outline-variant)'}`,
                  }}
                >
                  {getStatusDot(status)}
                  <span
                    className="text-sm font-medium text-left flex-1"
                    style={{
                      color: isChecked ? 'var(--accent-green)' : 'var(--sys-on-surface)',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      opacity: isChecked ? 0.8 : 1,
                    }}
                  >
                    {practice.label}
                  </span>
                  {/* Checkbox indicator */}
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                    style={{
                      backgroundColor: isChecked ? 'var(--accent-green)' : 'transparent',
                      border: isChecked ? 'none' : '2px solid var(--sys-outline)',
                    }}
                  >
                    {isChecked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Status Legend */}
          <div className="flex items-center gap-4 mt-4 mb-3">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ border: '2px solid var(--sys-outline)', backgroundColor: 'transparent' }}
              />
              <span className="text-xs" style={{ color: 'var(--sys-on-surface-muted)' }}>Not started</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-yellow)' }} />
              <span className="text-xs" style={{ color: 'var(--sys-on-surface-muted)' }}>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-green)' }} />
              <span className="text-xs" style={{ color: 'var(--sys-on-surface-muted)' }}>Complete</span>
            </div>
          </div>

          {/* Collapsible Protocol */}
          <button
            type="button"
            onClick={() => setShowProtocol(!showProtocol)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-150 cursor-pointer"
            style={{
              backgroundColor: 'var(--sys-surface-container)',
              border: '1px solid var(--sys-outline-variant)',
            }}
          >
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--sys-on-surface-variant)' }}>
              Protocol Instructions
            </span>
            {showProtocol ? (
              <ChevronUp size={16} style={{ color: 'var(--sys-on-surface-variant)' }} />
            ) : (
              <ChevronDown size={16} style={{ color: 'var(--sys-on-surface-variant)' }} />
            )}
          </button>
          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              maxHeight: showProtocol ? '300px' : '0',
              opacity: showProtocol ? 1 : 0,
            }}
          >
            <div
              className="text-xs leading-relaxed p-3 mt-2 rounded-xl"
              style={{
                color: 'var(--sys-on-surface-variant)',
                backgroundColor: 'var(--sys-surface-container)',
              }}
            >
              <p className="font-semibold mb-1" style={{ color: 'var(--sys-on-surface)' }}>
                Shankhaprakshalana Protocol
              </p>
              <p className="mb-2">
                A yogic intestinal cleansing technique using warm salt water and specific asanas.
                Perform on an empty stomach, ideally in the morning.
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Prepare lukewarm water with 2 teaspoons of salt per litre.</li>
                <li>Drink 2 glasses, then perform the 5 prescribed asanas (8 reps each).</li>
                <li>Repeat the cycle 6-8 times until the water runs clear.</li>
                <li>Rest for 45 minutes, then eat khichdi (rice + mung dal) with ghee.</li>
                <li>Avoid raw foods, dairy, and stimulants for 24 hours.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
