'use strict'

var express = require('express');
var UnidadController = require('../controllers/unidad');

var router = express.Router();

//Rutas
router.post('/:bd/unidad/save', UnidadController.save);
router.get('/:bd/unidads', UnidadController.getUnidades);
router.delete('/:bd/unidad/:id', UnidadController.delete)

module.exports = router;