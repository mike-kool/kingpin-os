import type { KitManifest } from '@kingpin/shared';

// Where each contract component comes from. "hand-built" means we wrote the
// behavior or layout ourselves; "library" means it is a library component
// with only props and styling applied. Read by scripts/measure.
// DaisyUI ships CSS classes, not React components, so "library" here means
// standard markup with DaisyUI's component classes.
export const manifest: KitManifest = {
  library: 'DaisyUI',
  version: 'daisyui 5.8',
  components: {
    AppShell: 'library', // navbar + menu + drawer (checkbox driven)
    StatCard: 'library', // stats + radial-progress
    DataTable: 'hand-built', // table classes only; sorting and mobile cards are ours
    Tabs: 'library',
    Badge: 'library',
    TextField: 'library', // fieldset + input
    Select: 'library', // native select with DaisyUI classes
    DatePicker: 'hand-built', // DaisyUI has no date picker; the browser's date input
    Textarea: 'library',
    Button: 'library',
    Modal: 'library', // <dialog> + modal classes
    Toaster: 'library', // toast + alert
  },
};
