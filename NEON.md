# Neon + Drizzle (этап 5)

## 1. Создать проект Neon (T100)

1. Зарегистрируйтесь на [https://console.neon.tech](https://console.neon.tech)
2. Create project → имя например `techno-market`
3. Region: ближайший (или Free tier default)
4. Скопируйте **Connection string** (URI), формат:
   `postgresql://USER:PASSWORD@HOST/neondb?sslmode=require`

## 2. Локальные переменные

```bash
cd web
cp .env.example .env.local
```

В `.env.local` раскомментируйте и вставьте:

```env
DATABASE_URL=postgresql://...ваш_uri...
```

Файл `.env.local` не коммитить.

## 3. Миграции и сид

```bash
cd web
npm run db:generate   # SQL в папку drizzle/
npm run db:migrate    # применить миграции
# или быстрее на пустой БД:
npm run db:push

npm run db:seed       # категории + товары из моков
```

Просмотр таблиц:

```bash
npm run db:studio
```

## 4. Безопасное обновление каталога (T106)

Пока сайт на витрине ещё читает моки/localStorage (этап 6 подключит БД к UI).

Чтобы обновить ассортимент в Neon после правок моков:

1. Правите `src/data/mocks/products.ts` / `categories.ts`
2. `npm run db:seed` — upsert по `slug` (идемпотентно)

Админ-панель `/admin` на этапе 5 пишет в localStorage браузера; запись в Neon — на этапе 6.

## 5. Проверка без UI

После seed в Neon Console → SQL Editor:

```sql
select count(*) from categories;
select count(*) from products;
select name, price_uzs, stock_quantity from products order by popularity desc limit 5;
```
