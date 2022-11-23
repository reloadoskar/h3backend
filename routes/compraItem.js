'use strict'
var express = require('express');
var CompraItemController = require('../controllers/compraItem');
var router = express.Router();

router.get('/:bd/items', CompraItemController.getItems);
router.post('/:bd/items/subtract', CompraItemController.subtractStock)
router.post('/:bd/items/add', CompraItemController.addStock)
module.exports = router;