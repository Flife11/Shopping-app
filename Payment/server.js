// Require npm packages
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser"); // necessary?
const https = require("https");
const fs = require("fs");
const jwt = require("jsonwebtoken");

// Require custom modules
const db = require('./utilities/db');
const secret = process.env.JWT_SECRET;
const mainURL = process.env.MAIN_URL;

// Setting up express app
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser()); // necessary?

app.use((req, res, next) => {
    const token = req.headers['authorization'];

    if(!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        if (decoded.url == mainURL) {
            next();
        }
        else {
            return res.status(401).json({ message: 'Forbidden - Invalid server' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
});

const credentials = {
    key: fs.readFileSync('./Payment/cert/demo.key'),
    cert: fs.readFileSync('./Payment/cert/demo.cert'),
    rejectUnauthorized: false,
};
app.use('/public', express.static(__dirname + "/public"));
const router = require('./routers/router');
const port = process.env.PAYMENT_PORT | 5000;
const host = process.env.HOST || 'localhost';

// Require routers

// Setting up routers (use)

// Setting up error handler
app.use((err, req, res, next) => {
    res.status(500).send('Something broke!');
})
app.use('/',router);
// Initialize database and start server
let server = https.createServer(credentials, app);
db.initDatabase().then(() => {
    server.listen(port, () => console.log(`Server is running at https://${host}:${port}`));
}).catch(err => {
    console.error(`Failed to initialize database: ${err}`);
});