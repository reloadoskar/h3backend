'use strict'

var express = require('express');
var PccController = require('../controllers/porCobrarCuenta');

var router = express.Router();

//Rutas
router.get('/:bd/cuentasporcobrar', PccController.getCuentas);
router.get('/:bd/cuentasporcobrar/pdv', PccController.getCxcPdv);
router.get('/:bd/cuentasporcobrar/cliente/:id', PccController.getCuentasCliente);
router.post('/:bd/cuentasporcobrar/pago/save', PccController.savePago);
router.post('/:bd/cuentasporcobrar/save', PccController.save);
// router.get('/pcc/:id', PccController.getCliente);
// router.put('/pcc/:id', PccController.update);
// router.delete('/pcc/:id', PccController.delete);

module.exports = router;