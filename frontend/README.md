# Visitor Management System - Frontend

## Stack
React + Vite + TailwindCSS.

## Run
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open http://localhost:5173

The frontend expects the FastAPI backend at http://127.0.0.1:8000/api. Change `VITE_API_BASE` if needed.
