// shadcn/ui implementation of the Kingpin OS component contract.
// The components in ./components/ui are shadcn's own source, copied in the
// way the shadcn CLI does; this file adapts them to the shared prop types.

import { useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ArrowDown, ArrowUp, ArrowUpDown, CalendarIcon, Menu, Siren, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
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
import { cn } from './lib/utils';
import { Badge as UiBadge } from './components/ui/badge';
import { Button as UiButton } from './components/ui/button';
import { Calendar } from './components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Progress } from './components/ui/progress';
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';
import { Toaster as Sonner } from './components/ui/sonner';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Tabs as UiTabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Textarea as UiTextarea } from './components/ui/textarea';

/** 44px touch targets below the mobile breakpoint. */
const TOUCH = 'max-sm:h-11 max-sm:min-w-11';

function AppShell({ title, nav, activeNavId, onNavigate, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-6 px-6 max-sm:px-4">
          <span className="font-semibold">{title}</span>
          <nav className="flex gap-1 max-sm:hidden" aria-label="Main">
            {nav.map((item) => (
              <UiButton
                key={item.id}
                variant={item.id === activeNavId ? 'secondary' : 'ghost'}
                size="sm"
                aria-current={item.id === activeNavId ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </UiButton>
            ))}
          </nav>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <UiButton variant="outline" size="icon" className="ml-auto size-11 sm:hidden" aria-label="Open menu">
                <Menu />
              </UiButton>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>{title}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Drawer">
                {nav.map((item) => (
                  <UiButton
                    key={item.id}
                    variant={item.id === activeNavId ? 'secondary' : 'ghost'}
                    className="h-11 justify-start"
                    onClick={() => {
                      onNavigate(item.id);
                      setOpen(false);
                    }}
                  >
                    {item.label}
                  </UiButton>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

function StatCard({ label, value, trend, gauge, alarm }: StatCardProps) {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          {label}
          {alarm && <Siren className="size-5 animate-pulse text-destructive" aria-label="Siren: heat is high" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-4">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        {trend !== undefined && (
          <span
            className={cn(
              'flex items-center gap-1 text-xs',
              trend >= 0 ? 'text-emerald-600' : 'text-destructive',
            )}
          >
            {trend >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {trend >= 0 ? '+' : ''}
            {trend}% vs last week
          </span>
        )}
        {gauge !== undefined && (
          <Progress
            value={gauge}
            aria-label={`${label} gauge`}
            className={cn(alarm && '[&>[data-slot=progress-indicator]]:bg-destructive')}
          />
        )}
      </CardContent>
    </Card>
  );
}

function SortIcon({ active, direction }: { active: boolean; direction?: 'asc' | 'desc' }) {
  if (!active) return <ArrowUpDown className="size-3.5 opacity-50" />;
  return direction === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />;
}

function DataTable<Row>({ caption, columns, rows, getRowId, sort, onSortChange }: DataTableProps<Row>) {
  const [primary, ...rest] = columns;
  return (
    <>
      {/* Desktop: a sortable table. */}
      <div className="rounded-md border bg-background max-sm:hidden">
        <Table>
          <TableCaption className="sr-only">{caption}</TableCaption>
          <TableHeader>
            <TableRow>
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <TableHead
                    key={col.key}
                    className={cn(col.numeric && 'text-right')}
                    aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {col.sortable ? (
                      <UiButton
                        variant="ghost"
                        size="sm"
                        className={cn('-ml-3', col.numeric && '-mr-3 ml-auto')}
                        onClick={() => onSortChange(col.key)}
                      >
                        {col.header}
                        <SortIcon active={active} direction={sort?.direction} />
                      </UiButton>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={cn('whitespace-normal', col.numeric && 'text-right tabular-nums whitespace-nowrap')}>
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: a sort picker and stacked cards. */}
      <div className="flex flex-col gap-3 sm:hidden">
        <UiSelect value={sort?.key ?? ''} onValueChange={(key) => onSortChange(key)}>
          <SelectTrigger className="w-full bg-background data-[size=default]:h-11" aria-label={`Sort ${caption}`}>
            <SelectValue placeholder="Sort by…" />
          </SelectTrigger>
          <SelectContent>
            {columns
              .filter((c) => c.sortable)
              .map((c) => (
                <SelectItem key={c.key} value={c.key}>
                  Sort by {c.header.toLowerCase()}
                </SelectItem>
              ))}
          </SelectContent>
        </UiSelect>
        <ul className="flex flex-col gap-3" aria-label={caption}>
          {rows.map((row) => (
            <li key={getRowId(row)}>
              <Card className="gap-2 py-3">
                <CardContent className="flex flex-col gap-1.5 px-4">
                  {primary && <span className="font-semibold">{primary.render(row)}</span>}
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    {rest.map((col) => (
                      <div key={col.key} className="contents">
                        <dt className="text-muted-foreground">{col.header}</dt>
                        <dd className="text-right">{col.render(row)}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <UiTabs value={activeId} onValueChange={onChange} className="gap-4">
      <TabsList className="max-sm:h-11 max-sm:w-full">
        {tabs.map((t) => (
          <TabsTrigger key={t.id} value={t.id} className={TOUCH}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((t) => (
        <TabsContent key={t.id} value={t.id}>
          {t.content}
        </TabsContent>
      ))}
    </UiTabs>
  );
}

const BADGE_TONE: Record<Tone, string> = {
  neutral: '',
  info: '',
  success: 'border-transparent bg-emerald-100 text-emerald-800',
  warning: 'border-transparent bg-amber-100 text-amber-800',
  danger: '',
};
const BADGE_VARIANT: Record<Tone, 'secondary' | 'outline' | 'destructive' | 'default'> = {
  neutral: 'secondary',
  info: 'outline',
  success: 'secondary',
  warning: 'secondary',
  danger: 'destructive',
};

function Badge({ tone, children }: BadgeProps) {
  return (
    <UiBadge variant={BADGE_VARIANT[tone]} className={BADGE_TONE[tone]}>
      {children}
    </UiBadge>
  );
}

function FieldShell({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive" aria-hidden="true">*</span>}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function TextField({ id, label, required, error, value, onChange, onBlur }: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <Input
        id={id}
        value={value}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="bg-background max-sm:h-11"
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </FieldShell>
  );
}

function Select({ id, label, required, error, value, options, placeholder, onChange, onBlur }: SelectProps) {
  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <UiSelect
        value={value}
        onValueChange={onChange}
        onOpenChange={(open) => {
          if (!open) onBlur?.();
        }}
      >
        <SelectTrigger
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full bg-background max-sm:data-[size=default]:h-11"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </UiSelect>
    </FieldShell>
  );
}

function DatePicker({ id, label, required, error, value, onChange, onBlur }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const date = value ? parseISO(value) : undefined;
  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onBlur?.();
        }}
      >
        <PopoverTrigger asChild>
          <UiButton
            id={id}
            variant="outline"
            aria-invalid={!!error}
            className={cn('justify-start font-normal max-sm:h-11', !date && 'text-muted-foreground')}
          >
            <CalendarIcon />
            {date ? format(date, 'MMMM d, yyyy') : 'Pick a date'}
          </UiButton>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            onSelect={(d) => {
              onChange(d ? format(d, 'yyyy-MM-dd') : '');
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </FieldShell>
  );
}

function Textarea({ id, label, required, error, value, rows, onChange, onBlur }: TextareaProps) {
  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <UiTextarea
        id={id}
        value={value}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="bg-background"
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </FieldShell>
  );
}

const BUTTON_VARIANT = { primary: 'default', secondary: 'outline', danger: 'destructive' } as const;

function Button({ variant = 'primary', type = 'button', disabled, onClick, children }: ButtonProps) {
  return (
    <UiButton
      type={type}
      variant={BUTTON_VARIANT[variant]}
      disabled={disabled}
      onClick={onClick}
      className="max-sm:h-11"
    >
      {children}
    </UiButton>
  );
}

function Modal({ open, title, children, confirmLabel, cancelLabel, onConfirm, onCancel }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-sm:max-w-[calc(100%-1rem)]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{children}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <UiButton variant="outline" className="max-sm:h-11" onClick={onCancel}>
            {cancelLabel}
          </UiButton>
          <UiButton className="max-sm:h-11" onClick={onConfirm}>
            {confirmLabel}
          </UiButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Mirrors the shared toast list into Sonner, shadcn's toast component. */
function Toaster({ toasts, onDismiss }: ToasterProps) {
  const shown = useRef(new Set<string>());
  useEffect(() => {
    const current = new Set(toasts.map((t) => t.id));
    for (const t of toasts) {
      if (shown.current.has(t.id)) continue;
      shown.current.add(t.id);
      toast[t.tone](t.title, { id: t.id, onDismiss: () => onDismiss(t.id) });
    }
    for (const id of shown.current) {
      if (!current.has(id)) {
        toast.dismiss(id);
        shown.current.delete(id);
      }
    }
  }, [toasts, onDismiss]);
  return <Sonner position="bottom-right" />;
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
