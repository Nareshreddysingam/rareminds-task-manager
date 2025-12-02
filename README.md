Here is your README cleaned, compact, no extra line gaps, perfect spacing, and GitHub-ready 👇
Just copy–paste directly into README.md.

📌 Rareminds Task Manager

A real-world, full-stack collaborative task management system with manager–employee workflows, real-time updates, trash/archive, activity logs, authentication, RBAC, dark mode, and modern UI/UX.
This project is built for Rareminds as a production-ready, fully functional system — not a demo or tutorial.

🚀 Tech Stack
Frontend

React.js (Vite), Tailwind CSS, Zustand / Context API, Axios, Red + White UI palette (Light Mode), Neon Dark Mode, Reusable components, Protected Routes.

Backend

Node.js, Express.js, MongoDB (Mongoose), JWT Authentication, Role-Based Access Control (Manager & User), Socket.IO for real-time updates, Activity Logs, Project & Task APIs.

🧩 Core Features
✅ Authentication (JWT Based)

Signup/Login, encrypted passwords, manager/user role assignment.

✅ Role-Based Access Control

Manager: create tasks, assign tasks, edit/delete any task.
User: view assigned tasks, update task status.

✅ Tasks Module

Create/Edit/Delete tasks, assign tasks, mark complete, filter by status.

✅ Projects Module

Create projects, assign tasks to projects, view project dashboard.

✅ Trash + Archive System

Soft delete → Trash, restore, archive tasks, delete permanently.

✅ Activity Logging

Tracks creation, edits, deletions, status updates.

✅ Real-Time Updates (Socket.IO)

Manager assigns → User sees instantly.
User updates → Manager sees instantly.

✅ Modern UI/UX

Red-white theme, dark mode toggle, animated transitions, mobile responsive, dashboard layout, task cards with priority & due dates.

📂 Folder Structure
rareminds-task-manager/
│── backend/
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── .env (ignored)
│   └── package.json
│
│── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── styles/
│   ├── .env (ignored)
│   └── package.json
│
└── README.md

🛠 Installation Guide
📍 1. Clone Repository
git clone https://github.com/Nareshreddysingam/rareminds-task-manager.git
cd rareminds-task-manager

📍 2. Backend Setup
cd backend
npm install


Create .env:

MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
PORT=4000


Run:

npm run dev

📍 3. Frontend Setup
cd ../frontend
npm install


Create .env:

VITE_BACKEND_URL=http://localhost:4000


Run:

npm run dev

🎯 How It Works
Manager Flow

Login → Create project → Create tasks → Assign tasks → View dashboard → Check logs → Trash/Restore/Delete.

User Flow

Login → View assigned tasks → Update status → View details (no delete/edit permissions).

🧪 Future Improvements

Email notifications, Kanban drag-drop, Multi-team access, File uploads, Calendar/reminders.

🧑‍💻 Author

Singam Naresh
Backend/Full-Stack Developer
Creator of JobNext.in & HireNxt AI

GitHub: https://github.com/Nareshreddysingam
LinkedIn: https://linkedin.com/in/singamnaresh
