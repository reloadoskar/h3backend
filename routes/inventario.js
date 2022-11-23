'use strict'

var express = require('express');
var Inventario = require('../controllers/inventario');

var router = express.Router();

//Rutas
router.get('/:bd/inventario', Inventario.getInventario);
router.post('/:bd/inventario/movimiento', Inventario.moveInventario);
router.get('/:bd/inventario/movimientos/:mes', Inventario.getMovimientos);
router.get('/:bd/inventario/:ubicacion', Inventario.getInventarioBy);
router.get('/:bd/inventarioxubicacion/', Inventario.getInventarioUbicacion);
router.delete('/:bd/inventario/delete/movimiento/', Inventario.deleteMovimiento);

module.exports = router;
