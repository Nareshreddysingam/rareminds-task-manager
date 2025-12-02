📘 Rareminds Task Manager — Backend (Node.js + Express + MongoDB)

This is the backend API for the Rareminds Task Manager, a real-life project & team management system with authentication, role-based access, task/workflows, archive/trash, and real-time updates.

🚀 Features
🔐 Authentication

JWT-based login & signup

Secure password hashing (bcrypt)

Manager/User role system

🧑‍💼 Role-Based Access Control (RBAC)

Manager: Full CRUD access, assign tasks, manage projects, archive, trash

User: Limited access, update only their tasks

📁 Projects Module API

Create project

Update, delete, fetch

Owned by managers

📝 Tasks API

Create tasks

Assign to users

Include project & priority

Status change (todo → in_progress → done)

Archive / Trash system

Restore / permanent delete (manager only)

🔄 Real-Time Updates

Socket.io broadcast for:

Task creation

Status updates

Archive/trash

Deletes

📊 Activity Log API

Logs for every task action

Paginated results

🛡 Security

Helmet

CORS

Rate limiting

Sanitized input

📦 Tech Stack

Node.js

Express.js

MongoDB + Mongoose

Socket.io

JWT

bcrypt

Helmet

Morgan

📁 Project Structure
backend/
│── config/
│── controllers/
│── middleware/
│── models/
│── routes/
│── server.js
│── package.json
│── README.md

⚙️ Setup Instructions
1. Install dependencies
cd backend
npm install

2. Create .env
PORT=4000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret
CLIENT_URL=http://localhost:5173

3. Run server
npm run dev


API will run at:
👉 http://localhost:4000

📡 API Routes (Quick Overview)
Auth
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/users (manager only)

Projects
POST /api/projects
GET  /api/projects
PUT  /api/projects/:id
DELETE /api/projects/:id

Tasks
POST /api/tasks
GET  /api/tasks/my
GET  /api/tasks/created (manager)
PUT  /api/tasks/:id
DELETE /api/tasks/:id

Activity Logs
GET /api/activity

🧑‍💻 Developer

Singam Naresh — Full Stack Developer (Java | Node | React)