// Require

const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_SECRET;

const { MyStrategy, GGStrategy } = require('../utilities/customSPP');
const userModel = require('../models/user.m');

// Start here

passport.serializeUser((user, done) => {
    done(null, { username: user.username, role: user.role });
});
passport.deserializeUser(async (user, done) => {

    const userInfo = await userModel.getUser(user.username);
    //console.log(user); //
    if (!userInfo) {
        return done("User không hợp lệ!", null);
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

        done("Tên đăng nhập hoặc mật khẩu sai!", false);

    }));

    passport.use(new GGStrategy({}, async (token, done) => {

        if (token) {
            jwt.verify(token, secret, async (err, user) => {
                if (err) {
                    console.log(err)
                    return done(err, false);
                }
                return done(null, user);
            });
        }
        else {
            return done("Xác thực thất bại!", false);
        }
    }));

};