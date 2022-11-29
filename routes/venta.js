'use strict'

var express = require('express');
var VentaController = require('../controllers/venta');

var router = express.Router();

//Rutas
// router.post('/:bd/ventas', VentaController.getVentas);
router.post('/venta/save', VentaController.save);
router.post('/ventas/mes/:mes', VentaController.getVentaItems);
router.post('/ventas/:ubicacion/:fecha', VentaController.getResumenVentas)
router.post('/venta/producto/:id', VentaController.getVentasOfProduct);
router.post('/venta', VentaController.getVenta);
router.post('/venta/delete', VentaController.cancel);
router.post('/ventas/semana', VentaController.getVentasSemana);

module.exports = router;