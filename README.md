# StroiMaterial / BuildPro

Маркетплейс стройматериалов.

## Структура

```
frontend/   — Angular 22 (витрина + админка)
backend/    — NestJS + PostgreSQL + Prisma
docker-compose.yml — PostgreSQL для разработки
```

## Запуск (разработка)

```bash
# 1. База данных
docker compose up -d

# 2. API
cd backend
npm install
npm run prisma:migrate
npm run db:seed
npm run start:dev

# 3. Фронт (другой терминал)
cd frontend
npm start
```

- Фронт: http://localhost:4200
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

Админ API: `admin@buildpro.local` / `admin123`
