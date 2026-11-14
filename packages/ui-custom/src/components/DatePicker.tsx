import { useEffect, useRef, useState } from 'react';
import { Calendar } from './Calendar';
import { isIso, toTime } from './dates';
import { useFieldControl } from './Field';
import { Icon } from './Icon';
import { cx } from './util';

export interface DatePickerProps {
  /** ISO date, yyyy-mm-dd, or '' when empty. */
  value: string;
  onChange: (value: string) => void;
  /** Called when the calendar closes. */
  onBlur?: () => void;
  id?: string;
  placeholder?: string;
  /** Earliest and latest allowed days, as ISO dates. */
  min?: string;
  max?: string;
  /** BCP 47 tag for month and day names; defaults to the browser's. */
  locale?: string;
  /** 0 is Sunday, 1 is Monday. */
  weekStartsOn?: 0 | 1;
  className?: string;
}

/** A button that shows the date and opens a calendar to change it. */
export function DatePicker({
  value,
  onChange,
  onBlur,
  placeholder = 'Pick a date',
  locale,
  className,
  id: ownId,
  ...calendar
}: DatePickerProps) {
  const field = useFieldControl();
  const id = ownId ?? field.props.id;
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const selected = isIso(value) ? value : '';

  function close(refocus: boolean) {
    setOpen(false);
    if (refocus) trigger.current?.focus();
    onBlur?.();
  }

  function toggle() {
    if (open) return close(true);
    const box = trigger.current!.getBoundingClientRect();
    setAbove(window.innerHeight - box.bottom < 380 && box.top > 380);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, onBlur]);

  const valueId = id ? `${id}-value` : undefined;
  const text = selected
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(toTime(selected))
    : placeholder;

  return (
    <div ref={root} className={cx('k-date', className)}>
      <button
        ref={trigger}
        type="button"
        className="k-input k-date-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        id={id}
        aria-invalid={field.props['aria-invalid']}
        aria-describedby={field.props['aria-describedby']}
        aria-labelledby={field.labelId && valueId ? `${field.labelId} ${valueId}` : undefined}
        data-empty={!selected || undefined}
        onClick={toggle}
      >
        <span id={valueId}>{text}</span>
        <Icon name="calendar" />
      </button>
      {open && (
          <Calendar
            {...calendar}
            locale={locale}
            above={above}
            value={selected}
            onClose={() => close(true)}
            onPick={(next) => {
              onChange(next);
              close(true);
            }}
          />
      )}
    </div>
  );
}
