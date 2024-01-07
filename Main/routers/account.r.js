const router = require('express').Router();
const passport = require('passport');

const accountController = require('../controllers/account.c.js');

// Free routes
// TODO: Xử lý nếu login rồi thì quay về '/account'
router.get('/login', accountController.getLogin);
router.get('/register', accountController.getRegister);

router.post('/register', accountController.postRegister);
router.post('/login', (req, res, next) => {
    passport.authenticate('myStrategy', (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!user) {
            return res.status(404).json({ message: 'Wrong username or password!' });
        }

        // Authorization 
        let role = user.role;
        let redirectUrl = '';
        if (role === 'admin') {
            redirectUrl = '/admin';
        }
        else if (role === 'client') {
            redirectUrl = '/';
        }

        req.user = user;
        req.redirectUrl = redirectUrl;
        next();
    })(req, res, next);
}, (req, res) => {
    // Handle remember me
    if (req.body.rememberme) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    }
    else {
        req.session.cookie.expires = false;
    }
    console.log(req.session)

    // Send success response
    req.session.save(err => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        //Send success response
        //return res.status(200).json({ message: 'Authentication successfully', redirectUrl: req.redirectUrl });
    });
    res.redirect('/home')
});



// Authenticated routes (require login)
// Ví dụ: xem profile, sửa profile, xem orders, chi tiết orders, thanh toán,...
//  TODO: Xử lý nếu chưa login thì quay về '/account/login'

module.exports = router;