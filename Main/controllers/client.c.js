const categoryModel = require('../models/category.m');
const subcategoryModel = require('../models/subcategory.m');
const productModel = require('../models/product.m');

// Pass isLoggedin vào render: dùng req.isAuthenticated()

module.exports = {

    getHome: async function (req, res) { //Sẽ thay đổi sau
        const categories = await categoryModel.getAll();
        const subcategories = await subcategoryModel.getAll();
        let user = null;
        if (req.isAuthenticated()) {
            user = req.session.passport.user;
        }
        
        res.render('home', { title: 'Trang chủ', categories: categories, subcategories: subcategories, isLoggedin: req.isAuthenticated(), user: user });
    },
    getListProduct: async function (req, res) { //Sẽ thay đổi sau
        
        // Get necessary data
        const categories = await categoryModel.getAll();
        const subcategories = await subcategoryModel.getAll();
        let user = null;
        if (req.isAuthenticated()) {
            user = req.session.passport.user;
        }
        let products = await productModel.getProducts(req.params.catid, req.params.subcatid, req.query.search);

        // Filter maxprice, minprice, maxquantity, minquantity for products
        let maxprice = Number.MAX_SAFE_INTEGER;
        let minprice = 0;
        let maxquantity = Number.MAX_SAFE_INTEGER;
        let minquantity = 0;

        if(req.query.maxprice) 
            maxprice = parseInt(req.query.maxprice);
        if(req.query.minprice)
            minprice = parseInt(req.query.minprice);
        if(req.query.maxquantity)
            maxquantity = parseInt(req.query.maxquantity);
        if(req.query.minquantity)
            minquantity = parseInt(req.query.minquantity);

        products = products.filter(product => product.price >= minprice && product.price <= maxprice && product.quantity >= minquantity && product.quantity <= maxquantity);

        // Render view
        res.render('listproduct', { title: 'Danh sách sản phẩm', categories: categories, subcategories: subcategories, products:products, isLoggedin: req.isAuthenticated(), user: user });
    },
}