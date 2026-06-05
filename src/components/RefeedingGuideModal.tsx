import Modal from './ui/Modal';
import { useApp } from '../context/AppContext';
import { AlertCircle } from 'lucide-react';

interface RefeedPhase {
  name: string;
  startHour: number;
  endHour: number;
  description: string;
}

const REFEED_PHASES: RefeedPhase[] = [
  {
    name: 'Broth Only',
    startHour: 0,
    endHour: 12,
    description:
      'Start with bone broth or clear vegetable broth. Small sips every 30–60 minutes. Avoid solid food.',
  },
  {
    name: 'Soft Foods',
    startHour: 12,
    endHour: 24,
    description:
      'Introduce soft cooked vegetables (zucchini, carrots). Small portions. Chew thoroughly.',
  },
  {
    name: 'Light Proteins',
    startHour: 24,
    endHour: 48,
    description:
      'Add light proteins: soft eggs, steamed fish. Continue small portions.',
  },
  {
    name: 'Normal Foods',
    startHour: 48,
    endHour: Infinity,
    description:
      'Gradually return to normal eating. Avoid processed foods, sugar, and alcohol for the first week.',
  },
];

export default function RefeedingGuideModal() {
  const { showRefeedGuide, setShowRefeedGuide, hoursElapsed, protocol } = useApp();

  const refeedStart = protocol.preFastHours + protocol.fastDuration;
  const refeedHour = Math.max(0, hoursElapsed - refeedStart);
  const isInRefeed = hoursElapsed >= refeedStart;

  const getPhaseStatus = (phase: RefeedPhase) => {
    if (!isInRefeed) return 'upcoming';
    if (refeedHour >= phase.endHour) return 'completed';
    if (refeedHour >= phase.startHour && refeedHour < phase.endHour) return 'current';
    return 'upcoming';
  };

  return (
    <Modal
      isOpen={showRefeedGuide}
      onClose={() => setShowRefeedGuide(false)}
      title="Refeeding Guide"
    >
      {/* ── Top banner ─────────────────────── */}
      {!isInRefeed && (
        <div
          className="flex items-start gap-3 rounded-xl p-4 mb-6"
          style={{
            backgroundColor: 'rgba(0, 113, 227, 0.08)',
            border: '1px solid rgba(0, 113, 227, 0.2)',
          }}
        >
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-blue)' }} />
          <p className="text-sm" style={{ color: 'var(--accent-blue)' }}>
            Refeeding phase has not started yet. It begins at hour{' '}
            <span className="font-semibold">{refeedStart}</span>.
          </p>
        </div>
      )}

      {/* ── Timeline ───────────────────────── */}
      <div className="relative">
        {/* Vertical connector line */}
        <div
          className="absolute top-3 bottom-3 left-[15px] w-px"
          style={{ backgroundColor: 'var(--sys-outline-variant)' }}
        />

        <div className="space-y-3">
          {REFEED_PHASES.map((phase, idx) => {
            const status = getPhaseStatus(phase);
            const isCurrent = status === 'current';
            const isCompleted = status === 'completed';
            const phaseDuration = phase.endHour === Infinity ? 0 : phase.endHour - phase.startHour;
            const hourLabel =
              phase.endHour === Infinity ? `${phase.startHour}h+` : `${phase.startHour}–${phase.endHour}h`;

            return (
              <div
                key={idx}
                className="relative flex gap-4 rounded-xl p-4 transition-all duration-300"
                style={{
                  backgroundColor: isCurrent
                    ? 'rgba(0, 113, 227, 0.06)'
                    : 'var(--sys-surface-container)',
                  borderLeft: isCurrent ? '3px solid var(--accent-blue)' : '3px solid transparent',
                  border: isCurrent
                    ? undefined
                    : `1px solid var(--sys-outline-variant)`,
                  opacity: isCompleted ? 0.7 : 1,
                }}
              >
                {/* Circle indicator */}
                <div className="flex-shrink-0 relative z-10 mt-0.5">
                  {isCompleted ? (
                    <div
                      className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--accent-green)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : isCurrent ? (
                    <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center relative">
                      {/* Pulsing ring */}
                      <div
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{
                          backgroundColor: 'var(--accent-blue)',
                          opacity: 0.2,
                        }}
                      />
                      <div
                        className="w-[30px] h-[30px] rounded-full border-[3px]"
                        style={{
                          borderColor: 'var(--accent-blue)',
                          backgroundColor: 'rgba(0, 113, 227, 0.15)',
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-[30px] h-[30px] rounded-full"
                      style={{
                        border: '2px solid var(--sys-outline)',
                        backgroundColor: 'var(--sys-surface)',
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        color: isCompleted
                          ? 'var(--sys-on-surface-muted)'
                          : isCurrent
                          ? 'var(--accent-blue)'
                          : 'var(--sys-on-surface)',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                      }}
                    >
                      {phase.name}
                    </h4>

                    {/* Progress badge for current phase */}
                    {isCurrent && phaseDuration > 0 && (
                      <span
                        className="chip"
                        style={{
                          height: '26px',
                          fontSize: '11px',
                          backgroundColor: 'rgba(0, 113, 227, 0.12)',
                          color: 'var(--accent-blue)',
                          borderColor: 'var(--accent-blue)',
                          cursor: 'default',
                        }}
                      >
                        Hour {Math.floor(refeedHour - phase.startHour)} of {phaseDuration}
                      </span>
                    )}
                  </div>

                  <p
                    className="text-xs mb-1.5"
                    style={{
                      color: isCompleted
                        ? 'var(--sys-on-surface-muted)'
                        : 'var(--sys-on-surface-variant)',
                      lineHeight: '1.5',
                    }}
                  >
                    {phase.description}
                  </p>

                  <span
                    className="text-xs font-medium"
                    style={{
                      color: 'var(--sys-on-surface-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {hourLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
