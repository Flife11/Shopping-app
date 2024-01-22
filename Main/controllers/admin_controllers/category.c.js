const Categories = require('../../models/category.m');
const SubCategories = require('../../models/subcategory.m');

const RenderCategory = async(req, res, next) => {
    try {
        let categoryname = req.query.name || '';
        let page = 1;
        let perpage = 10;        
                
        if (req.query.page)
            page = parseInt(req.query.page);
        if (req.query.limit)
            perpage = parseInt(req.query.limit);

        let data = await Categories.getCategories(categoryname);                
        
        const totalItems = data.length;
        const totalPage = (totalItems / perpage) + (totalItems % perpage != 0);
        
        // console.log(page, perpage);
        data = data.slice((page - 1) * perpage, page * perpage);
        res.render('product', {
            title: 'Admin',
            header: 'LOẠI SẢN PHẨM',
            newurl: '/admin/category/new',                        
            name: categoryname,
            nameVal: '',            
            data: data,
            page: page,
            perpage: perpage,                        
            totalpage: Array.from({length: totalPage}, (e, i)=> i+1),
            deleteurl: 'http://localhost:3000/admin/category/delete'
        })
    } catch (error) {
        next(error);
    }
}

const DeleteCategory = async(req, res, next) => {
    try {
        const { listID } = req.body;
        // console.log(listID);
        Categories.delete(listID);
        res.status(201).json({url: 'http://localhost:3000/admin/category'});
    } catch (error) {
        next(error);
    }
}

const NewCategory = async(req, res, next) => {
    try {
        let categories = await Categories.getAll();        
        
        res.render('newproduct', {
            title: 'Admin',
            header: 'Thêm loại sản phẩm',
            posturl: 'http://localhost:3000/admin/category/new',
            cancelurl: 'http://localhost:3000/admin/category',
            nameCol: 'Tên loại sản phẩm',
            catnameCol: 'Loại sản phẩm cha',
            categories: [{id: 0, name: 'Không có'}, ...categories],
        });
    } catch (error) {
        next(error);
    }
}

const CreateCategory = async(req, res, next) => {
    try {
        let {name, category} = req.body;
        console.log(name, category);
        if (category==0) {
            Categories.insert(name);
        } else {
            SubCategories.insert(name, category);
        }

        res.redirect('http://localhost:3000/admin/category/new');
    } catch (error) {
        next(error);
    }
}

const DeatilCategory = async(req, res, next) => {
    try {
        
    } catch (error) {
        next(error);
    }
}

module.exports = {RenderCategory, DeleteCategory, NewCategory, CreateCategory, DeatilCategory}