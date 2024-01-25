const router = require('express').Router();
const passport = require('passport');

const accountController = require('../controllers/account.c.js');
const checkLogin = require('../middleware/checkLogin');
const {checkConnection} = require('../middleware/checkConnect2Server');

//TODO: chuyển tất cả handle login về controller, xóa 3 require ở dưới
const jwt = require('jsonwebtoken');
let secret = process.env.JWT_SECRET;
const corsHelper = require('../utilities/corsHelper');

// Logout
router.get('/logout', checkLogin.isLoggedIn, function (req, res) {
    req.logOut(err => {
        console.log(err);
    });
    res.redirect("/");
});


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
            // Render view if authentication fails (keep old username and password)
            let oldUsername = req.body.username;
            let oldPassword = req.body.password;

            return res.render('login', { title: 'Login', error: info, oldUsername: oldUsername, oldPassword: oldPassword });
        }
        req.logIn(user, async (err) => {
            if (err) {
                return next(err);
            }
            // Handle remember me
            if (req.body.rememberme) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            } else {
                req.session.cookie.expires = false;
            }

            // fetch to /getbalance (Payment server) user.id (by token) and assign to req.session.passport.user.balance
            if (user.role == "client") {
                let iduser = user.id;
                let token = jwt.sign({ iduser }, secret, { expiresIn: 24 * 60 * 60 });
                let data = { token: token };

                // Code to check `Connection from Server Main to Server Payment
                // Please add the code below to test the connection before sending any fetch to the Payment Server
                try {
                    const result = await checkConnection(req);
                    // console.log(result);
                    // if connection is successful => result = true,  else => result = false;
                    if (!result) {
                        res.status(500).json({ message: "Lỗi không thể kết nối đến Server Payment" });
                        return;
                    }
                }
                catch (error) {
                    console.log(error);
                }
                ///////////////////////////
                let PaymentURL = process.env.PAYMENT_URL;
                const corsToken = await corsHelper.generateCorsToken(req);
                let rs = await fetch(PaymentURL + '/getbalance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': corsToken
                    },
                    body: JSON.stringify(data)
                });

                let rsData = await rs.json();
                if (!rs.ok) {
                    return res.status(501).json({ message: rsData.message })
                }

                let balanceToken = rsData.token;
                let balanceData = jwt.verify(balanceToken, secret);
                req.session.passport.user.balance = balanceData.balance;
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
    failureRedirect: '/account/login'
}), async (req, res) => {

    // fetch to /getbalance (Payment server) user.id (by token) and assign to req.session.passport.user.balance
    if (req.session.passport.user.role == "client") {
        let iduser = req.session.passport.user.id;
        let token = jwt.sign({ iduser }, secret, { expiresIn: 24 * 60 * 60 });
        let data = { token: token };

        // Code to check `Connection from Server Main to Server Payment
        // Please add the code below to test the connection before sending any fetch to the Payment Server
        try {
            const result = await checkConnection(req);
            // console.log(result);
            // if connection is successful => result = true,  else => result = false;
            if (!result) {
                res.status(500).json({ message: "Lỗi không thể kết nối đến Server Payment" });
                return;
            }
        }
        catch (error) {
            console.log(error);
        }
        ///////////////////////////
        let PaymentURL = process.env.PAYMENT_URL;
        const corsToken = await corsHelper.generateCorsToken(req);
        let rs = await fetch(PaymentURL + '/getbalance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': corsToken
            },
            body: JSON.stringify(data)
        });

        let rsData = await rs.json();
        if (!rs.ok) {
            return res.status(501).json({ message: rsData.message })
        }

        let balanceToken = rsData.token;
        let balanceData = jwt.verify(balanceToken, secret);
        req.session.passport.user.balance = balanceData.balance;
    }

    res.redirect('/account');
});


// Authenticated routes (require login)
// Phải kiểm tra user đã login mới cho zô đây :0
// Ví dụ: xem profile, sửa profile, xem orders, chi tiết orders, thanh toán, nạp tiền,...

router.get('/', checkLogin.isClient, accountController.getAccount);

router.get('/editprofile', checkLogin.isClient, accountController.getEditprofile);
router.get('/editpassword', checkLogin.isClient, accountController.getEditpassword);
router.get('/addfund', checkLogin.isClient, accountController.getAddfund);
router.get('/checkout', checkLogin.isClient, accountController.getCheckout);
router.get('/orders/:id', checkLogin.isClient, accountController.getOrderDetail);
router.get('/orders', checkLogin.isClient, accountController.getOrders);


router.post('/addfund', accountController.postAddfund)
router.post('/editprofile', accountController.postEditprofile);
router.post('/editpassword', accountController.postEditpassword);
router.post('/checkout', accountController.postCheckout);



module.exports = router;