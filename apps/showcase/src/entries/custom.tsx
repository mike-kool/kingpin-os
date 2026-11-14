import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { KingpinPage } from '@kingpin/page';
import { Kit } from '@kingpin/ui-custom';
import '@kingpin/ui-custom/styles.css';
import '@kingpin/page/page.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KingpinPage kit={Kit} />
  </StrictMode>,
);
