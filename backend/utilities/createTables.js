const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const cred = require('./credentials');

class TABLES {

    constructor(){

        this.db = mysql.createConnection({
            ...cred,
            database: 'library'
        });

        this.sql = {
            student: 'CREATE TABLE IF NOT EXISTS student(id int AUTO_INCREMENT, name VARCHAR(255), fine float(6,2) DEFAULT 0, PRIMARY KEY (id))',
            books: 'CREATE TABLE IF NOT EXISTS book(id int AUTO_INCREMENT, name VARCHAR(255), author VARCHAR(255), semester int(1), count int, PRIMARY KEY (id))',
            borrow: "CREATE TABLE IF NOT EXISTS borrow(idStudent int, idBook int, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, deadline TIMESTAMP DEFAULT (DATE_ADD(CURRENT_TIMESTAMP(),INTERVAL 7 DAY)),\
                     PRIMARY KEY (idStudent, idBook),\
                     FOREIGN KEY(idStudent) REFERENCES student(id),\
                     FOREIGN KEY(idBook) REFERENCES book(id))",
            users: "CREATE TABLE IF NOT EXISTS users(id int AUTO_INCREMENT, name VARCHAR(255), email VARCHAR(255) UNIQUE, username VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL,\
                     role ENUM('admin', 'librarian', 'member') DEFAULT 'member', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id))"
        };

    }

    initTable() {
        for(let i in this.sql){
            this.db.query(this.sql[i], (err, result) => {
                if(err)
                    console.log(`Couldn't create table ${i}`);
                else
                    console.log(`Successfully created table ${i}`);

                if(i === 'users' && !err)
                    this.seedAdmin();
            })
        }
    }

    seedAdmin() {
        this.db.query(`SELECT id FROM users WHERE username = 'admin'`, (err, result) => {
            if(!err && result.length === 0){
                const hashed = bcrypt.hashSync('Admin@123', 10);
                this.db.query(
                    `INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, 'admin')`,
                    ['Administrator', 'admin@library.local', 'admin', hashed],
                    (err) => {
                        if(err)
                            console.log("Couldn't seed default admin");
                        else
                            console.log('Default admin created (username: admin, password: Admin@123)');
                    }
                );
            }
        });
    }
}

module.exports = TABLES;