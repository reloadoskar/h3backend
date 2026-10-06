'use strict'

var express = require('express');
var Retiro = require('../controllers/retiro');
var { enforceAuthenticatedDatabase } = require('../src/authenticateApi');

var router = express.Router();
router.param('bd', enforceAuthenticatedDatabase);

//Rutas
router.post('/:bd/retiro/save', Retiro.save);

module.exports = router;
