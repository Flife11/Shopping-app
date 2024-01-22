const SubCategories = require('../../models/subcategory.m');
const Categories = require('../../models/category.m');

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

const DeatilSubCategory = async(req, res, next) => {
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

module.exports = {DeleteSubcategory, DeatilSubCategory}