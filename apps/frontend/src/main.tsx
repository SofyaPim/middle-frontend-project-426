import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './styles.css';

const bugsinkDsn = import.meta.env.VITE_BUGSINK_DSN;

if (bugsinkDsn) {
  Sentry.init({
    dsn: bugsinkDsn,
    sendDefaultPii: false,
  });
}

function App() {
  return (
    <main className="page-shell">
      <p className="eyebrow">PC COMPONENTS / 2026</p>
      <h1>Соберите компьютер, которым хочется пользоваться.</h1>
      <p className="intro">
        Каталог комплектующих с понятными характеристиками, честными фильтрами
        и заказом в несколько шагов.
      </p>
      <a className="catalog-link" href="/catalog">
        Открыть каталог <span aria-hidden="true">→</span>
      </a>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
