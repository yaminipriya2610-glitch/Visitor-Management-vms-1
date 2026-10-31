# Online Visitor Management System

Beginner-friendly local project with separate frontend and backend folders.

- **Frontend:** React + Vite
- **Backend:** Python + FastAPI
- **Database:** PostgreSQL (persistent relational database)
- **Database UI:** pgAdmin 4
- **Authentication:** JWT with Employee and Security Head roles
- **QR:** generated only after approval
- **API testing:** Postman collection included

## Folder structure
```text
visitor_management_system/
├── backend/       # Python/FastAPI source
├── frontend/      # React source
├── database/
│   └── schema.sql # readable SQL table definitions
├── postman/       # import collection and testing guide
├── README.md
└── .gitignore
```

## A. Install PostgreSQL
1. Download PostgreSQL for Windows from https://www.postgresql.org/download/windows/.
2. Run the installer. Keep PostgreSQL Server and pgAdmin 4 selected.
3. During setup, remember the password you create for the built-in `postgres` user.
4. Keep the default port `5432`.
5. Finish installation and open **pgAdmin 4** from the Windows Start menu.
6. If asked, create a pgAdmin master password. This is for pgAdmin and can differ from your database password.
7. In pgAdmin, expand **Servers → PostgreSQL** and enter the password created in the installer.

## B. Create a database user and database in pgAdmin
Use the GUI; you do not need to type SQL for this step.

1. In pgAdmin, right-click **Login/Group Roles** → **Create** → **Login/Group Role**.
2. On **General**, set Name to `visitor_app`.
3. On **Definition**, enter a password of your choice and remember it.
4. On **Privileges**, set **Can login?** to Yes. Save.
5. Right-click **Databases** → **Create** → **Database**.
6. Set Database to `visitor_management`.
7. Set Owner to `visitor_app`. Save.

If pgAdmin does not show the role/database immediately, right-click the relevant tree item and choose **Refresh**.

## C. Configure the Python backend to connect to PostgreSQL
1. Open the extracted `visitor_management_system` folder in VS Code: **File → Open Folder**.
2. In the Explorer, open the `backend` folder.
3. Make a copy of `backend/.env.example` named `backend/.env`.
4. Open `backend/.env`. Replace `CHANGE_ME` in `DATABASE_URL` with the password you set for `visitor_app`.
   Example format (do not copy the example password literally):
   `DATABASE_URL=postgresql+psycopg://visitor_app:YOUR_PASSWORD@localhost:5432/visitor_management`
5. Replace the example `SECRET_KEY` with a long random value. Keep `.env` private; never upload it to GitHub.

If your password contains characters such as `@`, `:`, `/`, or `#`, URL-encode those characters or choose a local development password without them.

## D. Start the backend
1. In VS Code, click **Terminal → New Terminal**.
2. In the terminal, change to the backend folder:
   `cd backend`
3. Create the virtual environment:
   `python -m venv .venv`
4. Activate it in PowerShell:
   `.venv\Scripts\Activate.ps1`
   If PowerShell blocks activation, open a **Command Prompt** terminal and run:
   `.venv\Scripts\activate.bat`
5. Install packages:
   `python -m pip install -r requirements.txt`
6. Start FastAPI:
   `uvicorn app.main:app --reload`
7. Keep this terminal open. Visit `http://127.0.0.1:8000/docs`.
   If the database connection is correct, the app starts and creates `users` and `visitor_bookings` tables in PostgreSQL automatically.

## E. Confirm tables in pgAdmin
1. In pgAdmin, expand **Databases → visitor_management → Schemas → public → Tables**.
2. Right-click **Tables** → **Refresh**.
3. You should see `users` and `visitor_bookings`.
4. To view stored rows, right-click a table → **View/Edit Data → All Rows**.
5. The `users` table stores login accounts and hashed passwords; `visitor_bookings` stores visitor requests, statuses, and QR token data.

The project includes `database/schema.sql` as a readable SQL reference. The app normally creates tables automatically, so you do not need to execute this SQL file on a fresh database.

## F. Start the React frontend
Keep the backend terminal running. Open a **second** VS Code terminal:
1. From the project root, run `cd frontend` (if the terminal is already in `backend`, run `cd ..` first).
2. Install frontend dependencies: `npm install`.
3. Start React: `npm run dev`.
4. Open the URL printed in the terminal, normally `http://localhost:5173`.

## G. First-run demo and user workflow
1. Open Postman and import `postman/Visitor-Management-System.postman_collection.json`.
2. Follow `postman/TESTING_GUIDE.md`. Start with Health and Seed Demo.
3. Demo Employee: `employee@example.com` / `employee123`.
4. Demo Security Head: `security@example.com` / `security123`.
5. In the browser, log in as Employee and create a visitor booking.
6. Log out and log in as Security Head; approve or reject the request. Rejection requires a reason.
7. Log in as Employee again and download the QR for an approved booking.
8. Use the Security Head verification screen to verify the QR.

Postman is for testing requests to **your own backend**. It is not the database. The data is stored in your local PostgreSQL database.

## H. GitHub drag-and-drop
1. Make sure both app folders work locally first.
2. Do not upload `backend/.env`, any `.venv` folder, `frontend/node_modules`, or real visitor personal data.
3. Keep `.gitignore`, README, source code, `database/schema.sql`, and (optionally) the Postman collection.
4. On GitHub, create a new repository.
5. Choose **Add file → Upload files**.
6. Drag the contents of the extracted `visitor_management_system` folder into the upload area.
7. Wait for the upload and click **Commit changes**.

## Important
This is a local learning project, not production-hardened software. Before using it for real visitors, add production secrets management, HTTPS, audit logs, data-retention rules, and stronger deployment controls.
