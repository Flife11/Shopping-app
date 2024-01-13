const router = require('express').Router();

const payCtrl= require('../controllers/pay.ctrl');

router.post('/createuser',payCtrl.createUserBalance);
router.post('/payment',payCtrl.payment);
router.post('/historypayment');
router.post('/getbalance');

module.exports = router;