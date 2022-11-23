'use strict'

var express = require('express');
var InversionController = require('../controllers/inversion');

var router = express.Router();

//Rutas
router.post('/:bd/inversion/save', InversionController.save);
router.get('/:bd/inversions/:mes/:year', InversionController.getInversions);
router.get('/:bd/inversion/:id', InversionController.getInversion);
router.put('/:bd/close/inversion/:id', InversionController.close);
router.put('/:bd/open/inversion/:id', InversionController.open);
router.put('/:bd/update/inversion/:id', InversionController.update);
router.delete('/:bd/inversion/delete/:id', InversionController.delete);
router.put('/:bd/inversion/cancel/:id', InversionController.cancel);
router.put('/:bd/inversion/update/', InversionController.update);

module.exports = router;