import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
}: DrawerProps) {
  const [visible, setVisible] = useState(isOpen);
  const [animateIn, setAnimateIn] = useState(false);

  // Mount/unmount with animation
  useEffect(() => {
    let animTimer: ReturnType<typeof setTimeout>;
    let renderTimer: ReturnType<typeof setTimeout>;

    if (isOpen) {
      renderTimer = setTimeout(() => {
        setVisible(true);
        animTimer = setTimeout(() => setAnimateIn(true), 50);
      }, 0);
    } else {
      animTimer = setTimeout(() => setAnimateIn(false), 0);
      renderTimer = setTimeout(() => setVisible(false), 300);
    }

    return () => {
      clearTimeout(animTimer);
      clearTimeout(renderTimer);
    };
  }, [isOpen]);

  // ESC key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!visible) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleKeyDown]);

  // Prevent body scroll when open
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  if (!visible) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          transition: 'opacity 300ms ease-out',
          opacity: animateIn ? 1 : 0,
        }}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 bottom-0 flex w-full max-w-md flex-col"
        style={{
          backgroundColor: 'var(--sys-surface)',
          color: 'var(--sys-on-surface)',
          boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.15)',
          transition: 'transform 300ms ease-out',
          transform: animateIn ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            borderBottom: '1px solid var(--sys-outline-variant)',
            flexShrink: 0,
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--sys-on-surface)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Close"
            style={{ color: 'var(--sys-on-surface-variant)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
