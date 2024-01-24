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
            notiAppearance: 1,
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
        // console.log(name, category);        
        if (category==0) {
            let check = await Categories.checkExist(name);            
            if (!check) {
                Categories.insert(name);
                return res.status(201).json({
                    message: 'Tạo loại sản phẩm thành công',
                    redirecturl: 'http://localhost:3000/admin/category'
                }) 
            }
            else {
                return res.status(401).json({
                    message: 'Tên loại sản phẩm không được trùng',
                    redirecturl: 'http://localhost:3000/admin/category/new'
                });
            }
        } else {
            let check = await SubCategories.checkExist(name, category);            
            if (!check) {
                SubCategories.insert(name, category);
                return res.status(201).json({
                    message: 'Tạo loại sản phẩm phụ thành công',
                    redirecturl: 'http://localhost:3000/admin/category'
                }) 
            }
            else {
                return res.status(401).json({
                    message: 'Tên loại sản phẩm phụ không được trùng trong cùng 1 loại sản phẩm',
                    redirecturl: 'http://localhost:3000/admin/category/new'
                });
            }
        }               
    } catch (error) {
        next(error);
    }
}

const DetailCategory = async(req, res, next) => {
    try {
        let id = req.params.id;
        let category = req.params.category;
        let subcategoryname = req.query.name || '';        
        let cat = await Categories.getCategory(id);
        // console.log(cat);
        let categories = await Categories.getAll();    
        categories = [{id: 0, name: 'Không có'}, ...categories];
        categories.forEach((cat, index) => {
            if (cat.id==category) catidVal = index;
        });
        // console.log(categories);

        let subcategories = await SubCategories.getSubcategories(subcategoryname);
        let subcatlist = [];
        let catidVal = 0;
        let subcatidVal = 0;

        let page = 1;
        let perpage = 10;
        if (req.query.page)
            page = parseInt(req.query.page);
        if (req.query.limit)
            perpage = parseInt(req.query.limit);     
        
        subcategories.forEach(sub => {
            if (sub.catid==cat.id) subcatlist.push(sub);
        });

        const totalItems = subcatlist.length;
        const totalPage = (totalItems / perpage) + (totalItems % perpage != 0);
        
        subcatlist = subcatlist.slice((page - 1) * perpage, page * perpage);        
        subcatlist = subcatlist.filter(d => {            
            d.detailurl = '/admin/subcategory/detail/';
            return d;
        })

        res.render('newproduct', {
            title: 'Admin',
            header: 'Chi tiết loại sản phẩm',
            posturl: 'http://localhost:3000/admin/category/update',
            cancelurl: 'http://localhost:3000/admin/category',
            deleteurl: 'http://localhost:3000/admin/subcategory/delete',
            // Tên các fields cần điền
            nameCol: 'Tên loại sản phẩm',
            subcatCol: 'Loại sản phẩm con',
            name: subcategoryname,
            // Giá trị của cá fielfs nếu có thì sẽ là detail không sẽ là create
            idVal: cat.id,
            nameVal: cat.name,
            catidVal,
            subcatidVal,
            notiAppearance: 1,
            // Dữ liệu            
            data: subcatlist,
            page: page, 
            perpage: perpage,
            totalpage: Array.from({length: totalPage}, (e, i)=> i+1),
            categories
        })
    } catch (error) {
        next(error);
    }
}

const UpdateCategory = async(req, res, next) => {
    try {
        let {id, name, category} = req.body;
        // console.log(id, name);
        if (category==0) {
            let check = await Categories.checkExist(name);            
            if (!check) {
                Categories.update(id, name);
                return res.status(201).json({
                    message: 'Chỉnh sửa loại sản phẩm thành công',
                    redirecturl: 'http://localhost:3000/admin/category'
                })
            }
            else {
                return res.status(401).json({
                    message: 'Tên loại sản phẩm không được trùng',
                    redirecturl: 'http://localhost:3000/admin/category/new'
                });
            }
        } else {
            let checkChild = await Categories.checkChildExist(id);
            if (!checkChild) {
                let check = await SubCategories.checkExist(name, category);            
                if (!check) {
                    SubCategories.insert(name, category);
                    Categories.delete([id]);
                    return res.status(201).json({
                        message: 'Chỉnh sửa loại sản phẩm phụ thành công',
                        redirecturl: 'http://localhost:3000/admin/subcategory'
                    })
                } else {
                    return res.status(401).json({
                        message: 'Tên loại sản phẩm phụ không được trùng trong cùng 1 loại sản phẩm',
                        redirecturl: 'http://localhost:3000/admin/category/new'
                    });
                }
            }
            else {
                return res.status(401).json({
                    message: 'Loại sản phẩm này có loại sản phẩm phụ nên không thể thay đổi thành loại sản phẩm phụ',
                    redirecturl: 'http://localhost:3000/admin/category/new'
                });
            }
        }        
    } catch (error) {
        next(error);
    }
}

module.exports = {RenderCategory, DeleteCategory, NewCategory, CreateCategory, DetailCategory, UpdateCategory}