import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

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
