'use strict'

var express = require('express');
var EmpaqueController = require('../controllers/empaque');

var router = express.Router();

//Rutas
router.get('/:bd/empaques', EmpaqueController.getEmpaques)
router.post('/:bd/empaque/save', EmpaqueController.save);
router.delete('/:bd/empaque/:id', EmpaqueController.delete)

module.exports = router;