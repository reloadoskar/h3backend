'use strict'
var express = require('express');
var InsumoController = require('../controllers/insumo');
var { enforceAuthenticatedDatabase } = require('../src/authenticateApi');
var router = express.Router();
router.param('bd', enforceAuthenticatedDatabase);

router.get('/:bd/insumos/:produccion_id', InsumoController.getInsumos);
router.post('/:bd/insumo/save', InsumoController.save);
router.post('/:bd/insumo/delete', InsumoController.delete);
router.post('/:bd/insumo/add', InsumoController.add);
router.post('/:bd/insumo/subtract', InsumoController.subtract);

module.exports = router;