'use strict'

var express = require('express');
var UbicacionController = require('../controllers/ubicacion');

var router = express.Router();

//Rutas
router.post('/:bd/ubicacion/save', UbicacionController.save);
router.get('/:bd/ubicacions', UbicacionController.getUbicacions);
router.get('/:bd/ubicacions/saldo', UbicacionController.getUbicacionsSaldo);
router.get('/:bd/ubicacion/:id', UbicacionController.getUbicacion);
router.put('/:bd/ubicacion/update/:id', UbicacionController.update);
router.delete('/:bd/ubicacion/:id', UbicacionController.delete);

module.exports = router;