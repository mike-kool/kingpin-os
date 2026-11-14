import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { KingpinPage } from '@kingpin/page';
import { Kit, KitProvider } from '@kingpin/ui-mui';
import '@kingpin/page/page.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KitProvider>
      <KingpinPage kit={Kit} />
    </KitProvider>
  </StrictMode>,
);
