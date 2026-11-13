import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { KingpinPage } from '@kingpin/page';
import { Kit } from '@kingpin/ui-shadcn';
import '@kingpin/ui-shadcn/styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KingpinPage kit={Kit} />
  </StrictMode>,
);
