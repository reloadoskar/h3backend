'use strict'

var express = require('express');
var TipoPagoController = require('../controllers/tipoPago');
var { enforceAuthenticatedDatabase } = require('../src/authenticateApi');

var router = express.Router();
router.param('bd', enforceAuthenticatedDatabase);

//Rutas
router.post('/:bd/tipopago/save', TipoPagoController.save);
router.get('/:bd/tipopagos', TipoPagoController.getTipoPagos);
router.get('/:bd/tipopago/:id', TipoPagoController.getTipoPago);
router.put('/:bd/tipopago/:id', TipoPagoController.update);
router.delete('/:bd/tipopago/:id', TipoPagoController.delete);

module.exports = router;