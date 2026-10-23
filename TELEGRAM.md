# Telegram Mini App — Techno Market

Клиент: маршрут **`/tg`** (те же API, токены и каталог Neon, что у сайта).

## 1. BotFather (T130)

1. [@BotFather](https://t.me/BotFather) → `/newbot` → имя и username.
2. Скопируйте токен бота → `TELEGRAM_BOT_TOKEN` в `web/.env.local`.
3. `/newapp` → выберите бота → название Mini App → картинка (опционально).
4. **Web App URL** (нужен HTTPS):
   - прод: `https://ваш-домен/tg`
   - локально: туннель, например `npx cloudflared tunnel --url http://localhost:3000` → URL вида `https://….trycloudflare.com/tg`
5. В BotFather укажите этот URL как Web App.
6. Меню бота: `/setmenubutton` → Web App → тот же URL.

Deep link (T137):

- товар: `https://t.me/<bot>?startapp=product_<slug>` или `p_<slug>`
- категория: `https://t.me/<bot>?startapp=category_<slug>` или `c_<slug>`

Пример: `startapp=product_asus-vivobook-15-i5`

## 2. Env

```env
TELEGRAM_BOT_TOKEN=
AUTH_SECRET=          # уже нужен для JWT Mini App
NEXT_PUBLIC_APP_URL=https://ваш-https-хост
```

Без `TELEGRAM_BOT_TOKEN` страница `/tg` открывается как превью в браузере, серверный вход по `initData` недоступен.

## 3. Проверка (T136)

1. `npm run dev` + HTTPS-туннель на `/tg`.
2. Откройте Mini App в мобильном и Desktop Telegram.
3. Каталог, товар, избранное, сравнение, корзина, checkout.
4. MainButton на товаре/корзине/checkout, BackButton на внутренних экранах.
5. Deep link `startapp=…` открывает нужный экран после auth.

## 4. Auth

`POST /api/telegram/auth` проверяет HMAC `initData`, создаёт/находит пользователя (`accounts.provider = telegram`), выдаёт Bearer-токен. Им пользуются `/api/cart`, `/api/favorites`, `/api/orders`.
