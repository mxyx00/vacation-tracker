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

-----------------

## to install
1. net10 sdk
2. node.js & npm
3. mysql + workbench etc.

## to create database
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Port=3306;Database=vacation_tracker;User=vacation_app;Password= ;"

CREATE USER 'vacation_app'@'localhost'
IDENTIFIED BY '{password}';

GRANT ALL PRIVILEGES
ON vacation_tracker.*
TO 'vacation_app'@'localhost';

FLUSH PRIVILEGES;

## EF migrations

1. dotnet tool run dotnet-ef migrations add MigrationName
2. dotnet tool run dotnet-ef database update

## future changes:
- Better Gantt Chart, with colour coding
- Azure Deployment (Azure Static Web Apps, Azure App Service, Aure Database, Microsoft EntraID, Key Vault)