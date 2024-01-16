const categoryModel = require('../models/category.m');
const subcategoryModel = require('../models/subcategory.m');

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
        const categories = await categoryModel.getAll();
        const subcategories = await subcategoryModel.getAll();
        let user = null;
        if (req.isAuthenticated()) {
            user = req.session.passport.user;
        }
        res.render('listproduct', { title: 'Danh sách sản phẩm', categories: categories, subcategories: subcategories, isLoggedin: req.isAuthenticated(), user: user });
    },
}