'use strict'

var express = require('express');
var ProductoController = require('../controllers/producto');

var router = express.Router();

//Rutas
router.post('/:bd/producto/save', ProductoController.save);
router.get('/:bd/productos', ProductoController.getProductos);
router.get('/:bd/productos/masvendidos/:year/:month', ProductoController.getProductosMasVendidos);
router.get('/:bd/producto/:id', ProductoController.getProducto);
router.put('/:bd/producto/update/', ProductoController.update);
router.delete('/:bd/producto/:id', ProductoController.delete);

module.exports = router;