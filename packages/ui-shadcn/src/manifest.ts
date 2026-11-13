import type { KitManifest } from '@kingpin/shared';

// Where each contract component comes from. "hand-built" means we wrote the
// behavior or layout ourselves; "library" means it is a library component
// with only props and classes applied. Read by scripts/measure.
export const manifest: KitManifest = {
  library: 'shadcn/ui',
  version: 'new-york-v4 (copied 2026-11-13)',
  components: {
    AppShell: 'library', // Sheet drawer + Button nav
    StatCard: 'library', // Card + Progress as the gauge
    DataTable: 'hand-built', // Table styling only; sorting and mobile cards are ours
    Tabs: 'library',
    Badge: 'library',
    TextField: 'library',
    Select: 'library',
    DatePicker: 'library', // Popover + Calendar, shadcn's documented recipe
    Textarea: 'library',
    Button: 'library',
    Modal: 'library',
    Toaster: 'library', // Sonner
  },
};
