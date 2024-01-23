const { RenderAdmin } = require('../controllers/admin.c');
const {  RenderCategory, DeleteCategory, NewCategory, CreateCategory, DeatilCategory, UpdateCategory } = require('../controllers/admin_controllers/category.c')
const { RenderProduct, DeleteProduct, NewProduct, CreateProduct, DeatilProduct, UpdateProduct } = require('../controllers/admin_controllers/product.c');
const multer  = require('multer');
const { DeleteSubcategory, DeatilSubCategory } = require('../controllers/admin_controllers/subcategory.c');
const {getOrders,getCategory}= require('../controllers/admin_controllers/home.c')
const upload = multer({ dest: 'Main/public/image' })
    
const router = require('express').Router();
// product
router.get('/', RenderAdmin);
router.get('/product', RenderProduct);
router.post('/product/delete', DeleteProduct);
router.get('/product/new', NewProduct);
router.post('/product/new', upload.single('image'), CreateProduct);
router.get('/product/detail/:id', upload.single('image'), DeatilProduct);
router.post('/product/update', upload.single('image'), UpdateProduct);

//category
router.get('/category', RenderCategory);
router.post('/category/delete', DeleteCategory);
router.get('/category/new', NewCategory);
router.post('/category/new', upload.none(), CreateCategory);
router.get('/category/detail/:id', upload.none(), DeatilCategory);
router.post('/category/update', upload.none(), UpdateCategory);

//subcategory
router.post('/subcategory/delete', DeleteSubcategory);
router.get('/subcategory/detail/:id', upload.none(), DeatilSubCategory);
//user


//home
router.post('/getOrders',getOrders);
router.post('/getCategory',getCategory);

module.exports = router;