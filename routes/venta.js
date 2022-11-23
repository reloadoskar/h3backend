'use strict'

var express = require('express');
var VentaController = require('../controllers/venta');

var router = express.Router();

//Rutas
router.post('/:bd/venta/save', VentaController.save);
// router.get('/:bd/ventas', VentaController.getVentas);
router.get('/:bd/ventas/mes/:mes', VentaController.getVentaItems);
router.get('/:bd/ventas/:ubicacion/:fecha', VentaController.getResumenVentas)
router.get('/:bd/venta/producto/:id', VentaController.getVentasOfProduct);
router.get('/:bd/venta/:folio', VentaController.getVenta);
router.delete('/:bd/venta/:id', VentaController.cancel);
router.get('/:bd/ventas/semana', VentaController.getVentasSemana);

module.exports = router;