'use strict'

var express = require('express');
var ClienteController = require('../controllers/cliente');

var router = express.Router();

//Rutas
router.post('/clientes', ClienteController.getClientes);
router.post('/cliente/save', ClienteController.save);
// router.get('/:bd/clientes/cuentas', ClienteController.getClientesCuentas);
router.post('/cliente', ClienteController.getCliente);
router.post('/cliente/update/', ClienteController.update);
router.post('/cliente/delete', ClienteController.delete);

module.exports = router;