// The Kingpin OS dashboard, written once against the component contract.
// Every library renders this exact composition with the same data and
// behavior; only the components passed in as `kit` differ.

import { useCallback, useMemo, useState } from 'react';
import {
  HEAT_SIREN_THRESHOLD,
  STATUS_LABEL,
  STATUS_TONE,
  THREAT_LABEL,
  THREAT_TONE,
  TOAST_COPY,
  computeStats,
  defineColumns,
  formatBucks,
  seed,
  useEmbeddedTab,
  useRecruitForm,
  useSort,
  useToasts,
  type CrewMember,
  type FrontBusiness,
  type KitComponents,
  type RecruitForm,
  type RivalOutfit,
  type SelectOption,
  type TabId,
  type ThreatLevel,
} from '@kingpin/shared';

const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'crew', label: 'Crew' },
  { id: 'territories', label: 'Territories' },
  { id: 'fronts', label: 'Fronts' },
];

const territoryName = new Map(seed.territories.map((t) => [t.id, t.name]));
const productName = new Map(seed.productLines.map((p) => [p.id, p.name]));
const THREAT_RANK: Record<ThreatLevel, number> = { low: 0, moderate: 1, high: 2, extreme: 3 };

const territoryOptions: SelectOption[] = seed.territories.map((t) => ({ value: t.id, label: t.name }));
const productOptions: SelectOption[] = seed.productLines.map((p) => ({
  value: p.id,
  label: `${p.name} (${p.sku})`,
}));

export interface KingpinPageProps {
  kit: KitComponents;
}

export function KingpinPage({ kit }: KingpinPageProps) {
  const {
    AppShell,
    StatCard,
    DataTable,
    Tabs,
    Badge,
    TextField,
    Select,
    DatePicker,
    Textarea,
    Button,
    Modal,
    Toaster,
  } = kit;

  const [nav, setNav] = useState('dashboard');
  const [tab, setTab] = useEmbeddedTab();
  const [crew, setCrew] = useState<CrewMember[]>(seed.crew);
  const [heat, setHeat] = useState(seed.heatLevel);
  const [expandOpen, setExpandOpen] = useState(false);
  const { toasts, push, dismiss } = useToasts();

  const stats = useMemo(() => computeStats({ ...seed, crew, heatLevel: heat }), [crew, heat]);

  // Tables -----------------------------------------------------------------

  const crewSortValue = useCallback((c: CrewMember, key: string) => {
    if (key === 'loyalty') return c.loyalty;
    if (key === 'territory') return territoryName.get(c.territoryId) ?? '';
    if (key === 'product') return productName.get(c.productLineId) ?? '';
    if (key === 'status') return STATUS_LABEL[c.status];
    return c.codename;
  }, []);
  const crewTable = useSort(crew, crewSortValue);

  const rivalSortValue = useCallback((r: RivalOutfit, key: string) => {
    if (key === 'threat') return THREAT_RANK[r.threat];
    if (key === 'boss') return r.boss;
    if (key === 'turf') return r.turf;
    return r.name;
  }, []);
  const rivalTable = useSort(seed.rivals, rivalSortValue);

  const frontSortValue = useCallback((f: FrontBusiness, key: string) => {
    if (key === 'cleaned') return f.cleanedThisWeek;
    if (key === 'kind') return f.kind;
    if (key === 'territory') return territoryName.get(f.territoryId) ?? '';
    return f.name;
  }, []);
  const frontTable = useSort(seed.fronts, frontSortValue);

  const crewColumns = defineColumns<CrewMember>([
    { key: 'codename', header: 'Codename', sortable: true, render: (c) => c.codename },
    { key: 'territory', header: 'Territory', sortable: true, render: (c) => territoryName.get(c.territoryId) },
    { key: 'product', header: 'Product line', sortable: true, render: (c) => productName.get(c.productLineId) },
    { key: 'loyalty', header: 'Loyalty', sortable: true, numeric: true, render: (c) => `${c.loyalty}%` },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (c) => <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>,
    },
  ]);

  const rivalColumns = defineColumns<RivalOutfit>([
    { key: 'name', header: 'Outfit', sortable: true, render: (r) => r.name },
    { key: 'boss', header: 'Boss', sortable: true, render: (r) => r.boss },
    { key: 'turf', header: 'Turf', sortable: true, render: (r) => r.turf },
    {
      key: 'threat',
      header: 'Threat',
      sortable: true,
      render: (r) => <Badge tone={THREAT_TONE[r.threat]}>{THREAT_LABEL[r.threat]}</Badge>,
    },
  ]);

  const frontColumns = defineColumns<FrontBusiness>([
    { key: 'name', header: 'Front business', sortable: true, render: (f) => f.name },
    { key: 'kind', header: 'Type', sortable: true, render: (f) => f.kind },
    { key: 'territory', header: 'Territory', sortable: true, render: (f) => territoryName.get(f.territoryId) },
    {
      key: 'cleaned',
      header: 'Cleaned this week',
      sortable: true,
      numeric: true,
      render: (f) => formatBucks(f.cleanedThisWeek),
    },
  ]);

  // Form -------------------------------------------------------------------

  const onRecruit = useCallback(
    (form: RecruitForm) => {
      setCrew((list) => [
        {
          id: `c-new-${list.length + 1}`,
          codename: form.codename.trim(),
          territoryId: form.territoryId,
          productLineId: form.productLineId,
          loyalty: 50,
          status: 'active',
        },
        ...list,
      ]);
      push('success', TOAST_COPY.recruited);
    },
    [push],
  );
  const form = useRecruitForm(onRecruit);

  // Actions ----------------------------------------------------------------

  const confirmExpansion = () => {
    setExpandOpen(false);
    setHeat((h) => Math.min(100, h + 6));
    push('error', TOAST_COPY.heatRising);
  };

  const tabs = [
    {
      id: 'operations',
      label: 'Operations',
      content: (
        <DataTable
          caption="Crew"
          columns={crewColumns}
          rows={crewTable.rows}
          getRowId={(c) => c.id}
          sort={crewTable.sort}
          onSortChange={crewTable.onSortChange}
        />
      ),
    },
    {
      id: 'rivals',
      label: 'Rivals',
      content: (
        <DataTable
          caption="Rival outfits"
          columns={rivalColumns}
          rows={rivalTable.rows}
          getRowId={(r) => r.id}
          sort={rivalTable.sort}
          onSortChange={rivalTable.onSortChange}
        />
      ),
    },
    {
      id: 'laundering',
      label: 'Laundering',
      content: (
        <DataTable
          caption="Front businesses"
          columns={frontColumns}
          rows={frontTable.rows}
          getRowId={(f) => f.id}
          sort={frontTable.sort}
          onSortChange={frontTable.onSortChange}
        />
      ),
    },
  ];

  return (
    <AppShell title="Kingpin OS" nav={NAV} activeNavId={nav} onNavigate={setNav}>
      <div className="kp-page">
        <div className="kp-heading">
          <div>
            <h2 className="kp-title">Empire overview</h2>
            <p className="kp-subtitle">Week 12 · All figures in Kingpin Bucks. Totally legitimate.</p>
          </div>
          <div className="kp-actions">
            <Button variant="secondary" onClick={() => push('warning', TOAST_COPY.shipmentDelayed)}>
              Check shipments
            </Button>
            <Button variant="primary" onClick={() => setExpandOpen(true)}>
              Expand territory
            </Button>
          </div>
        </div>

        <section className="kp-stats" aria-label="Key numbers">
          <StatCard label="Weekly Revenue" value={formatBucks(stats.weeklyRevenue)} trend={stats.revenueTrend} />
          <StatCard label="Active Corners" value={String(stats.activeCorners)} />
          <StatCard label="Crew Headcount" value={String(stats.crewHeadcount)} />
          <StatCard
            label="Heat Level"
            value={`${stats.heatLevel}%`}
            gauge={stats.heatLevel}
            alarm={stats.heatLevel >= HEAT_SIREN_THRESHOLD}
          />
        </section>

        <div className="kp-columns">
          <section className="kp-main" aria-label="Operations">
            <Tabs tabs={tabs} activeId={tab} onChange={(id) => setTab(id as TabId)} />
          </section>

          <section className="kp-side" aria-labelledby="recruit-title">
            <h3 id="recruit-title" className="kp-section-title">Recruit New Lieutenant</h3>
            <form
              className="kp-form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                form.submit();
              }}
            >
              <TextField
                id="codename"
                label="Codename"
                required
                value={form.values.codename}
                error={form.errors.codename}
                onChange={(v) => form.setField('codename', v)}
                onBlur={() => form.blurField('codename')}
              />
              <Select
                id="territory"
                label="Territory"
                required
                placeholder="Pick a territory"
                options={territoryOptions}
                value={form.values.territoryId}
                error={form.errors.territoryId}
                onChange={(v) => form.setField('territoryId', v)}
                onBlur={() => form.blurField('territoryId')}
              />
              <Select
                id="product"
                label="Product line"
                required
                placeholder="Pick a product line"
                options={productOptions}
                value={form.values.productLineId}
                error={form.errors.productLineId}
                onChange={(v) => form.setField('productLineId', v)}
                onBlur={() => form.blurField('productLineId')}
              />
              <DatePicker
                id="start-date"
                label="Start date"
                value={form.values.startDate}
                error={form.errors.startDate}
                onChange={(v) => form.setField('startDate', v)}
                onBlur={() => form.blurField('startDate')}
              />
              <Textarea
                id="alibi"
                label="Alibi"
                required
                rows={3}
                value={form.values.alibi}
                error={form.errors.alibi}
                onChange={(v) => form.setField('alibi', v)}
                onBlur={() => form.blurField('alibi')}
              />
              <div className="kp-form-actions">
                <Button type="submit" variant="primary">
                  Recruit
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <Modal
        open={expandOpen}
        title="Confirm Territory Expansion"
        confirmLabel="Expand"
        cancelLabel="Cancel"
        onConfirm={confirmExpansion}
        onCancel={() => setExpandOpen(false)}
      >
        Move into Pickle Point? The Coupon Clippers won&apos;t like it, and the heat will go up.
      </Modal>

      <Toaster toasts={toasts} onDismiss={dismiss} />
    </AppShell>
  );
}
