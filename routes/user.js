'use strict'

const express = require('express');
const router = express.Router();
const cors = require('cors')

const UserController = require('../controllers/user');
const EmpresaController = require('../controllers/empresa');

router.use(cors())



//Rutas
router.post('/client/register', UserController.save);
router.post('/user/login', UserController.login)
router.get('/profile', UserController.profile)
router.get('/logout', UserController.logout)
router.get('/:bd/restartApp', UserController.restartApp)

router.get('/:bd/empleados', UserController.getEmpleados)
router.post('/:bd/empleados/add', UserController.addEmpleado)
router.delete('/:bd/empleado/:id', UserController.delEmpleado)
router.put('/:bd/empleado/update/', UserController.update);

router.get('/:bd/empresa', EmpresaController.get);
router.put('/:bd/empresa/update/', EmpresaController.update);

module.exports = router;