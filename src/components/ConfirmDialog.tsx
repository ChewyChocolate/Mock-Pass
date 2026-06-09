import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} panelClassName="max-w-md">
      {body ? <div className="text-sm text-on-surface-variant mb-6">{body}</div> : null}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="bg-surface-container-high border border-outline-variant text-on-surface px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            destructive
              ? 'bg-error text-on-error hover:brightness-110'
              : 'bg-primary text-on-primary hover:brightness-110'
          }`}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
