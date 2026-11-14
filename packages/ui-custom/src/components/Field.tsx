import {
  createContext,
  useContext,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { Icon } from './Icon';
import { cx } from './util';

interface FieldContext {
  id: string;
  labelId: string;
  errorId?: string;
  hintId?: string;
  required?: boolean;
}

const Context = createContext<FieldContext | null>(null);

/**
 * The props a control needs to be tied to the Field around it: its id, the
 * error and hint it is described by, and its invalid and required state.
 * Outside a Field it returns nothing, so controls also work on their own.
 */
export function useFieldControl() {
  const field = useContext(Context);
  if (!field) return { labelId: undefined, props: {} };
  return {
    labelId: field.labelId,
    props: {
      id: field.id,
      required: field.required,
      'aria-invalid': field.errorId ? true : undefined,
      'aria-describedby': cx(field.errorId, field.hintId) || undefined,
    },
  };
}

export interface FieldProps {
  label: ReactNode;
  /** Id for the control; generated when left out. */
  id?: string;
  required?: boolean;
  /** Shown under the control and announced with it. */
  error?: ReactNode;
  hint?: ReactNode;
  className?: string;
  /** One control: Input, Textarea, Select or DatePicker. */
  children: ReactNode;
}

/** A label, a control, and its hint or error, wired up for screen readers. */
export function Field({ label, id, required, error, hint, className, children }: FieldProps) {
  const auto = useId();
  const controlId = id ?? auto;
  const field: FieldContext = {
    id: controlId,
    labelId: `${controlId}-label`,
    errorId: error ? `${controlId}-error` : undefined,
    hintId: hint ? `${controlId}-hint` : undefined,
    required,
  };
  return (
    <div className={cx('k-field', className)}>
      <label id={field.labelId} htmlFor={controlId} className="k-label">
        {label}
        {required && (
          <span className="k-required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <Context value={field}>{children}</Context>
      {hint && !error && (
        <p id={field.hintId} className="k-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={field.errorId} className="k-error">
          <Icon name="alert" />
          {error}
        </p>
      )}
    </div>
  );
}

type ValueProps<T> = Omit<T, 'value' | 'onChange'> & {
  value: string;
  /** Called with the new value, not the event. */
  onChange: (value: string) => void;
};

export type InputProps = ValueProps<InputHTMLAttributes<HTMLInputElement>>;

export function Input({ className, onChange, type = 'text', ...rest }: InputProps) {
  const field = useFieldControl();
  return (
    <input
      type={type}
      className={cx('k-input', className)}
      {...field.props}
      {...rest}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  );
}

export type TextareaProps = ValueProps<TextareaHTMLAttributes<HTMLTextAreaElement>>;

export function Textarea({ className, onChange, rows = 3, ...rest }: TextareaProps) {
  const field = useFieldControl();
  return (
    <textarea
      rows={rows}
      className={cx('k-input k-textarea', className)}
      {...field.props}
      {...rest}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends ValueProps<SelectHTMLAttributes<HTMLSelectElement>> {
  options: SelectOption[];
  /** Shown while nothing is picked; it can't be chosen. */
  placeholder?: string;
}

/**
 * The platform's own select, restyled. It keeps the native picker, which is
 * the best one on a phone and works with every keyboard and screen reader.
 */
export function Select({ className, onChange, options, placeholder, ...rest }: SelectProps) {
  const field = useFieldControl();
  return (
    <span className="k-select">
      <select
        className={cx('k-input', className)}
        {...field.props}
        {...rest}
        data-empty={rest.value === '' || undefined}
        onChange={(e) => onChange(e.currentTarget.value)}
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevron-down" />
    </span>
  );
}
