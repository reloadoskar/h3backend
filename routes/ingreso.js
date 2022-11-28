'use strict'

var express = require('express');
var Ingreso = require('../controllers/ingreso');

var router = express.Router();

//Rutas
router.post('/ingreso/save', Ingreso.save);
router.post('/ingresos/fecha', Ingreso.getIngresosDelDia);
router.post('/ingresos/mes', Ingreso.getIngresosMonthYear);
// router.get('/:bd/ingresos/recuperarclientes', Ingreso.getRecuperarClientes);
router.post('/cuentas/clientes', Ingreso.getCuentasdelosClientes);
router.post('/ingreso/update', Ingreso.update);
router.post('/ingreso/delete', Ingreso.delete);

module.exports = router;
