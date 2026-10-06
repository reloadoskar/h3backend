'use strict'

var express = require('express');
var ProduccionController = require('../controllers/produccion');
var { enforceAuthenticatedDatabase } = require('../src/authenticateApi');
var router = express.Router();
router.param('bd', enforceAuthenticatedDatabase);

//Rutas
router.get('/:bd/produccion/save', ProduccionController.save);
router.get('/:bd/produccions', ProduccionController.getProduccions);
router.get('/:bd/produccion/:id', ProduccionController.getProduccion);
router.put('/:bd/produccion/:id', ProduccionController.update);
router.delete('/:bd/produccion/:id', ProduccionController.delete);

module.exports = router;