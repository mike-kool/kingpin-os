import type { KitManifest } from '@kingpin/shared';

// Where each contract component comes from. Read by scripts/measure.
// There is no library here: every component is written in this package, on
// React and what the browser already provides.
export const manifest: KitManifest = {
  library: 'No library',
  version: 'React 19 and plain CSS',
  components: {
    AppShell: 'hand-built', // AppBar + NavList + Drawer (<dialog>)
    StatCard: 'hand-built', // Stat + an SVG Gauge
    DataTable: 'hand-built',
    Tabs: 'hand-built',
    Badge: 'hand-built',
    TextField: 'hand-built', // Field + Input
    Select: 'hand-built', // Field + the native select, restyled
    DatePicker: 'hand-built', // Field + our own calendar
    Textarea: 'hand-built',
    Button: 'hand-built',
    Modal: 'hand-built', // Dialog (<dialog>)
    Toaster: 'hand-built',
  },
};
