# JavaScript Застосунок (Node.js + MongoDB)

## Опис

Цей застосунок реалізує **прості CRUD-ендпоінти** для роботи з колекцією “завдань” (to-do tasks) у базі даних MongoDB.  
Він призначений для демонстрації:
- Підключення Node.js (Express + Mongoose) до MongoDB.
- Використання Docker і Docker Compose для підняття як бекенду, так і бази даних у контейнерах.
- Структурування проєкту з моделями Mongoose, маршрутизацією та середовищними змінними.

## Передумови

1. **Docker & Docker Compose**  
   - Потрібно мати встановлені Docker (Engine) та Docker Compose (версії Docker Compose v2.x або сумісної).  
   - Перевірити можна командами:
     ```bash
     docker --version
     docker compose version
     ```
2. **Node.js (локально, лише для налагодження)**  
   - Для запуску без Docker потрібен Node.js (рекомендується v16.x).  
   - Перевірити:
     ```bash
     node --version
     npm --version
     ```

>Хоча можна запускати застосунок локально (без Docker), рекомендуємо використовувати Docker Compose, щоб автоматично запускати MongoDB у контейнері.

## Структура проєкту

```
lab-03-starter-project-javascript/
├── Dockerfile
├── docker-compose.yml
├── .env
├── package.json
├── package-lock.json
└── src/
    ├── index.js
    └── models/
        └── Task.js
```

- **Dockerfile** – багатостадійна збірка Node.js-застосунку.
- **docker-compose.yml** – конфігурація із двома сервісами:
  - **mongo** (образ `mongo:latest`)
  - **web** (образ, зібраний з Dockerfile)
- **.env** – середовищні змінні (порт, URI до MongoDB).
- **src/index.js** – головний файл, налаштовує Express, підключається до Mongo, задає маршрути.
- **src/models/Task.js** – Mongoose-схема та модель `Task`.

## Налаштування середовища (.env)

У корені проєкту є файл `.env`. Він має приблизно такий вміст:

```ini
PORT=3000
MONGO_URI=mongodb://mongo:27017/todo_db
```

- **PORT** – порт, на якому Express-сервер слухатиме всередині контейнера (за замовчуванням 3000).
- **MONGO_URI** – рядок підключення до MongoDB. У режимі Docker Compose значення `mongo` резолвиться у контейнер з ім’ям `mongo`.

## Як запустити

### 1. З запуском через Docker Compose (рекомендований спосіб)

1. Перейти в кореневу директорію проєкту:
   ```bash
   cd lab-03-starter-project-javascript
   ```
2. Переконатися, що файл `.env` налаштований (як показано вище).
3. Запустити:
   ```bash
   docker compose up -d --build
   ```
   - Опція `-d` — запустити сервіси у фоновому режимі.
   - `--build` — перебудувати образ `web`, навіть якщо він є у кеші.
4. Перевірити статус:
   ```bash
   docker compose ps
   ```
   Має бути два контейнери «Up»:
   - `mongo` (порт 27017)
   - `js-app` (порт 3000)

5. Перевірити, що працює:
   ```bash
   curl http://localhost:3000/api/tasks
   ```
   Має повернути порожній масив:
   ```json
   []
   ```

6. Щоб зупинити та видалити контейнери:
   ```bash
   docker compose down
   ```

### 2. З запуском поетапно (без Docker Compose)

> Використовуйте цей варіант, якщо хочете підняти MongoDB окремо, а потім запускати Node.js локально або в контейнері вручну.

#### 2.1. Запустити MongoDB у контейнері

```bash
docker run -d --name mongo-test -p 27017:27017 mongo:latest
```

- Порт `27017` опубліковано на ваш локальний `localhost:27017`.
- Контейнер має ім’я `mongo-test`.

#### 2.2. Запуск Node.js-застосунку локально (без Docker)

1. Створити файл `.env` (як у розділі “Налаштування середовища”).  
2. Встановити залежності (якщо ще не зроблено):
   ```bash
   npm install
   ```
3. Запустити:
   ```bash
   node src/index.js
   ```
   У консолі ви побачите:
   ```
   MongoDB connected
   Server on 3000
   ```
4. Перевірити:
   ```bash
   curl http://localhost:3000/api/tasks
   ```

#### 2.3. Запуск Node.js у Docker без Docker Compose

1. Зібрати образ:
   ```bash
   docker build -t js-app:alpine-basic .
   ```
2. Запустити контейнер, зв’язавши його з контейнером Mongo:
   ```bash
   docker run --rm -p 3000:3000 \
     --link mongo-test:mongo \
     -e MONGO_URI="mongodb://mongo:27017/todo_db" \
     js-app:alpine-basic
   ```
   - `--link mongo-test:mongo` — у контейнері `js-app` DNS-ім’я `mongo` резолвиться у IP `mongo-test`.
   - `-e MONGO_URI="mongodb://mongo:27017/todo_db"` — перезаписує значення MONGO_URI у середовищі.

3. Перевірити:
   ```bash
   curl http://localhost:3000/api/tasks
   ```

> **Примітка:** якщо у `.env` уже прописано `MONGO_URI=mongodb://mongo:27017/todo_db`, можна опустити `-e MONGO_URI…` при запуску. Достатньо:
> ```bash
> docker run --rm -p 3000:3000 --link mongo-test:mongo js-app:alpine-basic
> ```

## Як користуватися API

Застосунок реалізує такі маршрути:

| HTTP-метод  | Endpoint             | Опис                                             | Тіло запиту (JSON)           | Відповідь (JSON)                  |
|-------------|----------------------|--------------------------------------------------|-----------------------------|------------------------------------|
| GET         | `/api/tasks`         | Отримати всі завдання                            | —                           | Масив об’єктів завдань             |
| POST        | `/api/tasks`         | Створити нове завдання                           | `{ "title": "Назва" }`      | Створений об’єкт завдання          |
| PUT         | `/api/tasks/:id`     | Оновити завдання за ID                            | `{ "completed": true }` | Оновлений об’єкт завдання         |
| DELETE      | `/api/tasks/:id`     | Видалити завдання за ID                           | —                           | `{ "message": "Deleted" }`         |

### Приклади (curl)

1. **GET усіх завдань (порожній масив, якщо ще немає)**  
   ```bash
   curl http://localhost:3000/api/tasks
   ```
   Відповідь:
   ```json
   []
   ```

2. **POST – створення нового завдання**  
   - Linux / macOS / WSL / Git Bash:
     ```bash
     curl -X POST http://localhost:3000/api/tasks \
       -H "Content-Type: application/json" \
       -d '{"title":"Перше завдання"}'
     ```
   - PowerShell (Windows):
     ```powershell
     curl -X POST "http://localhost:3000/api/tasks" `
       -H "Content-Type: application/json" `
       -d "{\"title\":\"Перше завдання\"}"
     ```
   Відповідь (приклад):
   ```json
   {
     "_id": "650a1f7f2ab0450f1a234567",
     "title": "Перше завдання",
     "completed": false,
     "createdAt": "2025-06-04T15:20:15.123Z",
     "updatedAt": "2025-06-04T15:20:15.123Z",
     "__v": 0
   }
   ```

3. **GET після створення**  
   ```bash
   curl http://localhost:3000/api/tasks
   ```
   Відповідь:
   ```json
   [
     {
       "_id": "650a1f7f2ab0450f1a234567",
       "title": "Перше завдання",
       "completed": false,
       "createdAt": "2025-06-04T15:20:15.123Z",
       "updatedAt": "2025-06-04T15:20:15.123Z",
       "__v": 0
     }
   ]
   ```

4. **PUT – оновлення completed**  
   ```bash
   curl -X PUT http://localhost:3000/api/tasks/650a1f7f2ab0450f1a234567 \
     -H "Content-Type: application/json" \
     -d '{"completed":true}'
   ```
   Відповідь:
   ```json
   {
     "_id": "650a1f7f2ab0450f1a234567",
     "title": "Перше завдання",
     "completed": true,
     "createdAt": "2025-06-04T15:20:15.123Z",
     "updatedAt": "2025-06-04T15:25:30.456Z",
     "__v": 0
   }
   ```

5. **DELETE – видалення завдання**  
   ```bash
   curl -X DELETE http://localhost:3000/api/tasks/650a1f7f2ab0450f1a234567
   ```
   Відповідь:
   ```json
   { "message": "Deleted" }
   ```

## Підсумок

Цей застосунок демонструє:
- Як налаштувати простий бекенд на Node.js із MongoDB.
- Як скласти Dockerfile (multi-stage) для зменшення розміру образу.
- Як використати Docker Compose для запуску багатокомпонентного застосунку.
