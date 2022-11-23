'use strict'

var express = require('express');
var TipoPagoController = require('../controllers/tipoPago');

var router = express.Router();

//Rutas
router.post('/:bd/tipopago/save', TipoPagoController.save);
router.get('/:bd/tipopagos', TipoPagoController.getTipoPagos);
router.get('/:bd/tipopago/:id', TipoPagoController.getTipoPago);
router.put('/:bd/tipopago/:id', TipoPagoController.update);
router.delete('/:bd/tipopago/:id', TipoPagoController.delete);

module.exports = router;