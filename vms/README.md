# Gatepass — Online Visitor Management System (QR Approval)

One project, two folders. Frontend and backend are matched to each other.

| Folder | Stack |
|---|---|
| `backend/`  | FastAPI · SQLAlchemy (SQLite default) · JWT + bcrypt · qrcode |
| `frontend/` | React 18 · Vite · React Router · Tailwind CSS · Axios |

## Run it (two terminals)

**1. Backend** → http://localhost:8000 (Swagger docs at `/docs`)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**2. Frontend** → http://localhost:5173

```bash
cd frontend
npm install
npm run dev
```

`frontend/.env` already points at `http://localhost:8000`. Change `VITE_API_BASE_URL`
if the backend runs elsewhere (and add that frontend origin to CORS in `backend/app/main.py`).

## Try it

1. Open http://localhost:5173/register and create one **Employee** and one **Security Head** account.
2. Log in as the employee → **Book visitor** (an ID proof file is required in the form).
3. Log in as the security head → **Approve** (generates the QR) or **Reject** (with a reason). Use **View ID proof** to open the uploaded file.
4. Back as the employee → **View pass** to see the badge with the QR, and **Download QR**.

## Configuration (optional)

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/vms_db"   # default: SQLite vms.db
export JWT_SECRET_KEY="a-long-random-string"                              # set this in production
```

## Notes

- The register page lets anyone choose the Security Head role. That is fine for a demo; lock it down before real use.
- QR codes and ID proofs require the login token, so the frontend loads them through Axios as blobs rather than plain `<img>` / `<a>` links.
