import type { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './touch.css';

/** Mantine's default theme, untouched, plus its date and notification hosts. */
export function KitProvider({ children }: { children: ReactNode }) {
  return (
    <MantineProvider>
      <DatesProvider settings={{}}>
        <Notifications position="bottom-right" />
        {children}
      </DatesProvider>
    </MantineProvider>
  );
}
