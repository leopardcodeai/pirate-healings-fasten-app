import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  const [visible, setVisible] = useState(isOpen);
  const [animateIn, setAnimateIn] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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

      {/* Content */}
      <div
        ref={contentRef}
        className={`relative w-full ${maxWidth} rounded-2xl shadow-2xl`}
        style={{
          backgroundColor: 'var(--sys-surface)',
          color: 'var(--sys-on-surface)',
          transition: 'transform 300ms ease-out, opacity 300ms ease-out',
          transform: animateIn ? 'scale(1)' : 'scale(0.95)',
          opacity: animateIn ? 1 : 0,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
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
        <div
          className="overflow-y-auto p-6"
          style={{ maxHeight: '80vh' }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
