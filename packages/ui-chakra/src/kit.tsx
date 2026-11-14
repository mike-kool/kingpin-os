// Chakra UI v3 implementation of the Kingpin OS component contract, on
// Chakra's default system. Mobile is below Chakra's `md` breakpoint (48em,
// 768px). Responsive `size` props lift controls to 44px ("lg") on phones.

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge as CBadge,
  Box,
  Button as CButton,
  Card,
  chakra,
  CloseButton,
  createListCollection,
  createToaster,
  DatePicker as CDatePicker,
  Dialog,
  Drawer,
  Field,
  Flex,
  HStack,
  IconButton,
  Input,
  parseDate,
  Portal,
  ProgressCircle,
  Select as CSelect,
  Stack,
  Table,
  Tabs as CTabs,
  Text,
  Textarea as CTextarea,
  Toast,
  Toaster as CToaster,
  useMediaQuery,
} from '@chakra-ui/react';
import {
  LuCalendar,
  LuChevronDown,
  LuChevronsUpDown,
  LuChevronUp,
  LuMenu,
  LuSiren,
  LuTrendingDown,
  LuTrendingUp,
} from 'react-icons/lu';
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

/** Below Chakra's `md` breakpoint. */
function useIsMobile() {
  const [mobile] = useMediaQuery(['(max-width: 47.99em)'], { ssr: false });
  return mobile ?? false;
}

/** 44px controls on phones, Chakra's default size above. */
const touchSize = { base: 'lg', md: 'md' } as const;

function AppShell({ title, nav, activeNavId, onNavigate, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  return (
    <Box minH="100vh" bg="bg.muted">
      <Box as="header" bg="bg" position="sticky" top={0} zIndex="sticky" borderBottomWidth="1px">
        <HStack h="60px" px="4" gap="6" maxW="1280px" mx="auto">
          <Text fontWeight="bold" fontSize="lg">
            {title}
          </Text>
          <HStack as="nav" aria-label="Main" gap="1" hideBelow="md">
            {nav.map((item) => (
              <CButton
                key={item.id}
                variant={item.id === activeNavId ? 'subtle' : 'ghost'}
                aria-current={item.id === activeNavId ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </CButton>
            ))}
          </HStack>
          <IconButton
            aria-label="Open menu"
            variant="ghost"
            size="lg"
            ml="auto"
            hideFrom="md"
            onClick={() => setOpen(true)}
          >
            <LuMenu />
          </IconButton>
        </HStack>
      </Box>
      <Drawer.Root open={open} onOpenChange={(d) => setOpen(d.open)} placement="start" size="xs">
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>{title}</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <Stack as="nav" aria-label="Drawer" gap="1">
                  {nav.map((item) => (
                    <CButton
                      key={item.id}
                      size="lg"
                      justifyContent="flex-start"
                      variant={item.id === activeNavId ? 'subtle' : 'ghost'}
                      aria-current={item.id === activeNavId ? 'page' : undefined}
                      onClick={() => {
                        onNavigate(item.id);
                        setOpen(false);
                      }}
                    >
                      {item.label}
                    </CButton>
                  ))}
                </Stack>
              </Drawer.Body>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="lg" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
      <main>{children}</main>
    </Box>
  );
}

function StatCard({ label, value, trend, gauge, alarm }: StatCardProps) {
  return (
    <Card.Root size="sm">
      <Card.Body gap="1">
        <Flex justify="space-between" align="center">
          <Text textStyle="sm" color="fg.muted" fontWeight="medium">
            {label}
          </Text>
          {alarm && (
            <Box color="red.solid">
              <LuSiren size={20} role="img" aria-label="Siren: heat is high" />
            </Box>
          )}
        </Flex>
        <HStack justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            {value}
          </Text>
          {gauge !== undefined && (
            <ProgressCircle.Root
              value={gauge}
              size="lg"
              colorPalette={alarm ? 'red' : 'blue'}
              aria-label={`${label} gauge`}
            >
              <ProgressCircle.Circle>
                <ProgressCircle.Track />
                <ProgressCircle.Range strokeLinecap="round" />
              </ProgressCircle.Circle>
            </ProgressCircle.Root>
          )}
        </HStack>
        {trend !== undefined && (
          <HStack gap="1" color={trend >= 0 ? 'green.fg' : 'red.fg'} textStyle="xs">
            {trend >= 0 ? <LuTrendingUp /> : <LuTrendingDown />}
            <span>
              {trend >= 0 ? '+' : ''}
              {trend}% vs last week
            </span>
          </HStack>
        )}
      </Card.Body>
    </Card.Root>
  );
}

function DataTable<Row>({ caption, columns, rows, getRowId, sort, onSortChange }: DataTableProps<Row>) {
  const isMobile = useIsMobile();
  const [primary, ...rest] = columns;
  const sortOptions = useMemo(
    () =>
      createListCollection({
        items: columns.filter((c) => c.sortable).map((c) => ({ value: c.key, label: c.header })),
      }),
    [columns],
  );

  if (isMobile) {
    return (
      <Stack gap="3">
        <CSelect.Root
          collection={sortOptions}
          size="lg"
          value={sort ? [sort.key] : []}
          onValueChange={(d) => d.value[0] && onSortChange(d.value[0])}
          positioning={{ sameWidth: true }}
        >
          <CSelect.HiddenSelect aria-hidden="true" />
          <CSelect.Control>
            <CSelect.Trigger aria-label={`Sort ${caption}`} bg="bg">
              <CSelect.ValueText placeholder="Sort by…" />
            </CSelect.Trigger>
            <CSelect.IndicatorGroup>
              <CSelect.Indicator />
            </CSelect.IndicatorGroup>
          </CSelect.Control>
          <Portal>
            <CSelect.Positioner>
              <CSelect.Content>
                {sortOptions.items.map((o) => (
                  <CSelect.Item key={o.value} item={o}>
                    {o.label}
                    <CSelect.ItemIndicator />
                  </CSelect.Item>
                ))}
              </CSelect.Content>
            </CSelect.Positioner>
          </Portal>
        </CSelect.Root>
        <Stack as="ul" aria-label={caption} gap="3" listStyleType="none" p="0" m="0">
          {rows.map((row) => (
            <Card.Root as="li" key={getRowId(row)} size="sm">
              <Card.Body>
                {primary && (
                  <Text fontWeight="semibold" mb="1.5">
                    {primary.render(row)}
                  </Text>
                )}
                <chakra.dl display="grid" gridTemplateColumns="auto 1fr" columnGap="4" rowGap="1" m="0">
                  {rest.map((col) => (
                    <Box key={col.key} display="contents">
                      <chakra.dt textStyle="sm" color="fg.muted">
                        {col.header}
                      </chakra.dt>
                      <chakra.dd textStyle="sm" m="0" textAlign="right">
                        {col.render(row)}
                      </chakra.dd>
                    </Box>
                  ))}
                </chakra.dl>
              </Card.Body>
            </Card.Root>
          ))}
        </Stack>
      </Stack>
    );
  }

  return (
    <Table.ScrollArea borderWidth="1px" rounded="md" bg="bg">
      <Table.Root size="md" striped interactive aria-label={caption} minW="560px">
        <Table.Header>
          <Table.Row>
            {columns.map((col) => {
              const active = sort?.key === col.key;
              const Icon = !active ? LuChevronsUpDown : sort.direction === 'asc' ? LuChevronUp : LuChevronDown;
              return (
                <Table.ColumnHeader
                  key={col.key}
                  textAlign={col.numeric ? 'end' : 'start'}
                  aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {col.sortable ? (
                    <chakra.button
                      type="button"
                      onClick={() => onSortChange(col.key)}
                      display="inline-flex"
                      alignItems="center"
                      gap="1"
                      fontWeight="semibold"
                      cursor="pointer"
                      whiteSpace="nowrap"
                    >
                      {col.header}
                      <Icon size={14} aria-hidden="true" />
                    </chakra.button>
                  ) : (
                    col.header
                  )}
                </Table.ColumnHeader>
              );
            })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={getRowId(row)}>
              {columns.map((col) => (
                <Table.Cell key={col.key} textAlign={col.numeric ? 'end' : 'start'} whiteSpace="normal">
                  {col.render(row)}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}

function Tabs({ tabs, activeId, onChange }: TabsProps) {
  const isMobile = useIsMobile();
  return (
    <CTabs.Root
      value={activeId}
      onValueChange={(d) => onChange(d.value)}
      fitted={isMobile}
      size={touchSize}
      lazyMount
      unmountOnExit
    >
      <CTabs.List mb="4">
        {tabs.map((t) => (
          <CTabs.Trigger key={t.id} value={t.id}>
            {t.label}
          </CTabs.Trigger>
        ))}
      </CTabs.List>
      {tabs.map((t) => (
        <CTabs.Content key={t.id} value={t.id} p="0">
          {t.content}
        </CTabs.Content>
      ))}
    </CTabs.Root>
  );
}

const BADGE_PALETTE: Record<Tone, string> = {
  neutral: 'gray',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  info: 'blue',
};

function Badge({ tone, children }: BadgeProps) {
  return (
    <CBadge colorPalette={BADGE_PALETTE[tone]} variant="subtle" whiteSpace="nowrap">
      {children}
    </CBadge>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Field.Label>
      {children}
      <Field.RequiredIndicator />
    </Field.Label>
  );
}

function TextField({ id, label, required, error, value, onChange, onBlur }: TextFieldProps) {
  return (
    <Field.Root ids={{ control: id }} required={required} invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>
      <Input
        size={touchSize}
        bg="bg"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onBlur={onBlur}
      />
      <Field.ErrorText>{error}</Field.ErrorText>
    </Field.Root>
  );
}

function Select({ id, label, required, error, value, options, placeholder, onChange, onBlur }: SelectProps) {
  const collection = useMemo(() => createListCollection({ items: options }), [options]);
  return (
    <Field.Root required={required} invalid={!!error}>
      <CSelect.Root
        ids={{ trigger: id }}
        collection={collection}
        size={touchSize}
        value={value ? [value] : []}
        onValueChange={(d) => onChange(d.value[0] ?? '')}
        onOpenChange={(d) => !d.open && onBlur?.()}
        positioning={{ sameWidth: true }}
      >
        <CSelect.HiddenSelect aria-hidden="true" />
        <CSelect.Label display="flex" gap="1">
          {label}
          <Field.RequiredIndicator />
        </CSelect.Label>
        <CSelect.Control>
          <CSelect.Trigger bg="bg">
            <CSelect.ValueText placeholder={placeholder} />
          </CSelect.Trigger>
          <CSelect.IndicatorGroup>
            <CSelect.Indicator />
          </CSelect.IndicatorGroup>
        </CSelect.Control>
        <Portal>
          <CSelect.Positioner>
            <CSelect.Content>
              {collection.items.map((o) => (
                <CSelect.Item key={o.value} item={o}>
                  {o.label}
                  <CSelect.ItemIndicator />
                </CSelect.Item>
              ))}
            </CSelect.Content>
          </CSelect.Positioner>
        </Portal>
      </CSelect.Root>
      <Field.ErrorText>{error}</Field.ErrorText>
    </Field.Root>
  );
}

function DatePicker({ id, label, required, error, value, onChange, onBlur }: DatePickerProps) {
  return (
    <Field.Root required={required} invalid={!!error}>
      <CDatePicker.Root
        ids={{ input: () => id }}
        size={touchSize}
        value={value ? [parseDate(value)] : []}
        onValueChange={(d) => onChange(d.value[0]?.toString() ?? '')}
        onOpenChange={(d) => !d.open && onBlur?.()}
      >
        <CDatePicker.Label display="flex" gap="1">
          {label}
          <Field.RequiredIndicator />
        </CDatePicker.Label>
        <CDatePicker.Control>
          <CDatePicker.Input placeholder="mm/dd/yyyy" bg="bg" />
          <CDatePicker.IndicatorGroup>
            <CDatePicker.Trigger aria-label="Pick a date" minW={{ base: '11', md: 'auto' }} minH={{ base: '11', md: 'auto' }}>
              <LuCalendar />
            </CDatePicker.Trigger>
          </CDatePicker.IndicatorGroup>
        </CDatePicker.Control>
        <Portal>
          <CDatePicker.Positioner>
            <CDatePicker.Content>
              <CDatePicker.View view="day">
                <CDatePicker.Header />
                <CDatePicker.DayTable />
              </CDatePicker.View>
              <CDatePicker.View view="month">
                <CDatePicker.Header />
                <CDatePicker.MonthTable />
              </CDatePicker.View>
              <CDatePicker.View view="year">
                <CDatePicker.Header />
                <CDatePicker.YearTable />
              </CDatePicker.View>
            </CDatePicker.Content>
          </CDatePicker.Positioner>
        </Portal>
      </CDatePicker.Root>
      <Field.ErrorText>{error}</Field.ErrorText>
    </Field.Root>
  );
}

function Textarea({ id, label, required, error, value, rows, onChange, onBlur }: TextareaProps) {
  return (
    <Field.Root ids={{ control: id }} required={required} invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>
      <CTextarea
        size={touchSize}
        bg="bg"
        rows={rows ?? 3}
        autoresize
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onBlur={onBlur}
      />
      <Field.ErrorText>{error}</Field.ErrorText>
    </Field.Root>
  );
}

function Button({ variant = 'primary', type = 'button', disabled, onClick, children }: ButtonProps) {
  return (
    <CButton
      type={type}
      disabled={disabled}
      onClick={onClick}
      size={touchSize}
      variant={variant === 'secondary' ? 'outline' : 'solid'}
      colorPalette={variant === 'danger' ? 'red' : variant === 'primary' ? 'blue' : 'gray'}
      bg={variant === 'secondary' ? 'bg' : undefined}
    >
      {children}
    </CButton>
  );
}

function Modal({ open, title, children, confirmLabel, cancelLabel, onConfirm, onCancel }: ModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => !d.open && onCancel()}
      placement="center"
      size="md"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner px={{ base: '4', md: '0' }}>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text color="fg.muted">{children}</Text>
            </Dialog.Body>
            <Dialog.Footer>
              <CButton variant="outline" size={touchSize} flex={{ base: '1', md: 'initial' }} onClick={onCancel}>
                {cancelLabel}
              </CButton>
              <CButton colorPalette="blue" size={touchSize} flex={{ base: '1', md: 'initial' }} onClick={onConfirm}>
                {confirmLabel}
              </CButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

const toaster = createToaster({ placement: 'bottom-end' });

/** Mirrors the shared toast list into Chakra's toaster. */
function Toaster({ toasts, onDismiss }: ToasterProps) {
  const shown = useRef(new Set<string>());
  useEffect(() => {
    const current = new Set(toasts.map((t) => t.id));
    for (const t of toasts) {
      if (shown.current.has(t.id)) continue;
      shown.current.add(t.id);
      toaster.create({
        id: t.id,
        title: t.title,
        type: t.tone,
        duration: Infinity,
        closable: true,
        onStatusChange: ({ status }) => status === 'unmounted' && onDismiss(t.id),
      });
    }
    for (const id of shown.current) {
      if (!current.has(id)) {
        toaster.dismiss(id);
        shown.current.delete(id);
      }
    }
  }, [toasts, onDismiss]);

  return (
    <Portal>
      <CToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
        {(toast) => (
          <Toast.Root width={{ md: 'sm' }}>
            <Toast.Indicator />
            <Toast.Title flex="1">{toast.title}</Toast.Title>
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </CToaster>
    </Portal>
  );
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
