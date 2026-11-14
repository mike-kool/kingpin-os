// @vitest-environment jsdom
// Renders the page with a bare HTML kit to check the wiring every library
// inherits: stats, sorting, form, modal and toasts.
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { KitComponents } from '@kingpin/shared';
import { KingpinPage } from '../src';

const kit: KitComponents = {
  AppShell: ({ title, children }) => <div><h1>{title}</h1>{children}</div>,
  StatCard: ({ label, value }) => <div data-testid="stat">{label}: {value}</div>,
  DataTable: ({ caption, columns, rows, getRowId, onSortChange }) => (
    <table aria-label={caption}>
      <thead><tr>{columns.map((c) => <th key={c.key}><button onClick={() => onSortChange(c.key)}>{c.header}</button></th>)}</tr></thead>
      <tbody>{rows.map((r) => <tr key={getRowId(r)}>{columns.map((c) => <td key={c.key}>{c.render(r)}</td>)}</tr>)}</tbody>
    </table>
  ),
  Tabs: ({ tabs, activeId, onChange }) => (
    <div>
      {tabs.map((t) => <button key={t.id} role="tab" aria-selected={t.id === activeId} onClick={() => onChange(t.id)}>{t.label}</button>)}
      {tabs.find((t) => t.id === activeId)?.content}
    </div>
  ),
  Badge: ({ children }) => <span>{children}</span>,
  TextField: ({ id, label, value, error, onChange }) => (
    <label htmlFor={id}>{label}<input id={id} value={value} onChange={(e) => onChange(e.target.value)} />{error}</label>
  ),
  Select: ({ id, label, value, options, error, onChange }) => (
    <label htmlFor={id}>{label}
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" />{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>{error}
    </label>
  ),
  DatePicker: ({ id, label, value, onChange }) => (
    <label htmlFor={id}>{label}<input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} /></label>
  ),
  Textarea: ({ id, label, value, error, onChange }) => (
    <label htmlFor={id}>{label}<textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} />{error}</label>
  ),
  Button: ({ type = 'button', onClick, children }) => <button type={type} onClick={onClick}>{children}</button>,
  Modal: ({ open, title, confirmLabel, cancelLabel, onConfirm, onCancel, children }) =>
    open ? (
      <div role="dialog" aria-label={title}>{children}<button onClick={onCancel}>{cancelLabel}</button><button onClick={onConfirm}>{confirmLabel}</button></div>
    ) : null,
  Toaster: ({ toasts }) => <ul aria-label="toasts">{toasts.map((t) => <li key={t.id}>{t.tone}: {t.title}</li>)}</ul>,
};

afterEach(cleanup);

describe('KingpinPage', () => {
  it('renders stats from the seed', () => {
    render(<KingpinPage kit={kit} />);
    const stats = screen.getAllByTestId('stat').map((s) => s.textContent);
    expect(stats).toEqual([
      'Weekly Revenue: KB$88,700',
      'Active Corners: 24',
      'Crew Headcount: 36',
      'Heat Level: 82%',
    ]);
  });

  it('sorts the crew table by loyalty', () => {
    render(<KingpinPage kit={kit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Loyalty' }));
    const first = within(screen.getByRole('table', { name: 'Crew' })).getAllByRole('row')[1];
    expect(first?.textContent).toContain('Flip-Flop Phil');
  });

  it('recruits a lieutenant and shows the success toast', () => {
    render(<KingpinPage kit={kit} />);
    fireEvent.change(screen.getByLabelText('Codename'), { target: { value: 'Waffles Wallace' } });
    fireEvent.change(screen.getByLabelText('Territory'), { target: { value: 't-waffle' } });
    fireEvent.change(screen.getByLabelText('Product line'), { target: { value: 'p-croissant' } });
    fireEvent.change(screen.getByLabelText('Alibi'), { target: { value: 'At the knitting circle all night.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Recruit' }));
    expect(screen.getByText('success: Lieutenant recruited')).toBeTruthy();
    expect(screen.getByText('Crew Headcount: 37')).toBeTruthy();
    expect(screen.getAllByRole('row')[1]?.textContent).toContain('Waffles Wallace');
  });

  it('confirming expansion raises heat and shows the error toast', () => {
    render(<KingpinPage kit={kit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Expand territory' }));
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Expand' }));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('Heat Level: 88%')).toBeTruthy();
    expect(screen.getByText('error: Heat level rising')).toBeTruthy();
  });
});
