// Require npm packages
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser"); // necessary?
let cors = require("cors");
const https = require("https");
const fs = require("fs");

// Require custom modules
const db = require('./utilities/db');

// Setting up express app
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser()); // necessary?

app.use(cors({
    origin: `http://localhost:${process.env.MAINPORT}`,
    credentials: true,
}));


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