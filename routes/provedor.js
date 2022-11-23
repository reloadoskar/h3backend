'use strict'

var express = require('express');
var ProvedorController = require('../controllers/provedor');

var router = express.Router();

//Rutas
router.post('/:bd/provedor/save', ProvedorController.save);
router.get('/:bd/provedors', ProvedorController.getProvedors);
router.get('/:bd/provedor/:id', ProvedorController.getProvedor);
router.put('/:bd/provedor/:id', ProvedorController.update);
router.delete('/:bd/provedor/:id', ProvedorController.delete);

module.exports = router;