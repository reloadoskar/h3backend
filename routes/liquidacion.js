'use strict'

var express = require('express');
var LiquidacionController = require('../controllers/liquidacion');

var router = express.Router();

//Rutas
router.post('/:bd/liquidacion/save', LiquidacionController.save);

module.exports = router;