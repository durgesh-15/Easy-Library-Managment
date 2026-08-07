const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DATABASE = require('./utilities/createDB');
const TABLES = require('./utilities/createTables');
const cred = require('./utilities/credentials');
const { verifyToken, requireRole } = require('./middleware/auth');

class LIBRARY {

    constructor(port, app) {

        this.port = port;
        this.app = app;
        this.app.use(express.json())
        this.temp = 0;

        //Initialize Database, then tables (tables require the database to exist first)
        new DATABASE().initDB(() => {
            new TABLES().initTable();
        });
        
        this.db = mysql.createConnection({
            ...cred,
            database: 'library'
        });

    }

    get() {

        //GET LIST OF ALL THE BOOKS
        this.app.get('/api/getBooks', (req, res) => {
            let sql = `SELECT * FROM book`;
            this.db.query(sql, (err, result) => {
                if(err)
                    console.log(err);
                else
                    console.log("Successfully extracted books");
                res.send(result);
            });
        });

        //GET LIST OF BOOKS BY SEMESTER
        this.app.get('/api/getBooks/:id', (req, res) => {
            let sql = `SELECT * FROM book where semester = '${req.params.id}'`;
            this.db.query(sql, (err, result) => {
                if(err)
                    console.log(err);
                else
                    console.log("Successfully extracted books");
                res.send(result);
            });
        });

        //BORROW A BOOK
        this.app.post('/api/borrow', (req, res) => {
            let sql = [`INSERT INTO borrow(idStudent, idBook) VALUES (${req.body.sid}, ${req.body.id});`,
                       `Update book SET count = count - 1 WHERE id = ${req.body.id}`];

                for(let i = 0; i < sql.length; i++){
                    this.db.query(sql[i], (err, result) => {
                        if(err){
                            console.log("Couldn't add");
                            this.temp = 1;
                        }
                        else
                            console.log("Successfully inserted");
                    });
                    if(this.temp)
                        break;
                }
        });

        //GET ALL THE ISSUED BOOKS BY A STUDENT
        this.app.get('/api/getIssues/:sid', (req, res) => {
            
            let sql = `SELECT book.name, book.author, book.semester, book.id, borrow.date, borrow.deadline, student.name as sname\
                       FROM book, student, borrow\
                       where borrow.idStudent = '${req.params.sid}' and book.id = borrow.idBook and student.id = '${req.params.sid}'`;

            this.db.query(sql, (err, result) => {
                if(err)
                    console.log(err);
                else
                    console.log("Successfully extracted issues");
                res.send(result);
            });
        });

        //RETURN A BOOK, UPDATE FINE IF ANY
        this.app.post('/api/return', (req, res) => {
            
            let sql = [`SELECT deadline from borrow\
                        WHERE idBook = ${req.body.id} and idStudent = ${req.body.sid}`,
                       `DELETE FROM borrow where idStudent = ${req.body.sid} and idBook = ${req.body.id}`,
                       `UPDATE book SET count = count + 1 WHERE id = ${req.body.id}`];

            for(let i = 0; i < sql.length; i++){
                this.db.query(sql[i], (err, result) => {
                    if(err){
                        console.log("Couldn't return");
                    }
                    
                    //FOR FINE
                    else if(i == 0){
                        var d1 = new Date(result[0].deadline);
                        var d2 = new Date()
                        const timeDiff = d2 - d1;
                        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                        if(daysDiff > 0) {
                            this.db.query(`UPDATE student SET fine = fine + ${(daysDiff - 1) * 10} WHERE id = '${req.body.sid}'`, (err, result) => {
                                if(err)
                                    console.log(err);
                                else
                                    console.log("Fine Updated Succesfully");
                            });
                        }
                    }

                });
            }
        });

        //GET ALL THE STUDENTS WHO HAVE ISSUED A PARTICULAR BOOK
        this.app.get('/api/students/:id', (req, res) => {
            
            let sql = `SELECT student.name, borrow.date, borrow.deadline\
                       FROM student, borrow\
                       where borrow.idBook = '${req.params.id}' and student.id = borrow.idStudent`;

            this.db.query(sql, (err, result) => {
                if(err)
                    console.log("Couldn't get issues");
                else
                    console.log("Successfully extracted issues");
                res.send(result);
            });
        });
    }

    auth() {

        //REGISTER (always creates a 'member' account - role can't be set by the caller)
        this.app.post('/api/auth/register', (req, res) => {
            const { name, email, username, password } = req.body;

            if(!name || !username || !password)
                return res.status(400).send({ message: 'name, username and password are required' });

            const hashed = bcrypt.hashSync(password, 10);
            const sql = `INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, 'member')`;

            this.db.query(sql, [name, email, username, hashed], (err, result) => {
                if(err){
                    console.log(err);
                    return res.status(400).send({ message: 'Could not register user (username/email may already be taken)' });
                }
                res.send({ message: 'User registered successfully' });
            });
        });

        //LOGIN
        this.app.post('/api/auth/login', (req, res) => {
            const { username, password } = req.body;

            if(!username || !password)
                return res.status(400).send({ message: 'username and password are required' });

            const sql = `SELECT * FROM users WHERE username = ?`;

            this.db.query(sql, [username], (err, result) => {
                if(err || result.length === 0)
                    return res.status(401).send({ message: 'Invalid credentials' });

                const user = result[0];
                if(!bcrypt.compareSync(password, user.password))
                    return res.status(401).send({ message: 'Invalid credentials' });

                const token = jwt.sign(
                    { id: user.id, username: user.username, role: user.role },
                    cred.jwtSecret,
                    { expiresIn: '8h' }
                );

                res.send({
                    token,
                    user: { id: user.id, name: user.name, username: user.username, role: user.role }
                });
            });
        });

        //CURRENT LOGGED IN USER
        this.app.get('/api/auth/me', verifyToken, (req, res) => {
            res.send({ user: req.user });
        });
    }

    dashboard() {

        //DASHBOARD SUMMARY STATS
        this.app.get('/api/dashboard/stats', verifyToken, (req, res) => {
            const queries = {
                totalBooks: 'SELECT COUNT(*) as count FROM book',
                totalMembers: 'SELECT COUNT(*) as count FROM student',
                totalIssued: 'SELECT COUNT(*) as count FROM borrow',
                overdue: 'SELECT COUNT(*) as count FROM borrow WHERE deadline < NOW()',
                totalFine: 'SELECT COALESCE(SUM(fine), 0) as total FROM student'
            };

            const keys = Object.keys(queries);
            const stats = {};
            let completed = 0;

            keys.forEach((key) => {
                this.db.query(queries[key], (err, result) => {
                    if(err)
                        stats[key] = 0;
                    else if(result[0].count !== undefined)
                        stats[key] = result[0].count;
                    else
                        stats[key] = result[0].total;

                    completed++;
                    if(completed === keys.length)
                        res.send(stats);
                });
            });
        });
    }

    users() {

        //LIST ALL USERS (admin only)
        this.app.get('/api/users', verifyToken, requireRole('admin'), (req, res) => {
            let sql = `SELECT id, name, email, username, role, created_at FROM users ORDER BY id`;
            this.db.query(sql, (err, result) => {
                if(err)
                    return res.status(500).send({ message: 'Could not fetch users' });
                res.send(result);
            });
        });

        //CREATE A USER WITH ANY ROLE (admin only)
        this.app.post('/api/users', verifyToken, requireRole('admin'), (req, res) => {
            const { name, email, username, password, role } = req.body;

            if(!name || !username || !password || !['admin', 'librarian', 'member'].includes(role))
                return res.status(400).send({ message: 'name, username, password and a valid role are required' });

            const hashed = bcrypt.hashSync(password, 10);
            const sql = `INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)`;

            this.db.query(sql, [name, email, username, hashed, role], (err, result) => {
                if(err)
                    return res.status(400).send({ message: 'Could not create user (username/email may already be taken)' });
                res.send({ message: 'User created successfully' });
            });
        });

        //UPDATE A USER'S NAME/EMAIL/ROLE (admin only)
        this.app.put('/api/users/:id', verifyToken, requireRole('admin'), (req, res) => {
            const { name, email, role } = req.body;

            if(!name || !['admin', 'librarian', 'member'].includes(role))
                return res.status(400).send({ message: 'name and a valid role are required' });

            const sql = `UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?`;

            this.db.query(sql, [name, email, role, req.params.id], (err, result) => {
                if(err)
                    return res.status(400).send({ message: 'Could not update user' });
                res.send({ message: 'User updated successfully' });
            });
        });

        //DELETE A USER (admin only, can't delete your own account)
        this.app.delete('/api/users/:id', verifyToken, requireRole('admin'), (req, res) => {
            if(Number.parseInt(req.params.id) === req.user.id)
                return res.status(400).send({ message: "You can't delete your own account" });

            const sql = `DELETE FROM users WHERE id = ?`;

            this.db.query(sql, [req.params.id], (err, result) => {
                if(err)
                    return res.status(400).send({ message: 'Could not delete user' });
                res.send({ message: 'User deleted successfully' });
            });
        });
    }

    catalog() {

        //ADD A BOOK (admin/librarian only)
        this.app.post('/api/books', verifyToken, requireRole('admin', 'librarian'), (req, res) => {
            const { name, author, semester, count } = req.body;

            if(!name || !author || !semester || count === undefined)
                return res.status(400).send({ message: 'name, author, semester and count are required' });

            const sql = `INSERT INTO book (name, author, semester, count) VALUES (?, ?, ?, ?)`;

            this.db.query(sql, [name, author, semester, count], (err, result) => {
                if(err)
                    return res.status(400).send({ message: 'Could not add book' });
                res.send({ message: 'Book added successfully' });
            });
        });

        //UPDATE A BOOK (admin/librarian only)
        this.app.put('/api/books/:id', verifyToken, requireRole('admin', 'librarian'), (req, res) => {
            const { name, author, semester, count } = req.body;

            if(!name || !author || !semester || count === undefined)
                return res.status(400).send({ message: 'name, author, semester and count are required' });

            const sql = `UPDATE book SET name = ?, author = ?, semester = ?, count = ? WHERE id = ?`;

            this.db.query(sql, [name, author, semester, count, req.params.id], (err, result) => {
                if(err)
                    return res.status(400).send({ message: 'Could not update book' });
                res.send({ message: 'Book updated successfully' });
            });
        });

        //DELETE A BOOK (admin/librarian only)
        this.app.delete('/api/books/:id', verifyToken, requireRole('admin', 'librarian'), (req, res) => {
            const sql = `DELETE FROM book WHERE id = ?`;

            this.db.query(sql, [req.params.id], (err, result) => {
                if(err)
                    return res.status(400).send({ message: 'Could not delete book (it may still have active borrows)' });
                res.send({ message: 'Book deleted successfully' });
            });
        });
    }

    listen() {
        this.app.listen(this.port, (err) => {
            if(err)
                console.log(err);
            else
                console.log(`Server Started On ${this.port}`);
        })
    }

}

let library = new LIBRARY(3001, express());
library.get();
library.auth();
library.dashboard();
library.users();
library.catalog();
library.listen();