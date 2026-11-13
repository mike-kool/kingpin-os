// Messages between the shell and a library page inside its iframe.
// The shell owns state in its URL; pages read the initial tab from their own
// URL and report changes back so the shell can keep both frames in sync.

import { useCallback, useEffect, useState } from 'react';
import type { TabId } from './types';

export const TAB_IDS: readonly TabId[] = ['operations', 'rivals', 'laundering'];

export function isTabId(value: unknown): value is TabId {
  return typeof value === 'string' && (TAB_IDS as readonly string[]).includes(value);
}

export type PageToShell = { source: 'kingpin-page'; type: 'tab-changed'; tab: TabId };
export type ShellToPage = { source: 'kingpin-shell'; type: 'set-tab'; tab: TabId };

export function isPageToShell(data: unknown): data is PageToShell {
  const d = data as PageToShell | null;
  return !!d && d.source === 'kingpin-page' && d.type === 'tab-changed' && isTabId(d.tab);
}

export function isShellToPage(data: unknown): data is ShellToPage {
  const d = data as ShellToPage | null;
  return !!d && d.source === 'kingpin-shell' && d.type === 'set-tab' && isTabId(d.tab);
}

/** Read `?tab=` from a URL search string, falling back to Operations. */
export function tabFromSearch(search: string): TabId {
  const tab = new URLSearchParams(search).get('tab');
  return isTabId(tab) ? tab : 'operations';
}

/**
 * Tab state for a library page running inside the shell's iframe. Starts from
 * `?tab=`, reports changes to the shell, and follows `set-tab` from the shell
 * so the desktop and phone frames stay on the same tab.
 */
export function useEmbeddedTab(): [TabId, (tab: TabId) => void] {
  const [tab, setTabState] = useState<TabId>(() =>
    typeof window === 'undefined' ? 'operations' : tabFromSearch(window.location.search),
  );

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (isShellToPage(event.data)) setTabState(event.data.tab);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const setTab = useCallback((next: TabId) => {
    setTabState(next);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', next);
    window.history.replaceState(null, '', url);
    if (window.parent !== window) {
      const message: PageToShell = { source: 'kingpin-page', type: 'tab-changed', tab: next };
      window.parent.postMessage(message, window.location.origin);
    }
  }, []);

  return [tab, setTab];
}
