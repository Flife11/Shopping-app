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
        // Thêm url detail
        data = data.filter(d => {
            d.quantity = `${d.quantity}`;           
            d.price = `${d.price}`;
            d.detailurl = '/admin/product/detail/';
            return d;
        })
        // console.log(data);

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
            // Tên các fields cần điền
            nameCol: 'Tên sản phẩm',
            imageCol: 'Hình ảnh',
            priceCol: 'Giá',
            quantityCol: 'Số lượng',
            catnameCol: 'Loại sản phârm',
            longdesCol: "Mô tả đầy đủ",
            shortdesCol: "Mô tả ngắn",
            // Giá trị của cá fielfs nếu có thì sẽ là detail không sẽ là create
            catidVal: 0,
            subcatidVal: 0,
            // Dữ liệu
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

        fs.renameSync(`Main/public/image/${filename}`, `Main/public/image/${newid}.jpg`, function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

        // res.status(201).json({
        //     message: 'Tạo tài khoản thành công',
        //     redirecturl: 'http://localhost:3000/admin/product/new'
        // });
        res.redirect('http://localhost:3000/admin/product');
    } catch (error) {
        next(error);
    }
}

const DetailProduct = async(req, res, next) => {
    try {
        let id = req.params.id;
        let product = await Product.getOne(id);
        let categories = await Categories.getAll();
        let subcategories = await SubCategories.getAll();
        let subCatList = [];
        let catidVal = 0;
        let subcatidVal = 0;

        // Lấy index của catid và subcatid trong mảng categories và subcategories                

        categories.forEach((cat, index) => {
            //Lấy index của catid 
            if (cat.id==product[0].catid) catidVal = index;
            //Tạo mảng subCatList
            let tmp = {"cat": cat, list: []};
            subcategories.forEach(sub => {
                if (sub.catid==cat.id) tmp.list.push(sub);
            });
            subCatList.push(tmp);
        });

        subCatList[catidVal].list.forEach((sub, index) => {            
            if (sub.id==product[0].subcatid) subcatidVal = index;
        });
        // console.log(catidVal, subcatidVal);

        res.render('newproduct', {
            title: 'Admin',
            header: 'Chi tiết sản phẩm',
            posturl: 'http://localhost:3000/admin/product/update',
            cancelurl: 'http://localhost:3000/admin/product',
            // Tên các fields cần điền
            nameCol: 'Tên sản phẩm',
            updateimageCol: 'Hình ảnh',
            priceCol: 'Giá',
            quantityCol: 'Số lượng',
            catnameCol: 'Loại sản phârm',
            longdesCol: "Mô tả đầy đủ",
            shortdesCol: "Mô tả ngắn",
            // Giá trị của cá fielfs nếu có thì sẽ là detail không sẽ là create
            idVal: product[0].id,
            nameVal: product[0].name,
            priceVal: product[0].price,
            quantityVal: product[0].quantity,
            imageVal: product[0].image,
            longdesVal: product[0].fulldescription,
            shortdesVal: product[0].shortdescription,
            catidVal,
            subcatidVal,
            // Dữ liệu
            categories: categories,
            subCatList: subCatList,            
        })
    } catch (error) {
        next(error);
    }
}

const UpdateProduct = async(req, res, next) => {
    try {
        let {id, name, price, quantity, category, subcategory, shortdes, longdes} = req.body;
        price = parseInt(price);
        quantity = parseInt(quantity);
        category = parseInt(category);
        subcategory = parseInt(subcategory);
        Product.update(id, name, price, quantity, category, subcategory, shortdes, longdes);
        // console.log(name, price, quantity, category, subcategory, shortdes, longdes);
        console.log(subcategory);
        // console.log(newid, filename);
        if (req.file!=undefined) {
            let filename = req.file.filename;
            fs.unlinkSync(`Main/public/image/${id}.jpg`);
            fs.renameSync(`Main/public/image/${filename}`, `Main/public/image/${id}.jpg`, function(err) {
                if ( err ) console.log('ERROR: ' + err);
            });
        }

        res.redirect('http://localhost:3000/admin/product');
    } catch (error) {
        next(error);
    }
}

module.exports = {RenderProduct, DeleteProduct, NewProduct, CreateProduct, DetailProduct, UpdateProduct}