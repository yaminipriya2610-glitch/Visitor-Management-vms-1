# Gatepass — Visitor Management Frontend

React + Tailwind CSS + Axios frontend for the QR-approval visitor management system.

## Stack
- React 18 + Vite
- React Router v6 (route protection by role)
- Tailwind CSS (custom "checkpoint / brass" design tokens — see `tailwind.config.js`)
- Axios (JWT attached automatically via interceptor)

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
npm run dev
```

App runs at `http://localhost:5173`.

## Pages

| Route          | Role           | Purpose                                   |
|----------------|----------------|--------------------------------------------|
| `/login`       | public         | Sign in, redirects by role                 |
| `/register`    | public         | Create an Employee or Security Head account|
| `/employee`    | EMPLOYEE       | List own bookings + status, view/download QR pass |
| `/book-visit`  | EMPLOYEE       | New visitor booking form (with ID upload)  |
| `/security`    | SECURITY_HEAD  | Review all requests, approve/reject        |

## Backend contract (matches `../backend`)

- `POST /api/auth/register` — `{ name, email, password, role }`
- `POST /api/auth/login` — `{ email, password }` → `{ access_token, token_type, role, name, email }`
- `POST /api/book-visit` — multipart form: `visitor_name, visitor_contact, num_visitors, purpose, visit_date, time_slot, id_proof`
- `GET /api/my-visits` — visits for the logged-in employee
- `GET /api/all-requests` — all visits (security head)
- `POST /api/approve/{id}`
- `POST /api/reject/{id}` — `{ reason }`
- `GET /api/download-qr/{id}` — QR image (JWT required, so the app loads it as a blob)
- `GET /api/id-proof/{id}` — uploaded ID proof (JWT required, loaded as a blob)

Visit objects use `visit_date`, `visitor_contact`, `id_proof_path`, `employee_name`.

All authenticated requests send `Authorization: Bearer <token>`; a 401 response clears the
session and redirects to `/login`.

## Design notes

The UI leans on a "security checkpoint" visual identity: deep navy (`checkpoint`), a brass
approval accent, and a denial red for rejections. Approved visits render as a stylized
visitor badge (`VisitorPassCard`) with a perforated top edge, rather than a bare QR image —
this is the one deliberately distinctive element; everything else stays quiet and functional.
