'use strict'

var express = require('express');
var Ingreso = require('../controllers/ingreso');

var router = express.Router();

//Rutas
router.post('/:bd/ingreso/save', Ingreso.save);
router.get('/:bd/ingresos/:fecha', Ingreso.getIngresosDelDia);
router.get('/:bd/ingresos/:month/:year', Ingreso.getIngresosMonthYear);
// router.get('/:bd/ingresos/recuperarclientes', Ingreso.getRecuperarClientes);
router.get('/:bd/cuentas/clientes', Ingreso.getCuentasdelosClientes);
router.put('/:bd/ingreso/update', Ingreso.update);
router.delete('/:bd/ingreso/:id', Ingreso.delete);

module.exports = router;
