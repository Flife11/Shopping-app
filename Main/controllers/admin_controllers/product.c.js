const Product = require('../../models/product.m');

const RenderProduct = async (req, res, next) => {
    try {
        let productname = req.query.productname || '';
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
            data: data, 
            page: page, 
            perpage: perpage,
            maxprice: maxprice,
            minprice: minprice,
            maxquantity: maxquantity,
            minquantity: minquantity,
            totalpage: Array.from({length: totalPage}, (e, i)=> i+1)
        })
    } catch (error) {
        next(error);
    }
}

const DeleteProduct = async(req, res, next) => {
    try {
        const { listID } = req.body;
        Product.delete(listID);
        res.status(201).json({url: 'http://localhost:3000/admin/product'});
    } catch (error) {
        next(error);
    }
}

module.exports = {RenderProduct, DeleteProduct}