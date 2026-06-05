import { useRef, useState, useLayoutEffect, useCallback } from 'react';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const activeIndex = options.findIndex((o) => o.value === value);

  const measureIndicator = useCallback(() => {
    const activeOption = options[activeIndex];
    if (!activeOption) return;
    const btn = buttonRefs.current.get(activeOption.value);
    const container = containerRef.current;
    if (!btn || !container) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    setIndicator({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    });
  }, [activeIndex, options]);

  useLayoutEffect(() => {
    measureIndicator();
  }, [measureIndicator]);

  // Re-measure on resize
  useLayoutEffect(() => {
    window.addEventListener('resize', measureIndicator);
    return () => window.removeEventListener('resize', measureIndicator);
  }, [measureIndicator]);

  const setButtonRef = useCallback(
    (value: string) => (el: HTMLButtonElement | null) => {
      if (el) {
        buttonRefs.current.set(value, el);
      } else {
        buttonRefs.current.delete(value);
      }
    },
    [],
  );

  const heightClass = size === 'sm' ? 'h-8' : 'h-10';
  const textClass = size === 'sm' ? 'text-xs' : 'text-sm';
  const pillInset = 3; // px inset on top/bottom for the pill

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex ${heightClass} items-center rounded-xl p-[3px]`}
      style={{
        backgroundColor: 'var(--sys-surface-container-highest)',
      }}
      role="tablist"
    >
      {/* Sliding indicator pill */}
      <div
        className="absolute rounded-lg shadow-sm"
        style={{
          top: `${pillInset}px`,
          bottom: `${pillInset}px`,
          left: `${indicator.left}px`,
          width: `${indicator.width}px`,
          backgroundColor: 'var(--sys-surface)',
          transition: 'left 200ms ease, width 200ms ease',
          zIndex: 0,
        }}
      />

      {/* Option buttons */}
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            ref={setButtonRef(option.value)}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`relative z-10 cursor-pointer whitespace-nowrap px-4 ${textClass} font-medium transition-colors duration-150`}
            style={{
              color: isActive
                ? 'var(--sys-on-surface)'
                : 'var(--sys-on-surface-variant)',
              fontWeight: isActive ? 600 : 500,
              background: 'transparent',
              border: 'none',
              height: '100%',
              borderRadius: '0.5rem',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
