import type { KitManifest } from '@kingpin/shared';

// Where each contract component comes from. "hand-built" means we wrote the
// behavior or layout ourselves; "library" means it is a library component
// with only props and styling applied. Read by scripts/measure.
export const manifest: KitManifest = {
  library: 'Chakra UI',
  version: '@chakra-ui/react 3.38',
  components: {
    AppShell: 'library', // IconButton + Drawer
    StatCard: 'library', // Card + ProgressCircle as the gauge
    DataTable: 'hand-built', // Table styling only; sorting and mobile cards are ours
    Tabs: 'library',
    Badge: 'library',
    TextField: 'library', // Field + Input
    Select: 'library',
    DatePicker: 'library',
    Textarea: 'library',
    Button: 'library',
    Modal: 'library', // Dialog
    Toaster: 'library', // createToaster
  },
};
