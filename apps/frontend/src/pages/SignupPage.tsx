import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiSignup } from '../api';
import { useAuth } from '../auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return 'Что-то пошло не так. Попробуйте позже.';
}

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!EMAIL_RE.test(email)) {
      setError('Введите корректный email');
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен быть не короче 8 символов');
      return;
    }

    setSubmitting(true);
    try {
      const user = await apiSignup({ email, password });
      setUser(user);
      navigate('/account');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell">
      <p className="eyebrow">SIGN UP / 2026</p>
      <h1>Регистрация</h1>
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        data-testid="signup-form"
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
          <span>Пароль (не короче 8 символов)</span>
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
          {submitting ? 'Отправка…' : 'Зарегистрироваться'}
        </button>
        <p className="auth-form__hint">
          Уже есть аккаунт? <Link to="/signin">Войти</Link>
        </p>
      </form>
    </main>
  );
}