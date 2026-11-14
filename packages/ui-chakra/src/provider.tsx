import type { ReactNode } from 'react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

/** Chakra's default system, untouched, in light mode. */
export function KitProvider({ children }: { children: ReactNode }) {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
}
