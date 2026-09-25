import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import './styles.css';
import { AuthProvider } from './auth';
import { Header } from './components/Header';
import { AccountPage } from './pages/AccountPage';
import { CatalogPage } from './pages/CatalogPage';
import { SigninPage } from './pages/SigninPage';
import { SignupPage } from './pages/SignupPage';
import {ProtectedRoute} from './auth';

const bugsinkDsn = import.meta.env.VITE_BUGSINK_DSN;

if (bugsinkDsn) {
  Sentry.init({ dsn: bugsinkDsn, sendDefaultPii: false });
}

function Landing() {
  return (
    <main className="page-shell">
      <p className="eyebrow">PC COMPONENTS / 2026</p>
      <h1>Соберите компьютер, которым хочется пользоваться.</h1>
      <p className="intro">
        Каталог комплектующих с понятными характеристиками, честными фильтрами
        и заказом в несколько шагов.
      </p>
      <Link className="catalog-link" to="/catalog">
        Открыть каталог <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}

function NotFound() {
  return (
    <main className="page-shell">
      <h1>404</h1>
      <p className="intro">Страница не найдена.</p>
      <Link to="/">Вернуться на главную</Link>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SigninPage />} />
           <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);