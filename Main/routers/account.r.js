const router = require('express').Router();
const passport = require('passport');

const accountController = require('../controllers/account.c.js');
const checkLogin = require('../middleware/checkLogin');

// Logout
// TODO: Tạo 1 nút logout trên header của logged in, method post, gửi request tới /account/logout
// TODO: Tạo header cho logged in và not logged in


// Free routes
// Phải kiểm tra user chưa login mới cho zô đây

router.get('/login', checkLogin.isNotLoggedIn, accountController.getLogin);
router.get('/register', checkLogin.isNotLoggedIn, accountController.getRegister);

router.post('/register', accountController.postRegister);
router.post('/login', (req, res, next) => {
    passport.authenticate('myStrategy', (err, user, info) => {
        if (err) {
            return next(err); // Handle error
        }
        if (!user) {
            // Render view if authentication fails
            return res.render('login', { title: 'Login', error: info });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Handle remember me
            if (req.body.rememberme) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            } else {
                req.session.cookie.expires = false;
            }

            // Redirect based on role
            let role = req.session.passport.user.role;
            if (role == "admin") {
                res.redirect("/admin");
            } else if (role == "client") {
                res.redirect("/account");
            }
        });
    })(req, res, next);
});

router.get('/google/auth', checkLogin.isNotLoggedIn, accountController.authGoogle);
router.get('/google', checkLogin.isNotLoggedIn, accountController.renderGoogleLogin);
router.get('/assignpassportGoogle', checkLogin.isNotLoggedIn, passport.authenticate('google', {
    failureRedirect: '/account/login',
    successRedirect: '/account'
}));


// Authenticated routes (require login)
// Phải kiểm tra user đã login mới cho zô đây :0
// Ví dụ: xem profile, sửa profile, xem orders, chi tiết orders, thanh toán, nạp tiền,...

router.get('/', checkLogin.isClient,(req, res) => {
    res.send('Trang chu cua account') //xoa cho nay
});
router.get('/orders/:id', checkLogin.isClient, ); //them cho nay
router.get('/orders', checkLogin.isClient, ); //them cho nay




module.exports = router;