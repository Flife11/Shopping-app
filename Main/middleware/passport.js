// Require

const bcrypt = require('bcrypt');
const passport = require('passport');
require('dotenv').config();

const secret = process.env.JWT_SECRET;

const { MyStrategy } = require('../utilities/customSPP');
const userModel = require('../models/user.m');

// Start here

passport.serializeUser((user, done) => {
    done(null, user.username);
});
passport.deserializeUser(async (username, done) => {
    
    const user = await userModel.getUser(username);
    console.log(user); //
    if (!user) {
        return done("Invalid user", null);
    }
    done(null, user);

});

module.exports = app => {

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new MyStrategy({}, async (username, password, done) => {

        const user = await userModel.getUser(username);

        let auth = false;
        if (user) {
            auth = await bcrypt.compare(password, user.password);
        }
        if (auth) {
            return done(null, user);
        }

        done("Invalid authentication", false);
        
    }));

};