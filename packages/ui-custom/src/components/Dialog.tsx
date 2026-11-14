import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { cx } from './util';

interface SheetProps {
  open: boolean;
  /** Asked to close: Escape, a click outside, or the close button. */
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * The shared base: a native <dialog> opened with showModal(), which gives a
 * focus trap, an inert page behind, Escape to close and focus restored to
 * the opener, with no script of ours. Open state stays controlled.
 */
function useModal(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return ref;
}

function sheetProps(onClose: () => void) {
  return {
    onCancel: (e: React.SyntheticEvent) => {
      e.preventDefault();
      onClose();
    },
    // The backdrop belongs to the dialog element; its content is a child.
    onClick: (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
  };
}

export interface DialogProps extends SheetProps {
  /** Usually buttons. Stacked full width on a phone. */
  footer?: ReactNode;
}

/** A modal dialog, centered on desktop and a bottom sheet on a phone. */
export function Dialog({ open, onClose, title, footer, className, children }: DialogProps) {
  const ref = useModal(open);
  const titleId = useId();
  return (
    <dialog ref={ref} className={cx('k-dialog', className)} aria-labelledby={titleId} {...sheetProps(onClose)}>
      <div className="k-dialog-body">
        <h2 id={titleId} className="k-dialog-title">
          {title}
        </h2>
        <div className="k-dialog-content">{children}</div>
        {footer && <div className="k-dialog-footer">{footer}</div>}
      </div>
    </dialog>
  );
}

export interface DrawerProps extends SheetProps {
  side?: 'left' | 'right';
}

/** A panel that slides in from the side, for navigation on small screens. */
export function Drawer({ open, onClose, title, side = 'left', className, children }: DrawerProps) {
  const ref = useModal(open);
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      className={cx('k-drawer', className)}
      data-side={side}
      aria-labelledby={titleId}
      {...sheetProps(onClose)}
    >
      <div className="k-drawer-body">
        <div className="k-drawer-head">
          <span id={titleId} className="k-brand">
            {title}
          </span>
          <Button variant="ghost" icon aria-label="Close menu" onClick={onClose}>
            <Icon name="close" />
          </Button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
