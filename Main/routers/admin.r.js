const { RenderAdmin } = require('../controllers/admin.c');
const { RenderProduct, DeleteProduct } = require('../controllers/admin_controllers/product.c');

const router = require('express').Router();

router.get('/', RenderAdmin)
router.get('/product', RenderProduct);
router.post('/product/delete', DeleteProduct);

module.exports = router;