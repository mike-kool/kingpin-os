// The phone shell: instead of a header, a small tab hugs one screen edge.
// Drag it up, down or across to the other edge; tap it to open the menu
// (library switcher, stats, links). The position is remembered.

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';

type Side = 'left' | 'right';
interface Dock {
  side: Side;
  /** Top of the tab as a fraction of the screen height, 0 to 1. */
  y: number;
}

const SIZE = 44;
const EDGE_GAP = 8;
const DRAG_THRESHOLD = 6;
const STORAGE_KEY = 'kingpin-fab';
const DEFAULT_DOCK: Dock = { side: 'right', y: 0.6 };

function readDock(): Dock {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<Dock> | null;
    if (saved && (saved.side === 'left' || saved.side === 'right') && typeof saved.y === 'number') {
      return { side: saved.side, y: Math.min(1, Math.max(0, saved.y)) };
    }
  } catch {
    // Private mode or bad data: fall through to the default.
  }
  return DEFAULT_DOCK;
}

function saveDock(dock: Dock) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dock));
  } catch {
    // Nothing to do; the position just won't be remembered.
  }
}

const clampTop = (top: number) => Math.min(window.innerHeight - SIZE - EDGE_GAP, Math.max(EDGE_GAP, top));

export interface FabProps {
  label: string;
  /** Rendered in the menu; call `close` after an action that should dismiss it. */
  children: (close: () => void) => ReactNode;
}

export function Fab({ label, children }: FabProps) {
  const [dock, setDock] = useState<Dock>(readDock);
  const [open, setOpen] = useState(false);
  // While a finger drags the tab, it follows the finger freely.
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const gesture = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number; moved: boolean } | null>(
    null,
  );
  // A drag ends with a click event too; this stops it from opening the menu.
  const suppressClick = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function onPointerDown(e: PointerEvent<HTMLButtonElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    gesture.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - box.left,
      offsetY: e.clientY - box.top,
      moved: false,
    };
    // Capture, so the page's iframe underneath doesn't swallow the drag.
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLButtonElement>) {
    const g = gesture.current;
    if (!g) return;
    if (!g.moved && Math.hypot(e.clientX - g.startX, e.clientY - g.startY) < DRAG_THRESHOLD) return;
    g.moved = true;
    setOpen(false);
    setDrag({
      x: Math.min(window.innerWidth - SIZE, Math.max(0, e.clientX - g.offsetX)),
      y: clampTop(e.clientY - g.offsetY),
    });
  }

  function onPointerUp(e: PointerEvent<HTMLButtonElement>) {
    const g = gesture.current;
    gesture.current = null;
    if (!g?.moved) return; // a tap: the click handler toggles the menu
    suppressClick.current = true;
    const next: Dock = {
      side: e.clientX < window.innerWidth / 2 ? 'left' : 'right',
      y: clampTop(e.clientY - g.offsetY) / window.innerHeight,
    };
    setDock(next);
    saveDock(next);
    setDrag(null);
  }

  const top = drag ? drag.y : clampTop(dock.y * window.innerHeight);
  const close = () => setOpen(false);

  return (
    <>
      {open && <div className="fab-backdrop" onClick={close} />}
      <button
        type="button"
        className="fab"
        data-side={dock.side}
        data-dragging={drag ? true : undefined}
        style={drag ? { top, left: drag.x } : { top }}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          gesture.current = null;
          setDrag(null);
        }}
        onClick={() => {
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          setOpen((o) => !o);
        }}
      >
        <span aria-hidden="true">♛</span>
      </button>
      {open && (
        <div
          className="fab-menu"
          role="dialog"
          aria-label={label}
          data-side={dock.side}
          style={
            top > window.innerHeight / 2
              ? { bottom: Math.max(EDGE_GAP, window.innerHeight - top - SIZE) }
              : { top }
          }
        >
          {children(close)}
        </div>
      )}
    </>
  );
}
