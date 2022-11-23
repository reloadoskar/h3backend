'use strict'

var express = require('express');
var TipoVentaController = require('../controllers/tipoventa');

var router = express.Router();

//Rutas
router.post('/:bd/tipoventa/save', TipoVentaController.save);
router.get('/:bd/tipoventas', TipoVentaController.getTipoPagos);
router.get('/:bd/tipoventa/:id', TipoVentaController.getTipoPago);
router.put('/:bd/tipoventa/:id', TipoVentaController.update);
router.delete('/:bd/tipoventa/:id', TipoVentaController.delete);

module.exports = router;