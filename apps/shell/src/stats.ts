// Per-library numbers written by scripts/measure at build time. Until that
// script exists (next step) the file is absent and the badges stay hidden.

import { useEffect, useState } from 'react';
import type { LibraryId } from '@kingpin/shared';

export interface LibraryStats {
  /** Gzipped bytes of all JS the page loads. */
  jsGzip: number;
  /** Gzipped bytes of all CSS the page loads. */
  cssGzip: number;
  linesOfCode: number;
  handBuilt: number;
  fromLibrary: number;
}

export type StatsFile = { generatedAt: string; libraries: Partial<Record<LibraryId, LibraryStats>> };

export function useStats(): StatsFile | null {
  const [stats, setStats] = useState<StatsFile | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/stats.json')
      .then((r) => (r.ok ? (r.json() as Promise<StatsFile>) : null))
      .then((data) => {
        if (!cancelled && data?.libraries) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return stats;
}

export function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
