
const RenderAdmin = (req, res, next) => {
    res.render('admin', {
        title: 'Admin'        
    })
}

module.exports = {RenderAdmin}