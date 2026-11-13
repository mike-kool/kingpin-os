// Derived values and formatting, shared so every kit shows identical text.

import type { CrewStatus, SeedData, Stats, ThreatLevel } from './types';
import type { Tone } from './contract';

export const HEAT_SIREN_THRESHOLD = 75;

export function computeStats(data: SeedData): Stats {
  const last = data.revenue.at(-1)?.amount ?? 0;
  const prev = data.revenue.at(-2)?.amount ?? last;
  const active = data.crew.filter((c) => c.status === 'active');
  return {
    weeklyRevenue: last,
    revenueTrend: prev === 0 ? 0 : Math.round(((last - prev) / prev) * 1000) / 10,
    activeCorners: new Set(active.map((c) => c.territoryId)).size * 3,
    crewHeadcount: data.crew.filter((c) => c.status !== 'flipped').length,
    heatLevel: data.heatLevel,
  };
}

const bucks = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** Kingpin Bucks are a cartoon currency; shown with a KB$ prefix. */
export function formatBucks(amount: number): string {
  return `KB$${bucks.format(amount)}`;
}

export const STATUS_LABEL: Record<CrewStatus, string> = {
  active: 'Active',
  'lying-low': 'Lying Low',
  flipped: 'Flipped',
};

export const STATUS_TONE: Record<CrewStatus, Tone> = {
  active: 'success',
  'lying-low': 'warning',
  flipped: 'danger',
};

export const THREAT_LABEL: Record<ThreatLevel, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  extreme: 'Extreme',
};

export const THREAT_TONE: Record<ThreatLevel, Tone> = {
  low: 'neutral',
  moderate: 'info',
  high: 'warning',
  extreme: 'danger',
};

export const TOAST_COPY = {
  shipmentDelayed: 'Shipment delayed, blame the Feds',
  recruited: 'Lieutenant recruited',
  heatRising: 'Heat level rising',
} as const;
