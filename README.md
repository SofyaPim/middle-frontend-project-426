# Интернет-магазин комплектующих для ПК

[![hexlet-check](https://github.com/SofyaPim/middle-frontend-project-426/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/SofyaPim/middle-frontend-project-426/actions)

[Открыть приложение](https://middle-frontend-project-426-4rp8.onrender.com)

Разработайте интернет-магазин комплектующих для ПК целиком на TypeScript.
Фронтенд пишете на любом TS-фреймворке (React, Vue, Svelte, Angular, Solid и др.).
Готового API здесь нет, поэтому сервер под свой интерфейс вы поднимаете сами,
а фреймворк для него и работу с базой выбираете на свой вкус. Спроектируйте API
через TypeSpec → OpenAPI, реализуйте регистрацию и авторизацию, главную
с промо-блоками, каталог с фильтрами и пагинацией, корзину, оформление заказа
и личный кабинет с историей заказов. Приложение деплоится в прод с третьего шага
и развивается под собственными браузерными тестами.

Учебный проект Хекслета: https://ru.hexlet.io/programs/middle-frontend
Как это должно работать: https://files.hexlet.app/a/qf7bsq

## Стек

- TypeScript
- React + Vite
- Fastify
- PostgreSQL + Prisma
- Bugsink (Sentry-compatible SDK)
- Docker + Render
- Playwright

## TypeScript

TypeScript настраивается по границам системы:

- Prisma schema и сгенерированный Prisma Client типизируют границу базы данных;
- типы тел запросов и ответов API будут добавлены вместе с API-контрактом на
	следующем шаге, чтобы frontend и backend использовали одну спецификацию;
- frontend и backend имеют отдельные `tsconfig.json`, потому что собираются
	разными инструментами и для разных сред;
- `npm run typecheck` проверяет frontend, backend и Prisma seed.

Внутренние типы компонентов и модулей добавляются постепенно по мере появления
бизнес-логики и не дублируют схему базы или будущий API-контракт.

## Установка

```bash
git clone https://github.com/SofyaPim/middle-frontend-project-426.git
cd middle-frontend-project-426
npm install
```

Создайте локальный файл окружения на основе `.env.example`:

```bash
cp .env.example .env
```

## Использование

Корневые команды работают сразу для обеих частей проекта:

```bash
npm run build       # собирает frontend и backend без подключения к базе
npm run typecheck   # проверяет TypeScript frontend, backend, Prisma seed и e2e-тесты
npm run db:up       # запускает PostgreSQL в Docker Compose
npm run db:down     # останавливает PostgreSQL
npm run dev         # запускает backend в режиме разработки
npm run test:e2e     # запускает браузерные тесты Playwright
npm run test:e2e:ui  # интерактивный UI Playwright
```

### Браузерные тесты

Тесты находятся в `tests/e2e` и используют Playwright.
- конфиг в `playwright.config.ts` (+ `tsconfig.e2e.json` входит в npm run typecheck);
- артефакты при падении (скриншот, видео, trace) сохраняются в `test-results/`;
- в CI retries: 2, reporter github.

По умолчанию они проверяют локальное приложение на `http://127.0.0.1:3000`, поэтому сначала
поднимите Compose:

```bash
npx playwright install chromium
docker compose up --build -d
npm run test:e2e
```

Для проверки уже развернутого Render-приложения передайте публичный URL:

```bash
PLAYWRIGHT_BASE_URL=https://your-service.onrender.com npm run test:e2e
```

В Windows PowerShell:

```powershell
$env:PLAYWRIGHT_BASE_URL = "https://your-service.onrender.com"
npm run test:e2e
```

Smoke-тесты проверяют главную React-страницу, переход на `/catalog` через SPA
fallback и непустой каталог из `/api/products`. В CI перед тестами нужно
установить Chromium командой `npx playwright install --with-deps chromium`.

Для полного локального запуска предусмотрен Compose: он передаёт приложению
`DATABASE_URL` из `.env`, где hostname `postgres` — имя PostgreSQL-сервиса
внутри compose-сети. Миграции и seed применяются startup-скриптом приложения:

```bash
docker compose up --build
```

В CI и production используется тот же ключ `DATABASE_URL`, но его значение
передаёт окружение: локально это сервис Compose, на Render — managed PostgreSQL.
Приложение не содержит отдельной ветки для локальной базы.

После запуска backend health-check доступен по адресу `/health` и не требует
подключения к базе данных:

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

Эндпоинт возвращает HTTP `200` и используется Render как health check.

Frontend собирается в `apps/frontend/dist`, backend — в `apps/backend/dist`.
В production они работают внутри одного Node-процесса: Fastify слушает
`0.0.0.0:$PORT`, раздаёт frontend и обрабатывает API по `/api/*`.

### Docker

Локальная база и собранное приложение запускаются двумя сервисами. PostgreSQL
доступен приложению по имени `postgres` внутри compose-сети, поэтому контейнеру
не нужен `localhost` в `DATABASE_URL`:

```bash
docker compose up --build
docker compose ps
docker compose down
```

После запуска приложение доступно на `http://localhost:3000`, health-check — на
`http://localhost:3000/health`, а каталог — на `/api/products`. Startup-скрипт
сначала применяет миграции и seed к локальному PostgreSQL, затем поднимает сервер.

Логи базы доступны по команде:

```bash
docker compose logs -f postgres
```

Данные сохраняются в volume `postgres_data` между перезапусками. База удаляется вместе с volume командой `docker compose down -v`.

Образ собирается из корня репозитория в два этапа.

На этапе `build` Docker устанавливает зависимости, копирует исходники и
выполняет корневую команду `npm run build`. Она компилирует TypeScript backend
и собирает frontend-бандл Vite в `apps/frontend/dist`. Prisma Client также
генерируется на этом этапе. Подключение к PostgreSQL не выполняется, поэтому
база данных во время сборки образа не нужна.

На этапе `runtime` в production-образ попадают только production-зависимости,
собранные `dist` backend/frontend, скомпилированный `dist-seed/seed.js`, Prisma
schema и миграции. TypeScript, Vite, `tsx` и типы в финальный слой не попадают.
Prisma CLI остаётся в runtime только потому, что нужен для применения миграций
при запуске. Контейнер запускает скрипт `scripts/start.sh`, который строго
последовательно:

1. применяет неприменённые миграции через `prisma migrate deploy`;
2. запускает идемпотентный seed каталога: товары обновляются через `upsert` по
	уникальному `slug`, поэтому повторный запуск не создаёт дубли;
3. поднимает Fastify-сервер.

Если миграции или seed завершаются ошибкой, сервер не запускается. Таким образом,
сборка образа не зависит от базы, а база нужна только при старте контейнера.

Собрать и запустить образ можно так:

```bash
docker build -t pc-components-shop .
docker run --rm -p 3000:3000 \
	-e PORT=3000 \
	-e DATABASE_URL="$DATABASE_URL" \
	pc-components-shop
```

Внешние `PORT` и `DATABASE_URL` передаются только при запуске контейнера.

### Bugsink

Ошибки отправляются в Bugsink через Sentry-совместимые SDK в двух точках:

- frontend использует `VITE_BUGSINK_DSN`;
- backend использует `BUGSINK_DSN`.

DSN создаётся в Bugsink для соответствующих проектов. Значения не хранятся в
исходниках: локально их добавляют в `.env`, а в Render — в Environment Variables.
Для frontend `VITE_BUGSINK_DSN` передаётся как Docker build argument, потому что
Vite встраивает публичные frontend-переменные в собранный bundle. Backend DSN
остаётся runtime-переменной контейнера.

Если DSN не задан, приложение продолжает работать, но события в Bugsink не
отправляются. Не добавляйте реальные DSN в `.env.example` или Git.

### Render

Проект рассчитан на один Render Docker Web Service и Render PostgreSQL.
Файл `render.yaml` содержит Blueprint для этих ресурсов. Внешняя среда передаёт
приложению только:

- `PORT` — порт, который назначает Render;
- `DATABASE_URL` — строку подключения к Render PostgreSQL.

После подключения Blueprint Render собирает `Dockerfile` из корня и запускает
один процесс приложения. Frontend обращается к API относительно текущего origin:
`/api`, поэтому отдельный URL API и production CORS не нужны.

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
