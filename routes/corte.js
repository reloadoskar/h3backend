'use strict'

var express = require('express');
var CorteController = require('../controllers/corte');

var router = express.Router();

//Rutas
// router.get('/corte/ventas/:ubicacion/:fecha', CorteController.getVentas)
router.post('/corte', CorteController.getData)
router.post('/corte/save', CorteController.save)
router.post('/corte/exist', CorteController.exist);
router.post('/corte/open/', CorteController.open);
// router.put('/compra/:id', CompraController.update);
// router.delete('/compra/:id', CompraController.delete);

module.exports = router;