# Backend (FastAPI + PostgreSQL)

## One-time setup
1. Install Python 3.10+.
2. Install PostgreSQL and pgAdmin 4.
3. In pgAdmin, create a login role named `visitor_app` with a password you choose.
4. Create a database named `visitor_management` owned by `visitor_app`.
5. Copy `.env.example` to `.env` and put the same password into `DATABASE_URL`.
6. Open a terminal in this `backend` folder and run:
   - `python -m venv .venv`
   - Windows PowerShell: `.venv\Scripts\Activate.ps1`
   - Command Prompt alternative: `.venv\Scripts\activate.bat`
   - `python -m pip install -r requirements.txt`
   - `uvicorn app.main:app --reload`

The app creates the `users` and `visitor_bookings` tables automatically when it starts.
Open http://127.0.0.1:8000/docs to inspect and test API endpoints.

## Demo users (local learning only)
In Postman, call `POST http://127.0.0.1:8000/api/dev/seed-demo`.
- Employee: `employee@example.com` / `employee123`
- Security Head: `security@example.com` / `security123`

Do not expose the development seed endpoint or demo passwords in a production deployment.
