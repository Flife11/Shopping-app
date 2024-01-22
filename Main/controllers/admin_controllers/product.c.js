const Product = require('../../models/product.m');
const Categories = require('../../models/category.m');
const SubCategories = require('../../models/subcategory.m');
const fs = require('fs');

const RenderProduct = async (req, res, next) => {
    try {
        let productname = req.query.name || '';
        let page = 1;
        let perpage = 10;
        let maxprice = Number.MAX_SAFE_INTEGER;
        let minprice = 0;
        let maxquantity = Number.MAX_SAFE_INTEGER;
        let minquantity = 0;

        if (req.query.maxprice)
            maxprice = parseInt(req.query.maxprice);
        if (req.query.minprice)
            minprice = parseInt(req.query.minprice);
        if (req.query.maxquantity)
            maxquantity = parseInt(req.query.maxquantity);
        if (req.query.minquantity)
            minquantity = parseInt(req.query.minquantity);
        if (req.query.page)
            page = parseInt(req.query.page);
        if (req.query.limit)
            perpage = parseInt(req.query.limit);

        let data = await Product.getProducts(-1, -1, productname);
        data = data.filter(d => d.price >= minprice && d.price <= maxprice && d.quantity >= minquantity && d.quantity <= maxquantity);
        
        const totalItems = data.length;
        const totalPage = (totalItems / perpage) + (totalItems % perpage != 0);
        
        // console.log(page, perpage);
        data = data.slice((page - 1) * perpage, page * perpage);
        res.render('product', {
            title: 'Admin',
            header: 'SẢN PHẨM',
            newurl: '/admin/product/new',
            imageCol: 'HÌNH ẢNH',
            priceCol: 'GIÁ',
            quantityCol: 'SỐ LƯỢNG',
            name: productname,
            data: data, 
            page: page, 
            perpage: perpage,
            maxprice: maxprice,
            minprice: minprice,
            maxquantity: maxquantity,
            minquantity: minquantity,
            totalpage: Array.from({length: totalPage}, (e, i)=> i+1),
            deleteurl: 'http://localhost:3000/admin/product/delete'
        })
    } catch (error) {
        next(error);
    }
}

const DeleteProduct = async(req, res, next) => {
    try {
        const { listID } = req.body;
        // console.log(listID);
        Product.delete(listID);
        res.status(201).json({url: 'http://localhost:3000/admin/product'});
    } catch (error) {
        next(error);
    }
}

const NewProduct = async(req, res, next) => {
    try {
        let categories = await Categories.getAll();
        let subcategories = await SubCategories.getAll();
        let subCatList = []

        categories.forEach(cat => {
            let tmp = {"cat": cat, list: []};
            subcategories.forEach(sub => {
                if (sub.catid==cat.id) tmp.list.push(sub);
            });
            subCatList.push(tmp);
        });
        
        
        res.render('newproduct', {
            title: 'Admin',
            header: 'Thêm sản phẩm',
            posturl: 'http://localhost:3000/admin/product/new',
            cancelurl: 'http://localhost:3000/admin/product',
            nameCol: 'Tên sản phẩm',
            imageCol: 'Hình ảnh',
            priceCol: 'Giá',
            quantityCol: 'Số lượng',
            catnameCol: 'Loại sản phârm',
            longdesCol: "Mô tả đầy đủ",
            shortdesCol: "Mô tả ngắn",
            categories: categories,
            subCatList: subCatList,            
        })
    } catch (error) {
        next(error);
    }
}

const CreateProduct = async(req, res, next) => {
    try {
        let {name, price, quantity, category, subcategory, shortdes, longdes} = req.body;
        let filename = req.file.filename;
        price = parseInt(price);
        quantity = parseInt(quantity);
        let newid = await Product.insert(name, price, quantity, category, subcategory, shortdes, longdes);
        // console.log(name, price, quantity, category, subcategory, shortdes, longdes);
        // console.log(req.file);
        // console.log(newid, filename);

        fs.renameSync(`Main/public/image/${filename}`, `Main/public/image/${newid}.jpg`, function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

        res.redirect('http://localhost:3000/admin/product/new');
    } catch (error) {
        next(error);
    }
}

const DeatilProduct = async(req, res, next) => {
    try {
        
    } catch (error) {
        next(error);
    }
}

module.exports = {RenderProduct, DeleteProduct, NewProduct, CreateProduct, DeatilProduct}