'use strict'

var express = require('express');
var LiquidacionController = require('../controllers/liquidacion');
var { enforceAuthenticatedDatabase } = require('../src/authenticateApi');

var router = express.Router();
router.param('bd', enforceAuthenticatedDatabase);

//Rutas
router.post('/:bd/liquidacion/save', LiquidacionController.save);

module.exports = router;