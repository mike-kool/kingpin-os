// The Kingpin OS component contract, built on this package's own components.
// No UI library: React, the platform (<dialog>, <select>, Intl) and one CSS
// file. Each contract component below is a thin adapter over the kit in
// ./components, which is written to be used on its own; see the README.

import { useState } from 'react';
import { TOAST_DURATION_MS } from '@kingpin/shared';
import type {
  AppShellProps,
  BadgeProps,
  ButtonProps,
  DatePickerProps,
  KitComponents,
  ModalProps,
  SelectProps,
  StatCardProps,
  TabsProps,
  TextareaProps,
  TextFieldProps,
  ToasterProps,
} from '@kingpin/shared';
import {
  AppBar,
  Badge as KBadge,
  Button as KButton,
  DataTable,
  DatePicker as KDatePicker,
  Dialog,
  Drawer,
  Field,
  Gauge,
  Icon,
  Input,
  NavList,
  Select as KSelect,
  Stat,
  Tabs as KTabs,
  Textarea as KTextarea,
  ThemeToggle,
  Toaster as KToaster,
} from './components';

function AppShell({ title, nav, activeNavId, onNavigate, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const brand = (
    <>
      <span className="k-brand-mark" aria-hidden="true">
        ♛
      </span>
      {title}
    </>
  );
  return (
    <>
      <AppBar
        brand={brand}
        actions={
          <>
            <ThemeToggle />
            <KButton variant="ghost" icon className="k-phone" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              <Icon name="menu" />
            </KButton>
          </>
        }
      >
        <NavList label="Main" className="k-desktop" items={nav} value={activeNavId} onChange={onNavigate} />
      </AppBar>
      <main>{children}</main>
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title={brand}>
        <NavList
          label="Drawer"
          direction="column"
          items={nav}
          value={activeNavId}
          onChange={(id) => {
            onNavigate(id);
            setMenuOpen(false);
          }}
        />
      </Drawer>
    </>
  );
}

function StatCard({ label, value, trend, gauge, alarm }: StatCardProps) {
  return (
    <Stat
      label={label}
      value={value}
      trend={trend}
      aside={alarm && <Icon name="siren" className="k-siren" label="Siren: heat is high" />}
    >
      {gauge === undefined ? undefined : (
        <Gauge value={gauge} label={label} tone={alarm ? 'danger' : 'accent'}>
          {value}
        </Gauge>
      )}
    </Stat>
  );
}

function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return <KTabs tabs={tabs} value={activeId} onChange={onChange} />;
}

function Badge({ tone, children }: BadgeProps) {
  return <KBadge tone={tone}>{children}</KBadge>;
}

function TextField({ id, label, required, error, ...input }: TextFieldProps) {
  return (
    <Field id={id} label={label} required={required} error={error}>
      <Input {...input} />
    </Field>
  );
}

function Select({ id, label, required, error, placeholder = 'Pick one', ...select }: SelectProps) {
  return (
    <Field id={id} label={label} required={required} error={error}>
      <KSelect placeholder={placeholder} {...select} />
    </Field>
  );
}

function DatePicker({ id, label, required, error, ...picker }: DatePickerProps) {
  return (
    <Field id={id} label={label} required={required} error={error}>
      <KDatePicker {...picker} />
    </Field>
  );
}

function Textarea({ id, label, required, error, ...textarea }: TextareaProps) {
  return (
    <Field id={id} label={label} required={required} error={error}>
      <KTextarea {...textarea} />
    </Field>
  );
}

function Button(props: ButtonProps) {
  return <KButton {...props} />;
}

function Modal({ open, title, children, confirmLabel, cancelLabel, onConfirm, onCancel }: ModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <KButton variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </KButton>
          <KButton onClick={onConfirm}>{confirmLabel}</KButton>
        </>
      }
    >
      {children}
    </Dialog>
  );
}

function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <KToaster
      toasts={toasts.map((t) => ({ ...t, tone: t.tone === 'error' ? 'danger' : t.tone }))}
      onDismiss={onDismiss}
      duration={TOAST_DURATION_MS}
    />
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
