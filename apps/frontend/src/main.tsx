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
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage'; 

const bugsinkDsn = import.meta.env.VITE_BUGSINK_DSN;

if (bugsinkDsn) {
  Sentry.init({ dsn: bugsinkDsn, sendDefaultPii: false });
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
          <Route path="/" element={<HomePage />} />
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
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);