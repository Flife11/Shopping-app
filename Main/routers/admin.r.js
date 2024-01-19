const { RenderAdmin } = require('../controllers/admin.c');
const { RenderProduct } = require('../controllers/admin_controllers/product.c');

const router = require('express').Router();

router.get('/', RenderAdmin)
router.get('/product', RenderProduct);

module.exports = router;