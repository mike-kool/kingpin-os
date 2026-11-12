// Messages between the shell and a library page inside its iframe.
// The shell owns state in its URL; pages read the initial tab from their own
// URL and report changes back so the shell can keep both frames in sync.

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
