'use strict'

var express = require('express');
var CompraController = require('../controllers/compra');

var router = express.Router();

//Rutas
router.post('/compras', CompraController.getCompras);
router.post('/compra/save', CompraController.save);
router.post('/compra/additem', CompraController.addCompraItem);
router.post('/compras/provedor/:year/:month', CompraController.getComprasProvedor);
router.post('/compra/recuperarVentas/:id', CompraController.recuperarVentas);
router.post('/compra/recuperarGastos/:id', CompraController.recupearGastos);
router.post('/compras/activas', CompraController.getComprasActivas);
router.post('/compra/', CompraController.getCompra);
router.post('/compra/close', CompraController.close);
router.post('/open/compra/:id', CompraController.open);
router.post('/update/compra', CompraController.update);
router.post('/compra/item/update', CompraController.updateCompraItem);
router.post('/compra/delete/:id', CompraController.delete);
router.post('/compra/cancel/:id', CompraController.delete);

router.post('/compra/addmerma/', CompraController.addMerma);
router.post('/compra/crear/empaque/vacio', CompraController.crearItemEmpaqueVacio);
module.exports = router;