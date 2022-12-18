require('dotenv').config();
const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: process.env.DB_CONNECTION_LIMIT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

const db = {};

db.insertUser = (user) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO users SET?`, user, (err, result) => {
            if (err) {
                return reject(err);
            }
            return resolve(result);
        });
    });
}

db.userExists = (user) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT EXISTS ( SELECT * FROM users WHERE email = "${user.email}" ) AS output`, (err, result) =>{ 
            if (err) return reject(err);
            if (result[0].output === 1) return resolve(true);
            else if (result[0].output === 0) return resolve(false);
        })
    })
}

db.getUser = (user) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM users WHERE email="${user.email}"`, (err, result) => {
            if (err) return reject(err);
            return resolve(result[0]);
        })
    })
}

db.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT id, username, email FROM users WHERE id=${id}`, (err, result) => {
            if (err) return reject(err);
            return resolve(result[0]);
        })
    })
}

db.getAllUsers = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM users`, (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        })
    })
}

db.updatePassword = (user) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE users SET password="${user.password}" WHERE email="${user.email}"`, (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
}

module.exports = db;