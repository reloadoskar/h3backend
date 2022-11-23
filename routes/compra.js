'use strict'

var express = require('express');
var CompraController = require('../controllers/compra');

var router = express.Router();

//Rutas
router.post('/:bd/compra/save', CompraController.save);
router.post('/:bd/compra/additem', CompraController.addCompraItem);
router.get('/:bd/compras/:mes/:year', CompraController.getCompras);
router.get('/:bd/compras/provedor/:year/:month', CompraController.getComprasProvedor);
router.get('/:bd/compra/recuperarVentas/:id', CompraController.recuperarVentas);
router.get('/:bd/compra/recuperarGastos/:id', CompraController.recupearGastos);
router.get('/:bd/compras/activas', CompraController.getComprasActivas);
router.get('/:bd/compra/:id', CompraController.getCompra);
router.put('/:bd/close/compra/:id', CompraController.close);
router.put('/:bd/open/compra/:id', CompraController.open);
router.put('/:bd/update/compra/:id', CompraController.update);
router.put('/:bd/compra/item/:id', CompraController.updateCompraItem);
router.delete('/:bd/compra/:id', CompraController.delete);
router.put('/:bd/compra/cancel/:id', CompraController.delete);

module.exports = router;