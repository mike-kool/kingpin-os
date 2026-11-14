// Mantine implementation of the Kingpin OS component contract, on Mantine's
// default theme. Mobile is below Mantine's `sm` breakpoint (48em, 768px).

import { useEffect, useRef, useState } from 'react';
import {
  Badge as MBadge,
  Box,
  Burger,
  Button as MButton,
  Card,
  Drawer,
  Group,
  Modal as MModal,
  NavLink,
  Paper,
  Select as MSelect,
  SemiCircleProgress,
  Stack,
  Table,
  Tabs as MTabs,
  Text,
  Textarea as MTextarea,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconSelector,
  IconUrgent,
  IconTrendingDown,
  IconTrendingUp,
  IconX,
} from '@tabler/icons-react';
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
  ToastTone,
} from '@kingpin/shared';

/** Mantine's `sm` breakpoint. */
function useIsMobile() {
  return useMediaQuery('(max-width: 47.99em)', undefined, { getInitialValueInEffect: false }) ?? false;
}

function AppShell({ title, nav, activeNavId, onNavigate, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  return (
    <Box mih="100vh" bg="gray.0">
      <Box
        component="header"
        bg="white"
        pos="sticky"
        top={0}
        style={{ zIndex: 100, borderBottom: '1px solid var(--mantine-color-gray-3)' }}
      >
        <Group h={60} px="md" gap="lg" maw={1280} mx="auto">
          <Text fw={700} size="lg">
            {title}
          </Text>
          <Group component="nav" aria-label="Main" gap={4} visibleFrom="sm">
            {nav.map((item) => (
              <MButton
                key={item.id}
                variant={item.id === activeNavId ? 'light' : 'subtle'}
                color={item.id === activeNavId ? undefined : 'gray'}
                aria-current={item.id === activeNavId ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </MButton>
            ))}
          </Group>
          <Burger
            opened={open}
            onClick={() => setOpen((o) => !o)}
            hiddenFrom="sm"
            ml="auto"
            size="sm"
            aria-label="Open menu"
            w={44}
            h={44}
          />
        </Group>
      </Box>
      <Drawer opened={open} onClose={() => setOpen(false)} title={title} size={280}>
        <Box component="nav" aria-label="Drawer">
          {nav.map((item) => (
            <NavLink
              key={item.id}
              label={item.label}
              active={item.id === activeNavId}
              mih={44}
              onClick={() => {
                onNavigate(item.id);
                setOpen(false);
              }}
            />
          ))}
        </Box>
      </Drawer>
      <main>{children}</main>
    </Box>
  );
}

function StatCard({ label, value, trend, gauge, alarm }: StatCardProps) {
  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between">
        <Text size="sm" c="dimmed" fw={500}>
          {label}
        </Text>
        {alarm && <IconUrgent color="var(--mantine-color-red-6)" size={22} aria-label="Siren: heat is high" />}
      </Group>
      {gauge !== undefined ? (
        <SemiCircleProgress
          value={gauge}
          size={140}
          thickness={12}
          filledSegmentColor={alarm ? 'red' : 'blue'}
          label={<Text fw={700} size="xl">{value}</Text>}
          aria-label={`${label} gauge`}
          mt="xs"
          mx="auto"
        />
      ) : (
        <Text fw={700} fz={28} mt={4}>
          {value}
        </Text>
      )}
      {trend !== undefined && (
        <Group gap={4} c={trend >= 0 ? 'teal' : 'red'} mt={4}>
          {trend >= 0 ? <IconTrendingUp size={16} /> : <IconTrendingDown size={16} />}
          <Text size="xs" c="inherit">
            {trend >= 0 ? '+' : ''}
            {trend}% vs last week
          </Text>
        </Group>
      )}
    </Card>
  );
}

function DataTable<Row>({ caption, columns, rows, getRowId, sort, onSortChange }: DataTableProps<Row>) {
  const isMobile = useIsMobile();
  const [primary, ...rest] = columns;

  if (isMobile) {
    return (
      <Stack gap="sm">
        <MSelect
          aria-label={`Sort ${caption}`}
          placeholder="Sort by…"
          value={sort?.key ?? null}
          data={columns.filter((c) => c.sortable).map((c) => ({ value: c.key, label: c.header }))}
          onChange={(key) => key && onSortChange(key)}
          size="md"
          allowDeselect={false}
          comboboxProps={{ withinPortal: true }}
        />
        <Stack component="ul" aria-label={caption} gap="sm" p={0} m={0} style={{ listStyle: 'none' }}>
          {rows.map((row) => (
            <Card component="li" key={getRowId(row)} withBorder radius="md" padding="sm">
              {primary && <Text fw={600} mb={6}>{primary.render(row)}</Text>}
              <Box
                component="dl"
                m={0}
                style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 16, rowGap: 4 }}
              >
                {rest.map((col) => (
                  <Box key={col.key} style={{ display: 'contents' }}>
                    <Text component="dt" size="sm" c="dimmed">
                      {col.header}
                    </Text>
                    <Text component="dd" size="sm" m={0} ta="right">
                      {col.render(row)}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Card>
          ))}
        </Stack>
      </Stack>
    );
  }

  return (
    <Paper withBorder radius="md">
      <Table.ScrollContainer minWidth={560}>
        <Table striped highlightOnHover verticalSpacing="sm" aria-label={caption}>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => {
                const active = sort?.key === col.key;
                const Icon = !active ? IconSelector : sort.direction === 'asc' ? IconChevronUp : IconChevronDown;
                return (
                  <Table.Th
                    key={col.key}
                    ta={col.numeric ? 'right' : 'left'}
                    aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {col.sortable ? (
                      <UnstyledButton onClick={() => onSortChange(col.key)} fw={600}>
                        <Group gap={4} justify={col.numeric ? 'flex-end' : 'flex-start'} wrap="nowrap">
                          {col.header}
                          <Icon size={14} />
                        </Group>
                      </UnstyledButton>
                    ) : (
                      col.header
                    )}
                  </Table.Th>
                );
              })}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr key={getRowId(row)}>
                {columns.map((col) => (
                  <Table.Td key={col.key} ta={col.numeric ? 'right' : 'left'}>
                    {col.render(row)}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

function Tabs({ tabs, activeId, onChange }: TabsProps) {
  const isMobile = useIsMobile();
  return (
    <MTabs value={activeId} onChange={(id) => id && onChange(id)} keepMounted={false}>
      <MTabs.List grow={isMobile} mb="md">
        {tabs.map((t) => (
          <MTabs.Tab key={t.id} value={t.id} mih={44}>
            {t.label}
          </MTabs.Tab>
        ))}
      </MTabs.List>
      {tabs.map((t) => (
        <MTabs.Panel key={t.id} value={t.id}>
          {t.content}
        </MTabs.Panel>
      ))}
    </MTabs>
  );
}

const BADGE_COLOR: Record<Tone, string> = {
  neutral: 'gray',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  info: 'blue',
};

function Badge({ tone, children }: BadgeProps) {
  return (
    <MBadge color={BADGE_COLOR[tone]} variant="light" miw="max-content">
      {children}
    </MBadge>
  );
}

const fieldSize = { size: 'md' } as const;

function TextField({ id, label, required, error, value, onChange, onBlur }: TextFieldProps) {
  return (
    <TextInput
      id={id}
      label={label}
      withAsterisk={required}
      value={value}
      error={error}
      onChange={(e) => onChange(e.currentTarget.value)}
      onBlur={onBlur}
      {...fieldSize}
    />
  );
}

function Select({ id, label, required, error, value, options, placeholder, onChange, onBlur }: SelectProps) {
  return (
    <MSelect
      id={id}
      label={label}
      withAsterisk={required}
      placeholder={placeholder}
      data={options}
      value={value || null}
      error={error}
      onChange={(v) => onChange(v ?? '')}
      onBlur={onBlur}
      allowDeselect={false}
      {...fieldSize}
    />
  );
}

function DatePicker({ id, label, required, error, value, onChange, onBlur }: DatePickerProps) {
  return (
    <DatePickerInput
      id={id}
      label={label}
      withAsterisk={required}
      placeholder="Pick a date"
      value={value || null}
      error={error}
      onChange={(v) => onChange(v ? String(v).slice(0, 10) : '')}
      onDropdownClose={onBlur}
      valueFormat="MMMM D, YYYY"
      clearable
      {...fieldSize}
    />
  );
}

function Textarea({ id, label, required, error, value, rows, onChange, onBlur }: TextareaProps) {
  return (
    <MTextarea
      id={id}
      label={label}
      withAsterisk={required}
      value={value}
      error={error}
      minRows={rows ?? 3}
      autosize
      onChange={(e) => onChange(e.currentTarget.value)}
      onBlur={onBlur}
      {...fieldSize}
    />
  );
}

function Button({ variant = 'primary', type = 'button', disabled, onClick, children }: ButtonProps) {
  return (
    <MButton
      type={type}
      disabled={disabled}
      onClick={onClick}
      variant={variant === 'secondary' ? 'default' : 'filled'}
      color={variant === 'danger' ? 'red' : undefined}
      size="md"
    >
      {children}
    </MButton>
  );
}

function Modal({ open, title, children, confirmLabel, cancelLabel, onConfirm, onCancel }: ModalProps) {
  const isMobile = useIsMobile();
  return (
    <MModal
      opened={open}
      onClose={onCancel}
      title={<Text fw={700}>{title}</Text>}
      centered
      size={isMobile ? '100%' : 'md'}
    >
      <Text size="sm" c="dimmed">
        {children}
      </Text>
      <Group justify="flex-end" mt="lg" grow={isMobile}>
        <MButton variant="default" size="md" onClick={onCancel}>
          {cancelLabel}
        </MButton>
        <MButton size="md" onClick={onConfirm}>
          {confirmLabel}
        </MButton>
      </Group>
    </MModal>
  );
}

const TOAST_STYLE: Record<ToastTone, { color: string; icon: React.ReactNode }> = {
  success: { color: 'teal', icon: <IconCheck size={18} /> },
  warning: { color: 'yellow', icon: <IconAlertTriangle size={18} /> },
  error: { color: 'red', icon: <IconX size={18} /> },
};

/** Mirrors the shared toast list into @mantine/notifications. */
function Toaster({ toasts, onDismiss }: ToasterProps) {
  const shown = useRef(new Set<string>());
  useEffect(() => {
    const current = new Set(toasts.map((t) => t.id));
    for (const t of toasts) {
      if (shown.current.has(t.id)) continue;
      shown.current.add(t.id);
      notifications.show({
        id: t.id,
        message: t.title,
        autoClose: false,
        withBorder: true,
        onClose: () => onDismiss(t.id),
        ...TOAST_STYLE[t.tone],
      });
    }
    for (const id of shown.current) {
      if (!current.has(id)) {
        notifications.hide(id);
        shown.current.delete(id);
      }
    }
  }, [toasts, onDismiss]);
  return null;
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
