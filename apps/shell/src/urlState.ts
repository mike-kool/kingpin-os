// The shell keeps its state in the URL so links are shareable and switching
// library keeps the current tab, viewport mode and phone.

import { LIBRARIES, isTabId, type LibraryId, type TabId } from '@kingpin/shared';
import { DEFAULT_DEVICE_ID, findDevice } from './devices';

export type ViewMode = 'desktop' | 'mobile' | 'both';
const VIEW_MODES: ViewMode[] = ['desktop', 'mobile', 'both'];

export interface ShellState {
  lib: LibraryId;
  tab: TabId;
  view: ViewMode;
  device: string;
}

export const DEFAULT_STATE: ShellState = {
  lib: 'shadcn',
  tab: 'operations',
  view: 'both',
  device: DEFAULT_DEVICE_ID,
};

function isLibraryId(value: unknown): value is LibraryId {
  return LIBRARIES.some((l) => l.id === value);
}

export function parseState(search: string): ShellState {
  const p = new URLSearchParams(search);
  const lib = p.get('lib');
  const tab = p.get('tab');
  const view = p.get('view') as ViewMode | null;
  return {
    lib: isLibraryId(lib) ? lib : DEFAULT_STATE.lib,
    tab: isTabId(tab) ? tab : DEFAULT_STATE.tab,
    view: view && VIEW_MODES.includes(view) ? view : DEFAULT_STATE.view,
    device: findDevice(p.get('device')).id,
  };
}

export function serializeState(state: ShellState): string {
  const p = new URLSearchParams();
  p.set('lib', state.lib);
  p.set('tab', state.tab);
  p.set('view', state.view);
  p.set('device', state.device);
  return `?${p.toString()}`;
}

declare const __PAGES_BASE__: string;

/** URL of a library page; the tab is only the starting tab. */
export function pageUrl(lib: LibraryId, tab: TabId): string {
  return `${__PAGES_BASE__}/${lib}/?tab=${tab}`;
}

export const SOURCE_BASE = 'https://github.com/mike-kool/kingpin-os/tree/main/packages';

export function sourceUrl(lib: LibraryId): string {
  return `${SOURCE_BASE}/ui-${lib}`;
}
