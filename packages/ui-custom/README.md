# The no-library kit

The Kingpin OS dashboard with no UI library: React, what the browser already
provides (`<dialog>`, `<select>`, `Intl`, CSS), and one stylesheet. It has no
runtime dependencies besides React.

It is also a small component kit you can use elsewhere. The dashboard's
contract components in `src/kit.tsx` are thin adapters over `src/components`,
which know nothing about Kingpin OS.

## Use it

```tsx
import { Button, Field, Input, Dialog } from '@kingpin/ui-custom';
import '@kingpin/ui-custom/styles.css';

<Field label="Codename" required error={error}>
  <Input value={name} onChange={setName} />
</Field>
<Button onClick={save}>Save</Button>
```

To take it into another project, copy `src/components` and `src/styles.css`.
Nothing in them imports from this repository.

## Components

| Component | What it is |
| --- | --- |
| `Button` | `variant`: primary, secondary, danger, ghost. `icon` for a square icon button, `block` for full width. Takes every `<button>` prop. |
| `Badge` | A status pill. `tone`: neutral, success, warning, danger, info. |
| `Card`, `Stat`, `Gauge` | A surface, a labelled number with an optional trend, and a half-circle SVG meter. |
| `Field` | Label, hint and error around one control. It passes the id, `aria-describedby`, `aria-invalid` and `required` to the control inside it. |
| `Input`, `Textarea`, `Select` | Native controls. `onChange` receives the value. `Select` keeps the platform picker. |
| `DatePicker` | A button and a calendar. ISO `yyyy-mm-dd` values, `min`, `max`, `locale`, `weekStartsOn`. Full keyboard support. |
| `Tabs` | Arrow keys, Home and End. Controlled with `value` and `onChange`. |
| `DataTable` | Sortable and controlled. A table on desktop, a list of cards with a sort control on phones. |
| `Dialog`, `Drawer` | Native modal dialogs: focus is trapped, the page behind is inert, Escape closes, focus returns to the opener. `Dialog` is a bottom sheet on phones. |
| `Toaster` | A controlled stack of notifications, with an optional `duration`. |
| `AppBar`, `NavList` | A sticky top bar and a navigation list (`direction`: row or column). |
| `ThemeToggle`, `useTheme`, `setTheme` | Light and dark. |
| `Icon` | 17 stroke icons drawn for the kit. Pass `label` to have one announced. |
| `useMediaQuery`, `cx` | Helpers. |

Props are documented in the source, on each component's props type.

## Theme it

Every color, radius and size is a CSS custom property on `:root`. Override
any of them, globally or on a subtree:

```css
:root {
  --k-accent: light-dark(#0a7d4f, #4fd6a0);
  --k-radius: 0.25rem;
  --k-font: 'Inter', sans-serif;
}
```

Colors are light and dark pairs. With no `data-theme` on `<html>` the kit
follows the system setting; `data-theme="light"` or `"dark"` forces one, and
`ThemeToggle` sets it and remembers the choice.

All styles are in the `kingpin` cascade layer, so any rule you write outside
a layer overrides them, whatever its specificity. Class names start with
`k-`; `k-desktop` and `k-phone` hide an element below or above 768px.

## What it does that the libraries here don't all do

- Controls are 40px, and 44px on phones, without per-component overrides.
- Input text is 16px on phones, so iOS doesn't zoom the page on focus.
- Control borders meet the 3:1 contrast WCAG asks of interface components.
- Dark mode, from the same tokens.
- Open and close animations in CSS only, switched off under
  `prefers-reduced-motion`.

## What it leaves out

It targets current browsers (it uses `light-dark()`, `@starting-style`,
cascade layers and container queries), and it has only the components this
dashboard needs. There is no combobox, menu, tooltip or virtualized table.
