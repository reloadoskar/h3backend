'use strict'

var express = require('express');
var ConceptoController = require('../controllers/concepto');

var router = express.Router();

//Rutas
router.get('/:bd/conceptos', ConceptoController.getConceptos)
router.post('/:bd/concepto/save', ConceptoController.save);
router.delete('/:bd/concepto/:id', ConceptoController.delete)

module.exports = router;