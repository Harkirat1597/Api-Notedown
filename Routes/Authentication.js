require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const db = require('../Database/dbUser.js');
const fn = require('../Middleware/VerifyToken.js');

const router = express.Router();

router.post('/sign-up', [
    body('username', 'Enter a valid name').isLength({ min: 3 }),
    body('password', 'Password must be 7 characters').isLength({ min: 7 }),
    body('email', 'Enter a valid email address').isEmail()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(404).json({ success: false, error: errors.array() });
        }

        let { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(404).json({ success: false, error: "Invalid input" });
        }

        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        const user = { username, email, password };

        const userExists = await db.userExists(user);
        if (userExists) {
            return res.status(200).json({ success: false, error: "User exists please login" });
        }

        const addUser = await db.insertUser(user);

        if (!addUser) return res.status(404).json({ success: false, error: "User not added" });

        return res.status(200).json({ success: true, message: "User added successfully" });
    }
    catch (err) {
        console.log(err.message);
        return res.status(404).json({ success: false, error: "Internal server error" });
    }
});


router.post('/sign-in', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(404).json({ success: false, error: errors.array() });
        }
        let { email, password } = req.body;

        let user = { email, password };
        user = await db.getUser(user);
        if (!user) {
            return res.status(200).json({ success: false, error: "Username or password in invalid" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(200).json({ success: false, error: "Wrong email or password entered" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const jsontoken = jwt.sign(
            data,
            process.env.ACCESS_TOKEN_SECRET,
            // {expiresIn: '30m'}
        );
        // return res.redirect('/api/auth/render-user');
        return res.status(200).json({ success: true, message: "User sign-in succesful", jsontoken, userDetails: { username: user.username, email: user.email } });
    }
    catch (err) {
        console.log(err.message);
        return res.status(404).json({ success: false, error: "Internal server error" });
    }
})


router.put('/changePassword', [
    body('email', 'Enter a valid email').isEmail(),
    body('oldpass', 'Invalid password').exists(),
    body('newpass', 'Invalid password').exists()
], fn.verifyToken, async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(404).json({ success: false, error: "Inputs are invalid" });
        }

        let { oldpass, newpass, email } = req.body;

        let user = { email, password: oldpass };
        user = await db.getUser(user);
        if (!user) {
            return res.status(404).json({ success: false, error: "Invalid details" });
        }

        const passwordCompare = await bcrypt.compare(oldpass, user.password);
        if (!passwordCompare) return res.status(200).json({ success: false, error: "Incorrect password entered" });

        const salt = await bcrypt.genSalt(10);
        newpass = await bcrypt.hash(newpass, salt);

        const passwordUpdate = await db.updatePassword({ email, password: newpass });
        if (!passwordUpdate) return res.status(404).json({ success: false, error: "Unable to update password" });

        return res.status(200).json({ success: true, message: "Password changed" });

    } catch (err) {
        console.error(err.message);
        return res.status(404).json({ success: false, error: "Internal server error" });
    }
});


module.exports = router;