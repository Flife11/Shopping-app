const categoryModel = require('../models/category.m');
const subcategoryModel = require('../models/subcategory.m');

// Pass isLoggedin vào render: dùng req.isAuthenticated()

module.exports = {

    getHome: async function (req, res) {
        const categories = await categoryModel.getAll();
        const subcategories = await subcategoryModel.getAll();
        
        res.render('home', { title: 'Trang chủ', categories: categories, subcategories: subcategories, isLoggedin: req.isAuthenticated() });
    },
}