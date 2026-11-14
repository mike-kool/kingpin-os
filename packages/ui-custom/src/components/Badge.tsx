import type { HTMLAttributes } from 'react';
import { cx } from './util';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/** A small status pill with a colored dot. */
export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx('k-badge', className)} data-tone={tone} {...rest}>
      {children}
    </span>
  );
}
