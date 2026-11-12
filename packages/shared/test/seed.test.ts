import { describe, expect, it } from 'vitest';
import { computeStats, formatBucks, seed } from '../src';

describe('seed data', () => {
  it('has the sizes the brief asks for', () => {
    expect(seed.crew).toHaveLength(40);
    expect(seed.territories).toHaveLength(8);
    expect(seed.productLines).toHaveLength(6);
    expect(seed.rivals).toHaveLength(10);
    expect(seed.fronts).toHaveLength(8);
    expect(seed.revenue).toHaveLength(12);
  });

  it('has unique ids and codenames', () => {
    const ids = seed.crew.map((c) => c.id);
    const names = seed.crew.map((c) => c.codename);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it('only references territories and product lines that exist', () => {
    const territories = new Set(seed.territories.map((t) => t.id));
    const products = new Set(seed.productLines.map((p) => p.id));
    for (const c of seed.crew) {
      expect(territories.has(c.territoryId)).toBe(true);
      expect(products.has(c.productLineId)).toBe(true);
    }
    for (const f of seed.fronts) expect(territories.has(f.territoryId)).toBe(true);
  });

  it('includes every crew status', () => {
    const statuses = new Set(seed.crew.map((c) => c.status));
    expect([...statuses].sort()).toEqual(['active', 'flipped', 'lying-low']);
  });
});

describe('computeStats', () => {
  it('derives the four stat cards', () => {
    const stats = computeStats(seed);
    expect(stats.weeklyRevenue).toBe(88700);
    expect(stats.revenueTrend).toBe(-2.8);
    expect(stats.crewHeadcount).toBe(36);
    expect(stats.activeCorners).toBe(24);
    expect(stats.heatLevel).toBe(82);
  });

  it('formats Kingpin Bucks', () => {
    expect(formatBucks(88700)).toBe('KB$88,700');
  });
});
