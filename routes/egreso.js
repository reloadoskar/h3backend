'use strict'

var express = require('express');
var Egreso = require('../controllers/egreso');

var router = express.Router();

//Rutas
router.post('/:bd/egreso/save', Egreso.save);
router.get('/:bd/egresos/:fecha', Egreso.getEgresosDelDia);
router.get('/:bd/egresos/:month/:year', Egreso.getEgresosMonthYear);
router.get('/:bd/egreso/:id', Egreso.getEgreso);
router.put('/:bd/egreso/update', Egreso.update);
router.delete('/:bd/egreso/delete/:id', Egreso.delete);

module.exports = router;
