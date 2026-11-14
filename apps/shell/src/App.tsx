import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { LIBRARIES, isPageToShell, type LibraryId, type ShellToPage, type TabId } from '@kingpin/shared';
import { DEVICES, findDevice, type Device } from './devices';
import { Fab } from './Fab';
import { formatKb, useStats, type LibraryStats } from './stats';
import {
  pageUrl,
  parseState,
  serializeState,
  sourceUrl,
  type ShellState,
  type ViewMode,
} from './urlState';

/** Below this real screen width the shell is on a phone: mobile frame only. */
const PHONE_QUERY = '(max-width: 899px)';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

function useShellState() {
  const [state, setState] = useState<ShellState>(() => parseState(window.location.search));
  useEffect(() => {
    const next = serializeState(state);
    if (next !== window.location.search) window.history.replaceState(null, '', next);
  }, [state]);
  const update = useCallback((patch: Partial<ShellState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);
  return [state, update] as const;
}

export function App() {
  const [state, update] = useShellState();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const view: ViewMode = isPhone ? 'mobile' : state.view;
  const device = findDevice(state.device);
  const stats = useStats();
  const libStats = stats?.libraries[state.lib];

  const desktopRef = useRef<HTMLIFrameElement>(null);
  const mobileRef = useRef<HTMLIFrameElement>(null);

  // The iframe URL carries only the starting tab; later tab changes travel by
  // postMessage so the page doesn't reload. A new library reloads the frame.
  const [loaded, setLoaded] = useState({ lib: state.lib, tab: state.tab });
  if (loaded.lib !== state.lib) setLoaded({ lib: state.lib, tab: state.tab });
  const src = pageUrl(loaded.lib, loaded.tab);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || !isPageToShell(event.data)) return;
      const frames = [desktopRef.current, mobileRef.current];
      const from = frames.find((f) => f?.contentWindow === event.source);
      if (!from) return;
      const tab: TabId = event.data.tab;
      update({ tab });
      const message: ShellToPage = { source: 'kingpin-shell', type: 'set-tab', tab };
      for (const frame of frames) {
        if (frame && frame !== from) frame.contentWindow?.postMessage(message, window.location.origin);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [update]);

  const libName = LIBRARIES.find((l) => l.id === state.lib)?.name ?? state.lib;
  // The library's page by itself, with no shell around it.
  const standaloneUrl = pageUrl(state.lib, state.tab);

  return (
    <div className="shell" data-phone={isPhone || undefined}>
      {isPhone ? (
        // On a phone the page gets the whole screen; the shell is a small
        // draggable tab that opens this menu.
        <Fab label="Kingpin OS menu">
          {(close) => (
            <>
              <h1 className="fab-title">
                <span aria-hidden="true">♛</span> Kingpin OS
              </h1>
              <LibrarySwitcher
                value={state.lib}
                onChange={(lib) => {
                  update({ lib });
                  close();
                }}
              />
              <Badges stats={libStats} statsReady={stats !== null} />
              <div className="fab-links">
                <a href={standaloneUrl} target="_blank" rel="noreferrer">
                  Open {libName} on its own
                </a>
                <a href={sourceUrl(state.lib)} target="_blank" rel="noreferrer">
                  View source
                </a>
              </div>
            </>
          )}
        </Fab>
      ) : (
        <>
          <header className="shell-header">
            <div className="shell-brand">
              <span className="shell-logo" aria-hidden="true">♛</span>
              <div>
                <h1>Kingpin OS</h1>
                <p>One app, six UI libraries</p>
              </div>
            </div>

            <LibrarySwitcher value={state.lib} onChange={(lib) => update({ lib })} />

            <div className="shell-controls">
              <ViewToggle value={state.view} onChange={(v) => update({ view: v })} />
              {view !== 'desktop' && <DevicePicker value={device.id} onChange={(id) => update({ device: id })} />}
            </div>
          </header>

          <div className="shell-meta">
            <Badges stats={libStats} statsReady={stats !== null} />
            <div className="shell-links">
              <a href={standaloneUrl} target="_blank" rel="noreferrer">
                Open {libName} on its own
              </a>
              <a href={sourceUrl(state.lib)} target="_blank" rel="noreferrer">
                View {libName} source
              </a>
            </div>
          </div>
        </>
      )}

      <main className="shell-stage" data-view={view}>
        {view !== 'mobile' && (
          <div className="frame-desktop">
            <iframe
              key={`desktop-${state.lib}`}
              ref={desktopRef}
              src={src}
              title={`${libName}, desktop`}
              data-testid="frame-desktop"
            />
          </div>
        )}
        {view !== 'desktop' &&
          (isPhone ? (
            <div className="frame-native">
              <iframe
                key={`mobile-${state.lib}`}
                ref={mobileRef}
                src={src}
                title={`${libName}, mobile`}
                data-testid="frame-mobile"
              />
            </div>
          ) : (
            <PhoneFrame device={device}>
              <iframe
                key={`mobile-${state.lib}`}
                ref={mobileRef}
                src={src}
                title={`${libName}, ${device.name}`}
                data-testid="frame-mobile"
                width={device.width}
                height={device.height}
              />
            </PhoneFrame>
          ))}
      </main>
    </div>
  );
}

function LibrarySwitcher({ value, onChange }: { value: LibraryId; onChange: (lib: LibraryId) => void }) {
  const ref = useRef<HTMLElement>(null);
  // On phones the row scrolls sideways, so keep the selected library in view.
  useEffect(() => {
    ref.current
      ?.querySelector('[aria-pressed="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [value]);
  return (
    <nav className="lib-switcher" aria-label="UI library" ref={ref}>
      {LIBRARIES.map((lib) => (
        <button
          key={lib.id}
          type="button"
          aria-pressed={lib.id === value}
          onClick={() => onChange(lib.id)}
        >
          {lib.name}
        </button>
      ))}
    </nav>
  );
}

const VIEW_OPTIONS: { id: ViewMode; label: string }[] = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'both', label: 'Both' },
];

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="segmented" role="group" aria-label="Viewport">
      {VIEW_OPTIONS.map((o) => (
        <button key={o.id} type="button" aria-pressed={o.id === value} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function DevicePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <label className="device-picker">
      <span className="visually-hidden">Phone</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {(['iOS', 'Android'] as const).map((os) => (
          <optgroup key={os} label={os === 'iOS' ? 'iPhone' : 'Android'}>
            {DEVICES.filter((d) => d.os === os).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.width}×{d.height})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function Badges({ stats, statsReady }: { stats: LibraryStats | undefined; statsReady: boolean }) {
  if (!stats) {
    return (
      <p className="badges-empty" data-testid="badges-empty">
        {statsReady ? 'This library is still a stand-in. Its numbers appear once it is built.' : ''}
      </p>
    );
  }
  return (
    <ul className="badges" data-testid="badges" aria-label="Measured at build time">
      <li title="Gzipped JavaScript this page loads, React included">
        <b>{formatKb(stats.jsGzip)}</b> JS
      </li>
      <li title="Gzipped CSS this page loads">
        <b>{formatKb(stats.cssGzip)}</b> CSS
      </li>
      <li title="Non-blank, non-comment lines in this library's kit package">
        <b>{stats.linesOfCode.toLocaleString('en-US')}</b> lines of code
      </li>
      <li title="Of the 12 components every library implements">
        <b>{stats.fromLibrary}</b> from library · <b>{stats.handBuilt}</b> hand-built
      </li>
    </ul>
  );
}

const BEZEL = 12;

/** Draws a phone around the iframe. The iframe keeps the device's real CSS
 *  width so the library's breakpoints fire; the frame is scaled down
 *  visually when the stage is shorter than the phone. */
function PhoneFrame({ device, children }: { device: Device; children: ReactNode }) {
  const slotRef = useRef<HTMLDivElement>(null);
  const scale = useFitScale(slotRef, device.height + BEZEL * 2);
  const outerW = (device.width + BEZEL * 2) * scale;
  const outerH = (device.height + BEZEL * 2) * scale;

  return (
    <div className="frame-phone-slot" ref={slotRef}>
      <div className="frame-phone-size" style={{ width: outerW, height: outerH }}>
        <div
          className="frame-phone"
          data-os={device.os}
          style={{
            width: device.width + BEZEL * 2,
            height: device.height + BEZEL * 2,
            padding: BEZEL,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
      <p className="frame-phone-label">
        {device.name} · {device.width}×{device.height}
        {scale < 1 && ` · shown at ${Math.round(scale * 100)}%`}
      </p>
    </div>
  );
}

function useFitScale(ref: RefObject<HTMLElement | null>, height: number): number {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const labelSpace = 28;
      const s = Math.min(1, (el.clientHeight - labelSpace) / height);
      setScale(Math.max(0.4, Math.round(s * 100) / 100));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, height]);
  return scale;
}
