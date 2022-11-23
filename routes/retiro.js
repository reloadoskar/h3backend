'use strict'

var express = require('express');
var Retiro = require('../controllers/retiro');

var router = express.Router();

//Rutas
router.post('/:bd/retiro/save', Retiro.save);

module.exports = router;
