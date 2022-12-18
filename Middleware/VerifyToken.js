require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token || token === undefined) {
        return res.status(404).json({success: false, error: "Unauthorised access!"});
    }
    try {
    const verifiedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verifiedUser.user;
    next();
    } catch (err) {
        return res.status(404).json({success: false, error: "Token expired"});
    }
}

module.exports = {verifyToken};