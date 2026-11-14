// MUI implementation of the Kingpin OS component contract, on MUI's default
// theme. Breakpoints are MUI's own (mobile below `sm`, 600px), so the phone
// frame shows MUI's real responsive behavior.

import { useState } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
  AppBar,
  Box,
  Button as MuiButton,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select as MuiSelect,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs as MuiTabs,
  TextField as MuiTextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Paper,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
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

function useIsMobile() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });
}

/** 44px touch targets on phones. */
const touch = { minHeight: { xs: 44, sm: 'auto' } } as const;

function AppShell({ title, nav, activeNavId, onNavigate, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 3 }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Box component="nav" aria-label="Main" sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
            {nav.map((item) => (
              <MuiButton
                key={item.id}
                color="inherit"
                aria-current={item.id === activeNavId ? 'page' : undefined}
                sx={{ opacity: item.id === activeNavId ? 1 : 0.8, fontWeight: item.id === activeNavId ? 700 : 500 }}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </MuiButton>
            ))}
          </Box>
          <IconButton
            color="inherit"
            edge="end"
            size="large"
            aria-label="Open menu"
            sx={{ ml: 'auto', display: { sm: 'none' } }}
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280 }}>
          <Typography variant="h6" sx={{ px: 2, py: 2 }}>
            {title}
          </Typography>
          <List component="nav" aria-label="Drawer">
            {nav.map((item) => (
              <ListItemButton
                key={item.id}
                selected={item.id === activeNavId}
                sx={{ minHeight: 48 }}
                onClick={() => {
                  onNavigate(item.id);
                  setOpen(false);
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <main>{children}</main>
    </Box>
  );
}

function StatCard({ label, value, trend, gauge, alarm }: StatCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {alarm && <NotificationImportantIcon color="error" aria-label="Siren: heat is high" />}
        </Stack>
        <Typography variant="h5" component="p" sx={{ fontWeight: 700, mt: 1 }}>
          {value}
        </Typography>
        {trend !== undefined && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: 'center', mt: 0.5, color: trend >= 0 ? 'success.main' : 'error.main' }}
          >
            {trend >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
            <Typography variant="caption">
              {trend >= 0 ? '+' : ''}
              {trend}% vs last week
            </Typography>
          </Stack>
        )}
        {gauge !== undefined && (
          <LinearProgress
            variant="determinate"
            value={gauge}
            color={alarm ? 'error' : 'primary'}
            aria-label={`${label} gauge`}
            sx={{ mt: 1.5, height: 8, borderRadius: 4 }}
          />
        )}
      </CardContent>
    </Card>
  );
}

function DataTable<Row>({ caption, columns, rows, getRowId, sort, onSortChange }: DataTableProps<Row>) {
  const isMobile = useIsMobile();
  const [primary, ...rest] = columns;

  if (isMobile) {
    return (
      <Stack spacing={1.5}>
        <FormControl fullWidth size="medium">
          <InputLabel id={`${caption}-sort`}>Sort by</InputLabel>
          <MuiSelect
            labelId={`${caption}-sort`}
            label="Sort by"
            value={sort?.key ?? ''}
            onChange={(e) => onSortChange(String(e.target.value))}
            inputProps={{ 'aria-label': `Sort ${caption}` }}
            sx={{ bgcolor: 'background.paper' }}
          >
            {columns
              .filter((c) => c.sortable)
              .map((c) => (
                <MenuItem key={c.key} value={c.key} sx={{ minHeight: 44 }}>
                  {c.header}
                </MenuItem>
              ))}
          </MuiSelect>
        </FormControl>
        <Stack component="ul" aria-label={caption} spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {rows.map((row) => (
            <Card component="li" key={getRowId(row)} variant="outlined">
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                {primary && (
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>{primary.render(row)}</Typography>
                )}
                <Box
                  component="dl"
                  sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 2, rowGap: 0.5, m: 0 }}
                >
                  {rest.map((col) => (
                    <Box key={col.key} sx={{ display: 'contents' }}>
                      <Typography component="dt" variant="body2" color="text.secondary">
                        {col.header}
                      </Typography>
                      <Typography component="dd" variant="body2" sx={{ m: 0, textAlign: 'right' }}>
                        {col.render(row)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label={caption}>
        <TableHead>
          <TableRow>
            {columns.map((col) => {
              const active = sort?.key === col.key;
              return (
                <TableCell
                  key={col.key}
                  align={col.numeric ? 'right' : 'left'}
                  sortDirection={active ? sort.direction : false}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={active}
                      direction={active ? sort.direction : 'asc'}
                      onClick={() => onSortChange(col.key)}
                    >
                      {col.header}
                    </TableSortLabel>
                  ) : (
                    col.header
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={getRowId(row)} hover>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.numeric ? 'right' : 'left'}>
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function Tabs({ tabs, activeId, onChange }: TabsProps) {
  const isMobile = useIsMobile();
  return (
    <Box>
      <MuiTabs
        value={activeId}
        onChange={(_, id: string) => onChange(id)}
        variant={isMobile ? 'fullWidth' : 'standard'}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        {tabs.map((t) => (
          <Tab key={t.id} value={t.id} label={t.label} id={`tab-${t.id}`} aria-controls={`panel-${t.id}`} />
        ))}
      </MuiTabs>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={t.id !== activeId}>
          {t.id === activeId && t.content}
        </div>
      ))}
    </Box>
  );
}

const CHIP_COLOR: Record<Tone, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  neutral: 'default',
  success: 'success',
  warning: 'warning',
  danger: 'error',
  info: 'info',
};

function Badge({ tone, children }: BadgeProps) {
  return <Chip size="small" color={CHIP_COLOR[tone]} label={children} />;
}

function TextField({ id, label, required, error, value, onChange, onBlur }: TextFieldProps) {
  return (
    <MuiTextField
      id={id}
      label={label}
      required={required}
      value={value}
      error={!!error}
      helperText={error}
      fullWidth
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      sx={{ bgcolor: 'background.paper' }}
    />
  );
}

function Select({ id, label, required, error, value, options, onChange, onBlur }: SelectProps) {
  const labelId = `${id}-label`;
  return (
    <FormControl fullWidth required={required} error={!!error}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <MuiSelect
        labelId={labelId}
        id={id}
        label={label}
        value={value}
        onChange={(e) => onChange(String(e.target.value))}
        onClose={() => onBlur?.()}
        sx={{ bgcolor: 'background.paper' }}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value} sx={{ minHeight: 44 }}>
            {o.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

function DatePicker({ id, label, required, error, value, onChange, onBlur }: DatePickerProps) {
  return (
    <MuiDatePicker
      label={label}
      value={value ? dayjs(value) : null}
      onChange={(d) => onChange(d && d.isValid() ? d.format('YYYY-MM-DD') : '')}
      onClose={() => onBlur?.()}
      slotProps={{
        openPickerButton: { sx: { width: 44, height: 44 } },
        textField: {
          id,
          required,
          error: !!error,
          helperText: error,
          fullWidth: true,
          onBlur,
          sx: { bgcolor: 'background.paper' },
        },
      }}
    />
  );
}

function Textarea({ id, label, required, error, value, rows, onChange, onBlur }: TextareaProps) {
  return (
    <MuiTextField
      id={id}
      label={label}
      required={required}
      value={value}
      error={!!error}
      helperText={error}
      multiline
      minRows={rows ?? 3}
      fullWidth
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      sx={{ bgcolor: 'background.paper' }}
    />
  );
}

function Button({ variant = 'primary', type = 'button', disabled, onClick, children }: ButtonProps) {
  return (
    <MuiButton
      type={type}
      disabled={disabled}
      onClick={onClick}
      variant={variant === 'secondary' ? 'outlined' : 'contained'}
      color={variant === 'danger' ? 'error' : 'primary'}
      sx={touch}
    >
      {children}
    </MuiButton>
  );
}

function Modal({ open, title, children, confirmLabel, cancelLabel, onConfirm, onCancel }: ModalProps) {
  const isMobile = useIsMobile();
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth
      maxWidth="sm"
      aria-labelledby="modal-title"
      slotProps={{ paper: { sx: isMobile ? { m: 1, width: 'calc(100% - 16px)' } : undefined } }}
    >
      <DialogTitle id="modal-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{children}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <MuiButton onClick={onCancel} sx={touch}>
          {cancelLabel}
        </MuiButton>
        <MuiButton variant="contained" onClick={onConfirm} sx={touch}>
          {confirmLabel}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
}

/** MUI's Snackbar shows one message at a time, so the newest toast wins. */
function Toaster({ toasts, onDismiss }: ToasterProps) {
  const latest = toasts.at(-1);
  // Keep the last toast rendered while the Snackbar animates out.
  const [shown, setShown] = useState(latest);
  if (latest && latest !== shown) setShown(latest);
  return (
    <Snackbar
      open={!!latest}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      onClose={(_, reason) => {
        if (reason !== 'clickaway' && latest) onDismiss(latest.id);
      }}
    >
      {shown ? (
        <Alert
          severity={shown.tone}
          variant="filled"
          onClose={() => onDismiss(shown.id)}
          sx={{ width: '100%', alignItems: 'center', '& .MuiAlert-action button': { width: 44, height: 44 } }}
        >
          {shown.title}
        </Alert>
      ) : (
        <span />
      )}
    </Snackbar>
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
