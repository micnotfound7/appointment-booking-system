# 📅 BookEase — Appointment Booking System

## 1. Project Overview
BookEase is a full-stack healthcare appointment booking system where patients can register, browse services, and book appointments online. Admins can manage appointments, services, and users.

## 2. Live Links
*Frontend*: https://appointment-booking-system-flax-sigma.vercel.app
*Backend API:* https://bookease-backend-9p4b.onrender.com


## 3. Tech Stack
*Frontend:* Angular 17 + Tailwind CSS
*Backend:* Node.js + Express + TypeScript
*Database:* MySQL (Railway)
*Auth:* JWT (JSON Web Tokens)
*File Upload:* Multer
*API Docs:* Swagger/OpenAPI

## 4. Setup Instructions
### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
ng serve
```

## 5. API Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | Public |
| POST | /api/auth/login | Login | Public |
| GET | /api/services | Get all services | Public |
| POST | /api/services | Create service | Admin |
| PUT | /api/services/:id | Update service | Admin |
| DELETE | /api/services/:id | Delete service | Admin |
| POST | /api/appointments | Book appointment | User |
| GET | /api/appointments/my | My appointments | User |
| GET | /api/appointments | All appointments | Admin |
| PATCH | /api/appointments/:id/status | Update status | Admin |
| DELETE | /api/appointments/:id | Delete | User |
| GET | /api/users/profile | Get profile | User |
| PUT | /api/users/profile | Update profile | User |
| GET | /api/users | All users | Admin |

## 6. Features Implemented
- ✅ User Registration & Login (JWT Authentication)
- ✅ Role-based Access Control (Admin/User)
- ✅ Book Appointments with time slot conflict detection
- ✅ Search, Filter & Pagination
- ✅ Profile with image upload (Multer)
- ✅ Admin Dashboard with statistics
- ✅ Manage Appointments (CRUD + Status update)
- ✅ Manage Services (CRUD)
- ✅ View All Users with phone & location
- ✅ Swagger API Documentation
- ✅ Responsive UI (Tailwind CSS)
- ✅ Deployed frontend & backend


## 7. Screenshots

| Screenshot | Description |

[Home]| Landing page with hero section and featured services |
[Register] User registration form with validation |
[Login] | Secure JWT login page |
[Services] | Browse services with search and filter |
[Book] | Book appointment with time slot conflict detection |
[My Appointments]() | View and manage personal appointments |
[Profile]| Update profile with image upload |
[Dashboard]| Admin statistics dashboard |
[Manage Appointments]() | Admin appointment and user management |
[Manage Services]() | Admin service CRUD management |
[API Docs]() | Swagger API documentation |

