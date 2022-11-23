'use strict'

var express = require('express');
var CorteController = require('../controllers/corte');

var router = express.Router();

//Rutas
// router.get('/corte/ventas/:ubicacion/:fecha', CorteController.getVentas)
router.get('/:bd/corte/:ubicacion/:fecha', CorteController.getData)
router.post('/:bd/corte/save', CorteController.save)
router.get('/:bd/corte/exist/:ubicacion/:fecha', CorteController.exist);
router.get('/:bd/corte/open/:ubicacion/:fecha', CorteController.open);
// router.put('/compra/:id', CompraController.update);
// router.delete('/compra/:id', CompraController.delete);

module.exports = router;