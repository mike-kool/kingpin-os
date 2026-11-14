// DaisyUI 5 implementation of the Kingpin OS component contract, on DaisyUI's
// default light theme. DaisyUI is class names on top of Tailwind v4, so these
// are plain elements with DaisyUI component classes. Behavior comes from the
// platform: a checkbox drives the drawer and <dialog> drives the modal.
// Mobile is below Tailwind's `md` breakpoint (48rem, 768px).

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Menu,
  Siren,
  X,
} from 'lucide-react';
import type {
  AppShellProps,
  BadgeProps,
  ButtonProps,
  DataTableProps,
  DatePickerProps,
  KitComponents,
  ModalProps,
  SelectProps,
  StatCardProps,
  TabsProps,
  TextareaProps,
  TextFieldProps,
  ToasterProps,
  Tone,
  ToastTone,
} from '@kingpin/shared';

const MOBILE_QUERY = '(max-width: 47.99rem)';
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
/** Below Tailwind's `md` breakpoint. */
function useIsMobile() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(MOBILE_QUERY).matches);
}

function AppShell({ title, nav, activeNavId, onNavigate, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  return (
    <div className="drawer">
      <input
        id={drawerId}
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        onChange={(e) => setOpen(e.currentTarget.checked)}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="drawer-content min-h-screen bg-base-200">
        <header className="navbar sticky top-0 z-30 border-b border-base-300 bg-base-100 px-4">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-6">
            <span className="text-lg font-bold">{title}</span>
            <nav aria-label="Main" className="hidden md:block">
              <ul className="menu menu-horizontal gap-1 p-0">
                {nav.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={item.id === activeNavId ? 'menu-active' : undefined}
                      aria-current={item.id === activeNavId ? 'page' : undefined}
                      onClick={() => onNavigate(item.id)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <button
              type="button"
              className="btn btn-square btn-ghost ml-auto md:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </header>
        <main>{children}</main>
      </div>
      <div className="drawer-side z-40">
        <label htmlFor={drawerId} aria-label="Close menu" className="drawer-overlay" />
        <div className="min-h-full w-72 bg-base-100 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg font-bold">{title}</span>
            <button
              type="button"
              className="btn btn-square btn-ghost"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>
          </div>
          <nav aria-label="Drawer">
            <ul className="menu w-full gap-1 p-0">
              {nav.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`min-h-11 ${item.id === activeNavId ? 'menu-active' : ''}`}
                    aria-current={item.id === activeNavId ? 'page' : undefined}
                    onClick={() => {
                      onNavigate(item.id);
                      setOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, gauge, alarm }: StatCardProps) {
  return (
    <div className="stats border border-base-300 bg-base-100 shadow-sm">
      <div className="stat max-md:px-4">
        <div className="stat-title flex items-center justify-between">
          {label}
          {alarm && <Siren className="size-5 text-error" role="img" aria-label="Siren: heat is high" />}
        </div>
        <div className="stat-value flex items-center gap-3 max-md:text-2xl">
          {value}
          {gauge !== undefined && (
            <div
              className={`radial-progress text-xs ${alarm ? 'text-error' : 'text-primary'}`}
              style={{ '--value': gauge, '--size': '2.75rem', '--thickness': '5px' } as React.CSSProperties}
              role="progressbar"
              aria-valuenow={gauge}
              aria-label={`${label} gauge`}
            />
          )}
        </div>
        {trend !== undefined && (
          <div className={`stat-desc flex items-center gap-1 ${trend >= 0 ? 'text-success' : 'text-error'}`}>
            {trend >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {trend >= 0 ? '+' : ''}
            {trend}% vs last week
          </div>
        )}
      </div>
    </div>
  );
}

function DataTable<Row>({ caption, columns, rows, getRowId, sort, onSortChange }: DataTableProps<Row>) {
  const isMobile = useIsMobile();
  const [primary, ...rest] = columns;

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        <select
          className="select w-full"
          aria-label={`Sort ${caption}`}
          value={sort?.key ?? ''}
          onChange={(e) => e.currentTarget.value && onSortChange(e.currentTarget.value)}
        >
          <option value="" disabled>
            Sort by…
          </option>
          {columns
            .filter((c) => c.sortable)
            .map((c) => (
              <option key={c.key} value={c.key}>
                {c.header}
              </option>
            ))}
        </select>
        <ul aria-label={caption} className="m-0 flex list-none flex-col gap-3 p-0">
          {rows.map((row) => (
            <li key={getRowId(row)} className="card card-border card-sm bg-base-100">
              <div className="card-body">
                {primary && <div className="mb-1.5 font-semibold">{primary.render(row)}</div>}
                <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  {rest.map((col) => (
                    <div key={col.key} className="contents">
                      <dt className="opacity-60">{col.header}</dt>
                      <dd className="m-0 text-right">{col.render(row)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
      <table aria-label={caption} className="table table-zebra min-w-[560px]">
        <thead>
          <tr>
            {columns.map((col) => {
              const active = sort?.key === col.key;
              const Icon = !active ? ChevronsUpDown : sort.direction === 'asc' ? ChevronUp : ChevronDown;
              return (
                <th
                  key={col.key}
                  className={col.numeric ? 'text-right' : undefined}
                  aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(col.key)}
                      className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap"
                    >
                      {col.header}
                      <Icon className="size-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowId(row)} className="hover:bg-base-200">
              {columns.map((col) => (
                <td key={col.key} className={col.numeric ? 'text-right' : undefined}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tabs({ tabs, activeId, onChange }: TabsProps) {
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  return (
    <div>
      <div role="tablist" className="tabs tabs-border mb-4 max-md:grid max-md:grid-cols-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={t.id === active?.id}
            aria-controls={`panel-${t.id}`}
            className={`tab ${t.id === active?.id ? 'tab-active' : ''}`}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {active && (
        <div role="tabpanel" id={`panel-${active.id}`} aria-labelledby={`tab-${active.id}`}>
          {active.content}
        </div>
      )}
    </div>
  );
}

const BADGE_CLASS: Record<Tone, string> = {
  neutral: 'badge-neutral',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-error',
  info: 'badge-info',
};

function Badge({ tone, children }: BadgeProps) {
  return <span className={`badge badge-soft badge-sm whitespace-nowrap ${BADGE_CLASS[tone]}`}>{children}</span>;
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="fieldset p-0">
      <label htmlFor={id} className="fieldset-legend pb-1 text-sm">
        {label}
        {required && (
          <span className="text-error" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="label text-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

const describedBy = (id: string, error?: string) => (error ? `${id}-error` : undefined);

function TextField({ id, label, required, error, value, onChange, onBlur }: TextFieldProps) {
  return (
    <Field id={id} label={label} required={required} error={error}>
      <input
        id={id}
        type="text"
        className={`input w-full ${error ? 'input-error' : ''}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, error)}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onBlur={onBlur}
      />
    </Field>
  );
}

function Select({ id, label, required, error, value, options, placeholder, onChange, onBlur }: SelectProps) {
  return (
    <Field id={id} label={label} required={required} error={error}>
      <select
        id={id}
        className={`select w-full ${error ? 'select-error' : ''}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, error)}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onBlur={onBlur}
      >
        <option value="" disabled>
          {placeholder ?? 'Pick one'}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** DaisyUI has no date picker, so this is the browser's own, in a DaisyUI input. */
function DatePicker({ id, label, required, error, value, onChange, onBlur }: DatePickerProps) {
  return (
    <Field id={id} label={label} required={required} error={error}>
      <input
        id={id}
        type="date"
        className={`input w-full ${error ? 'input-error' : ''}`}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, error)}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onBlur={onBlur}
      />
    </Field>
  );
}

function Textarea({ id, label, required, error, value, rows, onChange, onBlur }: TextareaProps) {
  return (
    <Field id={id} label={label} required={required} error={error}>
      <textarea
        id={id}
        className={`textarea w-full ${error ? 'textarea-error' : ''}`}
        rows={rows ?? 3}
        required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, error)}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onBlur={onBlur}
      />
    </Field>
  );
}

const BUTTON_CLASS = { primary: 'btn-primary', secondary: 'btn-outline', danger: 'btn-error' } as const;

function Button({ variant = 'primary', type = 'button', disabled, onClick, children }: ButtonProps) {
  return (
    <button type={type} className={`btn ${BUTTON_CLASS[variant]}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

function Modal({ open, title, children, confirmLabel, cancelLabel, onConfirm, onCancel }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <div className="modal-box">
        <h3 id={titleId} className="text-lg font-bold">
          {title}
        </h3>
        <p className="py-4 opacity-70">{children}</p>
        <div className="modal-action">
          <button type="button" className="btn btn-outline max-sm:flex-1" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-primary max-sm:flex-1" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onCancel} />
    </dialog>
  );
}

const ALERT_CLASS: Record<ToastTone, string> = {
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};

function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div className="toast toast-end z-50 max-sm:w-full" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} role="status" className={`alert ${ALERT_CLASS[t.tone]} shadow-lg`}>
          <span>{t.title}</span>
          <button
            type="button"
            className="btn btn-square btn-ghost"
            aria-label="Dismiss"
            onClick={() => onDismiss(t.id)}
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export const Kit: KitComponents = {
  AppShell,
  StatCard,
  DataTable,
  Tabs,
  Badge,
  TextField,
  Select,
  DatePicker,
  Textarea,
  Button,
  Modal,
  Toaster,
};
