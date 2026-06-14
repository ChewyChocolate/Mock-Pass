import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastVariant = 'info' | 'success' | 'error';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  /** Auto-dismiss after this many ms. Set to 0 to require manual close. */
  durationMs: number;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant, durationMs?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION_MS = 4000;

let counter = 0;
function nextId(): string {
  counter += 1;
  return `toast-${Date.now().toString(36)}-${counter}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const handle = timersRef.current.get(id);
    if (handle) {
      clearTimeout(handle);
      timersRef.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info', durationMs: number = DEFAULT_DURATION_MS) => {
      const id = nextId();
      setToasts((prev) => [...prev, { id, variant, message, durationMs }]);
      if (durationMs > 0) {
        const handle = setTimeout(() => dismiss(id), durationMs);
        timersRef.current.set(id, handle);
      }
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const handle of timers.values()) clearTimeout(handle);
      timers.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastView key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastView({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const palette = {
    info: {
      icon: Info,
      cls: 'border-primary/40 bg-primary-container/30 text-on-surface',
      iconCls: 'text-primary',
    },
    success: {
      icon: CheckCircle2,
      cls: 'border-tertiary/40 bg-tertiary-container/30 text-on-surface',
      iconCls: 'text-tertiary',
    },
    error: {
      icon: AlertTriangle,
      cls: 'border-error/40 bg-error-container/30 text-on-surface',
      iconCls: 'text-error',
    },
  }[toast.variant];

  const Icon = palette.icon;

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex items-start gap-3 min-w-[260px] max-w-md border rounded shadow-lg px-4 py-3 ${palette.cls}`}
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${palette.iconCls}`} />
      <p className="flex-1 text-sm leading-snug whitespace-pre-line">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>.');
  }
  return ctx;
}
