<<<<<<< HEAD
# team_60_csce331_project3
repo for the development of team 60's website

=======
# Aura Boba - Team 60
CSCE 331 Project 3 | Spring 2026

A web-based bubble tea point-of-sale system built with React, Node.js/Express, and PostgreSQL.

## Team Members
- Garv Puri
- Muhammad Ibrahime
- Andrew Siv
- Sam Garces
- Rian Hickey
- Christian Bui

## Tech Stack
- Frontend: React + Vite, deployed on Render
- Backend: Node.js + Express, deployed on Render
- Database: PostgreSQL on TAMU AWS

## Running Locally

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your DATABASE_URL and GROQ_API_KEY in .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Interface Views
- `/` - Portal page
- `/customer` - Customer kiosk
- `/cashierpage` - Cashier POS (requires cashier login)
- `/kitchen` - Kitchen display (requires manager login)
- `/manager` - Manager dashboard (requires manager login)
- `/menuboard` - Menu board
>>>>>>> main
