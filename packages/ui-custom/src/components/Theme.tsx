import { useSyncExternalStore } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

export type Theme = 'light' | 'dark';

// The theme is the data-theme attribute on <html>. With no attribute the CSS
// follows the system setting. A choice made here is remembered.
const STORAGE_KEY = 'k-theme';
const listeners = new Set<() => void>();
const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

if (typeof document !== 'undefined') {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isTheme(saved)) document.documentElement.dataset.theme = saved;
  } catch {
    // Storage is blocked: keep whatever the page or the system says.
  }
}

function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (isTheme(set)) return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Not remembered, but still applied.
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', notify);
  return () => {
    listeners.delete(notify);
    mql.removeEventListener('change', notify);
  };
}

/** The theme in effect, and a setter that applies and remembers a choice. */
export function useTheme(): [Theme, (theme: Theme) => void] {
  return [useSyncExternalStore(subscribe, currentTheme, () => 'light' as const), setTheme];
}

/** An icon button that flips between light and dark. */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, set] = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <Button variant="ghost" icon className={className} aria-label={`Switch to ${next} theme`} onClick={() => set(next)}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </Button>
  );
}
