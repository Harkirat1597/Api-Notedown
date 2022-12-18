require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
var cors = require('cors');
const app = express();

const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', require(path.join(__dirname, './Routes/Authentication.js')));
app.use('/api/notes', require(path.join(__dirname, './Routes/Notes.js')));

app.listen(port, () => {
    console.log(`Server running at port - ${port}`);
}); 