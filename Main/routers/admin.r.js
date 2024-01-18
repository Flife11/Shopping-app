const { RenderAdmin } = require('../controllers/admin.c');

const router = require('express').Router();

router.get('/', RenderAdmin)

module.exports = router;