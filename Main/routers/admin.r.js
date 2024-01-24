const { RenderAdmin, getOrders, getCategory,getTotalHome } = require('../controllers/admin.c');
const {  RenderCategory, DeleteCategory, NewCategory, CreateCategory, UpdateCategory, DetailCategory } = require('../controllers/admin_controllers/category.c')
const { RenderProduct, DeleteProduct, NewProduct, CreateProduct, UpdateProduct, DetailProduct } = require('../controllers/admin_controllers/product.c');
const multer  = require('multer');
const { DeleteSubcategory, DetailSubCategory, RenderSubcategory, UpdateSubCategory } = require('../controllers/admin_controllers/subcategory.c');
const { RenderUser, DeleteUser, NewUser, CreateUser, UpdateUser, DetaiilUser } = require('../controllers/admin_controllers/user.c');
const upload = multer({ dest: 'Main/public/image' })
    
const router = require('express').Router();
//TODO: bảo vệ các route bên dưới (middleware checkLogin)

// product
router.get('/', RenderAdmin);
router.get('/product', RenderProduct);
router.post('/product/delete', DeleteProduct);
router.get('/product/new', NewProduct);
router.post('/product/new', upload.single('image'), CreateProduct);
router.get('/product/detail/:id', upload.single('image'), DetailProduct);
router.post('/product/update', upload.single('image'), UpdateProduct);

//category
router.get('/category', RenderCategory);
router.post('/category/delete', DeleteCategory);
router.get('/category/new', NewCategory);
router.post('/category/new', upload.none(), CreateCategory);
router.get('/category/detail/:id', upload.none(), DetailCategory);
router.post('/category/update', upload.none(), UpdateCategory);

//subcategory
router.get('/subcategory', RenderSubcategory);
router.post('/subcategory/delete', DeleteSubcategory);
router.get('/subcategory/detail/:id', upload.none(), DetailSubCategory);
router.post('/subcategory/update', upload.none(), UpdateSubCategory);

//user
router.get('/user', RenderUser);
router.post('/user/delete', DeleteUser);
router.get('/user/new', NewUser);
router.post('/user/new', upload.none(), CreateUser);
router.get('/user/detail/:id', upload.none(), DetaiilUser);
router.post('/user/update', upload.none(), UpdateUser);


//home
router.post('/getOrders',getOrders);
router.post('/getCategory',getCategory);
router.post('/getTotalHome',getTotalHome);

module.exports = router;