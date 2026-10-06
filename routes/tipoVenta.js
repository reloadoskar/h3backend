'use strict'

var express = require('express');
var TipoVentaController = require('../controllers/tipoventa');
var { enforceAuthenticatedDatabase } = require('../src/authenticateApi');

var router = express.Router();
router.param('bd', enforceAuthenticatedDatabase);

//Rutas
router.post('/:bd/tipoventa/save', TipoVentaController.save);
router.get('/:bd/tipoventas', TipoVentaController.getTipoPagos);
router.get('/:bd/tipoventa/:id', TipoVentaController.getTipoPago);
router.put('/:bd/tipoventa/:id', TipoVentaController.update);
router.delete('/:bd/tipoventa/:id', TipoVentaController.delete);

module.exports = router;