# SCRUM Meeting 2 - Reveille Bubble Tea

Prepared by: Garv
Meeting Date: Sunday, March 29, 2026
Time: 11:00 - 11:15 AM

## Meeting Attendees

1. Garv
2. Ibrahime
3. Rian
4. Christian
5. Andrew
6. Sam

## Meeting Agenda Items

- Mid-sprint status check: what is done, what is in progress, what is blocked
- Identify any blockers and assign fixes
- Confirm plan to finish remaining tasks before Monday

## Status Update Since Last Meeting

Accomplishments:
- Backend Express server running, PostgreSQL connection confirmed
- All four API endpoints (GET menu, GET orders, POST orders, PUT order status) completed and tested locally
- Customer Kiosk page built: menu displays grouped by category, cart add/remove/quantity works

Tasks Completed:

| Task Description                 | Assigned To      | Completed? |
|----------------------------------|------------------|------------|
| Set up Node.js/Express backend   | Andrew, Sam      | Yes        |
| Connect PostgreSQL database      | Andrew           | Yes        |
| GET /api/menu endpoint           | Sam              | Yes        |
| GET /api/orders endpoint         | Rian             | Yes        |
| POST /api/orders endpoint        | Rian, Christian  | Yes        |
| PUT /api/orders/:id endpoint     | Christian        | Yes        |
| Customer Kiosk page (React)      | Garv, Ibrahime   | Yes        |
| Cart (add / remove / quantity)   | Garv             | Yes        |

## Before The Next Meeting

Plans:
- Sam: replace hardcoded API base URL with VITE_API_BASE environment variable
- Ibrahime: wire PortalPage and OrdersPage into App.jsx React Router
- All members: commit current work to GitHub before end of Sunday

Task Assignments:

| Task Description                  | Assigned To |
|-----------------------------------|-------------|
| Fix hardcoded API base URL        | Sam         |
| Wire PortalPage into router       | Ibrahime    |
| Wire OrdersPage into router       | Ibrahime    |

## Minutes from Previous Meeting

In Meeting 1 (Saturday, March 28), the team held the sprint kickoff. The product backlog was reviewed and sprint tasks were divided: Andrew and Sam took the backend scaffolding and database connection, Rian and Christian took the order API routes, and Garv and Ibrahime took the frontend Customer Kiosk page. The tech stack was confirmed as Node.js/Express with PostgreSQL for the backend and React/Vite for the frontend. All members were asked to begin their assigned tasks immediately and commit initial progress by end of Saturday.
