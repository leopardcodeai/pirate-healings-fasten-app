import { useState, useCallback } from 'react';
import Modal from './ui/Modal';
import { useApp } from '../context/AppContext';

const ENERGY_LEVELS = [1, 2, 3, 4, 5] as const;

const ELECTROLYTE_KEYS = ['na', 'k', 'mg'] as const;
const ELECTROLYTE_LABELS: Record<string, string> = { na: 'Na', k: 'K', mg: 'Mg' };

const SYMPTOM_KEYS = ['headache', 'dizziness', 'nausea', 'fatigue', 'insomnia'] as const;
const SYMPTOM_LABELS: Record<string, string> = {
  headache: 'Headache',
  dizziness: 'Dizziness',
  nausea: 'Nausea',
  fatigue: 'Fatigue',
  insomnia: 'Insomnia',
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyLogModal() {
  const { showDailyLog, setShowDailyLog, addDailyLog, profile } = useApp();

  // ── Local form state ────────────────────
  const [date, setDate] = useState(todayISO);
  const [glucose, setGlucose] = useState(90);
  const [ketones, setKetones] = useState(0.5);
  const [weight, setWeight] = useState(profile.weight);
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(3);
  const [electrolytes, setElectrolytes] = useState({ na: false, k: false, mg: false });
  const [symptoms, setSymptoms] = useState({
    headache: false,
    dizziness: false,
    nausea: false,
    fatigue: false,
    insomnia: false,
  });

  const resetForm = useCallback(() => {
    setDate(todayISO());
    setGlucose(90);
    setKetones(0.5);
    setWeight(profile.weight);
    setSleep(7);
    setEnergy(3);
    setElectrolytes({ na: false, k: false, mg: false });
    setSymptoms({ headache: false, dizziness: false, nausea: false, fatigue: false, insomnia: false });
  }, [profile.weight]);

  const handleSave = () => {
    addDailyLog({
      id: crypto.randomUUID(),
      date,
      glucose,
      ketones,
      weight,
      sleep,
      energy,
      electrolytes,
      symptoms,
    });
    setShowDailyLog(false);
    resetForm();
  };

  const toggleElectrolyte = (key: typeof ELECTROLYTE_KEYS[number]) =>
    setElectrolytes((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleSymptom = (key: typeof SYMPTOM_KEYS[number]) =>
    setSymptoms((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Modal isOpen={showDailyLog} onClose={() => setShowDailyLog(false)} title="Log Daily Vitals">
      <div className="space-y-4">
        {/* Date */}
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--sys-on-surface-variant)' }}>
            Date
          </label>
          <input
            type="date"
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Glucose */}
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--sys-on-surface-variant)' }}>
            Glucose (mg/dL)
          </label>
          <input
            type="number"
            className="input-field"
            value={glucose}
            step={1}
            min={20}
            max={400}
            onChange={(e) => setGlucose(parseFloat(e.target.value) || 0)}
          />
        </div>

        {/* Ketones */}
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--sys-on-surface-variant)' }}>
            Ketones (mmol/L)
          </label>
          <input
            type="number"
            className="input-field"
            value={ketones}
            step={0.1}
            min={0}
            max={20}
            onChange={(e) => setKetones(parseFloat(e.target.value) || 0)}
          />
        </div>

        {/* Weight */}
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--sys-on-surface-variant)' }}>
            Weight (kg)
          </label>
          <input
            type="number"
            className="input-field"
            value={weight}
            step={0.1}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
          />
        </div>

        {/* Sleep */}
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--sys-on-surface-variant)' }}>
            Sleep (hours)
          </label>
          <input
            type="number"
            className="input-field"
            value={sleep}
            step={0.5}
            min={0}
            max={24}
            onChange={(e) => setSleep(parseFloat(e.target.value) || 0)}
          />
        </div>

        {/* Energy */}
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--sys-on-surface-variant)' }}>
            Energy Level
          </label>
          <div className="flex items-center gap-2">
            {ENERGY_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEnergy(level)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor:
                    energy === level ? 'var(--accent-blue)' : 'var(--sys-surface-container)',
                  color: energy === level ? '#ffffff' : 'var(--sys-on-surface-variant)',
                  border:
                    energy === level
                      ? '2px solid var(--accent-blue)'
                      : '1px solid var(--sys-outline-variant)',
                  transform: energy === level ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Electrolytes */}
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--sys-on-surface-variant)' }}>
            Electrolytes
          </label>
          <div className="flex flex-wrap gap-2">
            {ELECTROLYTE_KEYS.map((key) => {
              const active = electrolytes[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleElectrolyte(key)}
                  className={active ? 'chip' : 'chip chip-inactive'}
                  style={
                    active
                      ? {
                          backgroundColor: 'rgba(52, 199, 89, 0.15)',
                          color: 'var(--accent-green)',
                          borderColor: 'var(--accent-green)',
                        }
                      : undefined
                  }
                >
                  {ELECTROLYTE_LABELS[key]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--sys-on-surface-variant)' }}>
            Symptoms
          </label>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_KEYS.map((key) => {
              const active = symptoms[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSymptom(key)}
                  className={active ? 'chip' : 'chip chip-inactive'}
                  style={
                    active
                      ? {
                          backgroundColor: 'rgba(255, 59, 48, 0.15)',
                          color: 'var(--accent-red)',
                          borderColor: 'var(--accent-red)',
                        }
                      : undefined
                  }
                >
                  {SYMPTOM_LABELS[key]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <button className="btn-primary w-full mt-2" onClick={handleSave}>
          Save Entry
        </button>
      </div>
    </Modal>
  );
}
