// Domain types for the Kingpin OS demo. Everything here is fictional.

export type CrewStatus = 'active' | 'lying-low' | 'flipped';
export type ThreatLevel = 'low' | 'moderate' | 'high' | 'extreme';

export interface Territory {
  id: string;
  name: string;
}

export interface ProductLine {
  id: string;
  /** Silly made-up street name, e.g. "Cloud Nine Cola". */
  name: string;
  /** Invented SKU, e.g. "KP-CNC-001". */
  sku: string;
}

export interface CrewMember {
  id: string;
  codename: string;
  territoryId: string;
  productLineId: string;
  /** 0 to 100. */
  loyalty: number;
  status: CrewStatus;
}

export interface RivalOutfit {
  id: string;
  name: string;
  boss: string;
  turf: string;
  threat: ThreatLevel;
}

export interface FrontBusiness {
  id: string;
  name: string;
  kind: string;
  territoryId: string;
  /** Cartoon "Kingpin Bucks", not a real currency. */
  cleanedThisWeek: number;
}

export interface WeeklyRevenue {
  /** 1-based week number. */
  week: number;
  /** Kingpin Bucks. */
  amount: number;
}

export interface Stats {
  weeklyRevenue: number;
  /** Percent change vs. previous week. */
  revenueTrend: number;
  activeCorners: number;
  crewHeadcount: number;
  /** 0 to 100. Siren shows at or above HEAT_SIREN_THRESHOLD. */
  heatLevel: number;
}

export interface SeedData {
  territories: Territory[];
  productLines: ProductLine[];
  crew: CrewMember[];
  rivals: RivalOutfit[];
  fronts: FrontBusiness[];
  revenue: WeeklyRevenue[];
  heatLevel: number;
}

export type TabId = 'operations' | 'rivals' | 'laundering';
