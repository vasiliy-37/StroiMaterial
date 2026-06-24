# BuildPro API (NestJS + PostgreSQL)

Backend для маркетплейса StroiMaterial / BuildPro.

## Стек

- NestJS 11
- Prisma + PostgreSQL 16
- JWT auth
- Swagger: `/api/docs`

## Быстрый старт

### 1. PostgreSQL (Docker)

Из корня проекта:

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run db:seed
npm run start:dev
```

API: http://localhost:3000/api  
Swagger: http://localhost:3000/api/docs

### Админ по умолчанию (после seed)

- Email: `admin@buildpro.local`
- Password: `admin123`

## Основные эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/health` | Health check |
| GET | `/api/catalog` | Полный каталог (как на фронте) |
| GET | `/api/products` | Товары (+ `?category`, `?brand`, `?search`) |
| GET | `/api/services` | Услуги |
| GET | `/api/promotions` | Акции |
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход → JWT |
| GET | `/api/cart` | Корзина (auth) |
| POST | `/api/orders` | Оформить заказ из корзины (auth) |
| CRUD | `/api/admin/*` | Админка (role: ADMIN) |

## Переменные окружения

См. `.env.example`.

## Скрипты

```bash
npm run start:dev      # dev-сервер
npm run build          # сборка
npm run prisma:migrate # миграции
npm run db:seed        # начальные данные
npm run prisma:studio  # GUI для БД
```
