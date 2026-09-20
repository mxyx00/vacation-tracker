# Vacation Request Tracker

This is a simple web app for submitting and managing employee time off requests.

Employees can:
- Submit a time-off request
- View and edit their requests
- Filter requests by status

Managers can:
- Approve or Reject requests
- Leave an optional comment

Simple Gantt chart with time off.


## Tech Stack 

Frontend:
- React
- TypeScript
- Vite

Backend:
- C#
- ASP.NET Core
- Entity Framework Core

Database:
- MySQL (MySQLWorkbench)


## Structure

Frontend
-> React user interface

Backend
-> ASP.NET Core API

EF
-> Connects the backend to MySQL

MySQL
-> Stores employee info and time-off requests


## Database

The project uses a MySQL database called:

vacation_tracker

The tables are:

Employees

TimeOffRequests