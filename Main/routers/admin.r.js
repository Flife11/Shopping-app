const { RenderAdmin } = require('../controllers/admin.c');
const { RenderProduct, DeleteProduct, NewProduct, CreateProduct } = require('../controllers/admin_controllers/product.c');
const multer  = require('multer')
const upload = multer({ dest: 'Main/public/image' })
    
const router = require('express').Router();

router.get('/', RenderAdmin)
router.get('/product', RenderProduct);
router.post('/product/delete', DeleteProduct);
router.get('/product/new', NewProduct);
router.post('/product/new', upload.single('image'), CreateProduct);

module.exports = router;