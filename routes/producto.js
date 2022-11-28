'use strict'

var express = require('express');
var ProductoController = require('../controllers/producto');

var router = express.Router();

//Rutas
router.post('/productos', ProductoController.getProductos);
router.post('/producto/save', ProductoController.save);
router.post('/productos/masvendidos/', ProductoController.getProductosMasVendidos);
router.post('/producto/', ProductoController.getProducto);
router.post('/producto/update/', ProductoController.update);
router.post('/producto/delete/', ProductoController.delete);

module.exports = router;