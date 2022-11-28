'use strict'

var express = require('express');
var UnidadController = require('../controllers/unidad');

var router = express.Router();

//Rutas
router.post('/unidad/save', UnidadController.save);
router.post('/unidads', UnidadController.getUnidades);
router.post('/unidad/delete', UnidadController.delete)

module.exports = router;