'use strict'
const mongoose = require('mongoose')
const conexion_app = require('../src/db')
const con = require('../src/dbuser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const curDate = new Date()
let curDateISO = curDate.toISOString()
let tryPeriod = curDate.setDate(curDate.getDate() + 30)
tryPeriod = new Date(tryPeriod).toISOString()
process.env.SECRET_KEY = 'muffintop'

const controller = {
    update: (req, res) => {
        const {user, data} = req.body
        const conn = con(user)
        const params = data;
        const Empleado = conn.model('Empleado')
        // console.log(params)
        Empleado.findOneAndUpdate({_id: params._id}, params, {new:true}, (err, empleadoUpdated) => {
            conn.close()
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar'
                })
            }
            if(!empleadoUpdated){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el empleado'
                })
            }
            return res.status(200).send({
                status: 'success',
                message: "Actualizado.",
                empleado: empleadoUpdated
            })
        })
    },
    getEmpleados: async (req, res) => {
        const user = req.body
        const conn = con(user)        
        try{
            const Empleado = conn.model('Empleado')
            const r = await Empleado.find()
                // .select('nombre sexo leve instagram facebook email telefono ubicacion')            
                .populate('ubicacion')
                .lean()
                conn.close()
            return res.status(200).send({
                status: "success",
                message: "Ok",
                empleados: r
            })
        } catch(error){
            console.error(error)
        }
    },
    
    addEmpleado: (req, res) => {
        const {user, data} = req.body
        const conn = conexion_app()
        const conn2 = con(user)
        // console.log(params)
        const User = conn.model('User')
        const Empleado = conn2.model('Empleado')
        // Creo un usuario para accesar a BD
        try{
            let nusr = new User()
            if(data.area.level < 5){
                nusr.level = data.level
                nusr.nombre = data.nombre
                nusr.telefono = data.telefono
                nusr.email = data.email
                nusr.database = user.database
                nusr.fechaInicio = curDateISO
                nusr.tryPeriodEnds = tryPeriod
                nusr.paidPeriodEnds = tryPeriod
                bcrypt.hash(data.password, 10, (err, hash) =>{
                    nusr.password = hash
                    nusr.save().catch(err=>{console.log(err)})
                })
            }
            //Creo un Empleado en BD local
            let nempleado = new Empleado()
            nempleado._id = nusr._id
            nempleado.nombre = data.nombre
            nempleado.edad = data.edad
            nempleado.level = data.area.level
            nempleado.sexo = data.sexo
            nempleado.sueldo = data.sueldo
            nempleado.ubicacion = data.ubicacion
            nempleado.direccion = data.direccion
            nempleado.telefono = data.telefono
            nempleado.email = data.email
            nempleado.instagram = data.instagram
            nempleado.facebook = data.facebook
            nempleado.save((err, usrSvd) => {
                conn.close()
                if(err){console.log(err)}
                return res.status(200).send({
                    status: "success",
                    message: "Empleado creado correctamente",
                    empleado: usrSvd
                })
            })
        } catch(err){
            conn.close()
            console.error(err)
        }     

    },
    delEmpleado: (req,res) =>{
        const {user, id} = req.body
        const empleadoId = id
        const conn = con(user)
        const bdMaster = conexion_app()
        const Empleado = conn.model('Empleado')
        const User = bdMaster.model('User')
        Empleado.findOneAndDelete({_id: empleadoId}, (err, empleadoRemoved) => {
            if(err)console.log(err)
            User.findOneAndDelete({_id:empleadoId}, (err, userDeleted)=>{
                if(err)console.log(err)
                bdMaster.close()
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Se elimino el empleado correctamente.'
                })
            })
        })
    },
    save: (req, res) => {
        const {email, password, nombre, apellido} = req.body;
        const conn = conexion_app()
        const User = conn.model('User')

        User
        .findOne({email: email}, (err, user) => {
            if(err){
                return res.status(200).send({
                    status: 'error',
                    message:"¡Ups!, ocurrió un error.",
                    err
                })
            }
            if(user === null){
                User.estimatedDocumentCount(count => {
                    const user = new User();
                    user.nombre = nombre
                    user.apellido = apellido
                    user.email = email
                    user.database = 9
                    user.level = 1
                    user.fechaInicio = curDateISO
                    user.tryPeriodEnds = tryPeriod
                    user.paidPeriodEnds = tryPeriod

                    bcrypt.hash(password, 10, (err, hash) => {
                        user.password = hash                        
                        user.save((err, usr) => {
                            if(err || !user) {
                                return res.status(200).send({
                                    status: 'error',
                                    message:"No se guardó el usuario",
                                    err
                                })
                            }else{
                                let con2 = con(user.database)
                                let Ubicacion = con2.model('Ubicacion')
                                let Unidad = con2.model('Unidad')
                                let Empaque = con2.model('Empaque')
                                let Empleado = con2.model('Empleado')
                                let Cliente = con2.model('Cliente')
                                let Provedor = con2.model('Provedor')
                                let TipoCompra = con2.model('TipoCompra')

                                TipoCompra.create({tipo:"COMPRA"})
                                TipoCompra.create({tipo:"CONSIGNACION"})

                                Ubicacion.create({direccion:"", telefono:"", nombre:"BODEGA/ALMACÉN", tipo:"Almacenamiento"})
                                
                                Unidad.create({unidad:"Paquetes", abr:"Paq"})
                                Unidad.create({unidad:"Cajas", abr:"Cj"})
                                Unidad.create({unidad:"Kilos", abr:"Kg"})
                                Unidad.create({unidad:"Onzas", abr:"Oz"})
                                Unidad.create({unidad:"Gramos", abr:"g"})
                                Unidad.create({unidad:"Piezas", abr:"pz"})
                                Unidad.create({unidad:"Litros", abr:"lt"})
                                Unidad.create({unidad:"Galónes", abr:"gt"})
                                Unidad.create({unidad:"Bidón", abr:"gt"})
                                
                                Empaque.create({empaque:"Cajas", abr:"Cj"})
                                Empaque.create({empaque:"Bolsas", abr:"b"})
                                Empaque.create({empaque:"Tarimas", abr:"Tr"})
                                Empaque.create({empaque:"TetraPack", abr:"Tp"})

                                Cliente.create({
                                    nombre: "PÚBLICO EN GENERAL",
                                    rfc: "XAXX010101000",
                                    dias_de_credito: 0,
                                    limite_de_credito: 0,
                                    credito_disponible: 0,
                                })
                                Provedor.create({
                                    nombre: "COMPRAS GENERAL",
                                    clave: "CG",
                                    diasDeCredito: 0,
                                    comision: 0,
                                })

                                let nueva_ubicacion_administracion = new Ubicacion()
                                    nueva_ubicacion_administracion.nombre = "Admin"
                                    nueva_ubicacion_administracion.tipo = "ADMINISTRACIÓN"
                                    nueva_ubicacion_administracion.save((err, nub)=>{
                                        if(err){
                                            console.log(err)
                                            con2.close()
                                            conn.close()
                                        }

                                        let nempleado = new Empleado()
                                        nempleado._id = usr._id
                                        nempleado.nombre = usr.nombre
                                        nempleado.level = 1
                                        nempleado.email = usr.email
                                        nempleado.ubicacion = nub._id
                                        nempleado.save( (err, empleadoSaved) => {
                                            conn.close()
                                            con2.close()
                                            if(err){
                                                return res.status(200).send({
                                                    status: "error",
                                                    message: "No se pudo crear el Empleado.",
                                                    err
                                                })
                                            }
                                            return res.status(200).send({
                                                status: "success",
                                                message: "Usuario creado con éxito.",
                                                usr
                                            })
                                        })
                                    })
                                
                            }
                        })

                    })
                })
            }else{
                return res.status(200).send({
                    status: "error",
                    message: "El usuario ya existe."
                })
            }
        })            
        .catch(err => {
            return res.status(200).send({
                status: 'error',
                message:"¡Ups!, no se que pasó.",
                err
            })
        })
    },

    logout: (req, res) => {
        return res.status(200).send({
            status: 'success',
            message: "Se cerro la sesión."
        })
    },

    login: async (req, res) => {
        const {usuario, password} = req.body
        let errorStatusCode = 500;
        try{
            console.log("Conenctando...")
            const conn = await conexion_app()
        if(!conn){
            errorStatusCode="401"
            throw new Error('Error al conectar a la bd')
        }
        const Usuario = conn.model('User')
        console.log("Buscando usuario...")
        const existingUser = await Usuario.findOne({ email: usuario });
        if (existingUser == null) {
            errorStatusCode = 401;
            throw new Error(`Usuario y password invalidos`);
        }
        const isMatch = await bcrypt.compareSync(password, existingUser.password);
        if (!isMatch) {
            errorStatusCode = 401;
            throw new Error(`Password incorrecto`);
        }
        console.log("Conectando a la BD del usuario...")
        const newConn = await con(existingUser)
        if(!newConn){
            errorStatusCode="401"
            throw new Error('Error al cambiar la bd')
        }

        const Empleado = newConn.model('Empleado', require('../schemas/empleado'))
        const Ubicacion = newConn.model('Ubicacion', require('../schemas/ubicacion'))
        console.log("=> Recopilando datos del usuario en su database...")
        const empleado = await Empleado.findById(existingUser._id).populate("ubicacion")
        if(!empleado){
        errorStatusCode = 401
        throw new Error('No se encontro el No. de empleado.')
        }

        const payload = {
            _id: empleado._id,
            nombre: empleado.nombre,
            apellido: empleado.apellido,
            email: empleado.email,
            ubicacion: empleado.ubicacion,
            level: empleado.level,
            database: existingUser.database,
            tryPeriodEnds: empleado.tryPeriodEnds,
            paidPeriodEnds: empleado.paidPeriodEnds,
        }

        let token = await jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '12h' })

        if(!token){
            errorStatusCode = 401
            throw new Error('No se genero el token.')
        }
        console.log("Token generado, Bienvenido. 🤜🤛")
        return res.status(200).send({
            status: 'success',
            message: 'Bienvenido '+payload.nombre,
            token: token
        })

            // User.findOne({
            //     email: usuario
            // })
            // .lean()
            // .then( user => {
            //     // console.log(user)
            //     if(user){
            //         if(bcrypt.compareSync(password, user.password)){
            //             const conn2 = con(user.database)
            //             const Empleado = conn2.model('Empleado')
            //             Empleado.findById(user._id)
            //             .populate('ubicacion')
            //             // .lean()
            //             .then(emp => {
            //                 conn2.close()
            //                 conn.close()
            //                 const payload = {
            //                     _id: emp._id,
            //                     nombre: emp.nombre,
            //                     apellido: emp.apellido,
            //                     email: emp.email,
            //                     ubicacion: emp.ubicacion,
            //                     level: emp.level,
            //                     database: user.database,
            //                     tryPeriodEnds: user.tryPeriodEnds,
            //                     paidPeriodEnds: user.paidPeriodEnds,
            //                 }
            //                 let token = jwt.sign(payload, process.env.SECRET_KEY, {
            //                     expiresIn: '12h'
            //                 })
            //                 return res.status(200).send({
            //                     status: 'success',
            //                     message: 'Bienvenido '+payload.nombre,
            //                     token
            //                 })
            //             })
            //             .catch(err => {
            //                 console.log(err)
            //                 conn2.close()
            //                 conn.close()
            //                 return res.status(200).send({
            //                     status: 'error',
            //                     message: "El empleado es incorrecto.",
            //                     err
            //                 })    
            //             })
            //         }else{
            //             return res.status(200).send({
            //                 status: 'error',
            //                 message: "El usuario o la contraseña son incorrectos."
            //             })
            //         }
            //     }else{
            //         return res.status(200).send({
            //             status: 'error',
            //             message: "El usuario no existe."
            //         })
            //     }
            // })
            // .catch(err => {
            //     return res.status(200).send({
            //         status: "error",
            //         message: "Algo paso con la BASE DE DATOS."+err,
            //     })
            // })
        }catch(err){
            console.log(err)
            return res.status(500).send({
                status: "error",
                message: "No hay conectividad con la red.",
                err
            })
        }
    },

    profile: (req, res) => {
        const conn = conexion_app()
        const User = conn.model('User')
        let decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)

        User.findOne({
            _id: decoded._id
        })
        .then(user => {
            conn.close()
            if(user){
                res.send({
                    message: "success",
                    user
                })
            }else{
                res.send({ message: "El usuario no existe."})
            }
        })
        .catch(err => {
            res.send({'error': err})
        })
    },

    restartApp: (req, res) => {
        const bd= req.params.bd
        const conn = con(bd)
        const Cliente = conn.model('Cliente')
        const CompraItem = conn.model('CompraItem')
        const Compra = conn.model('Compra')
        const Corte = conn.model('Corte')
        const Egreso = conn.model('Egreso')
        const Ingreso = conn.model('Ingreso')
        const Insumo = conn.model('Insumo')
        const ProduccionItem = conn.model('ProduccionItem')
        const Produccion = conn.model('Produccion')
        const Producto = conn.model('Producto')
        const Provedor = conn.model('Provedor')
        const Ubicacion = conn.model('Ubicacion')
        const Venta = conn.model('Venta')
        const VentaItem = conn.model('VentaItem')
        const Movimiento = conn.model('Movimiento')
        
        // Cliente.deleteMany({}).exec((err, docs) => {
        //     if(err){console.log(err)}
        //     console.log("Cliente - vaciado")
        // })
        CompraItem.deleteMany({}).exec((err, docs) => {
            if(err){console.log(err)}
            console.log("Compra items - vaciado")
        })
        Compra.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Compra - vaciado")
        })
        Corte.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Corte - vaciado")
        })
        Egreso.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Egreso - vaciado")
        })
        Ingreso.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Ingreso - vaciado")
        })
        // Insumo.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("Insumo - vaciado")
        // })
        // ProduccionItem.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("ProduccionItem - vaciado")
        // })
        // Produccion.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("Produccion - vaciado")
        // })
        // Producto.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("Producto - vaciado")
        // })
        // Provedor.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("Provedor - vaciado")
        // })
        // Ubicacion.deleteMany({}).exec((err, docs)=> {
        //     if(err){console.log(err)}
        //     console.log("Ubicacion - vaciado")
        // })
        Venta.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Venta - vaciado")
        })
        Movimiento.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Movimientos - vaciado")
        })
        VentaItem.deleteMany({}).exec((err, docs)=> {
            if(err){console.log(err)}
            console.log("Venta items - vaciado")
            conn.close()
            return res.status(200).send({
                message: 'Restart done!'
            })
        })


    }

}

module.exports = controller;