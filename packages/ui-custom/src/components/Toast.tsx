import { useEffect, type ReactNode } from 'react';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

export type ToastTone = 'success' | 'warning' | 'danger' | 'info';

export interface Toast {
  id: string;
  tone: ToastTone;
  title: ReactNode;
  description?: ReactNode;
}

export interface ToasterProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  /** Milliseconds before a toast dismisses itself; shown as a shrinking bar. Leave out to keep toasts until dismissed. */
  duration?: number;
}

const ICONS: Record<ToastTone, IconName> = { success: 'check', warning: 'alert', danger: 'error', info: 'info' };

function ToastItem({ toast, onDismiss, duration }: { toast: Toast } & Omit<ToasterProps, 'toasts'>) {
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss, toast.id]);
  return (
    <div role="status" className="k-toast" data-tone={toast.tone}>
      <span className="k-toast-icon">
        <Icon name={ICONS[toast.tone]} />
      </span>
      <div className="k-toast-text">
        <strong>{toast.title}</strong>
        {toast.description && <span>{toast.description}</span>}
      </div>
      <Button variant="ghost" icon aria-label="Dismiss" onClick={() => onDismiss(toast.id)}>
        <Icon name="close" />
      </Button>
      {duration ? <span className="k-toast-bar" style={{ animationDuration: `${duration}ms` }} /> : null}
    </div>
  );
}

/** A stack of notifications in the corner. The list is controlled: you hold it. */
export function Toaster({ toasts, onDismiss, duration }: ToasterProps) {
  return (
    <div className="k-toaster" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} duration={duration} />
      ))}
    </div>
  );
}
