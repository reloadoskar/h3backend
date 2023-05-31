'use strict'
const mongoose = require('mongoose')
const con = require('../src/dbuser')
var controller = {
    getInventario: async (req, res) => {
        const user = req.body
        const conn = await con(user)
        const CompraItem = conn.model('CompraItem')

        const inventario = await CompraItem
            .find({"stock": {$gt:0.3} })
            .populate({path:'ubicacion', select: 'nombre tipo'})
            .populate({path:'compra', select:'folio fecha clave'})
            .populate({
                path: 'producto',
                select: 'nombre descripcion unidad empaque',
                populate: {
                    path: 'unidad empaque',
                    select: 'abr'
                }
            })
            .sort('createdAt')
            .lean()
            .then( inv => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Items encontrados',
                    inventario: inv
                })
                
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: "No se encontraron items." + err,
                })
            })
    },
    
    getInventarioBy: async (req, res) => {
        const {user, ubicacion} = req.body
        const conn = await con(user)
        const CompraItem = conn.model('CompraItem')
        CompraItem.find({ubicacion: mongoose.Types.ObjectId(ubicacion), stock: { $gt: 0.3} })
            .populate('ubicacion')
            .populate({path:'compra', select: 'folio clave'})
            .populate({path: 'producto',
                populate: {path: 'unidad empaque', select: 'abr'}
            })
            .then(inventario => {
                conn.close()
                return res.status(200).send({
                    status: "Encontrado",
                    inventario
                })
            })
            .catch(err => {
                conn.close()
                    return res.status(500).send({
                        status: "error",
                        err
                    })
            })
    },

    getInventarioUbicacion: async (req, res) => {
        const bd = req.params.bd
        const conn = await con(bd)
        const CompraItem = conn.model('CompraItem')
        try{
            const inventario = await CompraItem.aggregate()
                .match({stock: {$gt: 0.3}})
                .lookup({ from: 'ubicacions', localField: "ubicacion", foreignField: '_id', as: 'ubicacion' })
                .lookup({ from: 'compras', localField: "compra", foreignField: '_id', as: 'compra' })
                .lookup({ from: 'productos', localField: "producto", foreignField: '_id', as: 'producto' })
                .lookup({ from: 'unidads', localField: "producto.unidad", foreignField: '_id', as: 'productounidad' })
                .lookup({ from: 'empaques', localField: "producto.empaque", foreignField: '_id', as: 'productoempaque' })
                .project({
                    _id: 1,
                    stock: 1,
                    empaques: 1,
                    empaquesStock: 1,
                    ubicacion: 1, 
                    clasificacion: 1,
                    "compra._id":1,
                    "compra.folio": 1, 
                    "compra.clave": 1, 
                    "compra.status": 1,
                    "producto._id": 1,
                    "producto.descripcion": 1,
                    "productounidad": 1,
                    "productoempaque": 1,
                })
                .unwind('compra')
                .unwind('producto')
                .unwind('productounidad')
                .unwind('productoempaque')
                .group({
                    _id: "$ubicacion",
                    items: {$push: {
                        _id: "$_id", 
                        compra: "$compra", 
                        clasificacion: "$clasificacion",
                        producto: "$producto", 
                        productounidad: "$productounidad", 
                        productoempaque: "$productoempaque", 
                        stock: "$stock", 
                        empaquesStock: "$empaquesStock", 
                        empaques: "$empaques"}},
                })
                .unwind('_id')
                .sort('_id.nombre')
                .then(inventario => {
                    conn.close()
                    return res.status(200).send({
                        status: "success",
                        message: "Encontrado",
                        inventario
                    })
                })
                .catch(err => {
                    conn.close()
                    return res.status(500).send({
                        status: "error",
                        err
                    })
                })

        } catch(err){
            console.error(err)
        }
    },

    getCambios: async (req, res) => {
        const {user, fecha} = req.body
        const conn = await con(user) 
        const Cambio = conn.model('Cambio')
        let d = new Date(fecha)
        var firstDay = new Date(d.getFullYear(), d.getUTCMonth(), 1);
        var lastDay = new Date(d.getFullYear(), d.getUTCMonth() + 1, 0);

        const cambios = await Cambio.find(
            {createdAt: { $gt: firstDay, $lt: lastDay }}
        )
            .populate('ubicacion compraItem')

        if(!cambios){
            return res.status(404).send({
                status: "error",
                message: "No se encontraron resultados. 🤷‍♂️😢",
            })
        }
        conn.close()
        return res.status(200).send({
            status: "success",
            message: "Cambios encontrados",
            cambios: cambios 
        })
    },

    getCambiosUbicacion: async (req, res) => {
        const {user, ubicacion, fecha} = req.body
        const conn = await con(user) 
        const Cambio = conn.model('Cambio')

        const cambiosUbicacion = Cambio.find({ubicacion: ubicacion, fecha: fecha})

        if(!cambiosUbicacion){
            return res.status(404).send({
                status: "error",
                message: "No se encontraron resultados. 🤷‍♂️😢",
            })
        }
        conn.close()
        return res.status(200).send({
            status: "success",
            message: "Cambios encontrados",
            cambios: cambiosUbicacion 
        })
    },

    createSolicitudCambio: async (req, res) => {
        const {user, solicitud} = req.body
        const conn = await con(user) 
        const Cambio = conn.model('Cambio')
        const CompraItem = conn.model('CompraItem')

        const cambioscount = await Cambio.estimatedDocumentCount()
        const foliosig = cambioscount + 1
        solicitud.folio = foliosig
        const respuesta = await Cambio.create(solicitud)

        if(!respuesta){
            return res.status(404).send({
                status: "error",
                message: "No sé. 🤷‍♂️😢",
            })
        }

        if(solicitud.descontarInventario){
            console.log("descontando de inventario..."+solicitud.compraItem)
            const descinv = await CompraItem.updateOne( 
                {_id: solicitud.compraItem },
                {"$inc": { "stock":  -solicitud.peson }} 
                )
                .then(res=>{
                    console.log(res)
                })
                .catch(err=>{
                    console.log(err.message,'error')
                })
        }

        await respuesta.populate('ubicacion compraItem')
        conn.close()
        return res.status(200).send({
            status: "success",
            message: "Solicitud registrada",
            respuesta: respuesta
        })
    },

    stockUp: async (req, res) => {
        const {user, respuesta: data} = req.body
        // console.log(data)
        const conn = await con(user) 
        const Cambio = conn.model('Cambio')
        const CompraItem = conn.model('CompraItem')

        const resp = await Cambio.findOneAndUpdate({"_id":data._id}, data, {new: true})

        if(data.respuesta.descontarInventario){
            console.log("descontando de inventario..."+data.respuesta.compraItem)
            const descinv = await CompraItem.updateOne( 
                {_id: data.respuesta.compraItem._id },
                {"$inc": { "stock":  -data.respuesta.peson }} 
                ).catch(err=>{
                    console.log(err.message,'error')
                })
        }
        if(!resp){
            return res.status(404).send({
                status: "error",
                message: "No sé. 🤷‍♂️😢",
            })
        }

        await resp.populate('ubicacion compraItem')
        conn.close()
        return res.status(200).send({
            status: "success",
            message: "Se envio la respuesta.",
            cambio: resp
        })
    },

    aceptarCambio: async (req, res) => {
        const {user, firma} = req.body
        const conn = await con(user)
        const Cambio = conn.model('Cambio')
        const cambioTerminado = await Cambio.findOneAndUpdate({'_id':firma._id}, firma, {new:true})   
        if(!cambioTerminado){
            return res.status(404).send({
                status: "error",
                message: "No sé. 🤷‍♂️😢",
            })
        }
        await cambioTerminado.populate('ubicacion compraItem')
        conn.close()
        return res.status(200).send({
            status: "success",
            message: "Se envio la firma.",
            cambio: cambioTerminado
        })
    },

    getMovimientos: async (req, res) => {
        const {user, month} = req.body
        const conn = await con(user)        
        const Movimiento = conn.model('Movimiento')

        const movimientos = Movimiento.find({fecha: month}).sort({'createdAt': -1})
            .then(movs=>{
                conn.close()
                return res.status(200).send({
                    status: "success",
                    message: "Movimientos encontrados",
                    movimientos: movs 
                })
            })

    },
    
    moveInventario: async (req, res) => {
        const {user, data} = req.body
        const compraId = data.itemsel.compra._id || data.itemsel.compra
        const conn = await con(user)
        const CompraItem = conn.model('CompraItem')
        const Compra = conn.model('Compra')
        const Movimiento = conn.model('Movimiento')

        let numeroMovimientos = await Movimiento.countDocuments()
        if(!numeroMovimientos){
            return res.status(404).send({
                status: "error",
                message: "Error al numerar los movimientos",
            })
        }

        // const movimiento = new Movimiento()
        let movimiento = {}
            movimiento.folio = numeroMovimientos + 1
            movimiento.status = "OK"
            movimiento.fecha = data.fecha
            movimiento.origen = data.origensel.ubicacion
            movimiento.destino = data.destino
            movimiento.item = data.itemsel
            movimiento.cantidad = data.itemselcantidad
            movimiento.empaques = data.itemselempaques
            movimiento.clasificacion = data.clasificacion
            movimiento.comentario = data.comentario
            movimiento.pesadas = data.pesadas
            movimiento.tara=data.tara
            movimiento.ttara=data.ttara
            movimiento.bruto=data.bruto
            movimiento.neto=data.neto

        let movSaved = await Movimiento.create(movimiento)

        if(!movSaved){
            return res.status(404).send({
                status: "error",
                message: "No se pudo crear el movimiento.",
            })
        }
            
            
            // movimiento.save((err, movimiento) => {
            //     if(err){
            //         conn.close()
            //         return res.status(500).send({
            //             status: 'error',
            //             message: "No se pudo guardar el movimiento.",
            //             err
            //         })
            //     }
        let itmOrigen = await CompraItem.findById(data.itemsel._id)

        if(!itmOrigen){
            return res.status(404).send({
                status: "error",
                message: "No se encontro el item original.",
            })
        }
        // .exec((err, item) => {
        //             if(err || !item){
        //                 return res.status(500).send({
        //                     status: 'error',
        //                     message: "No se encontro el item origen.",
        //                     err
        //                 })
        //             }
            itmOrigen.cantidad -= data.itemselcantidad
            itmOrigen.stock -= data.itemselcantidad
            itmOrigen.empaques -= data.itemselempaques
            itmOrigen.empaquesStock -= data.itemselempaques
            itmOrigen.importe = itmOrigen.cantidad * itmOrigen.costo

        let itmOrigenUpdated = await itmOrigen.save()

        if (!itmOrigenUpdated){
            return res.status(404).send({
                status: "error",
                message: "No se actualizó el item origen.",
            })
        }
                    // item.save((err, itemsaved) => {
                    //     if(err){
                    //         return res.status(500).send({
                    //             status: 'error',
                    //             message: "No se pudo actualizar el item origen"
                    //         })
                    //     }
        // let nitem = new CompraItem()
        let nitem = {}
            nitem.ubicacion = data.destino
            nitem.compra = data.itemsel.compra
            nitem.producto = data.itemsel.producto
            nitem.cantidad = data.itemselcantidad
            nitem.clasificacion = data.clasificacion
            nitem.stock = data.itemselcantidad
            nitem.empaques = data.itemselempaques
            nitem.empaquesStock = data.itemselempaques
            nitem.costo = itmOrigen.costo
            nitem.importe = nitem.cantidad * itmOrigen.costo

        let nitemsaved = await CompraItem.create(nitem)

        if(!nitemsaved){
            return res.status(404).send({
                status: "error",
                message: "No se guardó el nuevo item.",
            })
        }

        // nitem.save((err, nitemsaved) => {
        //     if(err){
        //         conn.close()
        //         return res.status(500).send({
        //             status: 'error',
        //             message: "No se creó el nuevo item.",
        //             err
        //         })
        //     }

        let compra = await  Compra.findById(compraId)
        if(!compra){
            return res.status(404).send({
                status: "error",
                message: "No se encontró la compra.",
            })
        }
            // .exec((err, compra) => {
            //                     if(err){console.log(err)}
            compra.items.push(nitemsaved._id)
            compra.movimientos.push(movSaved._id)

        let compraUpdated = await compra.save()
        if(!compraUpdated){
            return res.status(404).send({
                status: "error",
                message: "No se actualizó la compra.",
            })
        }
        
        let nitempopulated = await CompraItem.findOne({_id:nitemsaved._id})
            .populate("compra ubicacion producto")
            .populate({path: 'producto',
                select: 'nombre descripcion unidad empaque',
                populate: {
                    path: 'unidad empaque',
                    select: 'abr'
                }
            })
        return res.status(200).send({
            status:'success',
            message: "Movimiento guardado correctamente. 👍",
            movimiento: movSaved,
            compraItem: nitempopulated
        })
          
    },

    deleteMovimiento: async (req, res)=>{
        const {user, data} = req.body
        const conn = await con(user)
        const CompraItem = conn.model('CompraItem')
        const Compra = conn.model('Compra')
        const Movimiento = conn.model('Movimiento')

        const numeroMovimientos = await Movimiento.countDocuments()

        const cancelarmovimiento = new Movimiento()
        cancelarmovimiento.folio = numeroMovimientos + 1
        cancelarmovimiento.status = "CANCELADO"
        cancelarmovimiento.fecha = new Date().toISOString().split('T')[0]
        //invertimos valores para regresar
        cancelarmovimiento.destino = data.origen
        cancelarmovimiento.origen = data.destino

        cancelarmovimiento.item = data.item
        cancelarmovimiento.cantidad = data.cantidad
        cancelarmovimiento.empaques = data.empaques
        cancelarmovimiento.clasificacion = data.clasificacion
        cancelarmovimiento.comentario = "CANCELACION DE MOVIMIENTO FOLIO: "+data.folio
        cancelarmovimiento.pesadas = data.pesadas
        cancelarmovimiento.tara=data.tara
        cancelarmovimiento.ttara=data.ttara
        cancelarmovimiento.bruto=data.bruto
        cancelarmovimiento.neto=data.neto

        cancelarmovimiento.save((err, movcancelado) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: "No se pudo guardar el movimiento.",
                    err
                })
            }
            CompraItem.findById(data.item._id).exec((err, item) => {
                if(err || !item){
                    return res.status(500).send({
                        status: 'error',
                        message: "No se encontro el item origen.",
                        err
                    })
                }
                item.cantidad += data.cantidad
                item.stock += data.cantidad
                item.empaques += data.empaques
                item.empaquesStock += data.empaques
                item.importe = item.cantidad * item.costo
                item.save((err, itemsaved) => {
                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: "No se pudo actualizar el item origen"
                        })
                    }
                    const nitem = new CompraItem()
                    nitem.ubicacion = data.destino._id
                    nitem.compra = data.item.compra._id
                    nitem.producto = data.item.producto._id
                    nitem.cantidad = data.cantidad
                    nitem.clasificacion = data.clasificacion
                    nitem.stock = data.cantidad
                    nitem.empaques = data.empaques
                    nitem.empaquesStock = data.empaques
                    nitem.costo = itemsaved.costo
                    nitem.importe = nitem.cantidad * itemsaved.costo
                    nitem.save((err, nitemsaved) => {
                        if(err){
                            return res.status(500).send({
                                status: 'error',
                                message: "No se creó el nuevo item.",
                                err
                            })
                        }
                        Compra.findById(item.compra._id).exec((err, compra) => {
                            if(err){console.log(err)}
                            compra.items.push(nitemsaved._id)
                            compra.movimientos.push(movcancelado._id)
                            compra.save( (err, compra) => {
                                if(err){
                                    return res.status(500).send({
                                        status:"error",
                                        message: "No se actualizo la compra.",
                                        err
                                    })
                                }
                                Movimiento.findById({_id: data._id}).exec((err, movupd)=>{
                                    if(err)console.log(err)
                                    movupd.status = "CANCELADO"
                                    movupd.save( (err) =>{
                                        if(err){
                                            return res.status(500).send({
                                                status:"error",
                                                message: "No se actualizo la compra.",
                                                err
                                            })
                                        }
                                        conn.close()
                                        return res.status(200).send({
                                            status:'success',
                                            message: "Movimiento guardado correctamente. 👍",
                                            movimiento: cancelarmovimiento
                                        })
                                    } )
                                })
                            })

                        })
                    })
                })
            })
        })
    }
}

module.exports = controller;