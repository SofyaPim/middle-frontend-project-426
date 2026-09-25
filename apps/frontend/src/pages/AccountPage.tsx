import { useAuth } from '../auth';

export function AccountPage() {
  const { user } = useAuth();

  return (
    <main className="page-shell">
      <p className="eyebrow">ACCOUNT / 2026</p>
      <h1>Личный кабинет</h1>
      {user ? (
        <p className="intro" data-testid="account-email">
          Вы вошли как {user.email}.
        </p>
      ) : null}
    </main>
  );
}