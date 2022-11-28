'use strict'

var express = require('express');
var UbicacionController = require('../controllers/ubicacion');

var router = express.Router();

//Rutas
router.post('/ubicacions', UbicacionController.getUbicacions);
router.post('/ubicacion/save', UbicacionController.save);
router.post('/ubicacions/saldo', UbicacionController.getUbicacionsSaldo);
router.post('/ubicacion', UbicacionController.getUbicacion);
router.post('/ubicacion/update', UbicacionController.update);
router.post('/ubicacion/delete', UbicacionController.delete);

module.exports = router;