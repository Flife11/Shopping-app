const User = require('../../models/user.m');

const RenderUser = async (req, res, next) => {
    try {
        console.log(1);
        let name = req.query.name || '';
        let address = req.query.address || '';
        let username = req.query.username || '';
        let email = req.query.email || '';
        let page = 1;
        let perpage = 10;        
        
        if (req.query.page)
            page = parseInt(req.query.page);
        if (req.query.limit)
            perpage = parseInt(req.query.limit);

        let data = await User.getUserByName(name, username, address, email);        
        
        const totalItems = data.length;
        const totalPage = (totalItems / perpage) + (totalItems % perpage != 0);
        
        // console.log(page, perpage);
        data = data.slice((page - 1) * perpage, page * perpage);
        console.log(data);
        // Thêm url detail
        data = data.filter(d => {            
            d.detailurl = '/admin/user/detail/';
            return d;
        })
        console.log(data);

        res.render('product', {
            title: 'Admin',
            header: 'TÀI KHOẢN',
            newurl: '/admin/user/new',        
            emailCol: 'EMAIL',
            addressCol: 'ĐỊA CHỈ',
            usernameCol: 'TÊN TÀI KHOẢN',
            name,
            address,
            email,
            username,
            data: data, 
            page: page, 
            perpage: perpage,
            totalpage: Array.from({length: totalPage}, (e, i)=> i+1),
            deleteurl: 'http://localhost:3000/admin/user/delete'
        })
    } catch (error) {
        next(error);
    }
}

const DeleteProduct = async(req, res, next) => {
    // try {
    //     const { listID } = req.body;
    //     // console.log(listID);
    //     Product.delete(listID);
    //     res.status(201).json({url: 'http://localhost:3000/admin/product'});
    // } catch (error) {
    //     next(error);
    // }
}

const NewProduct = async(req, res, next) => {
    // try {
    //     let categories = await Categories.getAll();
    //     let subcategories = await SubCategories.getAll();
    //     let subCatList = []

    //     categories.forEach(cat => {
    //         let tmp = {"cat": cat, list: []};
    //         subcategories.forEach(sub => {
    //             if (sub.catid==cat.id) tmp.list.push(sub);
    //         });
    //         subCatList.push(tmp);
    //     });
        
        
    //     res.render('newproduct', {
    //         title: 'Admin',
    //         header: 'Thêm sản phẩm',
    //         posturl: 'http://localhost:3000/admin/product/new',
    //         cancelurl: 'http://localhost:3000/admin/product',
    //         // Tên các fields cần điền
    //         nameCol: 'Tên sản phẩm',
    //         imageCol: 'Hình ảnh',
    //         priceCol: 'Giá',
    //         quantityCol: 'Số lượng',
    //         catnameCol: 'Loại sản phârm',
    //         longdesCol: "Mô tả đầy đủ",
    //         shortdesCol: "Mô tả ngắn",
    //         // Giá trị của cá fielfs nếu có thì sẽ là detail không sẽ là create
    //         catidVal: 0,
    //         subcatidVal: 0,
    //         // Dữ liệu
    //         categories: categories,
    //         subCatList: subCatList,            
    //     })
    // } catch (error) {
    //     next(error);
    // }
}

const CreateProduct = async(req, res, next) => {
    // try {
    //     let {name, price, quantity, category, subcategory, shortdes, longdes} = req.body;
    //     let filename = req.file.filename;
    //     price = parseInt(price);
    //     quantity = parseInt(quantity);
    //     let newid = await Product.insert(name, price, quantity, category, subcategory, shortdes, longdes);
    //     // console.log(name, price, quantity, category, subcategory, shortdes, longdes);
    //     // console.log(req.file);
    //     // console.log(newid, filename);

    //     fs.renameSync(`Main/public/image/${filename}`, `Main/public/image/${newid}.jpg`, function(err) {
    //         if ( err ) console.log('ERROR: ' + err);
    //     });

    //     res.redirect('http://localhost:3000/admin/product/new');
    // } catch (error) {
    //     next(error);
    // }
}

const DeatilProduct = async(req, res, next) => {
    try {
        // let id = req.params.id;
        // let product = await Product.getOne(id);
        // let categories = await Categories.getAll();
        // let subcategories = await SubCategories.getAll();
        // let subCatList = [];
        // let catidVal = 0;
        // let subcatidVal = 0;

        // // Lấy index của catid và subcatid trong mảng categories và subcategories                

        // categories.forEach((cat, index) => {
        //     //Lấy index của catid 
        //     if (cat.id==product[0].catid) catidVal = index;
        //     //Tạo mảng subCatList
        //     let tmp = {"cat": cat, list: []};
        //     subcategories.forEach(sub => {
        //         if (sub.catid==cat.id) tmp.list.push(sub);
        //     });
        //     subCatList.push(tmp);
        // });

        // subCatList[catidVal].list.forEach((sub, index) => {            
        //     if (sub.id==product[0].subcatid) subcatidVal = index;
        // });
        // // console.log(catidVal, subcatidVal);

        // res.render('newproduct', {
        //     title: 'Admin',
        //     header: 'Thêm sản phẩm',
        //     posturl: 'http://localhost:3000/admin/product/update',
        //     cancelurl: 'http://localhost:3000/admin/product',
        //     // Tên các fields cần điền
        //     nameCol: 'Tên sản phẩm',
        //     updateimageCol: 'Hình ảnh',
        //     priceCol: 'Giá',
        //     quantityCol: 'Số lượng',
        //     catnameCol: 'Loại sản phârm',
        //     longdesCol: "Mô tả đầy đủ",
        //     shortdesCol: "Mô tả ngắn",
        //     // Giá trị của cá fielfs nếu có thì sẽ là detail không sẽ là create
        //     idVal: product[0].id,
        //     nameVal: product[0].name,
        //     priceVal: product[0].price,
        //     quantityVal: product[0].quantity,
        //     imageVal: product[0].image,
        //     longdesVal: product[0].fulldescription,
        //     shortdesVal: product[0].shortdescription,
        //     catidVal,
        //     subcatidVal,
        //     // Dữ liệu
        //     categories: categories,
        //     subCatList: subCatList,            
        // })
    } catch (error) {
        next(error);
    }
}

const UpdateProduct = async(req, res, next) => {
    try {
        // let {id, name, price, quantity, category, subcategory, shortdes, longdes} = req.body;
        // price = parseInt(price);
        // quantity = parseInt(quantity);
        // category = parseInt(category);
        // subcategory = parseInt(subcategory);
        // Product.update(id, name, price, quantity, category, subcategory, shortdes, longdes);
        // // console.log(name, price, quantity, category, subcategory, shortdes, longdes);
        // console.log(subcategory);
        // // console.log(newid, filename);
        // if (req.file!=undefined) {
        //     let filename = req.file.filename;
        //     fs.unlinkSync(`Main/public/image/${id}.jpg`);
        //     fs.renameSync(`Main/public/image/${filename}`, `Main/public/image/${id}.jpg`, function(err) {
        //         if ( err ) console.log('ERROR: ' + err);
        //     });
        // }

        res.redirect('http://localhost:3000/admin/product');
    } catch (error) {
        next(error);
    }
}

module.exports = {RenderUser}