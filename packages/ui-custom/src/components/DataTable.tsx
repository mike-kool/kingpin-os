import type { ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Select } from './Field';
import { Icon } from './Icon';
import { PHONE_QUERY, cx, useMediaQuery } from './util';

export interface Column<Row> {
  key: string;
  header: string;
  sortable?: boolean;
  /** Right-aligned, with digits of equal width. */
  numeric?: boolean;
  render: (row: Row) => ReactNode;
}

export interface Sort {
  key: string;
  direction: 'asc' | 'desc';
}

export interface DataTableProps<Row> {
  /** Accessible name of the table, and of the card list on phones. */
  caption: string;
  columns: Column<Row>[];
  rows: Row[];
  getRowId: (row: Row) => string;
  sort: Sort | null;
  /** Asked to sort by this column; the owner flips the direction and sorts. */
  onSortChange: (key: string) => void;
  /** Shown when there are no rows. */
  empty?: ReactNode;
}

/**
 * A sortable table. Sorting is controlled, so it works with server data too.
 * On a phone each row becomes a card: the first column is its title and the
 * rest are label and value pairs.
 */
export function DataTable<Row>(props: DataTableProps<Row>) {
  const phone = useMediaQuery(PHONE_QUERY);
  if (props.rows.length === 0) return <Card className="k-empty">{props.empty ?? 'Nothing here yet.'}</Card>;
  return phone ? <CardList {...props} /> : <Table {...props} />;
}

function Table<Row>({ caption, columns, rows, getRowId, sort, onSortChange }: DataTableProps<Row>) {
  return (
    <Card className="k-table-wrap">
      <table aria-label={caption} className="k-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const dir = sort?.key === col.key ? sort.direction : null;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={cx(col.numeric && 'k-num')}
                  aria-sort={dir ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {col.sortable ? (
                    <button type="button" className="k-sort" data-active={dir ? true : undefined} onClick={() => onSortChange(col.key)}>
                      {col.header}
                      <Icon name={dir === 'asc' ? 'chevron-up' : dir === 'desc' ? 'chevron-down' : 'sort'} />
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
            <tr key={getRowId(row)}>
              {columns.map((col) => (
                <td key={col.key} className={cx(col.numeric && 'k-num')}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function CardList<Row>({ caption, columns, rows, getRowId, sort, onSortChange }: DataTableProps<Row>) {
  const [title, ...rest] = columns;
  const sortable = columns.filter((c) => c.sortable);
  return (
    <div className="k-cards">
      {sortable.length > 0 && (
        <div className="k-cards-sort">
          <Select
            aria-label={`Sort ${caption}`}
            placeholder="Sort by…"
            value={sort?.key ?? ''}
            options={sortable.map((c) => ({ value: c.key, label: c.header }))}
            onChange={onSortChange}
          />
          <Button
            variant="secondary"
            icon
            aria-label={sort?.direction === 'desc' ? 'Descending. Reverse the order' : 'Ascending. Reverse the order'}
            disabled={!sort}
            onClick={() => sort && onSortChange(sort.key)}
          >
            <Icon name={sort?.direction === 'desc' ? 'chevron-down' : 'chevron-up'} />
          </Button>
        </div>
      )}
      <ul aria-label={caption} className="k-cards-list">
        {rows.map((row) => (
          <li key={getRowId(row)} className="k-card k-row-card">
            {title && <div className="k-row-title">{title.render(row)}</div>}
            <dl>
              {rest.map((col) => (
                <div key={col.key}>
                  <dt>{col.header}</dt>
                  <dd>{col.render(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
