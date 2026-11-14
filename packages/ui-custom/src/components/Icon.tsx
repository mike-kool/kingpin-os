import type { SVGProps } from 'react';

// 24px stroke icons, drawn for this kit. Each is one SVG path string.
const PATHS = {
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  alert: 'M12 4l9 16H3zM12 10v4.5M12 17.2v.3',
  error: 'M12 3a9 9 0 100 18 9 9 0 000-18zM9 9l6 6M15 9l-6 6',
  info: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v6M12 7.5v.3',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-up': 'M6 15l6-6 6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  'chevron-right': 'M9 6l6 6-6 6',
  sort: 'M8 10l4-4 4 4M8 14l4 4 4-4',
  calendar: 'M5 6h14v14H5zM5 10h14M9 3v5M15 3v5',
  'trend-up': 'M4 16l6-6 4 4 6-7M15 7h5v5',
  'trend-down': 'M4 8l6 6 4-4 6 7M15 17h5v-5',
  sun: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z',
  siren: 'M7 18v-5a5 5 0 0110 0v5M5 18h14v3H5zM12 2v2.5M4.2 5.2l1.8 1.8M19.8 5.2L18 7',
} as const;

export type IconName = keyof typeof PATHS;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Pixel size; defaults to 1em so the icon follows the text. */
  size?: number | string;
  /** When set, the icon is announced with this name; otherwise it is decorative. */
  label?: string;
}

export function Icon({ name, size = '1em', label, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
