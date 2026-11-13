// Stand-in page used until each library's kit is built. It exercises the
// shell contract: tab sync over postMessage and real responsive breakpoints.

import { useEffect, useState } from 'react';
import {
  LIBRARIES,
  STATUS_LABEL,
  THREAT_LABEL,
  formatBucks,
  seed,
  useEmbeddedTab,
  type LibraryId,
  type TabId,
} from '@kingpin/shared';

const TABS: { id: TabId; label: string }[] = [
  { id: 'operations', label: 'Operations' },
  { id: 'rivals', label: 'Rivals' },
  { id: 'laundering', label: 'Laundering' },
];

function useViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

export function Placeholder({ lib }: { lib: LibraryId }) {
  const [tab, setTab] = useEmbeddedTab();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const width = useViewportWidth();
  const name = LIBRARIES.find((l) => l.id === lib)?.name ?? lib;

  const rows: string[][] =
    tab === 'operations'
      ? seed.crew.slice(0, 6).map((c) => [c.codename, STATUS_LABEL[c.status]])
      : tab === 'rivals'
        ? seed.rivals.slice(0, 6).map((r) => [r.name, THREAT_LABEL[r.threat]])
        : seed.fronts.slice(0, 6).map((f) => [f.name, formatBucks(f.cleanedThisWeek)]);

  return (
    <div className="ph">
      <header className="ph-top">
        <strong>Kingpin OS</strong>
        <nav className="ph-nav" aria-label="Main">
          <a href="#">Dashboard</a>
          <a href="#">Crew</a>
          <a href="#">Territories</a>
        </nav>
        <button
          className="ph-menu"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((o) => !o)}
        >
          ☰
        </button>
      </header>
      {drawerOpen && (
        <nav className="ph-drawer" aria-label="Drawer">
          <a href="#">Dashboard</a>
          <a href="#">Crew</a>
          <a href="#">Territories</a>
        </nav>
      )}
      <main className="ph-main">
        <p className="ph-note">
          The <b>{name}</b> version is coming in a later step. This page is a stand-in.
          Viewport: <span data-testid="viewport-width">{width}</span>px
          (<span data-testid="layout">{width < 640 ? 'mobile' : 'desktop'}</span> layout)
        </p>
        <div role="tablist" className="ph-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <ul className="ph-list" data-testid="tab-content" data-tab={tab}>
          {rows.map(([a, b]) => (
            <li key={a}>
              <span>{a}</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
