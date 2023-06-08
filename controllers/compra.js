'use strict'
const mongoose = require('mongoose');

const con = require('../src/dbuser')

var controller = {
    save: async (req, res) => {
        const {user, data} = req.body;
        const conn = await con(user)
        const Compra = conn.model('Compra')
        const CompraItem = conn.model('CompraItem')
        const Egreso = conn.model('Egreso')
        const Provedor = conn.model('Provedor')

        let numerocompras = await Compra.estimatedDocumentCount()
        // if(!numerocompras){
        //     return res.status(401).send({status:"error", message:"No se encontraron compras 🤷‍♂️"})
        // }

        let nuevacompra = {
            _id: mongoose.Types.ObjectId(),
            folio: numerocompras + 1,
            provedor: data.provedor,
            ubicacion: data.ubicacion,
            tipoCompra: data.tipoCompra,
            remision: data.remision,
            importe: data.importe,
            saldo: data.importe,
            fecha: data.fecha,
            status: 'ACTIVO',
            items: []
        }

        let provedor = await Provedor.findById(nuevacompra.provedor)
        if(!provedor){
            return res.status(401).send({status:"error", message:"No se encontraró el productor seleccionado 🤷‍♂️"})
        }

        let numerocomprasproductor = await Compra.countDocuments({provedor: data.provedor._id})
        let sigientenumerocompraproductor = numerocomprasproductor + 1
        //Posiblemente se atore en productores nuevos*****
        // if(!numerocomprasproductor){
        //     return res.status(401).send({status:"error", message:"No se encontraron compras del productor 🤷‍♂️"})
        // }
        
        nuevacompra.clave = data.provedor.clave + "-" + sigientenumerocompraproductor
        let i = data.items
        let itmsToSave = []
        i.map((item) => {
            let compraItem = {}
            compraItem._id = mongoose.Types.ObjectId()
            compraItem.ubicacion = data.ubicacion
            compraItem.clasificacion = "S/C"
            compraItem.compra = nuevacompra._id
            compraItem.producto = item.producto
            compraItem.cantidad = item.cantidad
            compraItem.stock = item.cantidad
            compraItem.empaques = item.empaques
            compraItem.empaquesStock = item.empaques
            compraItem.costo = item.costo
            compraItem.importe = item.importe
            itmsToSave.push(compraItem)
        })
        nuevacompra.itemsOrigen = itmsToSave

        let compraitemsguardados = await CompraItem.insertMany(itmsToSave)
        if(!compraitemsguardados){
            return res.status(401).send({status:"error", message:"No se guardaron los compraitems"})
        }
        
        compraitemsguardados.map(itm => {
            nuevacompra.items.push(itm._id)
        })

        let numeroegresos = await Egreso.estimatedDocumentCount()
        
        let g = data.gastos
        g.map((gasto) => {
            var egreso = new Egreso()
            egreso._id = mongoose.Types.ObjectId()
            egreso.folio = numeroegresos + 1
            egreso.tipo = "COMPRA"
            egreso.ubicacion = nuevacompra.ubicacion
            egreso.concepto = gasto.concepto
            egreso.descripcion = gasto.descripcion
            egreso.fecha = nuevacompra.fecha
            egreso.importe = 0
            egreso.saldo = gasto.importe
            egreso.compra = nuevacompra._id
            nuevacompra.gastos.push(egreso._id)
            provedor.cuentas.push(egreso._id)
            egreso.save((err, e) => {
                if (err) { console.log(err) }
            })
        })
        // compra.gastos.push(cgastos)

        let compraguardada = await Compra.create(nuevacompra)
        console.log(compraguardada)
        if(!compraguardada){
            return res.status(401).send({status:"error", message:"No se guardó la compra"})
        }

        let egresocompra = await Egreso.create({
            folio: numeroegresos + 1,
            tipo: "COMPRA",
            ubicacion: nuevacompra.ubicacion,
            concepto: "COMPRA",
            fecha: nuevacompra.fecha,
            importe: 0,
            saldo: data.importeItems,
            compra: nuevacompra._id,
        })
        if(!egresocompra){
            return res.status(401).send({status:"error", message:"No se guardó el egreso de la compra"})
        }
        provedor.cuentas.push(egresocompra._id)
            
        let productoractualizado = await provedor.save()
        if(!productoractualizado){
            return res.status(401).send({status:"error", message:"No se actualizaron los datos del productor"})
        }

        let comprapopuleada = await Compra.findById(compraguardada._id)
            .populate('provedor', 'nombre')
            .populate('ubicacion')
            .populate('tipoCompra')
            .populate({
                path: 'items',
                populate: { path: 'producto', populate: "empaque unidad" },
            })
            .populate({
                path: 'items',
                populate: { path: 'provedor' },
            })
        conn.close()
        return res.status(200).send({
            status: 'success',
            message: 'Compra registrada correctamente.',
            compra: comprapopuleada,
        })
    },

    getComprasActivas: async (req, res) => {
        const bd = req.params.bd
        const conexion = await con(bd)
        try {
            const Compra = conexion.model('Compra')
            const resp = await Compra
                .find({ status: "ACTIVO" })
                .select("folio clave saldo status")
                .sort('folio')
                .lean()
                .then(compras => {
                    conexion.close()
                    return res.status(200).send({
                        status: 'success',
                        compras: compras
                    })
                })
                .catch(err => {
                    conexion.close()
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al devolver los compras' + err
                    })
                })
        } catch (error) {
            console.log(error)
            conexion.close()
            return res.status(500).send({
                status: 'error',
                message: 'Error al devolver los compras' + err
            })
        }
    },

    getCompras: async (req, res) => {
        const {user, mesAnio} = req.body
        const conn = await con(user)
        const Compra = conn.model('Compra')
        const Liquidacion = conn.model('Liquidacion')
        const compra = await Compra
            .find({
                fecha: { $gt: mesAnio + "-00", $lt: mesAnio + "-32" }
                // fecha: { $gt: year + "-" + mes + "-00", $lt: year + "-" + mes + "-32" }
            })
            .sort('folio')
            // .lean()
            .populate('provedor', 'nombre diasDeCredito comision email cta1 tel1')
            .populate('ubicacion')
            .populate('tipoCompra')
            .populate({
                path: 'items',
                populate: { path: 'producto' },
            })
            .populate({
                path: 'items',
                populate: { path: 'ubicacion' },
            })
            .populate({
                path: 'items',
                populate: { path: 'producto', populate: { path: 'unidad' } },
            })
            .populate({
                path: 'items',
                populate: { path: 'producto', populate: { path: 'empaque' } },
            })
            .populate('gastos')
            .populate({
                path: 'gastos',
                populate: { path: 'ubicacion'},
            })
            .populate('pagos')
            .populate({
                path: 'pagos',
                populate: { path: 'ubicacion'},
            })
            .populate('ventaItems')
            .populate({
                path: 'ventaItems',
                populate: { path: 'venta',
                    populate: {path: 'cliente'} 
                },
            })
            .populate({
                path: 'ventaItems',
                populate: { path: 'ubicacion' },
            })
            .populate({
                path: 'ventaItems',
                populate: { path: 'producto',
                    populate: { path: 'unidad'},
                    populate: { path: 'empaque'}
                }
            })
            .populate({
                path: 'ventaItems',
                populate: { path: 'compraItem', select: 'clasificacion '}
            })
            // compra.liquidacion = await Liquidacion.find({compra: compra._id})
            // console.log(compra)
            .then(compras => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    compras: compras
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los compras' + err
                })
            })
    },

    getComprasProvedor: async (req, res) => {
        const {user, mes, year} = req.body        
        if (mes < 10) {
            mes = "0" + mes
        }
        const conn = await con(user)
        const Compra = conn.model('Compra')

        const resp = await Compra.aggregate([
            {$match: { fecha: { $gt: year + "-" + mes + "-00", $lt: year + "-" + mes + "-32" } }},
            {$group: { 
                _id: "$provedor", 
                provedor: { $first: "$provedor" }, 
                saldo: { $sum: "$saldo" }, 
                importe: { $sum: "$importe" }  
                } 
            },
            {$lookup: { from: "provedors", localField: "provedor", foreignField: "_id", as: "provedor" } },
            { $unwind: "$provedor"},
        ])
        .then(compras => {
            conn.close()
            return res.status(200).send({
                status: "success",
                compras: compras
            })
        })
        .catch(err=>{
            conn.close()
            return res.status(200).send({
                status: "error",
                message: "error: "+err
            })
        })
    },

    getCompra: async (req, res) => {
        const {user, id} = req.body
        const conn = await con(user)
        const Compra = conn.model('Compra')
        const VentaItem = conn.model('VentaItem')
        const Egreso = conn.model('Egreso')
        let data = {}

        const compra = await Compra
            .findById(id)
            .populate('provedor', 'clave nombre tel1 cta1 email diasDeCredito comision')
            .populate('gastos')
            .populate('ubicacion')
            .populate('tipoCompra')
            .populate('ventas')
            .populate({
                path: 'items',
                populate: { path: 'ubicacion' },
            })
            .populate({
                path: 'items',
                populate: { path: 'producto' },
            })
            .populate({
                path: 'items',
                populate: { path: 'producto', populate: { path: 'unidad' } },
            })
            .populate({
                path: 'items',
                populate: { path: 'producto', populate: { path: 'empaque' } },
            })
            .lean()
            .catch(err => {
                conn.close()
                return res.status(404).send({
                    status: 'error',
                    err
                })
            })
        data.compra = compra

        const ventas = await VentaItem.find({ compra: compra._id })
            .lean()
            .populate('venta')
            .populate({
                path: 'venta',
                populate: { path: 'cliente' },
            })
            .populate('producto')
            .populate('ubicacion')

        data.ventas = ventas

        const ventasGroup = await VentaItem
            .aggregate()
            .match({ compra: data.compra._id })
            .group({ _id: "$producto", producto: { $first: "$producto" }, compraItem: { $first: "$compraItem" }, cantidad: { $sum: "$cantidad" }, empaques: { $sum: "$empaques" }, importe: { $sum: "$importe" } })
            // .group({_id:"$compraItem", producto: {$first: "$producto"}, cantidad: { $sum: "$cantidad" }, empaques: { $sum: "$empaques" }, importe: { $sum: "$importe" } })
            .lookup({ from: 'productos', localField: "producto", foreignField: '_id', as: 'producto' })
            .unwind('producto')
            .lookup({ from: 'unidads', localField: "producto.unidad", foreignField: '_id', as: 'producto.unidad' })
            .lookup({ from: 'empaques', localField: "producto.empaque", foreignField: '_id', as: 'producto.empaque' })
            .unwind('producto.empaque')
            .unwind('producto.unidad')
            // .sort({"_id": 1})
            .exec()

        data.ventasGroup = ventasGroup

        const egresos = await Egreso
            .find({
                compra: data.compra._id,
                // tipo: {$eq: 'GASTO DE COMPRA'}
            })
            .lean()
            .populate('ubicacion')

        data.egresos = egresos
        conn.close()
        return res.status(200).send({
            status: 'success',
            data
        })
    },

    open: async (req, res) => {
        const compraId = req.params.id
        const bd = req.params.bd
        const conn = await con(bd)
        const Compra = conn.model('Compra')
        const resp = await Compra
            .findOneAndUpdate({ _id: compraId }, { status: "ACTIVO" })
            .then(compraUpdated => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Compra activada correctamente.',
                    compra: compraUpdated
                })
            })
            .catch(err => {
                conn.close()
                return res.status(404).send({
                    status: "error",
                    err
                })
            })
    },

    close: async (req, res) => {
        const compraId = req.params.id
        const bd = req.params.bd
        const conn = await con(bd)
        const Compra = conn.model('Compra')
        const resp = await Compra
            .findOneAndUpdate({ _id: compraId }, { status: "CERRADO" })
            .then(compraUpdated => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Compra cerrada correctamente.',
                    compra: compraUpdated
                })
            })
            .catch(err => {
                conn.close()
                return res.status(404).send({
                    status: "error",
                    message: "Error: " + err
                })
            })
    },

    update: async (req, res) => {
        const {user, data} = req.body
        const conn = await con(user)
        const Compra = conn.model('Compra')
        Compra
            .findOneAndUpdate({"_id": data._id}, data, { new: true }, (err, compraUpdated) => {
                conn.close()
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }
                if (!compraUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el compra'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    message: "Compra actualizada",
                    compra: compraUpdated
                })
            })
    },

    delete: async (req, res) => {
        const compraId = req.params.id;
        const bd = req.params.bd
        const conn = await con(bd)
        const Compra = conn.model('Compra')
        const CompraItem = conn.model('CompraItem')
        const VentaItem = conn.model('VentaItem')

        const itemsStatus = await CompraItem.deleteMany({compra: compraId})
            .catch((err)=>{
                return res.status(200).send({
                    status: "error",
                    message: "No se pudo cancelar los items de la compra "+err,
                })
            })
        
        const ventasStatus = await VentaItem.deleteMany({compra: compraId})
            .catch((err)=>{
                return res.status(200).send({
                    status: "error",
                    message: "No se pudo cancelar los items de las ventas "+err,
                })
            })

        const compraStatus = await Compra.findOneAndUpdate({ _id: compraId },{ status: "CANCELADO", saldo: 0, importe:0, ventas:[], pagos:[], ventaItems: [] }, (err, compraUpdated) => {
            conn.close()
            // if (!compraRemoved) {
            //     return res.status(500).send({
            //         status: 'error',
            //         message: 'No se pudo borrar la compra.'
            //     })
            // }
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            }
            return res.status(200).send({
                status: 'success',
                message: 'Compra cancelada correctamente',
                compraRemoved: compraUpdated
            })
        })

    },

    cancel: async (req, res) => {
        const compraId = req.params.id
        const bd = req.params.bd
        const conn = await con(bd)
        const Compra = conn.model('Compra')
        const CompraItem = conn.model('CompraItem')
        Compra.findById(compraId).exec((err, compra) => {
            compra.status = "CANCELADO"

            compra.save((err, saved) => {
                if (err | !saved) {
                    conn.close()
                    return res.status(200).send({
                        status: 'error',
                        message: 'Ocurrió un error',
                        err
                    })
                } else {
                    CompraItem.updateMany({ "compra": compraId }, { "stock": 0 }, (err, n) => {
                        conn.close()
                        return res.status(200).send({
                            status: 'success',
                            message: 'Compra CANCELADA correctamente.',
                            saved
                        })
                    })
                }
            })
        })
    },

    addCompraItem: async (req, res) => {
        const bd = req.params.bd
        const conn = await con(bd)
        const Compra = conn.model('Compra')
        const CompraItem = conn.model('CompraItem')
        let item = req.body
        let newItem = new CompraItem()
        newItem.compra = item.compra
        newItem.producto = item.producto
        newItem.ubicacion = item.compra.ubicacion
        newItem.cantidad = item.cantidad
        newItem.stock = item.stock
        newItem.empaques = item.empaques
        newItem.empaquesStock = item.stock
        newItem.costo = item.costo
        newItem.importe = item.importe

        newItem.save((err, itmSaved) => {
            if (err || !itmSaved) {
                conn.close()
                return res.status(200).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            } else {
                Compra.findById(newItem.compra).exec((err, compra) => {

                    if (err) {
                        conn.close()
                        return res.status(200).send({
                            status: 'error',
                            message: 'Ocurrio un error.'
                        })
                    } else {
                        compra.items.push(itmSaved._id)
                        compra.save()
                        CompraItem.findById(itmSaved._id).populate('producto').exec((err, item) => {
                            conn.close()
                            return res.status(200).send({
                                status: 'success',
                                message: 'Item Agregado correctamente.',
                                item: item
                            })

                        })
                    }
                })
            }
        })

    },

    updateCompraItem: async (req, res) => {
        const {user, data} = req.body;
        const conn = await con(user)
        const CompraItem = conn.model('CompraItem')

        CompraItem.findById(data.item_id).exec((err, compraItem) => {
            if (err || !compraItem) {
                conn.close()
                return res.status(200).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            } else {
                let cantDiff = compraItem.cantidad - data.cantidad
                let empDiff = compraItem.empaques - data.empaques
                compraItem.cantidad = data.cantidad
                compraItem.empaques = data.empaques
                compraItem.costo = data.costo
                compraItem.importe = data.importe
                compraItem.stock -= cantDiff
                compraItem.empaquesStock -= empDiff
                compraItem.save((err, compraItemSaved) => {
                    conn.close()
                    if (err || !compraItemSaved) {
                        return res.status(200).send({
                            status: 'error',
                            message: 'Algo pasó al actualizar.',
                            err
                        })
                    } else {
                        return res.status(200).send({
                            status: 'success',
                            message: 'Item actualizado.'
                        })
                    }
                })
            }
        })
    },

    recuperarVentas: async (req, res) => {
        const id = req.params.id;
        const bd = req.params.bd
        const conn = await con(bd)
        const VentaItem = conn.model('VentaItem')
        const Compra = conn.model('Compra')

        const ventas = await VentaItem.find({ compra: id }).lean()

        const compra = await Compra.findById(id)
        compra.ventas = []
        compra.ventaItems = []
        ventas.forEach(element => {
            compra.ventaItems.push(element._id)
        })
        compra.save()
            .then(cmp => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Item actualizado.',
                    compra: cmp
                })
            })

    },
    recupearGastos: async (req, res) => {
        const id = req.params.id;
        const bd = req.params.bd
        const conn = await con(bd)
        const Compra = conn.model('Compra')
        const Egreso = conn.model('Egreso')

        const egresos = await Egreso.find({ compra: id }).lean()
        const compra = await Compra.findById(id)
        compra.gastos = []
        compra.pagos = []

        egresos.map(eg => {
            if (eg.concepto !== "PAGO" && eg.importe > 0) {
                compra.gastos.push(eg._id)
            } else {
                compra.pagos.push(eg._id)
            }
        })

        compra
            .save()
            .then(cmp => {
                cmp
                    .populate('gastos')
                    .populate('pagos')
                    .populate('provedor', 'nombre')
                    .populate('ubicacion')
                    .populate('tipoCompra')
                    .populate('ventaItems', (err, comp) => {
                        conn.close()
                        return res.status(200).send({
                            status: 'success',
                            message: 'Item actualizado.',
                            compra: comp
                        })
                    })

            })
    },
    addMerma: async (req, res) => {

    },
    crearItemEmpaqueVacio: async (req, res) => {
        const {user, compra, ubicacion} = req.body
        const conn = await con(user)
        const Compra = conn.model('Compra')
        const CompraItem = conn.model('CompraItem')

        let compraSeleccionada = await Compra.findOne({_id:compra._id})
        if(!compraSeleccionada){
            return res.status(401).send({
                status: 'error',
                message: 'No se encontró la compra.',
            })
        }
        let itemEmpaqueVacio = await CompraItem.create({
                producto:"647e0f4f9e412d82cfe9f6f7",
                compra: compra,
                ubicacion: ubicacion,
                clasificacion: "S/C",
                cantidad: 0,
                empaques:0,
                empaquesStock:0,
                stock:0,
                costo:0,
                importe:0

            })
        if(!itemEmpaqueVacio){
            return res.status(401).send({
                status: 'error',
                message: 'No se pudo crear el item.',
            })
        }

        let itemPopuleado = await itemEmpaqueVacio.populate("producto, ubicacion")
        compraSeleccionada.items.push(itemEmpaqueVacio._id)
        let compraActualizada = await compraSeleccionada.save()

        if(!compraActualizada){
            return res.status(401).send({
                status: 'error',
                message: 'No se actualizó la compra.',
            })
        }

        return res.status(200).send({
            status: 'success',
            message: 'Item creado correctamente.',
            item: itemPopuleado
        })

    }

}

module.exports = controller;