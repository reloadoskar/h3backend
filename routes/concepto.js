'use strict'

var express = require('express');
var ConceptoController = require('../controllers/concepto');

var router = express.Router();

//Rutas
router.post('/conceptos', ConceptoController.getConceptos)
router.post('/concepto/save', ConceptoController.save);
router.post('/concepto/delete', ConceptoController.delete)

module.exports = router;