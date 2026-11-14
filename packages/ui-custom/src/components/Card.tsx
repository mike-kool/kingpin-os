import type { HTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';
import type { Tone } from './Badge';
import { cx } from './util';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('k-card', className)} {...rest} />;
}

export interface GaugeProps {
  /** 0 to 100. */
  value: number;
  /** Accessible name, e.g. "Heat level". */
  label: string;
  tone?: Tone | 'accent';
  /** Shown inside the arc; defaults to the percentage. */
  children?: ReactNode;
}

const ARC = Math.PI * 40; // length of the half circle, radius 40

/** A half-circle meter drawn in SVG. */
export function Gauge({ value, label, tone = 'accent', children }: GaugeProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className="k-gauge"
      data-tone={tone}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-valuetext={`${clamped}%`}
    >
      <svg viewBox="0 0 100 56" aria-hidden="true">
        <path className="k-gauge-track" d="M10 50a40 40 0 0180 0" />
        <path
          className="k-gauge-fill"
          d="M10 50a40 40 0 0180 0"
          strokeDasharray={ARC}
          strokeDashoffset={ARC * (1 - clamped / 100)}
        />
      </svg>
      <div className="k-gauge-value">{children ?? `${clamped}%`}</div>
    </div>
  );
}

export interface StatProps {
  label: string;
  value: ReactNode;
  /** Percent change; positive is up. */
  trend?: number;
  /** Text after the trend number. */
  trendLabel?: string;
  /** Shown in the top right corner, e.g. an alert icon. */
  aside?: ReactNode;
  /** Replaces the plain value, e.g. with a Gauge. */
  children?: ReactNode;
}

/** A labelled number, with an optional trend line. */
export function Stat({ label, value, trend, trendLabel = 'vs last week', aside, children }: StatProps) {
  return (
    <Card className="k-stat">
      <div className="k-stat-head">
        <span className="k-stat-label">{label}</span>
        {aside}
      </div>
      {children ?? <div className="k-stat-value">{value}</div>}
      {trend !== undefined && (
        <div className="k-stat-trend" data-direction={trend >= 0 ? 'up' : 'down'}>
          <Icon name={trend >= 0 ? 'trend-up' : 'trend-down'} />
          {trend >= 0 ? '+' : ''}
          {trend}% {trendLabel}
        </div>
      )}
    </Card>
  );
}
