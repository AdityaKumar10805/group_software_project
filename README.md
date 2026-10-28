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

## License

MIT — Built by Aditya Kumar
