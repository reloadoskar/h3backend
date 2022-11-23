'use strict'

var express = require('express');
var TipoCompraController = require('../controllers/tipoCompra');

var router = express.Router();

//Rutas
router.post('/:bd/tipocompra/create', TipoCompraController.save);
router.get('/:bd/tipocompras', TipoCompraController.getTipoCompras);
router.get('/:bd/tipocompra/:id', TipoCompraController.getTipoCompra);
router.put('/:bd/tipocompra/:id', TipoCompraController.update);
router.delete('/:bd/tipocompra/:id', TipoCompraController.delete);

module.exports = router;