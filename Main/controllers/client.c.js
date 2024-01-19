const categoryModel = require('../models/Category.m');
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
        let products = await productModel.getAll();

        const page = req.query.page ? parseInt(req.query.page) : 1;
        const perpage = req.query.perpage ? parseInt(req.query.perpage) : 10;

        const total_page = Math.ceil(products.length / perpage);
        const pre_page = page - 1 > 0 ? page - 1 : 1;
        const next_page = page + 1 <= total_page ? page + 1 : total_page;
        products = products.slice((page - 1) * perpage, page * perpage);


        res.render('home', { title: 'Trang chủ', categories: categories, subcategories: subcategories, products: products, isLoggedin: req.isAuthenticated(), user: user, total_page: total_page, next_page: next_page, pre_page: pre_page, page: page});
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


        // Filter sort
        if(req.query.sort) {
            if(req.query.sort == 'priceasc') {
                products.sort((a, b) => a.price - b.price);
            } else if(req.query.sort == 'pricedesc') {
                products.sort((a, b) => b.price - a.price);
            } else if(req.query.sort == 'quantityasc') {
                products.sort((a, b) => a.quantity - b.quantity);
            } else if(req.query.sort == 'quantitydesc') {
                products.sort((a, b) => b.quantity - a.quantity);
            }
        }

        //TODO: pagination

        // Render view
        res.render('listproduct', { title: 'Danh sách sản phẩm', categories: categories, subcategories: subcategories, products:products, isLoggedin: req.isAuthenticated(), user: user });
    },
}