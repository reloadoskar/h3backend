'use strict'

var express = require('express');
var BalanceController = require('../controllers/balance');

var router = express.Router();

//Rutas
router.get('/:bd/balance/', BalanceController.getBalance);
router.get('/:bd/balance/disponiblexubicacion/:fecha', BalanceController.disponiblexUbicacion);
// router.get('/clientes', ClienteController.getClientes);
// router.get('/cliente/:id', ClienteController.getCliente);
// router.put('/cliente/:id', ClienteController.update);
// router.delete('/cliente/:id', ClienteController.delete);

module.exports = router;