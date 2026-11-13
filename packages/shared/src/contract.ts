// The component contract. Every ui-* package exports a `Kit` that satisfies
// `KitComponents`, plus a `KitManifest` saying which parts came from the
// library and which were hand-built. The page is written once against this.

import type { ComponentType, ReactNode } from 'react';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface NavItem {
  id: string;
  label: string;
}

export interface AppShellProps {
  title: string;
  nav: NavItem[];
  activeNavId: string;
  onNavigate: (id: string) => void;
  /** Top nav on desktop, drawer on mobile. */
  children: ReactNode;
}

export interface StatCardProps {
  label: string;
  value: string;
  /** Percent change; positive is up. */
  trend?: number;
  /** 0 to 100. When set, render a gauge. */
  gauge?: number;
  /** Show the siren icon (used by Heat Level at high values). */
  alarm?: boolean;
}

export interface Column<Row> {
  key: string;
  header: string;
  sortable?: boolean;
  /** Numeric columns align right. */
  numeric?: boolean;
  render: (row: Row) => ReactNode;
}

export type SortDirection = 'asc' | 'desc';
export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface DataTableProps<Row> {
  caption: string;
  columns: Column<Row>[];
  rows: Row[];
  getRowId: (row: Row) => string;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  /** Below the mobile breakpoint the table becomes stacked cards. */
}

export interface TabDef {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  tabs: TabDef[];
  activeId: string;
  onChange: (id: string) => void;
}

export interface BadgeProps {
  tone: Tone;
  children: ReactNode;
}

interface FieldBase {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  onBlur?: () => void;
}

export interface TextFieldProps extends FieldBase {
  value: string;
  onChange: (value: string) => void;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends FieldBase {
  value: string;
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
}

export interface DatePickerProps extends FieldBase {
  /** ISO date, yyyy-mm-dd, or '' when empty. */
  value: string;
  onChange: (value: string) => void;
}

export interface TextareaProps extends FieldBase {
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps {
  variant?: ButtonVariant;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export type ToastTone = 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  tone: ToastTone;
  title: string;
}

export interface ToasterProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export interface KitComponents {
  AppShell: ComponentType<AppShellProps>;
  StatCard: ComponentType<StatCardProps>;
  // Generic component; kits implement it for any row type.
  DataTable: <Row>(props: DataTableProps<Row>) => ReactNode;
  Tabs: ComponentType<TabsProps>;
  Badge: ComponentType<BadgeProps>;
  TextField: ComponentType<TextFieldProps>;
  Select: ComponentType<SelectProps>;
  DatePicker: ComponentType<DatePickerProps>;
  Textarea: ComponentType<TextareaProps>;
  Button: ComponentType<ButtonProps>;
  Modal: ComponentType<ModalProps>;
  Toaster: ComponentType<ToasterProps>;
}

export type ComponentName = keyof KitComponents;

export const COMPONENT_NAMES = [
  'AppShell',
  'StatCard',
  'DataTable',
  'Tabs',
  'Badge',
  'TextField',
  'Select',
  'DatePicker',
  'Textarea',
  'Button',
  'Modal',
  'Toaster',
] as const satisfies readonly ComponentName[];

/** Where each contract component came from, read by the stats script. */
export type KitManifest = {
  library: string;
  version: string;
  components: Record<ComponentName, 'library' | 'hand-built'>;
};

export const LIBRARIES = [
  { id: 'shadcn', name: 'shadcn/ui' },
  { id: 'mui', name: 'MUI' },
  { id: 'mantine', name: 'Mantine' },
  { id: 'chakra', name: 'Chakra UI' },
  { id: 'daisyui', name: 'DaisyUI' },
  { id: 'heroui', name: 'HeroUI' },
] as const;

export type LibraryId = (typeof LIBRARIES)[number]['id'];
