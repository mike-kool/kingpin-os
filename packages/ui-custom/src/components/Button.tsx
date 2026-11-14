import type { ButtonHTMLAttributes } from 'react';
import { cx } from './util';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. Defaults to "primary". */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Square, for a single icon. Give it an aria-label. */
  icon?: boolean;
  /** Stretch to the container's width. */
  block?: boolean;
}

export function Button({ variant = 'primary', icon, block, type = 'button', className, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('k-btn', `k-btn-${variant}`, icon && 'k-btn-icon', block && 'k-btn-block', className)}
      {...rest}
    />
  );
}
