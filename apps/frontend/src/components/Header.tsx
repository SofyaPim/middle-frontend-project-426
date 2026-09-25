import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export function Header() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="site-header" data-testid="header">
      <Link to="/" className="site-header__logo">
        PC Store
      </Link>
      <nav className="site-header__nav">
        <Link to="/catalog">Каталог</Link>
        {loading ? null : user ? (
          <>
            <Link to="/account" data-testid="nav-account">
              {user.email}
            </Link>
            <button
              type="button"
              className="site-header__logout"
              onClick={handleLogout}
              data-testid="nav-signout"
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/signin" data-testid="nav-signin">
              Войти
            </Link>
            <Link to="/signup" data-testid="nav-signup">
              Регистрация
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}