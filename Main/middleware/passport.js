// Require

const bcrypt = require('bcrypt');
const passport = require('passport');
require('dotenv').config();

const secret = process.env.JWT_SECRET;

const { MyStrategy } = require('../utilities/customSPP');
const userModel = require('../models/user.m');

// Start here

passport.serializeUser((user, done) => {
    done(null, { username: user.username, role: user.role });
});
passport.deserializeUser(async (user, done) => {

    const userInfo = await userModel.getUser(user.username);
    //console.log(user); //
    if (!userInfo) {
        return done("Invalid user", null);
    }
    done(null, userInfo);

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

        done("Wrong username or password!", false);

    }));

};