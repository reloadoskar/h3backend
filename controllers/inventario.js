'use strict'
const mongoose = require('mongoose')
const con = require('../src/dbuser')
var controller = {
    getInventario: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
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
    
    getInventarioBy: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const ubicacion = req.params.ubicacion;
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
        const conn = con(bd)
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

    getMovimientos: (req, res) => {
        const bd = req.params.bd
        const fecha = req.params.mes //cambiar por fecha
        // const year = 2022
        const conn = con(bd)
        // let f1 = year + "-" + mes + "-01"
        // console.log(f1)
        // let f2 = year + "-" + mes + "-31"
        // console.log(f2)

        const Movimiento = conn.model('Movimiento')

        const movimientos = Movimiento.find({fecha: fecha}).sort({'createdAt': -1})
            .then(movs=>{
                return res.status(200).send({
                    status: "success",
                    message: "Movimientos encontrados",
                    movimientos: movs 
                })
            })

    },
    // getMovimientos: (req, res) => {
    //     const bd = req.params.bd
    //     const mes = req.params.mes
    //     const year = 2022
    //     const conn = con(bd)
    //     let f1 = year + "-" + mes + "-01"
    //     // console.log(f1)
    //     let f2 = year + "-" + mes + "-31"
    //     // console.log(f2)

    //     const Movimiento = conn.model('Movimiento')

    //     const movimientos = Movimiento.find({fecha: { $gte: f1, $lte: f2 }}).sort({'createdAt': -1})
    //         .then(movs=>{
    //             return res.status(200).send({
    //                 status: "success",
    //                 message: "Movimientos encontrados",
    //                 movimientos: movs 
    //             })
    //         })

    // },

    moveInventario: async (req, res) => {
        const bd = req.params.bd
        const params = req.body;
        // const destinoId = params.destino._id
        const compraId = params.itemsel.compra._id
        // const productoId = params.itemsel.producto._id
        // const cantidadm = parseInt(params.itemselcantidad)
        // const empaquesm = parseInt(params.itemselempaques)
        const conn = con(bd)
        const CompraItem = conn.model('CompraItem')
        const Compra = conn.model('Compra')
        const Movimiento = conn.model('Movimiento')

        const numeroMovimientos = await Movimiento.countDocuments()

        const movimiento = new Movimiento()
            movimiento.folio = numeroMovimientos + 1
            movimiento.status = "OK"
            movimiento.fecha = params.fecha
            movimiento.origen = params.origensel.ubicacion
            movimiento.destino = params.destino
            movimiento.item = params.itemsel
            movimiento.cantidad = params.itemselcantidad
            movimiento.empaques = params.itemselempaques
            movimiento.clasificacion = params.clasificacion
            movimiento.comentario = params.comentario
            movimiento.pesadas = params.pesadas
            movimiento.tara=params.tara
            movimiento.ttara=params.ttara
            movimiento.bruto=params.bruto
            movimiento.neto=params.neto
            movimiento.save((err, movimiento) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: "No se pudo guardar el movimiento.",
                        err
                    })
                }
                CompraItem.findById(params.itemsel._id).exec((err, item) => {
                    if(err || !item){
                        return res.status(500).send({
                            status: 'error',
                            message: "No se encontro el item origen.",
                            err
                        })
                    }
                    item.cantidad -= params.itemselcantidad
                    item.stock -= params.itemselcantidad
                    item.empaques -= params.itemselempaques
                    item.empaquesStock -= params.itemselempaques
                    item.importe = item.cantidad * item.costo
                    item.save((err, itemsaved) => {
                        if(err){
                            return res.status(500).send({
                                status: 'error',
                                message: "No se pudo actualizar el item origen"
                            })
                        }
                        const nitem = new CompraItem()
                        nitem.ubicacion = params.destino._id
                        nitem.compra = params.itemsel.compra._id
                        nitem.producto = params.itemsel.producto._id
                        nitem.cantidad = params.itemselcantidad
                        nitem.clasificacion = params.clasificacion
                        nitem.stock = params.itemselcantidad
                        nitem.empaques = params.itemselempaques
                        nitem.empaquesStock = params.itemselempaques
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
                            Compra.findById(compraId).exec((err, compra) => {
                                if(err){console.log(err)}
                                compra.items.push(nitemsaved._id)
                                compra.movimientos.push(movimiento._id)
                                compra.save((err, compra) => {
                                    conn.close()
                                    if(err){
                                        return res.status(500).send({
                                            status:"error",
                                            message: "No se actualizo la compra.",
                                            err
                                        })
                                    }
                                    return res.status(200).send({
                                        status:'success',
                                        message: "Movimiento guardado correctamente. 👍",
                                        movimiento
                                    })
                                })

                            })
                        })
                    })
                })
            })

    },

    deleteMovimiento: async (req, res)=>{
        const bd = req.params.bd
        const id = req.params.id
        const movimiento = req.body
        const conn = con(bd)
        const CompraItem = conn.model('CompraItem')
        const Compra = conn.model('Compra')
        const Movimiento = conn.model('Movimiento')

        const numeroMovimientos = await Movimiento.countDocuments()

        const cancelarmovimiento = new Movimiento()
        cancelarmovimiento.folio = numeroMovimientos + 1
        cancelarmovimiento.status = "CANCELADO"
        cancelarmovimiento.fecha = new Date().toISOString().split('T')[0]
        //invertimos valores para regresar
        cancelarmovimiento.destino = movimiento.origen
        cancelarmovimiento.origen = movimiento.destino

        cancelarmovimiento.item = movimiento.item
        cancelarmovimiento.cantidad = movimiento.cantidad
        cancelarmovimiento.empaques = movimiento.empaques
        cancelarmovimiento.clasificacion = movimiento.clasificacion
        cancelarmovimiento.comentario = "CANCELACION DE MOVIMIENTO FOLIO: "+movimiento.folio
        cancelarmovimiento.pesadas = movimiento.pesadas
        cancelarmovimiento.tara=movimiento.tara
        cancelarmovimiento.ttara=movimiento.ttara
        cancelarmovimiento.bruto=movimiento.bruto
        cancelarmovimiento.neto=movimiento.neto







        cancelarmovimiento.save((err, movcancelado) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: "No se pudo guardar el movimiento.",
                    err
                })
            }
            CompraItem.findById(movimiento.item._id).exec((err, item) => {
                if(err || !item){
                    return res.status(500).send({
                        status: 'error',
                        message: "No se encontro el item origen.",
                        err
                    })
                }
                item.cantidad += movimiento.cantidad
                item.stock += movimiento.cantidad
                item.empaques += movimiento.empaques
                item.empaquesStock += movimiento.empaques
                item.importe = item.cantidad * item.costo
                item.save((err, itemsaved) => {
                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: "No se pudo actualizar el item origen"
                        })
                    }
                    const nitem = new CompraItem()
                    nitem.ubicacion = movimiento.destino._id
                    nitem.compra = movimiento.item.compra._id
                    nitem.producto = movimiento.item.producto._id
                    nitem.cantidad = movimiento.cantidad
                    nitem.clasificacion = movimiento.clasificacion
                    nitem.stock = movimiento.cantidad
                    nitem.empaques = movimiento.empaques
                    nitem.empaquesStock = movimiento.empaques
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
                                Movimiento.findById({_id: movimiento._id}).exec((err, movupd)=>{
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
















        // return res.status(200).send({
        //     status:'success',
        //     message: "Movimiento eliminado correctamente. 👍",
        //     movimiento
        // })
    }
}

module.exports = controller;