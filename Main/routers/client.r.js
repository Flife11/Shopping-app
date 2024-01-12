const router = require('express').Router();

// Free routes
// Pass isLoggedin vào render: dùng req.isAuthenticated()

// Render detail product
router.get('/:productid', );

// Render list product by category and subcategory 
// if subcategory = -1 => render list product by only category
// if category = -1 => render product by params search (apply filter later)
// TODO: xử lý parameter cho filter (bao gồm cả search) (filter = currentURL + filter params)
router.get('/:catid/:subcatid', );

router.get('/', );

module.exports = router;