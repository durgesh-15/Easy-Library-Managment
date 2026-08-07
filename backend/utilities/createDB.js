const mysql = require('mysql');
const cred = require('./credentials');

class DATABASE {
    
    constructor(){
        this.db = mysql.createConnection(cred);
        this.sql = "CREATE DATABASE IF NOT EXISTS library";
    }

    initDB(callback) {
        this.db.query(this.sql, (err, result) => {
            if(err)
                console.log("Couldn't create database");
            else
                console.log(`Successfully created database `);
            this.db.end();
            if(callback)
                callback(err);
        })
    }
}

module.exports = DATABASE;