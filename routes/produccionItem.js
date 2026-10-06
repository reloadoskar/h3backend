'use strict'
var express = require('express');
var ProduccionItemController = require('../controllers/produccionItem');
var { enforceAuthenticatedDatabase } = require('../src/authenticateApi');
var router = express.Router();
router.param('bd', enforceAuthenticatedDatabase);

router.post('/:bd/produccionitem/save', ProduccionItemController.save);
router.get('/:bd/produccionitems/:produccion_id', ProduccionItemController.getItems);
router.post('/:bd/produccionitem/delete', ProduccionItemController.delete);
router.post('/:bd/produccionitems/subtract', ProduccionItemController.subtract);
// router.post('/:bd/insumo/add', ProduccionItemController.add);

module.exports = router;