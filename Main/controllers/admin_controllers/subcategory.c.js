const SubCategories = require('../../models/subcategory.m');
const Categories = require('../../models/category.m');

const RenderSubcategory = async(req, res, next) => {
    try {
        let subcategoryname = req.query.name || '';
        let page = 1;
        let perpage = 10;
                
        if (req.query.page)
            page = parseInt(req.query.page);
        if (req.query.limit)
            perpage = parseInt(req.query.limit);

        let data = await SubCategories.getSubcategories(subcategoryname);                
        
        const totalItems = data.length;
        const totalPage = (totalItems / perpage) + (totalItems % perpage != 0);
        
        // console.log(page, perpage);
        data = data.slice((page - 1) * perpage, page * perpage);
        data = data.filter(d => {            
            d.detailurl = '/admin/subcategory/detail/';
            return d;
        })
        res.render('product', {
            title: 'Admin',
            header: 'LOẠI SẢN PHẨM PHỤ',
            newurl: '/admin/category/new',
            name: subcategoryname,            
            data: data,
            page: page,
            perpage: perpage,                        
            totalpage: Array.from({length: totalPage}, (e, i)=> i+1),
            deleteurl: 'http://localhost:3000/admin/subcategory/delete'
        })
    } catch (error) {
        next(error);
    }
}

const DeleteSubcategory = async(req, res, next) => {
    try {
        const { listID } = req.body;
        console.log(listID);
        SubCategories.delete(listID);
        // res.status(201).json({url: 'http://localhost:3000/admin/category'});
    } catch (error) {
        next(error);
    }
}

const DetailSubCategory = async(req, res, next) => {
    try {
        let id = req.params.id;
        let subcat = await SubCategories.getSubcategory(id);
        // console.log(cat);             
        let categories = await Categories.getAll();        
        let catidVal = 0;
        let subcatidVal = 0;        
        
        categories.forEach((cat, index) => {
            if (cat.id==subcat.catid) catidVal = index;
        });                

        res.render('newproduct', {
            title: 'Admin',
            header: 'Chi tiết loại sản phẩm phụ',
            posturl: 'http://localhost:3000/admin/subcategory/update',
            cancelurl: `http://localhost:3000/admin/category/detail/${subcat.catid}`,            
            // Tên các fields cần điền
            nameCol: 'Tên loại sản phẩm phụ', 
            catnameCol: 'Loại sản phẩm cha', 
            // Giá trị của cá fielfs nếu có thì sẽ là detail không sẽ là create
            idVal: subcat.id,
            nameVal: subcat.name,
            catidVal,
            subcatidVal,
            // Dữ liệu
            categories,
        })
    } catch (error) {
        next(error);
    }
}

const UpdateSubCategory = async(req, res, next) => {
    try {
        let {id, name} = req.body;
        // console.log(id, name);
        SubCategories.update(id, name[0]);
        res.redirect('http://localhost:3000/admin/subcategory');
    } catch (error) {
        next(error);
    }
}

module.exports = {RenderSubcategory, DeleteSubcategory, DetailSubCategory, UpdateSubCategory}