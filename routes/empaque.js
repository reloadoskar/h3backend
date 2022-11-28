'use strict'

var express = require('express');
var EmpaqueController = require('../controllers/empaque');

var router = express.Router();

//Rutas
router.post('/empaques', EmpaqueController.getEmpaques)
router.post('/empaque/save', EmpaqueController.save);
router.post('/empaque/delete', EmpaqueController.delete)

module.exports = router;