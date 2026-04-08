# SCRUM Meeting 3 - Reveille Bubble Tea

Prepared by: Garv
Meeting Date: Monday, March 30, 2026
Time: 10:50 - 11:05 AM

## Meeting Attendees

1. Garv
2. Ibrahime
3. Rian
4. Christian
5. Andrew
6. Sam

## Meeting Agenda Items

- Final sprint status check before submission
- Figure out deployment situation
- Decide what carries into next sprint

## Status Update Since Last Meeting

Accomplishments:
- Ibrahime got PortalPage and OrdersPage wired into the router
- Sam fixed the hardcoded API URL to use an environment variable
- Everyone pushed their code from the weekend

Tasks Completed:

| Task Description                  | Assigned To | Completed? |
|-----------------------------------|-------------|------------|
| Wire PortalPage into router       | Ibrahime    | Yes        |
| Wire OrdersPage into router       | Ibrahime    | Yes        |
| Fix hardcoded API base URL        | Sam         | Yes        |

## Before The Next Meeting

Plans:
- Garv: create the Sprint 1 GitHub release tag and submit sprint materials
- Andrew: look into Render for backend deployment, start on it for next sprint
- Everyone: review what is left in the backlog before next sprint starts

Task Assignments:

| Task Description                        | Assigned To |
|-----------------------------------------|-------------|
| Create GitHub Sprint 1 release tag      | Garv        |
| Research Render deployment              | Andrew      |
| Persist order items to database         | Rian        |
| Remove hardcoded customer/employee IDs  | Christian   |

## Minutes from Previous Meeting

In Meeting 2 (Sunday, March 29), the team did a mid-sprint check-in. All the backend routes and the Customer Kiosk frontend were confirmed working. We found a few issues: the API URL was hardcoded to localhost, PortalPage and OrdersPage were not connected to the router, and order items were not actually being saved to the database. Sam took the API URL fix, Ibrahime took the routing, and we agreed to push the order item persistence to next sprint since it would take more time than we had left. Everyone was supposed to commit their work by end of Sunday.
