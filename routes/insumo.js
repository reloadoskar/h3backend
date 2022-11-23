'use strict'
var express = require('express');
var InsumoController = require('../controllers/insumo');
var router = express.Router();

router.get('/:bd/insumos/:produccion_id', InsumoController.getInsumos);
router.post('/:bd/insumo/save', InsumoController.save);
router.post('/:bd/insumo/delete', InsumoController.delete);
router.post('/:bd/insumo/add', InsumoController.add);
router.post('/:bd/insumo/subtract', InsumoController.subtract);

module.exports = router;