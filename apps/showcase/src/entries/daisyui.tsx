import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { KingpinPage } from '@kingpin/page';
import { Kit } from '@kingpin/ui-daisyui';
import '@kingpin/ui-daisyui/styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KingpinPage kit={Kit} />
  </StrictMode>,
);
