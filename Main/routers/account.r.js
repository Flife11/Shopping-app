const router = require('express').Router();
const passport = require('passport');

const accountController = require('../controllers/account.c.js');

// Free routes
// TODO: Xử lý nếu login rồi thì quay về '/account'

router.get('/login', accountController.getLogin);
router.get('/register', accountController.getRegister);

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



// Authenticated routes (require login)
// Ví dụ: xem profile, sửa profile, xem orders, chi tiết orders, thanh toán,...
//  TODO: Xử lý nếu chưa login thì quay về '/account/login'
// TODO: Tạo middleware quản lý: đã login? chưa login? là admin? là client? và import vào admin lẫn client để bảo vệ routing
router.get('/', (req, res) => {
    res.send('Trang chu cua account') //xoa cho nay
});



module.exports = router;