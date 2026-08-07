# Easy-Library-Managment
Easy library managment

`A ReactJS + NodeJS App for library management with role-based login, a dashboard, user/member management, book catalog management, and issuing/returning/searching of books.`

## Setup

Open the project directory in a terminal,
Then cd to frontend and run "npm install" to install the dependencies.
Again then cd to backend directory and run "npm install", at last run the command "npm run dev" to start the app.
Concurrently package is used for running backend and frontend simultaneously.

Frontend -> ReactJS.
Backend -> NodeJS.
The project uses MySQL Database, so for that I've used Xampp for creating the local server as well as mysql package.

The project creates the database, tables and a default admin account by itself. Initial book data has to be inserted through the Book/Catalog Management page after logging in.

## Default login

```
username: admin
password: Admin@123
```

Change this password (or create a new admin) after first login.

## Database

Database -> library

Tables -> book - Books in the library
          student - Student/member records used for circulation (issue, return, fine)
          borrow - Stores the student and corresponding issued books.
          users - Login accounts (admin, librarian, member roles)

NodeJS utitilities -> createDB -> Creates the database if it doesn't exist
                      createTables -> Creates the tables if they doesn't exist, seeds the default admin user
                      credentials -> Xampp credentials + JWT secret, add password accordingly

## Backend routes (server.js)

Auth        -> /api/auth/register, /api/auth/login, /api/auth/me
Dashboard   -> /api/dashboard/stats (protected)
Users       -> /api/users (admin only, CRUD)
Catalog     -> /api/books (admin/librarian, add/update/delete)
Circulation -> /api/getBooks, /api/borrow, /api/getIssues/:sid, /api/return, /api/students/:id

Auth is JWT-based (`middleware/auth.js`) - `verifyToken` protects a route, `requireRole(...roles)` additionally restricts it by role.

## React Components

Nav       -> Left sidebar navigation, role-filtered menu, shows logged-in user + logout
Login     -> Login form, stores JWT + user in localStorage
Dashboard -> Summary stat cards (books, members, issued, overdue, fines)
Users     -> Users/Members management (admin only)
Catalog   -> Book/Catalog management - add/edit/delete books (admin/librarian)
PrivateRoute -> Route wrapper redirecting to /login if unauthenticated, or away if the role doesn't match
Books     -> List all available books (for issuing)
Issue     -> Issue a book to a student
Return    -> List books issued by a student and option to return
Search    -> List students who have issued a particular book

## Roles

admin     -> full access: Users/Members, Book/Catalog Management, Dashboard, Circulation
librarian -> Book/Catalog Management, Dashboard, Circulation
member    -> Dashboard, Circulation
