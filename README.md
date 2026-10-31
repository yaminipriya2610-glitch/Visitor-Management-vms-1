# 🛡️ Online Visitor Management System with QR Approval

A full-stack web app that replaces paper visitor logs. Employees book visits for their guests, the Security Head approves or rejects each request, and an approved visit automatically gets a **QR code** that is scanned and verified at the gate.



![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)




![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)




![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)




![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)




![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)



---

## 📸 Screenshots

> Add your screenshots to a `docs/screenshots/` folder and update the paths below.

| Employee – Book Visit | Security – Approve / Reject | QR Code | Gate Verification |
|---|---|---|---|
| 

![Book](docs/screenshots/book-visit.png)

 | 

![Approve](docs/screenshots/security-dashboard.png)

 | 

![QR](docs/screenshots/qr.png)

 | 

![Verify](docs/screenshots/verify.png)

 |

---

## ✨ Features

**Employee**
- Register / log in securely
- Book a visit: visitor name, contact, ID proof, purpose, date and time slot
- Track request status: `PENDING` → `APPROVED` / `REJECTED` (with rejection reason)
- Download the visitor's QR code once approved

**Security Head**
- View all visit requests
- Approve a request (QR is generated automatically) or reject it with a reason
- **Gate verification:** scan the visitor's QR with the camera, or paste the token, to confirm entry

**Platform**
- JWT authentication with role-based access (`EMPLOYEE`, `SECURITY_HEAD`)
- Passwords hashed with scrypt
- QR generated only after approval, using the Python `qrcode` library
- Persistent PostgreSQL storage, manageable in pgAdmin
- Postman collection included for API testing

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, html5-qrcode, lucide-react |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| Database | PostgreSQL (psycopg 3) |
| Auth | JWT (HS256), role-based access control |
| QR | `qrcode[pil]` |
| Testing | Postman |

---

## 🔄 How It Works

```
Employee books visit ──► Status: PENDING
                              │
                  Security Head reviews
                     ┌────────┴────────┐
                 Approve            Reject (reason)
                     │                  │
        QR auto-generated          Employee sees reason
                     │
        Employee downloads QR ──► Visitor shows QR at gate
                                          │
                              Security scans / verifies ✅
```

---

## 📁 Project Structure

```text
visitor_management_system/
├── backend/            # FastAPI app (models, schemas, JWT security, QR utils)
│   ├── app/
│   ├── requirements.txt
│   ├── run.py
│   └── .env.example
├── frontend/           # React + Vite app
│   ├── src/
│   ├── package.json
│   └── .env.example
├── database/
│   └── schema.sql      # Readable SQL table definitions
├── postman/            # Postman collection + testing guide
├── .gitignore
└── README.md
```

---

## 🗄️ Database

Two tables, created automatically on first backend start (`database/schema.sql` is a readable reference):

- **users**: `id`, `name`, `email` (unique), `password_hash`, `role`, `created_at`
- **visitor_bookings**: `id`, `booking_code`, visitor details, ID proof, `purpose`, visit date/time, `status`, `rejection_reason`, `qr_token`, `qr_data`, `approved_at`, timestamps, `employee_id` (FK → users)

---

## 🔌 API Endpoints

Interactive docs at `http://127.0.0.1:8000/docs` (Swagger UI).

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Log in, receive JWT |
| GET | `/api/auth/me` | Any | Current user |
| POST | `/api/bookings` | Employee | Book a visit |
| GET | `/api/bookings/my` | Employee | My visit requests |
| GET | `/api/bookings/{id}` | Owner / Security | Single booking |
| GET | `/api/bookings/{id}/qr` | Owner / Security | Download QR (approved only) |
| GET | `/api/security/bookings` | Security Head | All requests |
| POST | `/api/security/bookings/{id}/approve` | Security Head | Approve + generate QR |
| POST | `/api/security/bookings/{id}/reject` | Security Head | Reject with reason |
| POST | `/api/security/verify` | Security Head | Verify a scanned QR token |
| POST | `/api/dev/seed-demo` | Dev only | Create demo accounts |

---

## 🚀 Getting Started

### Prerequisites
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js LTS](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/download/) (with pgAdmin 4)

### 1. Database
In pgAdmin (or `psql`), create a login role and database:

```sql
CREATE ROLE visitor_app WITH LOGIN PASSWORD 'your_password';
CREATE DATABASE visitor_management OWNER visitor_app;
```

### 2. Backend
```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env      # then edit .env (see below)
uvicorn app.main:app --reload
```

`backend/.env`:
```env
SECRET_KEY=replace-with-a-long-random-secret
DATABASE_URL=postgresql+psycopg://visitor_app:your_password@localhost:5432/visitor_management
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Backend runs at `http://127.0.0.1:8000`. Tables are created automatically.

### 3. Frontend
In a second terminal:
```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_BASE=http://127.0.0.1:8000/api
npm run dev
```

Open `http://localhost:5173`.

### 4. Try it with demo accounts
Call `POST /api/dev/seed-demo` (or use the Postman collection) to create:

| Role | Email | Password |
|---|---|---|
| Employee | `employee@example.com` | `employee123` |
| Security Head | `security@example.com` | `security123` |

> ⚠️ Demo credentials are for local testing only. Remove the seed endpoint before any real deployment.

---

## 🧪 API Testing

Import `postman/Visitor-Management-System.postman_collection.json` into Postman and follow `postman/TESTING_GUIDE.md`.

---

## 🔐 Security Notes

- `.env`, `.venv`, and `node_modules` are git-ignored; never commit secrets.
- Passwords are stored as salted scrypt hashes, never in plain text.
- Role checks are enforced on the server, not just in the UI.

This is a learning/portfolio project. For production use, add HTTPS, secrets management, audit logging, data-retention rules, and rate limiting.

---

## 🛣️ Future Improvements

- Email / SMS notification to the visitor and employee on approval
- Visitor check-in / check-out timestamps and visit history reports
- Docker Compose setup for one-command start
- Deployment (Render / Railway for backend, Vercel for frontend)
- Admin dashboard with analytics

---

## 👩‍💻 Author

**Yamini Priya**
Data / AI / ML student
GitHub: [@your-username](https://github.com/your-username) · LinkedIn: [your-profile](https://www.linkedin.com/in/your-profile)

If you found this project useful, please ⭐ the repo!# Visitor-Management-vms-1
