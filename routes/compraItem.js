'use strict'
var express = require('express');
var CompraItemController = require('../controllers/compraItem');
var router = express.Router();

router.post('/items', CompraItemController.getItems);
router.post('/items/subtract', CompraItemController.subtractStock)
router.post('/items/add', CompraItemController.addStock)
module.exports = router;