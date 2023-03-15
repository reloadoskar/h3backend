'use strict'

var express = require('express');
var Inventario = require('../controllers/inventario');

var router = express.Router();

//Rutas
router.post('/inventario', Inventario.getInventario);
router.post('/inventario/movimiento', Inventario.moveInventario);
router.post('/inventario/movimientos', Inventario.getMovimientos);
router.post('/inventario/:ubicacion', Inventario.getInventarioBy);
router.post('/inventarioxubicacion/', Inventario.getInventarioUbicacion);
router.post('/inventario/delete/movimiento/', Inventario.deleteMovimiento);

router.post('/cambios/ubicacion', Inventario.getCambiosUbicacion)
router.post('/cambios/solicitud', Inventario.createSolicitudCambio)
router.post('/cambios', Inventario.getCambios)
router.post('/cambios/stockup', Inventario.stockUp)
router.post('/cambios/aceptar', Inventario.aceptarCambio)

module.exports = router;
