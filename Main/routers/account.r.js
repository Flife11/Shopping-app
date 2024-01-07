const router = require('express').Router();
const passport = require('passport');

const accountController = require('../controllers/account.c.js');

// Free routes
// TODO: Xử lý nếu login rồi thì quay về '/account'

router.use((req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect("/account");
    }
    next();
});

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
        
        // Send success response
        return res.status(200).json({ message: 'Authentication successfully',redirectUrl: redirectUrl });
    })(req, res, next);
});



// Authenticated routes (require login)
// Ví dụ: xem profile, sửa profile, xem orders, chi tiết orders, thanh toán,...
router.use((req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/account/login");
    }
    next();
});
router.get('/', (req, res) => {
    res.send('Trang chu cua account')
});

//  TODO: Xử lý nếu chưa login thì quay về '/account/login'

module.exports = router;