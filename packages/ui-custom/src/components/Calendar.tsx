import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Button } from './Button';
import { addDays, addMonths, todayIso, toTime } from './dates';
import { Icon } from './Icon';

export interface CalendarProps {
  /** The selected day as an ISO date, or ''. */
  value: string;
  onPick: (value: string) => void;
  onClose: () => void;
  min?: string;
  max?: string;
  locale?: string;
  weekStartsOn?: 0 | 1;
  /** Open upward instead of downward. */
  above?: boolean;
}

/**
 * The calendar popover behind DatePicker. Arrow keys move by day and week,
 * Home and End by week, Page Up and Page Down by month (with Shift, by year).
 */
export function Calendar({ value, onPick, onClose, min, max, locale, weekStartsOn = 0, above }: CalendarProps) {
  // The day that holds keyboard focus; the calendar shows its month.
  const [cursor, setCursor] = useState(() => value || todayIso());
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    root.current?.querySelector<HTMLElement>(`[data-date="${cursor}"]`)?.focus();
  }, [cursor]);

  const allowed = (iso: string) => (!min || iso >= min) && (!max || iso <= max);

  function onGridKeyDown(e: KeyboardEvent) {
    const weekday = (new Date(toTime(cursor)).getUTCDay() - weekStartsOn + 7) % 7;
    const next =
      e.key === 'ArrowLeft' ? addDays(cursor, -1)
      : e.key === 'ArrowRight' ? addDays(cursor, 1)
      : e.key === 'ArrowUp' ? addDays(cursor, -7)
      : e.key === 'ArrowDown' ? addDays(cursor, 7)
      : e.key === 'Home' ? addDays(cursor, -weekday)
      : e.key === 'End' ? addDays(cursor, 6 - weekday)
      : e.key === 'PageUp' ? addMonths(cursor, e.shiftKey ? -12 : -1)
      : e.key === 'PageDown' ? addMonths(cursor, e.shiftKey ? 12 : 1)
      : null;
    if (!next) return;
    e.preventDefault();
    if (allowed(next)) setCursor(next);
  }

  function onPopoverKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      return onClose();
    }
    if (e.key !== 'Tab') return;
    // Keep Tab inside the calendar while it is open.
    const stops = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not([tabindex="-1"]):not(:disabled)')];
    const edge = e.shiftKey ? stops[0] : stops[stops.length - 1];
    if (document.activeElement === edge) {
      e.preventDefault();
      (e.shiftKey ? stops[stops.length - 1] : stops[0])?.focus();
    }
  }

  const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });
  const monthStart = `${cursor.slice(0, 8)}01`;
  const gridStart = addDays(monthStart, -((new Date(toTime(monthStart)).getUTCDay() - weekStartsOn + 7) % 7));
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const today = todayIso();

  return (
    <div
      ref={root}
      role="dialog"
      aria-label="Choose a date"
      className="k-popover k-calendar"
      data-above={above || undefined}
      onKeyDown={onPopoverKeyDown}
    >
      <div className="k-calendar-head">
        <Button variant="ghost" icon aria-label="Previous month" onClick={() => setCursor(addMonths(cursor, -1))}>
          <Icon name="chevron-left" />
        </Button>
        <span aria-live="polite">{format({ month: 'long', year: 'numeric' }).format(toTime(cursor))}</span>
        <Button variant="ghost" icon aria-label="Next month" onClick={() => setCursor(addMonths(cursor, 1))}>
          <Icon name="chevron-right" />
        </Button>
      </div>
      <div className="k-calendar-grid" aria-hidden="true">
        {days.slice(0, 7).map((iso) => (
          <span key={iso}>{format({ weekday: 'short' }).format(toTime(iso)).slice(0, 2)}</span>
        ))}
      </div>
      <div className="k-calendar-grid" role="group" aria-label="Days" onKeyDown={onGridKeyDown}>
        {days.map((iso) => (
          <button
            key={iso}
            type="button"
            className="k-day"
            data-date={iso}
            data-outside={iso.slice(0, 7) !== cursor.slice(0, 7) || undefined}
            tabIndex={iso === cursor ? 0 : -1}
            aria-label={format({ dateStyle: 'full' }).format(toTime(iso))}
            aria-pressed={iso === value}
            aria-current={iso === today ? 'date' : undefined}
            disabled={!allowed(iso)}
            onClick={() => onPick(iso)}
          >
            {Number(iso.slice(8))}
          </button>
        ))}
      </div>
      <div className="k-calendar-foot">
        <Button variant="ghost" disabled={!value} onClick={() => onPick('')}>
          Clear
        </Button>
        <Button variant="ghost" disabled={!allowed(today)} onClick={() => onPick(today)}>
          Today
        </Button>
      </div>
    </div>
  );
}
