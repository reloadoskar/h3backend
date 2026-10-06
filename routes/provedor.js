'use strict'

var express = require('express');
var ProvedorController = require('../controllers/provedor');
var { enforceAuthenticatedDatabase } = require('../src/authenticateApi');

var router = express.Router();
router.param('bd', enforceAuthenticatedDatabase);

//Rutas
router.post('/provedors', ProvedorController.getProvedors);
router.post('/provedor/save', ProvedorController.save);
router.post('/provedor/update', ProvedorController.update);
router.post('/provedor/delete', ProvedorController.delete);
router.get('/:bd/provedor/:id', ProvedorController.getProvedor);

module.exports = router;