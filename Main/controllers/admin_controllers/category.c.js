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
        data = data.filter(d => {            
            d.detailurl = '/admin/category/detail/';
            return d;
        })
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
            catidVal: 0,
            subcatidVal: 0,
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
        let id = req.params.id;
        let cat = await Categories.getCategory(id);
        // console.log(cat);             
        let subcategories = await SubCategories.getAll();
        let subcatlist = [];
        let catidVal = 0;
        let subcatidVal = 0;

        let page = 1;
        let perpage = 10;        
        
        subcategories.forEach(sub => {
            if (sub.catid==cat.id) subcatlist.push(sub);
        });
        subcategories = subcategories.filter(d => {            
            d.detailurl = '/admin/subcategory/detail/';
            return d;
        })
        const totalItems = subcatlist.length;
        const totalPage = (totalItems / perpage) + (totalItems % perpage != 0);
        // console.log(catidVal, subcatidVal);

        res.render('newproduct', {
            title: 'Admin',
            header: 'Thêm loại sản phẩm',
            posturl: 'http://localhost:3000/admin/category/update',
            cancelurl: 'http://localhost:3000/admin/category',
            deleteurl: 'http://localhost:3000/admin/subcategory/delete',
            // Tên các fields cần điền
            nameCol: 'Tên loại sản phẩm',
            subcatCol: 'Loại sản phẩm con',
            // Giá trị của cá fielfs nếu có thì sẽ là detail không sẽ là create
            idVal: cat.id,
            nameVal: cat.name,
            catidVal,
            subcatidVal,
            // Dữ liệu            
            data: subcatlist,
            page: page, 
            perpage: perpage,
            totalpage: Array.from({length: totalPage}, (e, i)=> i+1),
        })
    } catch (error) {
        next(error);
    }
}

const UpdateCategory = async(req, res, next) => {
    try {
        let {id, name} = req.body;
        // console.log(id, name);
        Categories.update(id, name[0]);
        res.redirect('http://localhost:3000/admin/category');
    } catch (error) {
        next(error);
    }
}

module.exports = {RenderCategory, DeleteCategory, NewCategory, CreateCategory, DeatilCategory, UpdateCategory}