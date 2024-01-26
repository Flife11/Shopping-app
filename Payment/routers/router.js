const router = require('express').Router();

const payCtrl= require('../controllers/pay.ctrl');

router.post('/createuser',payCtrl.createUserBalance);
router.post('/payment',payCtrl.payment);
router.post('/historypayment',payCtrl.historypayment);
router.post('/getbalance',payCtrl.getbalance);
router.post('/deleteuser', payCtrl.deleteUser);

module.exports = router;