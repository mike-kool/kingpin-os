import { useId, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from './util';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Id of the selected tab. */
  value: string;
  onChange: (id: string) => void;
  /** Accessible name for the tab list. */
  label?: string;
  className?: string;
}

/** Tabs with arrow-key navigation. Only the selected panel is rendered. */
export function Tabs({ tabs, value, onChange, label, className }: TabsProps) {
  const uid = useId();
  const active = tabs.find((t) => t.id === value) ?? tabs[0];

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((t) => t.id === active?.id);
    const last = tabs.length - 1;
    const next =
      e.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : -1;
    const tab = tabs[next];
    if (!tab) return;
    e.preventDefault();
    onChange(tab.id);
    e.currentTarget.querySelectorAll<HTMLElement>('[role=tab]')[next]?.focus();
  }

  return (
    <div className={cx('k-tabs', className)}>
      <div role="tablist" aria-label={label} className="k-tablist" onKeyDown={onKeyDown}>
        {tabs.map((t) => {
          const selected = t.id === active?.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${uid}tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${uid}panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              className="k-tab"
              onClick={() => onChange(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {active && (
        <div role="tabpanel" id={`${uid}panel-${active.id}`} aria-labelledby={`${uid}tab-${active.id}`}>
          {active.content}
        </div>
      )}
    </div>
  );
}
