import type { KitManifest } from '@kingpin/shared';

// Where each contract component comes from. "hand-built" means we wrote the
// behavior or layout ourselves; "library" means it is a library component
// with only props and styling applied. Read by scripts/measure.
export const manifest: KitManifest = {
  library: 'MUI',
  version: '@mui/material 9.5, @mui/x-date-pickers 9.18',
  components: {
    AppShell: 'library', // AppBar + Drawer
    StatCard: 'library', // Card + LinearProgress as the gauge
    DataTable: 'hand-built', // Table + TableSortLabel; mobile cards are ours
    Tabs: 'library',
    Badge: 'library', // Chip
    TextField: 'library',
    Select: 'library',
    DatePicker: 'library', // MUI X DatePicker
    Textarea: 'library', // multiline TextField
    Button: 'library',
    Modal: 'library', // Dialog
    Toaster: 'library', // Snackbar + Alert
  },
};
