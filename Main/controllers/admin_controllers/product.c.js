const RenderProduct = (req, res, next) => {
    res.render('product', {
        title: 'Admin'
    })
}

module.exports = {RenderProduct}