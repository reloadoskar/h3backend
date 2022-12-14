'use strict'

var express = require('express');
var PpcController = require('../controllers/porPagarCuenta');

var router = express.Router();

//Rutas
router.post('/cuentasporpagar', PpcController.cxp_list);
router.post('/cuentasporpagar/pago/save', PpcController.cxp_create_pago);
// router.get('/ppc/:id', PpcController.getCliente);
// router.put('/ppc/:id', PpcController.update);
// router.delete('/ppc/:id', PpcController.delete);

module.exports = router;