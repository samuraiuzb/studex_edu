# 🧮 Studex — Raqamli Ta'lim Platformasi

O'zbekiston maktablari uchun **zamonaviy raqamli ta'lim + elektron materiallar + AI chatbot** platformasi.

## ✨ Yangi Xususiyatlar (v2.0)

- ✅ **Matching Pairs** - Juftlashtirish turi savollari
- ✅ **File Upload** - Rasmlar va fayllarni yuklab olish
- ✅ **Enhanced Questions** - Turli savol tiplari

[📖 Yangi Xususiyatlar Guide](./MATCHING_PAIRS_GUIDE.md) | [API Docs](./API_DOCUMENTATION.md) | [Quick Start](./QUICK_START.md)

## 🛠 Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Backend   | Django 5 · DRF · JWT · SQLite         |
| Frontend  | React 18 · Vite · Tailwind CSS        |
| Charts    | Recharts                              |
| Auth      | JWT (access 8h / refresh 7d)          |
| AI        | OpenAI GPT-3.5-turbo (optional)       |
| Export    | openpyxl (Excel .xlsx)                |
| Media     | File Upload (Images, PDF, Docs)       |

---

## 🚀 Tezkor ishga tushirish

### Backend
```bash
# 1. run_backend.bat faylini ikki marta bosing
# YOKI qo'lda:
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
Server: **http://localhost:8000**
Admin panel: **http://localhost:8000/admin** (admin / admin123)

### Frontend
```bash
# 1. run_frontend.bat faylini ikki marta bosing
# YOKI qo'lda:
cd frontend
npm install
npm run dev
```
App: **http://localhost:5173**

---

## 👥 Rollar

| Rol      | Imkoniyatlar                                                  |
|----------|---------------------------------------------------------------|
| teacher  | Test yaratish, savollar, materiallar yuklash, statistika      |
| student  | Materiallar ko'rish, test topshirish, natijalar, chatbot      |

### Default admin hisobi
- Username: `admin` | Password: `admin123`

---

## 📦 Loyiha tuzilmasi

```
Studex/
├── backend/
│   ├── config/          # Django settings, urls, wsgi
│   ├── api/             # models, views, serializers, permissions, urls
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/         # axios client (JWT interceptors)
│   │   ├── context/     # AuthContext
│   │   ├── hooks/       # useSound
│   │   ├── components/  # Navbar
│   │   └── pages/
│   │       ├── teacher/ # Dashboard, Tests, TestDetail, Materials, Results
│   │       └── student/ # Dashboard, TakeTest, TestResult, History, Materials
│   ├── public/
│   │   └── sounds/      # correct.mp3, wrong.mp3  ← o'zingiz qo'shing
│   └── package.json
├── uploads/materials/   # uploaded files (PDF, video, image)
├── run_backend.bat
├── run_frontend.bat
└── README.md
```

---

## 🔑 API Endpointlar

| Method | Endpoint                             | Vazifa                      |
|--------|--------------------------------------|-----------------------------|
| POST   | /api/auth/register/                  | Ro'yxatdan o'tish           |
| POST   | /api/auth/login/                     | Login (JWT tokens)          |
| POST   | /api/auth/refresh/                   | Token yangilash             |
| GET    | /api/teacher/dashboard/              | Dashboard statistikasi      |
| CRUD   | /api/teacher/tests/                  | Test boshqaruvi             |
| GET    | /api/teacher/tests/{id}/results/     | Natijalar                   |
| GET    | /api/teacher/tests/{id}/export/      | Excel eksport               |
| CRUD   | /api/teacher/tests/{id}/questions/   | Savollar                    |
| CRUD   | /api/teacher/materials/              | Materiallar                 |
| GET    | /api/student/tests/                  | Mavjud testlar              |
| POST   | /api/student/tests/{id}/start/       | Test boshlash               |
| POST   | /api/student/attempts/{id}/answer/   | Javob yuborish              |
| POST   | /api/student/attempts/{id}/finish/   | Test yakunlash              |
| GET    | /api/student/history/                | Tarix                       |
| POST   | /api/chat/{attempt_id}/              | AI chatbot                  |

---

## 🤖 AI Chatbot sozlamalari

Har bir test uchun o'qituvchi chatbot rejimini belgilaydi:

| Rejim         | Xatti-harakat                              |
|---------------|--------------------------------------------|
| `OFF`         | Chatbot o'chirilgan                         |
| `HINT_ONLY`   | Faqat yo'naltirish, javob bermaslik        |
| `FULL_EXPLAIN`| Bosqichma-bosqich to'liq tushuntirish      |

OpenAI kalitini qo'shish uchun `backend/config/settings.py` da:
```python
OPENAI_API_KEY = 'sk-...'
```
Yoki environment variable: `set OPENAI_API_KEY=sk-...`

---

## 🔊 Ovozli rag'bat

`frontend/public/sounds/` papkasiga quyidagi fayllarni qo'shing:
- `correct.mp3` — to'g'ri javob tovushi
- `wrong.mp3` — noto'g'ri javob tovushi

Foydalanuvchi test vaqtida ovozni yoqish/o'chirish imkoniyatiga ega (🔊/🔇).

---

## 📊 Baho tizimi (O'zbekiston)

| Foiz    | Baho |
|---------|------|
| 86–100% | 5    |
| 71–85%  | 4    |
| 56–70%  | 3    |
| 0–55%   | 2    |

---

## 🗄 PostgreSQL ga o'tish

`backend/config/settings.py` da:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mathtestuz',
        'USER': 'postgres',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```
Va `pip install psycopg2-binary` qo'shing.
