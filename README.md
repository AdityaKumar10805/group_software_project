# Smart QR Attendance Management System

A fast, secure, and automated solution for recording classroom attendance using QR codes on student ID cards.

## Features

- 🔐 **JWT Authentication** — Secure teacher/admin login with role-based access
- 📱 **QR Code Scanning** — Camera-based scanning of student ID cards
- 📅 **Auto Subject Detection** — Automatically identifies current lecture from timetable
- 🚫 **Duplicate Prevention** — Students can't be marked twice in one lecture
- 📊 **Analytics & Reports** — Subject-wise, student-wise, and daily trend reports
- ✏️ **Attendance Management** — View, edit, and export attendance records
- 👥 **Role-Based Access** — Admin and Teacher roles with different permissions

## Tech Stack

| Layer      | Technology              |
|------------|------------------------|
| Frontend   | React.js (Vite)        |
| Backend    | Node.js + Express.js   |
| Database   | MongoDB + Mongoose     |
| Auth       | JWT                    |
| QR Scanner | html5-qrcode           |
| Charts     | Recharts               |

## Project Structure

```
software_engineering_project/
├── backend/
│   ├── config/         # Database config
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── seeds/           # Sample data
│   └── server.js        # Express entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, reusable UI
│   │   ├── context/     # Auth context
│   │   ├── pages/       # Dashboard, Scanner, Reports, etc.
│   │   ├── services/    # API service layer
│   │   ├── App.jsx      # Routes & app structure
│   │   └── index.css    # Design system
│   └── index.html
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Seed Database

```bash
npm run seed
```

This creates:
- **Admin**: admin@smartqr.edu / admin123
- **Teachers**: priya@smartqr.edu / teacher123
- **30 Students** with IDs: STU2024001 – STU2024030
- **Full timetable** and **sample attendance data**

### 3. Start Backend

```bash
npm run dev
```

Server runs on http://localhost:5001

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## API Endpoints

| Method | Endpoint                    | Description              | Auth     |
|--------|-----------------------------|--------------------------|----------|
| POST   | /api/auth/login             | Teacher/Admin login      | Public   |
| POST   | /api/auth/register          | Create user              | Admin    |
| GET    | /api/students               | List students            | Auth     |
| GET    | /api/students/verify/:id    | Verify student QR        | Auth     |
| POST   | /api/attendance/scan        | Record QR scan           | Auth     |
| GET    | /api/attendance             | List attendance          | Auth     |
| PUT    | /api/attendance/:id         | Edit attendance          | Auth     |
| GET    | /api/timetable/current      | Get current lecture      | Auth     |
| GET    | /api/reports/dashboard      | Dashboard stats          | Auth     |
| GET    | /api/reports/subject        | Subject-wise report      | Auth     |
| GET    | /api/reports/student        | Student-wise report      | Auth     |

## System Workflow

```
Teacher Login → Dashboard → Open Scanner → Scan Student ID Card
→ Verify Student → Detect Current Subject → Check Duplicate
→ Save Attendance → Report Generated
```

## 24/7 Cloud Deployment (Render + MongoDB Atlas)

To deploy the application permanently so it runs 24/7 even when your laptop is turned off:

### 1. Cloud Database (MongoDB Atlas)
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Deploy a free **M0 Sandbox cluster**
3. Create a Database User (Username & Password)
4. Under Network Access, allow IP `0.0.0.0/0` (allow access from anywhere)
5. Copy your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/qr_attendance?retryWrites=true&w=majority`

### 2. Cloud Web Service (Render)
1. Sign in at [render.com](https://render.com) using your GitHub account
2. Click **New +** → **Web Service**
3. Select this repository: `AdityaKumar10805/group_software_project`
4. Render automatically configures via `render.yaml`, or use:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Add the following **Environment Variables**:
   - `MONGODB_URI`: `<Your MongoDB Atlas connection string>`
   - `JWT_SECRET`: `smartqr_attendance_secret_key_2026`
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**. You will receive a permanent HTTPS link (e.g. `https://smart-qr-attendance.onrender.com`) that runs 24/7!

### 3. Seed Cloud Database (One-time)
Run locally once pointing to your Atlas connection string to populate the demo users and timetable:
```bash
MONGODB_URI="your-atlas-uri" npm run seed
```

## License

MIT — Built by Aditya Kumar
