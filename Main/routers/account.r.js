const router = require('express').Router();
const accountController = require('../controllers/account.c.js');

// Free routes
// TODO: Xử lý nếu login rồi thì quay về '/account'
router.get('/login', accountController.getLogin);
router.get('/register', accountController.getRegister);

//router.post('/login', accountController.postLogin);
//router.post('/register', accountController.postRegister);


// Authenticated routes (require login)
// Ví dụ: xem profile, sửa profile, xem orders, chi tiết orders, thanh toán,...
//  TODO: Xử lý nếu chưa login thì quay về '/account/login'

module.exports = router;