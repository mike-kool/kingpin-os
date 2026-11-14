import type { KitManifest } from '@kingpin/shared';

// Where each contract component comes from. "hand-built" means we wrote the
// behavior or layout ourselves; "library" means it is a library component
// with only props and styling applied. Read by scripts/measure.
export const manifest: KitManifest = {
  library: 'Mantine',
  version: '@mantine/core 9.8',
  components: {
    AppShell: 'library', // Burger + Drawer + NavLink
    StatCard: 'library', // Card + SemiCircleProgress as a real gauge
    DataTable: 'hand-built', // Table styling only; sorting and mobile cards are ours
    Tabs: 'library',
    Badge: 'library',
    TextField: 'library', // TextInput
    Select: 'library',
    DatePicker: 'library', // @mantine/dates DatePickerInput
    Textarea: 'library',
    Button: 'library',
    Modal: 'library',
    Toaster: 'library', // @mantine/notifications
  },
};
