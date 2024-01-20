const Product = require('../../models/product.m');

const RenderProduct = async (req, res, next) => {
    try {
        const data = await Product.getByOffset(0, 10);        
        const totalItems = await Product.countRecord();
        const perPage = 10;
        const totalPage = (totalItems / perPage) + (totalItems % perPage != 0);        
        res.render('product', {
            title: 'Admin',
            data: data,
            perpage: perPage,
            totalpage: Array.from({length: totalPage}, (e, i)=> i+1)
        })
    } catch (error) {
        next(error);
    }    
}

module.exports = {RenderProduct}