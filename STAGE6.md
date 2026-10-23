# Этап 6 — запуск с Neon, auth и тестовой оплатой

## Переменные (`web/.env.local`)

- `DATABASE_URL` — Neon
- `AUTH_SECRET` — `openssl rand -base64 32`
- `ADMIN_PASSWORD` — пароль `/admin` и заголовок `x-admin-password`
- `YOOMONEY_TEST=1` — симуляция оплаты без списания
- Google (опционально): `NEXT_PUBLIC_GOOGLE_AUTH=1`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## Команды

```bash
cd web
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Сид создаёт каталог и пользователя `demo@technomarket.uz` / `demo123`.

## Сценарий проверки

1. Каталог и карточка товара открываются с данными из Neon.
2. Админка `/admin` (пароль `admin123`) меняет цену — после «Обновить из БД» / перезагрузки витрины цена та же.
3. Вход демо-аккаунтом; регистрация нового email.
4. Гость кладёт товар в корзину → вход → корзина/избранное мержатся.
5. Checkout → заказ `pending_payment` → редирект на simulate → `paid`.
6. Чужой заказ по UUID без сессии владельца → 403/404.

## Важно

- URL `?status=success` сам по себе оплату не подтверждает — статус меняет только simulate/webhook.
- Данные банковских карт не принимаем и не храним.
- Ошибки API пишутся в `console.error` сервера Next.js.
