import type { ReactNode } from 'react';
import { cx } from './util';

export interface AppBarProps {
  /** Product name or logo, at the start. */
  brand: ReactNode;
  /** Usually a NavList; give it className="k-desktop" to hide it on phones. */
  children?: ReactNode;
  /** Buttons at the end. */
  actions?: ReactNode;
  className?: string;
}

/** A top bar that stays in view while the page scrolls. */
export function AppBar({ brand, children, actions, className }: AppBarProps) {
  return (
    <header className={cx('k-appbar', className)}>
      <div className="k-appbar-inner">
        <span className="k-brand">{brand}</span>
        {children}
        {actions && <div className="k-appbar-actions">{actions}</div>}
      </div>
    </header>
  );
}

export interface NavListItem {
  id: string;
  label: ReactNode;
}

export interface NavListProps {
  /** Accessible name of the navigation landmark. */
  label: string;
  items: NavListItem[];
  /** Id of the current item. */
  value: string;
  onChange: (id: string) => void;
  /** "row" for a top bar, "column" for a drawer. */
  direction?: 'row' | 'column';
  className?: string;
}

export function NavList({ label, items, value, onChange, direction = 'row', className }: NavListProps) {
  return (
    <nav aria-label={label} className={cx('k-nav', className)} data-direction={direction}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="k-nav-item"
          aria-current={item.id === value ? 'page' : undefined}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
