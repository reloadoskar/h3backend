'use strict'

const express = require('express');
const router = express.Router();
const cors = require('cors')

const UserController = require('../controllers/user');
const EmpresaController = require('../controllers/empresa');

router.use(cors())



//Rutas
router.post('/user/login', UserController.login)
router.post('/client/register', UserController.save);
router.get('/profile', UserController.profile)
router.get('/logout', UserController.logout)
router.get('/:bd/restartApp', UserController.restartApp)

router.post('/empleados', UserController.getEmpleados)
router.post('/empleados/save', UserController.addEmpleado)
router.post('/empleado/delete', UserController.delEmpleado)
router.post('/empleado/update', UserController.update);

router.post('/empresa', EmpresaController.get);
router.post('/empresa/save', EmpresaController.save);
router.post('/empresa/update', EmpresaController.update);

module.exports = router;