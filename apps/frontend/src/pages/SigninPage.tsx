import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiSignin } from '../api';
import { useAuth } from '../auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return 'Что-то пошло не так. Попробуйте позже.';
}

export function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? '/';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!EMAIL_RE.test(email) || password.length === 0) {
      setError('Введите email и пароль');
      return;
    }

    setSubmitting(true);
    try {
      const user = await apiSignin({ email, password });
      setUser(user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell">
      <p className="eyebrow">SIGN IN / 2026</p>
      <h1>Вход</h1>
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        data-testid="signin-form"
      >
        <label className="auth-form__row">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="auth-email"
          />
        </label>
        <label className="auth-form__row">
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="auth-password"
          />
        </label>
        {error ? (
          <p className="form-error" data-testid="auth-error">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={submitting} data-testid="auth-submit">
          {submitting ? 'Отправка…' : 'Войти'}
        </button>
        <p className="auth-form__hint">
          Нет аккаунта? <Link to="/signup">Зарегистрироваться</Link>
        </p>
      </form>
    </main>
  );
}