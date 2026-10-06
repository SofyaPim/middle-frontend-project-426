import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <main className="page-shell">
      <h1>404</h1>
      <p className="intro">Страница не найдена.</p>
      <Link to="/">Вернуться на главную</Link>
    </main>
  );
}