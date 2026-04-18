# Analytical Dashboard

Кондиционер мен су фильтрлеріне арналған сатылым аналитикасы платформасы.

---

## Талаптар

| Бағдарлама | Нұсқа | Сілтеме |
|------------|-------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Docker Desktop | кез келген | [docs.docker.com](https://docs.docker.com/desktop/windows/) |
| npm | 9+ | Node.js-пен бірге келеді |

---

## Жылдам орнату (Windows)1

```powershell
.\setup.ps1
```

Скрипт автоматты түрде:

- Node.js, npm, Docker бар-жоғын тексереді
- `.env` файлын жасайды (кездейсоқ `NEXTAUTH_SECRET` генерациялайды)
- npm тәуелділіктерін орнатады
- PostgreSQL контейнерін іске қосады
- Prisma client генерациялайды
- Дерекқор схемасын қолданады

---

## Қолмен орнату

### 1. Тәуелділіктерді орнату

```bash
npm install
```

### 2. `.env` файлын жасаңыз

Жоба папкасында `.env` файлын жасаңыз:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/analytical_dashboard?schema=public"
NEXTAUTH_SECRET="кездейсоқ-ұзын-жол-мысалы-abc123xyz456"
NEXTAUTH_URL="http://localhost:3000"
```

> **NEXTAUTH_SECRET** үшін кездейсоқ жол генерациялау:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3. PostgreSQL іске қосу (Docker)

```bash
docker-compose up -d
```

### 4. Дерекқорды баптау

```bash
npm run db:generate   # Prisma client генерациялау
npm run db:push       # Schema дерекқорға қолдану
```

### 5. Қосымшаны іске қосу

```bash
npm run dev
```

Браузерде ашыңыз: **[http://localhost:3000](http://localhost:3000)**

---

## Бірінші рет қолдану

1. **[http://localhost:3000](http://localhost:3000)** ашыңыз — тіркелу/кіру беті шығады
2. **Жаңа аккаунт тіркеңіз** (минимум 8 символ пароль)
3. **Dashboard** бетіне өтіңіз
4. **"Загрузить данные"** батырмасын басыңыз — кондиционерлер мен су фильтрлері жүктеледі
5. Аналитика, өнімдер тізімі мен болжамдарды қараңыз

---

## npm Командалары

```bash
npm run dev          # Dev сервер іске қосу
npm run build        # Production build
npm run start        # Production сервер
npm run lint         # ESLint тексеру

npm run db:generate  # Prisma client генерациялау
npm run db:push      # Schema өзгерістерін DB-ға қолдану (dev)
npm run db:migrate   # Migration жасау (production)
npm run db:studio    # Prisma Studio (DB GUI)
```

---

## Технологиялар

| Технология | Мақсаты |
|-----------|---------|
| Next.js 14 (App Router) | Full-stack framework |
| TypeScript | Type safety |
| PostgreSQL + Prisma ORM | Дерекқор |
| NextAuth.js | Аутентификация |
| Recharts | Графиктер |
| Zustand | State management |
| Tailwind CSS | Стильдеу |

---

## API Эндпоинттері

| Эндпоинт | Метод | Сипаттама |
|----------|-------|-----------|
| `/api/analytics` | GET | Толық аналитика деректері |
| `/api/sources` | GET | Деректер көздері статистикасы |
| `/api/products` | GET | Өнімдер тізімі (limit, offset, category, source) |
| `/api/products/[id]` | GET | Бір өнімнің деректері |
| `/api/products/[id]/image` | GET/POST/DELETE | Өнім суреті |
| `/api/forecast/[id]` | GET | Баға болжамы |
| `/api/parse/airconditioners` | POST | Кондиционерлерді жүктеу |
| `/api/parse/waterfilters` | POST | Су фильтрлерін жүктеу |
| `/api/parse/cleanup-dummy` | POST | Ескі деректерді тазалау |
| `/api/auth/register` | POST | Тіркелу |

---

## Жоба құрылымы

```text
analytical-dashboard/
├── app/
│   ├── api/           # API маршруттары
│   ├── dashboard/     # Аналитика дашборды
│   ├── products/      # Өнімдер тізімі мен беті
│   ├── sources/       # Деректер көздері
│   └── login/         # Кіру/тіркелу
├── components/        # UI компоненттері
├── contexts/          # React контексттері (тіл)
├── data/              # Жергілікті каталог деректері
├── lib/
│   ├── forecast/      # Болжам алгоритмдері
│   ├── parsers/       # Деректер парсерлері
│   └── translations/  # Аударма файлдары
├── prisma/
│   └── schema.prisma  # DB схемасы
├── store/             # Zustand store
└── docker-compose.yml # PostgreSQL контейнері
```

---

## Ақаулықтарды жою

**"Database connection failed" қатесі:**

```bash
docker-compose up -d   # Контейнер жұмыс істеп тұр ма?
docker ps              # Тексеру
```

**"Invalid prisma client" қатесі:**

```bash
npm run db:generate
```

**Schema өзгерістерден кейін:**

```bash
npm run db:push
```
