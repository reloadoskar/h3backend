'use strict'

var express = require('express');
var Egreso = require('../controllers/egreso');

var router = express.Router();

//Rutas
router.post('/egreso/save', Egreso.save);
router.post('/egresos/fecha', Egreso.getEgresosDelDia);
router.post('/egresos/mes', Egreso.getEgresosMonthYear);
router.post('/egreso/update', Egreso.update);
router.post('/egreso/delete', Egreso.delete);
router.post('/egreso', Egreso.getEgreso);

module.exports = router;
