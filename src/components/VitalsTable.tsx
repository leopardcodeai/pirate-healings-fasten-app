import { Trash2, ClipboardList } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VitalsTable() {
  const { dailyLogs, deleteDailyLog } = useApp();

  return (
    <div className="surface-card overflow-hidden animate-fade-in-up">
      {/* ── Header ──────────────────────────────── */}
      <div className="px-5 pt-5 pb-3">
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Vitals &amp; Logs
        </h2>
      </div>

      {dailyLogs.length === 0 ? (
        /* ── Empty State ──────────────────────── */
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <ClipboardList
            size={40}
            style={{ color: 'var(--sys-on-surface-muted)' }}
          />
          <p
            className="text-sm"
            style={{ color: 'var(--sys-on-surface-muted)' }}
          >
            No vitals logged yet
          </p>
        </div>
      ) : (
        /* ── Table ────────────────────────────── */
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{ background: 'var(--sys-surface-container)' }}
              >
                {['Date', 'Glucose (mg/dL)', 'Ketones (mmol/L)', 'Weight (kg)', 'Sleep (h)', 'Energy (1-5)', 'Electrolytes', 'Actions'].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                      style={{ color: 'var(--sys-on-surface-variant)' }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {dailyLogs.map((log, idx) => (
                <tr
                  key={log.id}
                  className="border-t transition-colors duration-150"
                  style={{
                    borderColor: 'var(--sys-outline-variant)',
                    background:
                      idx % 2 === 0
                        ? 'transparent'
                        : 'color-mix(in srgb, var(--sys-surface-container) 50%, transparent)',
                  }}
                >
                  <td className="px-4 py-3 whitespace-nowrap font-medium">
                    {formatDate(log.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {log.glucose}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {log.ketones.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {log.weight.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {log.sleep}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <EnergyDots level={log.energy} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {log.electrolytes.na && <ElecBadge label="Na" color="var(--accent-blue)" />}
                      {log.electrolytes.k && <ElecBadge label="K" color="var(--accent-purple)" />}
                      {log.electrolytes.mg && <ElecBadge label="Mg" color="var(--accent-green)" />}
                      {!log.electrolytes.na && !log.electrolytes.k && !log.electrolytes.mg && (
                        <span className="text-xs" style={{ color: 'var(--sys-on-surface-muted)' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteDailyLog(log.id)}
                      className="p-1.5 rounded-lg transition-all duration-150 hover:bg-[color-mix(in_srgb,var(--accent-red)_10%,transparent)]"
                      style={{ color: 'var(--accent-red)' }}
                      aria-label={`Delete log for ${log.date}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Helpers ────────────────────────────────────── */

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function ElecBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none"
      style={{
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
    >
      {label}
    </span>
  );
}

function EnergyDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full transition-colors duration-200"
          style={{
            background:
              i < level
                ? 'var(--accent-green)'
                : 'var(--sys-outline-variant)',
            opacity: i < level ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}
