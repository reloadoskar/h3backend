'use strict'
var mongoose = require('mongoose');
const con = require('../src/dbuser')

var controller = {
    save: async (req, res) => {
        const { user, data } = req.body
        console.log("intentando guardar venta...")
        let errorStatusCode = 500
        try {
            console.log("conectando...")
            const conn = await con(user)
            if (!conn) {
                console.error("No se pudo conectar")
                errorStatusCode = 401
                throw new Error("No se pudo conectar")
            }
            const Ingreso = conn.model('Ingreso')
            const Venta = conn.model('Venta')
            const VentaItem = conn.model('VentaItem')
            const Compra = conn.model('Compra')
            const CompraItem = conn.model('CompraItem')
            const Cliente = conn.model('Cliente')

            let ingreso = new Ingreso
            let venta = new Venta
            ingreso.venta = venta._id
            ingreso.concepto = "VENTA"
            ingreso.ubicacion = data.ubicacion
            ingreso.fecha = data.fecha
            ingreso.tipoPago = data.tipoPago


            console.info("Obteniendo datos del cliente...")
            let cliente = await Cliente.findById(data.cliente._id)
            if (!cliente) {
                errorStatusCode = 401
                throw new Error("No se encontro al cliente")
            }
            console.info("Tengo al cliente, ahora que era?...")

            if (data.tipoPago === "CRÉDITO") {
                venta.acuenta = data.acuenta
                ingreso.cliente = data.cliente
                if (data.acuenta > 0) {
                    ingreso.descripcion = "PAGO A CUENTA DE " + data.cliente.nombre
                    ingreso.importe = data.acuenta
                    ingreso.saldo = data.saldo
                } else {
                    ingreso.importe = 0
                    ingreso.saldo = data.total
                }
                cliente.cuentas.push(ingreso._id)
                let creditoDisponible = cliente.credito_disponible
                let creditoActualizado = creditoDisponible - ingreso.saldo
                cliente.credito_disponible = creditoActualizado
                console.log("ah siii.. Actualizando cliente...")
                let clienteUpdated = await cliente.save()
                if(!clienteUpdated){
                    errorStatusCode=401
                    throw new Error("No se actualizo el cliente.")
                }
            } else {
                venta.acuenta = data.acuenta
                ingreso.importe = data.total
            }
            
            console.log("... Guardando Ingreso...")
            let IngresoSaved = await ingreso.save()
            if(!IngresoSaved){
                errorStatusCode=401
                throw new Error("No se guardo el ingreso")
            }
            
            console.log("... Creando venta...")
            let numVentas = await Venta.estimatedDocumentCount()
            if(!numVentas){
                errorStatusCode=401
                throw new Error("No se obtuvo el nuevo folio")
            }
            venta.folio = numVentas + 1
            venta.ubicacion = data.ubicacion
            venta.cliente = data.cliente
            venta.fecha = data.fecha
            venta.importe = data.total
            venta.tipoPago = data.tipoPago
            
            console.log("... Creando items...")
            let items = []
            data.items.forEach(item => {                    
                var ventaItem = new VentaItem()
                    ventaItem.venta = venta._id
                    ventaItem.ventaFolio = venta.folio 
                    ventaItem.ubicacion = venta.ubicacion
                    ventaItem.fecha = venta.fecha
                    ventaItem.compra = item.compra
                    ventaItem.compraItem = item.itemOrigen
                    ventaItem.producto = item.producto._id
                    ventaItem.cantidad = item.cantidad
                    ventaItem.empaques = item.empaques
                    ventaItem.precio = item.precio
                    ventaItem.importe = item.importe
                    ventaItem.pesadas = item.pesadas
                    ventaItem.tara = item.tara
                    ventaItem.ttara = item.ttara
                    ventaItem.bruto = item.bruto
                    ventaItem.neto = item.neto

                    venta.items.push(ventaItem._id)
                    items.push(ventaItem)    

                    CompraItem.updateOne( 
                        {_id: item.itemOrigen },
                        {"$inc": { "stock":  -item.cantidad, "empaquesStock": -item.empaques }} 
                    ).catch(err=>{
                        console.log(err.message,'error')
                    })

                    Compra.updateOne(
                        {_id: item.compra},
                        {"$push": { ventaItems: ventaItem._id}}
                    ).catch(err=>{
                        console.log(err.message,'error')
                    })

            })
            console.log("... Guardando ventaItems...")
            let ventaItemsSaved = await VentaItem.insertMany(items)
            if(!ventaItemsSaved){
                errorStatusCode=401
                throw new Error("No se guardaron los items de venta")
            }
            
            console.log("... Guardando venta...")
            let ventaSvd = await venta.save()
            if(!ventaSvd){
                errorStatusCode=401
                throw new Error("No se guardo la pnchx venta!! 😡😡")
            }

            let vntaPpltd = await Venta.findById(ventaSvd._id)
            .populate('ubicacion')
            .populate('cliente')
            .populate({
                path: 'items',
                populate: { path: 'producto'},
            })
            .populate({
                path: 'items',
                populate: { path: 'compra'},
            })
            .populate({
                path: 'pagos',
                populate: { path: 'ubicacion'},
            })
            if(!vntaPpltd){
                errorStatusCode=401
                throw new Error("No se guardo la venta")
            }
            console.log("Todo cool, chau chau.. 🖖")
            conn.close()
            return res.status(200).send({
                status: "success",
                message: "Venta guardada correctamente.",
                venta: vntaPpltd
            })


        } catch (error) {
            return res.status(errorStatusCode).send({
                status: "error",
                message: error.message,
            })
        }
    },
    
    getVentas: async (req, res) => {
        const user = req.body
        const conn = await con(user)
        var VentaItem = conn.model('VentaItem')
        let ventas = await VentaItem.find({})
            // .populate('compras')
            .exec((err, ventas) => {
                conn.close()
                if (err) console.log(err)
                return res.status(200).send({
                    status: "success",
                    ventas
                })
            })
    },

    getVenta: async (req, res) => {
        const { user, folio } = req.body
        const conn = await con(user)
        const Venta = conn.model('Venta')
        Venta.findOne({ "folio": folio })
            // .populate({
            //     path: 'items',
            //     populate: { path: 'producto'},
            // })
            .populate({
                path: 'items',
                populate: { path: 'compra', select: 'folio' },
            })
            .populate({
                path: 'items',
                populate: {
                    path: 'compraItem',
                    select: 'clasificacion producto',
                    populate: {
                        path: 'producto',
                        select: 'descripcion'
                    }
                },
            })
            .populate({ path: 'pagos', populate: { path: 'ubicacion' } })
            .populate('ubicacion')
            .populate('cliente')
            .exec((err, venta) => {
                conn.close()
                if (err) {
                    return res.status(500).send({
                        status: "error",
                        message: err
                    })
                }
                if (!venta) {
                    return res.status(500).send({
                        status: "error",
                        message: "No existe la venta."
                    })
                }
                else {
                    return res.status(200).send({
                        status: "success",
                        venta
                    })
                }
            })
    },

    getVentasOfProduct: async (req, res) => {
        const { user, id } = req.body
        const conn = await con(user)
        const Venta = conn.model('Venta')
        Venta.aggregate()
            .project({ "items": 1, fecha: 1, cliente: 1, tipoPago: 1, })
            // .sort("items.item")
            .match({ "items.item": id })
            .exec((err, ventas) => {
                conn.close()
                if (err) console.log(err)
                res.status(200).send({
                    status: "success",
                    ventas
                })
            })
    },

    getResumenVentas: async (req, res) => {
        const { user, ubicacion, fecha } = req.body
        const conn = await con(user)
        const VentaItem = conn.model('VentaItem')
        try {
            const response = await VentaItem
                .aggregate()
                .match({ ubicacion: mongoose.Types.ObjectId(ubicacion), fecha: fecha })
                .group({ _id: { producto: "$producto" }, cantidad: { $sum: "$cantidad" }, empaques: { $sum: "$empaques" }, importe: { $sum: "$importe" } })
                .lookup({ from: 'productos', localField: "_id.producto", foreignField: '_id', as: 'producto' })
                .sort({ "_id.producto": 1, "_id.precio": -1 })
                .unwind('producto')
                .then(ventas => {
                    conn.close()
                    return res.status(200).send({
                        status: 'success',
                        ventas,
                    })
                })
                .catch(err => {
                    conn.close()
                    return res.status(404).send({
                        status: 'error',
                        err
                    })
                })
        } catch (err) {
            conn.close()
            return res.status(200).send({
                status: 'error',
                err
            })
        }

    },

    getVentasSemana: async (req, res) => {
        const { user, f1, f2 } = req.body
        const conn = await con(user)
        const VentaItem = conn.model('VentaItem')

        let ventas = await VentaItem.find({ fecha: { $gte: f1, $lte: f2 } })
            .populate({ path: 'ubicacion', select: 'nombre' })
            .populate({ path: 'producto', select: 'descripcion' })
            .populate({ path: 'compraItem', select: 'clasificacion' })
            .then(data => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    ventas: data
                })
            })


    },

    getVentaItems: async (req, res) => {
        const { user, mes } = req.body
        const conn = await con(user)
        const VentaItem = conn.model('VentaItem')
        const Items = await VentaItem.find({
            fecha: { $gt: "2021-" + mes + "-00", $lt: "2021-" + mes + "-32" }
        })
            .sort('folio')
            .lean()
            .populate('producto')
            .then(items => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    items: items
                })
            })
            .catch(err => {
                conn.close()
                return res.status(200).send({
                    status: 'error',
                    message: 'Error al devolver los items' + err
                })
            })
    },

    update: async (req, res) => {
        const { user, data } = req.body
        const conn = await con(user)
        const Venta = conn.model('Venta')
        //recoger datos actualizados y validarlos

        // Find and update
        Compra.findOneAndUpdate({ _id: data._id }, data, { new: true }, (err, compraUpdated) => {
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
                compra: compraUpdated
            })

        })
    },

    cancel: async (req, res) => {
        const { user, id } = req.body
        const conn = await con(user)
        const Venta = conn.model('Venta')
        const VentaItem = conn.model('VentaItem')
        const CompraItem = conn.model('CompraItem')
        const Ingreso = conn.model('Ingreso')

        let mensajes = []
        let laventa = await Venta.findById(id)
            .populate({ path: 'items', populate: { path: 'compraItem', populate: { path: 'compra', select: 'folio' } } })
            .populate({ path: 'items', populate: { path: 'producto', select: 'descripcion' } })
            .exec()
        laventa.tipoPago = "CANCELADO"
        laventa.saldo = 0
        laventa.importe = 0
        let itemsquesevanacancelar = []
        laventa.items.forEach(item => {
            itemsquesevanacancelar.push({
                cantidad: item.cantidad,
                empaques: item.empaques,
                importe: item.importe,
                pesadas: item.pesadas,
                precio: item.precio,
                producto: item.compraItem.compra.folio + "-" + item.producto.descripcion + " " + item.compraItem.clasificacion,
            })
            let stockUpdated = 0
            let empUpdated = 0
            stockUpdated = item.compraItem.stock + item.cantidad
            empUpdated = item.compraItem.empaquesStock + item.empaques

            CompraItem.updateOne({ _id: item.compraItem._id },
                { "$inc": { "stock": +item.cantidad, "empaquesStock": +item.empaques } },
                (err, doc) => {
                    if (err) { mensajes.push(err) }
                    mensajes.push("Item actualizado")
                })
        })
        laventa.itemsCancelados = itemsquesevanacancelar

        let noseguardolaventa = await laventa.save().catch(err => console.log(err))
        let noventaitemseliminados = await VentaItem.deleteMany({ "venta": laventa._id }).catch(err => err)
        let noingresoseliminados = await Ingreso.deleteMany({ "venta": laventa._id }).catch(err => err)
        conn.close()
        return res.status(200).send({
            status: 'success',
            mensajes: mensajes,
            venta: laventa
        })
    }
}

module.exports = controller;
