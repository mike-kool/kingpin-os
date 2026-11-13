import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { LibraryId } from '@kingpin/shared';
import { Placeholder } from './Placeholder';
import './placeholder.css';

export function mountPlaceholder(lib: LibraryId) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Placeholder lib={lib} />
    </StrictMode>,
  );
}
