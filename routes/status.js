'use strict'

var express = require('express');
var StatusController = require('../controllers/status');

var router = express.Router();

//Rutas
router.post('/:bd/status/save', StatusController.save);
router.get('/:bd/status', StatusController.getStatuss);
router.get('/:bd/status/:id', StatusController.getStatus);
router.put('/:bd/status/:id', StatusController.update);
router.delete('/:bd/status/:id', StatusController.delete);

module.exports = router;