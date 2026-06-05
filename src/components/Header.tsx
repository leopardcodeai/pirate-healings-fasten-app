import { User, Settings, ClipboardPlus, Droplets, Utensils } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const {
    profile,
    protocolName,
    setShowSettings,
    setShowDailyLog,
    setShowPractices,
    setShowRefeedGuide,
  } = useApp();

  return (
    <div className="sticky top-0 z-50 flex flex-col gap-3">
      {/* ── Top Bar ─────────────────────────────────── */}
      <header className="glass-card flex items-center justify-between px-6 h-16" style={{ borderRadius: 'var(--radius-xl)' }}>
        {/* Left: App Name */}
        <h1
          className="text-xl font-bold select-none"
          style={{
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          FastFlow Analytics
        </h1>

        {/* Center: Profile stat pills */}
        <div className="hidden md:flex items-center gap-2">
          <StatPill>
            <User size={12} />
            <span className="capitalize">{profile.gender}</span>
          </StatPill>
          <StatPill>{profile.weight} kg</StatPill>
          <StatPill>{profile.height} cm</StatPill>
          <StatPill>{profile.age} y</StatPill>
          <StatPill>{protocolName}</StatPill>
        </div>

        {/* Right: Settings gear */}
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:bg-[var(--sys-surface-container)]"
          style={{ color: 'var(--sys-on-surface-variant)' }}
          aria-label="Settings"
        >
          <Settings
            size={20}
            className="transition-transform duration-300 ease-out hover:rotate-90"
          />
        </button>
      </header>

      {/* ── Action Buttons Row ──────────────────────── */}
      <div className="flex items-center gap-2 px-1">
        <button
          className="btn-secondary h-9 text-sm gap-1.5 px-4"
          onClick={() => setShowDailyLog(true)}
        >
          <ClipboardPlus size={15} />
          Log Vitals
        </button>
        <button
          className="btn-secondary h-9 text-sm gap-1.5 px-4"
          onClick={() => setShowPractices(true)}
        >
          <Droplets size={15} />
          Hydration &amp; Practices
        </button>
        <button
          className="btn-secondary h-9 text-sm gap-1.5 px-4"
          onClick={() => setShowRefeedGuide(true)}
        >
          <Utensils size={15} />
          Refeeding Guide
        </button>
      </div>
    </div>
  );
}

/* ── Stat Pill sub-component ────────────────────── */
function StatPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        background: 'var(--sys-surface-container)',
        color: 'var(--sys-on-surface-variant)',
      }}
    >
      {children}
    </span>
  );
}
