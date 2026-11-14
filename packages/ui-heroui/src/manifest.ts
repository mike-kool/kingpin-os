import type { KitManifest } from '@kingpin/shared';

// Where each contract component comes from. "hand-built" means we wrote the
// behavior or layout ourselves; "library" means it is a library component
// with only props and styling applied. Read by scripts/measure.
export const manifest: KitManifest = {
  library: 'HeroUI',
  version: '@heroui/react 3.2',
  components: {
    AppShell: 'library', // Button + Drawer
    StatCard: 'library', // Card + ProgressCircle as the gauge
    DataTable: 'hand-built', // plain table; sorting and mobile cards are ours
    Tabs: 'library',
    Badge: 'library', // Chip
    TextField: 'library',
    Select: 'library',
    DatePicker: 'library',
    Textarea: 'library', // TextField + TextArea
    Button: 'library',
    Modal: 'library',
    Toaster: 'library', // Toast.Provider + toast queue
  },
};
