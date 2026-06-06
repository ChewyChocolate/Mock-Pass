import { useEffect, type ReactNode, type RefObject } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /**
   * Id of the title element used to label the dialog. Required when
   * `title` is omitted (so the dialog still has an accessible label).
   */
  labelledBy?: string;
  /**
   * Optional id of the element that describes the dialog (e.g. body copy).
   */
  describedBy?: string;
  /**
   * Tailwind class additions for the inner panel. Use `max-w-2xl` etc.
   * for sizing and `lg:max-w-md` to constrain the panel.
   */
  panelClassName?: string;
  /**
   * Render as a bottom-sheet on small screens (still centred on md+).
   * Used by the question navigator in the exam screen.
   */
  mobileSheet?: boolean;
  /**
   * Optional override for the close-X button (icon). Hidden when null.
   */
  hideCloseButton?: boolean;
  children: ReactNode;
  /**
   * Optional callback fired after the dialog is closed and unmounted.
   * Use to release large children that should not stay alive.
   */
  onClosed?: () => void;
}

const FOCUSABLE_CLOSE_LABEL = 'Close dialog';

function escapeHandler(active: boolean, onEscape: () => void) {
  return (e: KeyboardEvent) => {
    if (active && e.key === 'Escape') {
      e.stopPropagation();
      onEscape();
    }
  };
}

/**
 * Centralised modal scaffolding — overlay, focus trap, Escape-to-close,
 * and the close-X button. Use `mobileSheet` for a bottom-sheet on small
 * screens; the dialog is always centred on md+.
 */
export function Modal({
  open,
  onClose,
  title,
  labelledBy,
  describedBy,
  panelClassName = '',
  mobileSheet = false,
  hideCloseButton = false,
  children,
  onClosed,
}: ModalProps) {
  const ref = useFocusTrap<HTMLDivElement>(open);
  useEffect(() => {
    if (!open) return;
    const handler = escapeHandler(true, onClose);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);
  useEffect(() => {
    if (!open) onClosed?.();
  }, [open, onClosed]);

  if (!open) return null;

  const titleId = labelledBy ?? (title ? 'modal-title-fallback' : undefined);
  const panelBase = mobileSheet
    ? 'rounded-t-xl md:rounded-xl max-h-[90vh] overflow-y-auto'
    : 'rounded-xl';
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
      role="presentation"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        ref={ref as RefObject<HTMLDivElement | null>}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        className={`bg-surface-container border border-outline-variant max-w-2xl w-full shadow-2xl p-6 md:p-8 relative focus:outline-none ${panelBase} ${panelClassName}`}
      >
        {title && (
          <h2
            id={titleId}
            className="text-xl font-bold tracking-tight mb-4 pr-8"
          >
            {title}
          </h2>
        )}
        {!hideCloseButton && (
          <button
            onClick={onClose}
            aria-label={FOCUSABLE_CLOSE_LABEL}
            className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
