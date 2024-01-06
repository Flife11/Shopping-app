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

app.use('/public', express.static(__dirname + "/public"));

const port = process.env.PORT | 3000;
const host = process.env.HOST || 'localhost';


// Require routers
const accountRouter = require('./routers/account.r.js');
const clientRouter = require('./routers/client.r.js');
const adminRouter = require('./routers/admin.r.js');


// Setting up routers and views
app.use('/account', (req, res, next) => {
    app.set('views', './Main/views/account');
    next();
}, accountRouter);

app.use('/admin', (req, res, next) => {
    app.set('views', './Main/views/admin');
    next();
}, adminRouter);

app.use('/', (req, res, next) => {
    app.set('views', './Main/views/client');
    next();
}, clientRouter);

// Setting up error handler
app.use((err, req, res, next) => {
    res.status(500).send('Something broke!');
})

// Initialize database and start server
db.initDatabase().then(() => {
    app.listen(port, () => console.log(`Server is running at http://${host}:${port}`));
}).catch(err => {
    console.error(`Failed to initialize database: ${err}`);
});

