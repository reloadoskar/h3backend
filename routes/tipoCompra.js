'use strict'

var express = require('express');
var TipoCompraController = require('../controllers/tipoCompra');

var router = express.Router();

//Rutas
router.post('/tipocompras', TipoCompraController.getTipoCompras);
router.post('/tipocompra/create', TipoCompraController.save);
router.post('/tipocompra/:id', TipoCompraController.getTipoCompra);
router.post('/tipocompra/:id', TipoCompraController.update);
router.post('/tipocompra/:id', TipoCompraController.delete);

module.exports = router;