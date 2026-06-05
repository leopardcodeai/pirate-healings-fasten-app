import Drawer from './ui/Drawer';
import SegmentedControl from './ui/SegmentedControl';
import { useApp } from '../context/AppContext';
import { RefreshCcw } from 'lucide-react';
import type { ThemeMode, Profile } from '../context/AppContext';

export default function SettingsDrawer() {
  const {
    showSettings,
    setShowSettings,
    theme,
    setTheme,
    profile,
    updateProfile,
    resetState,
  } = useApp();

  return (
    <Drawer isOpen={showSettings} onClose={() => setShowSettings(false)} title="Settings">
      {/* ── Theme Switcher ─────────────────────── */}
      <div>
        <p
          className="text-xs uppercase tracking-wider mb-2 font-medium"
          style={{ color: 'var(--sys-on-surface-variant)' }}
        >
          Appearance
        </p>
        <SegmentedControl<ThemeMode>
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
          value={theme}
          onChange={setTheme}
        />
      </div>

      {/* ── Profile ────────────────────────────── */}
      <div className="mt-8">
        <p
          className="text-xs uppercase tracking-wider mb-4 font-medium"
          style={{ color: 'var(--sys-on-surface-variant)' }}
        >
          Profile
        </p>

        {/* Gender */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium block"
            style={{ color: 'var(--sys-on-surface-variant)' }}
          >
            Gender
          </label>
          <SegmentedControl<'male' | 'female'>
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
            value={profile.gender}
            onChange={(v) => updateProfile({ gender: v })}
          />
        </div>

        {/* Weight */}
        <div className="space-y-2 mt-4">
          <label
            className="text-sm font-medium block"
            style={{ color: 'var(--sys-on-surface-variant)' }}
          >
            Weight (kg)
          </label>
          <input
            type="number"
            className="input-field"
            value={profile.weight}
            step={0.5}
            min={30}
            max={300}
            onChange={(e) => updateProfile({ weight: parseFloat(e.target.value) || 0 })}
          />
        </div>

        {/* Height */}
        <div className="space-y-2 mt-4">
          <label
            className="text-sm font-medium block"
            style={{ color: 'var(--sys-on-surface-variant)' }}
          >
            Height (cm)
          </label>
          <input
            type="number"
            className="input-field"
            value={profile.height}
            min={100}
            max={250}
            onChange={(e) => updateProfile({ height: parseFloat(e.target.value) || 0 })}
          />
        </div>

        {/* Age */}
        <div className="space-y-2 mt-4">
          <label
            className="text-sm font-medium block"
            style={{ color: 'var(--sys-on-surface-variant)' }}
          >
            Age
          </label>
          <input
            type="number"
            className="input-field"
            value={profile.age}
            min={10}
            max={120}
            onChange={(e) => updateProfile({ age: parseFloat(e.target.value) || 0 })}
          />
        </div>

        {/* Body Type */}
        <div className="space-y-2 mt-4">
          <label
            className="text-sm font-medium block"
            style={{ color: 'var(--sys-on-surface-variant)' }}
          >
            Body Type
          </label>
          <SegmentedControl<Profile['bodyType']>
            options={[
              { value: 'slim', label: 'Slim' },
              { value: 'average', label: 'Average' },
              { value: 'athletic', label: 'Athletic' },
              { value: 'obese', label: 'Obese' },
            ]}
            value={profile.bodyType}
            onChange={(v) => updateProfile({ bodyType: v })}
            size="sm"
          />
        </div>
      </div>

      {/* ── Danger Zone ────────────────────────── */}
      <div
        className="mt-8 pt-6"
        style={{ borderTop: '1px solid var(--sys-outline-variant)' }}
      >
        <p
          className="text-xs uppercase tracking-wider mb-4 font-medium"
          style={{ color: 'var(--sys-on-surface-variant)' }}
        >
          Reset
        </p>
        <button
          className="btn-destructive w-full"
          onClick={() => {
            if (window.confirm('Reset all data? This action cannot be undone.')) {
              resetState();
            }
          }}
        >
          <RefreshCcw size={16} />
          Reset All Data
        </button>
      </div>
    </Drawer>
  );
}
