// Require npm packages
require("dotenv").config();
const express = require("express");
const { engine } = require('express-handlebars');

// Require custom modules
const db = require('./utilities/db');

// Setting up express app
const app = express();

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './Main/views');

app.use(express.urlencoded({ extended: true }))
app.use(express.json());

app.use('/image', express.static(__dirname + "/public/image"));

const port = process.env.PORT | 3000;
const host = process.env.HOST || 'localhost';

// Require routers

// Setting up routers (use)

// Setting up error handler
app.use((err, req, res, next) => {
    res.status(500).send('Something broke!');
})

// Initialize database
db.initDatabase().then(() => {
    app.listen(port, () => console.log(`Server is running at http://${host}:${port}`));
}).catch(err => {
    console.error(`Failed to initialize database: ${err}`);
});

