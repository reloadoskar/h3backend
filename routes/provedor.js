'use strict'

var express = require('express');
var ProvedorController = require('../controllers/provedor');

var router = express.Router();

//Rutas
router.post('/provedors', ProvedorController.getProvedors);
router.post('/provedor/save', ProvedorController.save);
router.post('/provedor/update', ProvedorController.update);
router.post('/provedor/delete', ProvedorController.delete);
router.get('/:bd/provedor/:id', ProvedorController.getProvedor);

module.exports = router;