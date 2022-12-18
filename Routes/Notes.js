require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../Database/dbNotes.js');
const dbUsers = require('../Database/dbUser.js');
const fn = require('../Middleware/VerifyToken.js');

const router = express.Router();

router.get('/all-notes', fn.verifyToken, async (req, res, next) => {
    try {
        const id = req.user.id;
        if (!id || id === undefined) {
            res.status(404).json({success: false, error: "Invalid request"});
            return; 
        }
        const notes = await db.getNotes({id});
        if (!notes || notes.length <= 0) {
            return res.status(200).json({success: false, error: "No notes available"});
        }
        return res.status(200).json({success: true, notes: notes});
    } 
    catch(err) {
        console.log(err.message);
        return res.status(404).json({success: false, error: "Internal server error"});
    }
});


router.post('/add-note', [
    body('description', "No description to add").isLength({min: 1})
], fn.verifyToken, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(404).json({success: false, error: errors.array()});
        }

        const userId = req.user.id;
        const {title, description, tag} = req.body;

        const note = {
            user_id: userId,
            title: title,
            description: description,
            tag: tag
        }

        const newNote = await db.addNote(note);
        if (newNote) {
            return res.status(200).json({success: true, message: "New note added to the database"});
        }
        return res.status(404).json({success: false, error: "Unable to add note"});
    } 
    catch(err) {
        console.log(err.message);
        return res.status(404).json({success: false, error: "Internal server error"});
    }
}); 


router.put('/update-note/:id', [
    body("description", "No description to update").isLength({min: 1})
] , fn.verifyToken , async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(404).json({success: false, errors: error.array()});
        }

        const noteId = parseInt(req.params.id);
        const userId = req.user.id;
        const credentials = {noteId, userId};
        
        const note = await db.findNote(credentials);
        if (!note) return res.status(404).json({success: false, error: "Not found"});

        if (userId !== note.user_id) return res.status(404).json({success: false, error: "Unautorised user"});

        let {title, description, tag} = req.body;

        const newNote = {id: noteId, title, description, tag};

        const updateNote = await db.updateNote(newNote);
        if (updateNote) return res.status(200).json({success: true, message: "Note updated successfully"});

        return res.status(404).json({success: false, error: "Unable to update note"});
    } 
    catch(err) {
        console.log(err.message);
        return res.status(404).json({success: false, error: "Internal server error"});
    }
});

router.put('/update-tag/:id',
[body("tag", "No tag to update").isLength({min: 1})],
fn.verifyToken, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(404).json({success: false, error: error.array()});
    }

    const noteId = parseInt(req.params.id);
    const userId = req.user.id;
    const key = req.body.tag;

    const credentials = {userId, noteId};

    const note = await db.findNote(credentials);
    if (!note) return res.status(404).json({success: false, error: "Note not found"});

    const updateTag = await db.updateTag({noteId, userId, key});
    if (!updateTag) return res.status(404).json({success: false, error: "Unable to update tag"});

    return res.status(200).json({success: true, message: "Tag updated successfully"});
});

router.delete('/delete-note/:id', fn.verifyToken, async (req, res, next) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({success: false, error: "Invalid request"});
        }
        const noteId = parseInt(req.params.id);
        const userId = req.user.id;
        const credentials = {userId, noteId};

        const note = await db.findNote(credentials);
        if (!note) return res.status(404).json({success: false, error: "Note not found"});

        if (req.user.id !== note.user_id) return res.status(404).json({success: false, error: "Unauthorised access"});

        const deleteNote = await db.deleteNote(credentials);
        if (deleteNote) return res.status(200).json({success: true, message: "Note deleted succesfully"});

        return res.status(404).json({success: false, error: "Unable to delete note"});
    } 
    catch(err) {
        console.log(err.message);
        return res.status(404).json({success: false, error: "Internal server error"});
    }
});

router.get('/search-note/:text', fn.verifyToken, async (req, res, next) => {
    try {
        if (!req.params.text) {
            return res.status(404).json({success: false, error: "Invalid request"});
        }
        
        const text = req.params.text;
        const userId = req.user.id;

        const searchNote = await db.searchNote({text, userId});
        if (!searchNote) return res.status(404).json({success: false, error: "Note not found"});

        return res.status(200).json({success: true, notes: searchNote});
    } catch(err) {
        console.log(err.message);
        return res.status(404).json({success: false, error: "Internal server error"});
    }
});

module.exports = router;