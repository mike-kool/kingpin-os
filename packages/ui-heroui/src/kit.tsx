// HeroUI v3 implementation of the Kingpin OS component contract, on HeroUI's
// default theme. HeroUI v3 is built on React Aria Components, so buttons use
// `onPress`. Mobile is below Tailwind's `md` breakpoint (48rem, 768px).

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  Button as HButton,
  Calendar,
  Card,
  Chip,
  DateField,
  DatePicker as HDatePicker,
  Drawer,
  FieldError,
  Input,
  Label,
  ListBox,
  Modal as HModal,
  ProgressCircle,
  Select as HSelect,
  Tabs as HTabs,
  TextArea,
  TextField as HTextField,
  Toast,
  toast,
} from '@heroui/react';
import { parseDate } from '@internationalized/date';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bars,
  BellFill,
  ChevronDown,
  ChevronsExpandVertical,
  ChevronUp,
} from '@gravity-ui/icons';
import type {
  AppShellProps,
  BadgeProps,
  ButtonProps,
  DataTableProps,
  DatePickerProps,
  KitComponents,
  ModalProps,
  SelectProps,
  StatCardProps,
  TabsProps,
  TextareaProps,
  TextFieldProps,
  ToasterProps,
  Tone,
} from '@kingpin/shared';

const MOBILE_QUERY = '(max-width: 47.99rem)';
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
/** Below Tailwind's `md` breakpoint. */
function useIsMobile() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(MOBILE_QUERY).matches);
}

function AppShell({ title, nav, activeNavId, onNavigate, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-separator bg-surface">
        <div className="mx-auto flex h-15 max-w-7xl items-center gap-6 px-4">
          <span className="text-lg font-bold">{title}</span>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <HButton
                key={item.id}
                variant={item.id === activeNavId ? 'secondary' : 'ghost'}
                aria-current={item.id === activeNavId ? 'page' : undefined}
                onPress={() => onNavigate(item.id)}
              >
                {item.label}
              </HButton>
            ))}
          </nav>
          <HButton
            isIconOnly
            variant="ghost"
            size="lg"
            aria-label="Open menu"
            className="ml-auto md:hidden"
            onPress={() => setOpen(true)}
          >
            <Bars />
          </HButton>
        </div>
      </header>
      <Drawer isOpen={open} onOpenChange={setOpen}>
        <Drawer.Backdrop>
          <Drawer.Content placement="left">
            <Drawer.Dialog>
              <Drawer.Header>
                <Drawer.Heading>{title}</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body>
                <nav aria-label="Drawer" className="flex flex-col gap-1">
                  {nav.map((item) => (
                    <HButton
                      key={item.id}
                      size="lg"
                      fullWidth
                      className="justify-start"
                      variant={item.id === activeNavId ? 'secondary' : 'ghost'}
                      aria-current={item.id === activeNavId ? 'page' : undefined}
                      onPress={() => {
                        onNavigate(item.id);
                        setOpen(false);
                      }}
                    >
                      {item.label}
                    </HButton>
                  ))}
                </nav>
              </Drawer.Body>
              <Drawer.CloseTrigger />
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
      <main>{children}</main>
    </div>
  );
}

function StatCard({ label, value, trend, gauge, alarm }: StatCardProps) {
  return (
    <Card>
      <Card.Content className="gap-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted">{label}</span>
          {alarm && <BellFill className="size-5 text-danger" role="img" aria-label="Siren: heat is high" />}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{value}</span>
          {gauge !== undefined && (
            <ProgressCircle value={gauge} size="lg" color={alarm ? 'danger' : 'accent'} aria-label={`${label} gauge`}>
              <ProgressCircle.Track>
                <ProgressCircle.TrackCircle />
                <ProgressCircle.FillCircle />
              </ProgressCircle.Track>
            </ProgressCircle>
          )}
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
            {trend >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {trend >= 0 ? '+' : ''}
            {trend}% vs last week
          </span>
        )}
      </Card.Content>
    </Card>
  );
}

function SortSelect({
  caption,
  options,
  value,
  onChange,
}: {
  caption: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (key: string) => void;
}) {
  return (
    <HSelect
      aria-label={`Sort ${caption}`}
      placeholder="Sort by…"
      fullWidth
      selectedKey={value}
      onSelectionChange={(key) => key !== null && onChange(String(key))}
    >
      <HSelect.Trigger>
        <HSelect.Value />
        <HSelect.Indicator />
      </HSelect.Trigger>
      <HSelect.Popover>
        <ListBox>
          {options.map((o) => (
            <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
              {o.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </HSelect.Popover>
    </HSelect>
  );
}

function DataTable<Row>({ caption, columns, rows, getRowId, sort, onSortChange }: DataTableProps<Row>) {
  const isMobile = useIsMobile();
  const [primary, ...rest] = columns;

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        <SortSelect
          caption={caption}
          options={columns.filter((c) => c.sortable).map((c) => ({ value: c.key, label: c.header }))}
          value={sort?.key ?? null}
          onChange={onSortChange}
        />
        <ul aria-label={caption} className="m-0 flex list-none flex-col gap-3 p-0">
          {rows.map((row) => (
            <Card key={getRowId(row)} render={(props) => <li {...(props as object)} />}>
              <Card.Content>
                {primary && <div className="mb-1.5 font-semibold">{primary.render(row)}</div>}
                <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                  {rest.map((col) => (
                    <div key={col.key} className="contents">
                      <dt className="text-muted">{col.header}</dt>
                      <dd className="m-0 text-right">{col.render(row)}</dd>
                    </div>
                  ))}
                </dl>
              </Card.Content>
            </Card>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-separator bg-surface">
      <table aria-label={caption} className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-separator bg-surface-secondary">
            {columns.map((col) => {
              const active = sort?.key === col.key;
              const Icon = !active ? ChevronsExpandVertical : sort.direction === 'asc' ? ChevronUp : ChevronDown;
              return (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold ${col.numeric ? 'text-right' : 'text-left'}`}
                  aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(col.key)}
                      className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap"
                    >
                      {col.header}
                      <Icon className="size-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowId(row)} className="border-b border-separator last:border-0 hover:bg-surface-secondary">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 ${col.numeric ? 'text-right' : 'text-left'}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <HTabs selectedKey={activeId} onSelectionChange={(key) => onChange(String(key))}>
      <HTabs.ListContainer className="mb-4">
        <HTabs.List aria-label="Operations views">
          {tabs.map((t) => (
            <HTabs.Tab key={t.id} id={t.id}>
              {t.label}
              <HTabs.Indicator />
            </HTabs.Tab>
          ))}
        </HTabs.List>
      </HTabs.ListContainer>
      {tabs.map((t) => (
        <HTabs.Panel key={t.id} id={t.id}>
          {t.content}
        </HTabs.Panel>
      ))}
    </HTabs>
  );
}

const CHIP_COLOR: Record<Tone, 'default' | 'success' | 'warning' | 'danger' | 'accent'> = {
  neutral: 'default',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'accent',
};

function Badge({ tone, children }: BadgeProps) {
  return (
    <Chip color={CHIP_COLOR[tone]} variant="soft" size="sm" className="whitespace-nowrap">
      {children}
    </Chip>
  );
}

function TextField({ id, label, required, error, value, onChange, onBlur }: TextFieldProps) {
  return (
    <HTextField
      id={id}
      isRequired={required}
      isInvalid={!!error}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      validationBehavior="aria"
      fullWidth
    >
      <Label>{label}</Label>
      <Input />
      <FieldError>{error}</FieldError>
    </HTextField>
  );
}

function Select({ id, label, required, error, value, options, placeholder, onChange, onBlur }: SelectProps) {
  return (
    <HSelect
      id={id}
      placeholder={placeholder}
      isRequired={required}
      isInvalid={!!error}
      validationBehavior="aria"
      fullWidth
      selectedKey={value || null}
      onSelectionChange={(key) => onChange(key === null ? '' : String(key))}
      onOpenChange={(open) => !open && onBlur?.()}
    >
      <Label>{label}</Label>
      <HSelect.Trigger>
        <HSelect.Value />
        <HSelect.Indicator />
      </HSelect.Trigger>
      <FieldError>{error}</FieldError>
      <HSelect.Popover>
        <ListBox>
          {options.map((o) => (
            <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
              {o.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </HSelect.Popover>
    </HSelect>
  );
}

function DatePicker({ id, label, required, error, value, onChange, onBlur }: DatePickerProps) {
  return (
    <HDatePicker
      id={id}
      isRequired={required}
      isInvalid={!!error}
      validationBehavior="aria"
      value={value ? parseDate(value) : null}
      onChange={(d) => onChange(d ? d.toString() : '')}
      onOpenChange={(open) => !open && onBlur?.()}
    >
      <Label>{label}</Label>
      <DateField.Group fullWidth>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <HDatePicker.Trigger aria-label="Pick a date">
            <HDatePicker.TriggerIndicator />
          </HDatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <FieldError>{error}</FieldError>
      <HDatePicker.Popover>
        <Calendar aria-label={label}>
          <Calendar.Header>
            <Calendar.Heading />
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>
      </HDatePicker.Popover>
    </HDatePicker>
  );
}

function Textarea({ id, label, required, error, value, rows, onChange, onBlur }: TextareaProps) {
  return (
    <HTextField
      id={id}
      isRequired={required}
      isInvalid={!!error}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      validationBehavior="aria"
      fullWidth
    >
      <Label>{label}</Label>
      <TextArea rows={rows ?? 3} />
      <FieldError>{error}</FieldError>
    </HTextField>
  );
}

function Button({ variant = 'primary', type = 'button', disabled, onClick, children }: ButtonProps) {
  return (
    <HButton
      type={type}
      isDisabled={disabled}
      onPress={onClick}
      variant={variant === 'secondary' ? 'outline' : variant}
    >
      {children}
    </HButton>
  );
}

function Modal({ open, title, children, confirmLabel, cancelLabel, onConfirm, onCancel }: ModalProps) {
  return (
    <HModal isOpen={open} onOpenChange={(o) => !o && onCancel()}>
      <HModal.Backdrop>
        <HModal.Container placement="center" size="md">
          <HModal.Dialog>
            <HModal.Header>
              <HModal.Heading>{title}</HModal.Heading>
            </HModal.Header>
            <HModal.Body>
              <p className="text-muted">{children}</p>
            </HModal.Body>
            <HModal.Footer>
              <HButton variant="outline" className="max-md:flex-1" onPress={onCancel}>
                {cancelLabel}
              </HButton>
              <HButton className="max-md:flex-1" onPress={onConfirm}>
                {confirmLabel}
              </HButton>
            </HModal.Footer>
          </HModal.Dialog>
        </HModal.Container>
      </HModal.Backdrop>
    </HModal>
  );
}

const TOAST_FN = { success: toast.success, warning: toast.warning, error: toast.danger };

/** Mirrors the shared toast list into HeroUI's toast queue. */
function Toaster({ toasts, onDismiss }: ToasterProps) {
  // Our toast id -> HeroUI's queue key.
  const shown = useRef(new Map<string, string>());
  useEffect(() => {
    const current = new Set(toasts.map((t) => t.id));
    for (const t of toasts) {
      if (shown.current.has(t.id)) continue;
      const key = TOAST_FN[t.tone](t.title, { timeout: 0, onClose: () => onDismiss(t.id) });
      shown.current.set(t.id, key);
    }
    for (const [id, key] of shown.current) {
      if (!current.has(id)) {
        toast.close(key);
        shown.current.delete(id);
      }
    }
  }, [toasts, onDismiss]);
  return <Toast.Provider placement="bottom end" />;
}

export const Kit: KitComponents = {
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
};
