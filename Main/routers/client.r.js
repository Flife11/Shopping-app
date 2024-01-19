const router = require('express').Router();
const clientController = require('../controllers/client.c');

// [ Free routes ]

// Render cart
router.get('/cart', clientController.getCart);
router.post('/cart', clientController.postCart);

// Render detail product (note: handle related product, don't allow user to buy product if quantity = 0)
router.get('/:productid', );

// Render list product by category and subcategory 
// if subcategory = -1 => render list product by only category
// if category = -1 => render product by params search (apply filter later) (nhớ xử lý trg hợp ng dùng cố tình xóa params search >:c )
// TODO: xử lý parameter cho page
router.get('/:catid/:subcatid', clientController.getListProduct);

router.get('/', clientController.getHome);

module.exports = router;