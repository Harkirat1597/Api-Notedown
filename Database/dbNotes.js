require('dotenv').config();
const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    user: 'root',
    password: 'password',
    database: 'notebookApp'
});

const db = {};

db.getAllNotes = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM notes`, (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
}

// Get all notes of a user
db.getNotes = (user) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM notes WHERE user_id=${user.id}`, (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
}

// Adding new Note to the database
db.addNote = (note) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO notes SET?`, note, (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
}

// Get specific note of a user 
db.findNote = (credentials) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM notes WHERE id=${credentials.noteId} AND user_id=${credentials.userId}`, (err, result) => {
            if (err) return reject(err);
            return resolve(result[0]);
        });
    });
}

// Updating an Existing note
db.updateNote = (note) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE notes SET title="${note.title}", description="${note.description}", tag="" WHERE id=${note.id}`, (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
}

db.updateTag = (obj) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE notes SET tag="${obj.key}" WHERE id=${obj.noteId} AND user_id=${obj.userId}`, (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        })
    })
}

// Delete an existing note
db.deleteNote = (credentials) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM notes WHERE id=${credentials.noteId} AND user_id=${credentials.userId}`, (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
}

db.searchNote = (details) => {
    return new Promise((resolve, reject) => {
        pool.query(` SELECT * FROM notes WHERE user_id=${details.userId} AND description like "%${details.text}%" OR user_id=${details.userId} AND title like "%${details.text}%"`, (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    })
}

module.exports = db;