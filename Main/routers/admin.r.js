const { RenderAdmin, getOrders, getCategory,getTotalHome } = require('../controllers/admin.c');
const {  RenderCategory, DeleteCategory, NewCategory, CreateCategory, UpdateCategory, DetailCategory } = require('../controllers/admin_controllers/category.c')
const { RenderProduct, DeleteProduct, NewProduct, CreateProduct, UpdateProduct, DetailProduct } = require('../controllers/admin_controllers/product.c');
const multer  = require('multer');
const { DeleteSubcategory, DetailSubCategory, RenderSubcategory, UpdateSubCategory } = require('../controllers/admin_controllers/subcategory.c');
const { RenderUser, DeleteUser, NewUser, CreateUser, UpdateUser, DetaiilUser } = require('../controllers/admin_controllers/user.c');
const upload = multer({ dest: 'Main/public/image' })

const {isAdmin} = require('../middleware/checkLogin');

const router = require('express').Router();
//TODO: bảo vệ các route bên dưới (middleware checkLogin)

// product
router.get('/',isAdmin, RenderAdmin);
router.get('/product',isAdmin, RenderProduct);
router.post('/product/delete',isAdmin, DeleteProduct);
router.get('/product/new',isAdmin, NewProduct);
router.post('/product/new',isAdmin, upload.single('image'), CreateProduct);
router.get('/product/detail/:id',isAdmin, upload.single('image'), DetailProduct);
router.post('/product/update',isAdmin, upload.single('image'), UpdateProduct);

//category
router.get('/category',isAdmin, RenderCategory);
router.post('/category/delete',isAdmin, DeleteCategory);
router.get('/category/new',isAdmin, NewCategory);
router.post('/category/new',isAdmin, upload.none(), CreateCategory);
router.get('/category/detail/:id',isAdmin, upload.none(), DetailCategory);
router.post('/category/update',isAdmin, upload.none(), UpdateCategory);

//subcategory
router.get('/subcategory',isAdmin, RenderSubcategory);
router.post('/subcategory/delete',isAdmin, DeleteSubcategory);
router.get('/subcategory/detail/:id',isAdmin, upload.none(), DetailSubCategory);
router.post('/subcategory/update',isAdmin, upload.none(), UpdateSubCategory);

//user
router.get('/user',isAdmin, RenderUser);
router.post('/user/delete',isAdmin, DeleteUser);
router.get('/user/new',isAdmin, NewUser);
router.post('/user/new',isAdmin, upload.none(), CreateUser);
router.get('/user/detail/:id',isAdmin, upload.none(), DetaiilUser);
router.post('/user/update',isAdmin, upload.none(), UpdateUser);


//home
router.post('/getOrders', getOrders);
router.post('/getCategory',getCategory);
router.post('/getTotalHome',getTotalHome);

module.exports = router;