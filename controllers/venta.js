'use strict'
var mongoose = require('mongoose');
const con = require('../src/dbuser')

var controller = {
    save: async (req, res) => {
        const {user, data} = req.body
        const conn = con(user)

        const Ingreso = conn.model('Ingreso')
        const Venta = conn.model('Venta')
        const VentaItem = conn.model('VentaItem')
        const Compra = conn.model('Compra')
        const CompraItem = conn.model('CompraItem')
        const Cliente = conn.model('Cliente')

        var ingreso = new Ingreso
        var venta = new Venta()

        ingreso.concepto = "VENTA"
        ingreso.venta = venta._id
        ingreso.ubicacion = data.ubicacion
        ingreso.fecha = data.fecha
        ingreso.tipoPago = data.tipoPago
        if(data.tipoPago === "CRÉDITO"){
                venta.acuenta = data.acuenta
                ingreso.cliente = data.cliente
            if(data.acuenta>0){
                ingreso.descripcion = "PAGO A CUENTA DE " + data.cliente.nombre
                ingreso.importe = data.acuenta
                ingreso.saldo = data.saldo
            }else{
                ingreso.importe = 0
                ingreso.saldo = data.total
            }
            Cliente.findById(data.cliente._id).exec((err, cliente)=>{
                if(err){console.log(err)}
                cliente.cuentas.push(ingreso._id)
                let creditoDisponible = cliente.credito_disponible
                let creditoActualizado = creditoDisponible - ingreso.saldo
                cliente.credito_disponible = creditoActualizado
                cliente.save(err => {
                    if(err)console.log(err)
                })
            })
        }else{
            venta.acuenta = data.acuenta
            ingreso.importe = data.total
        }
        
        ingreso.save((err, ingresoSaved) => {
            if(err || !ingresoSaved){console.log(err)}
        })
        
        Venta.estimatedDocumentCount().then(count => {
            venta.folio = count +1
            venta.ubicacion = data.ubicacion
            venta.cliente = data.cliente
            venta.fecha = data.fecha
            venta.importe = data.total
            venta.tipoPago = data.tipoPago
            let items = data.items

            items.map(item => {
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
                    ventaItem.save((err)=>{
                        if(err)console.log(err)
                    })
                    venta.items.push(ventaItem._id)

                    CompraItem.updateOne({_id: item.itemOrigen },
                        {"$inc": { "stock":  -item.cantidad, "empaquesStock": -item.empaques }},
                        (err, doc) => {
                            if(err)console.log(err)
                        }
                    )

                    Compra.updateOne(
                        {_id: item.compra},
                        {"$push": { ventaItems: ventaItem._id}},
                        (err, doc) => {
                            if(err)console.log(err)
                        }
                    )
            })

            venta.save((err, ventaSaved) => {
                if(err){console.log(err)}
                
                Venta.findById(ventaSaved._id)
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
                    .exec((err, vnt) => {
                        conn.close()
                        if(err){console.log(err)}
                        return res.status(200).send({
                            status: "success",
                            message: "Venta guardada correctamente.",
                            venta: vnt
                        })
                    })
            })
        })
    },
    
    getVentas: async (req, res) => {
        const user= req.body
        const conn = con(user)
        var VentaItem = conn.model('VentaItem')
        let ventas =  await VentaItem.find({})
        // .populate('compras')
        .exec((err, ventas) => {
            conn.close()
            if(err)console.log(err)
            return res.status(200).send({
                status: "success",
                ventas
            })
        })
    },

    getVenta: (req, res) => {
        const {user, folio}= req.body
        const conn = con(user)
        const Venta = conn.model('Venta')
        Venta.findOne({"folio": folio })
            // .populate({
            //     path: 'items',
            //     populate: { path: 'producto'},
            // })
            .populate({
                path: 'items',
                populate: { path: 'compra', select: 'folio'},
            })
            .populate({
                path: 'items',
                populate: { 
                    path: 'compraItem', 
                    select: 'clasificacion producto', 
                    populate: {path: 'producto', 
                        select: 'descripcion'
                    }
                },
            })
            .populate({path:'pagos', populate: {path: 'ubicacion'}})            
            .populate('ubicacion')
            .populate('cliente')
            .exec((err, venta) => {            
                conn.close()
                if(err){
                    return res.status(500).send({
                        status: "error",
                        message: err
                    })
                }
                if(!venta){
                    return res.status(500).send({
                        status: "error",
                        message: "No existe la venta."                        
                    })
                }
                else{
                    return res.status(200).send({
                        status: "success",
                        venta
                    })
                }
            })
    },

    getVentasOfProduct: (req, res) => {
        const {user, id}= req.body
        const conn = con(user)
        const Venta = conn.model('Venta')
        Venta.aggregate()
            .project({"items": 1, fecha: 1, cliente: 1, tipoPago:1, })
            // .sort("items.item")
            .match({"items.item": id})
            .exec((err, ventas) => {
                conn.close()
                if(err)console.log(err)
                res.status(200).send({
                    status: "success",
                    ventas
                })
            })
    },

    getResumenVentas: async (req, res) =>{
        const {user, ubicacion, fecha}= req.body
        const conn = con(user)
        const VentaItem = conn.model('VentaItem')
        try{
            const response = await VentaItem
                .aggregate()
                .match({ubicacion: mongoose.Types.ObjectId(ubicacion), fecha: fecha })
                .group({_id: {producto: "$producto"}, cantidad: { $sum: "$cantidad" }, empaques: { $sum: "$empaques" }, importe: { $sum: "$importe" } })
                .lookup({ from: 'productos', localField: "_id.producto", foreignField: '_id', as: 'producto' })
                .sort({"_id.producto": 1, "_id.precio": -1})
                .unwind('producto')
                .then(ventas =>{
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
        }catch(err){
            conn.close()
            return res.status(200).send({
                status: 'error',
                err
            })
        }
        
    },

    getVentasSemana: async (req, res) => {
        const {user, f1, f2}= req.body
        const conn = con(user)
        const VentaItem = conn.model('VentaItem')

        let ventas= await VentaItem.find({fecha: { $gte: f1, $lte: f2 }})
            .populate({path:'ubicacion', select:'nombre'})
            .populate({path:'producto', select:'descripcion'})
            .populate({path:'compraItem', select:'clasificacion'})
            .then(data=>{
                return res.status(200).send({
                    status: 'success',
                    ventas: data
                })
            })


    },

    getVentaItems: async (req, res) => {
        const {user, mes}= req.body
        const conn = con(user)
        const VentaItem = conn.model('VentaItem')
        const Items = await VentaItem.find({
                fecha: {$gt: "2021-"+mes+"-00" , $lt: "2021-"+mes+"-32"}
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

    update: (req, res) => {
        const {user, data}= req.body
        const conn = con(user)
        const Venta = conn.model('Venta')
        //recoger datos actualizados y validarlos
            
            // Find and update
            Compra.findOneAndUpdate({_id: data._id}, data, {new:true}, (err, compraUpdated) => {
                conn.close()
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }
                if(!compraUpdated){
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
        const {user, id}= req.body
        const conn = con(user)
        const Venta = conn.model('Venta')
        const VentaItem = conn.model('VentaItem')
        const CompraItem = conn.model('CompraItem')
        const Ingreso = conn.model('Ingreso')

        let mensajes = []
        let laventa = await Venta.findById(id)
            .populate({path:'items', populate:{path: 'compraItem', populate:{path:'compra', select:'folio'}}})
            .populate({path:'items', populate:{path: 'producto', select:'descripcion'}})
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
                    producto: item.compraItem.compra.folio +"-"+ item.producto.descripcion +" "+ item.compraItem.clasificacion,
                })
                let stockUpdated = 0
                let empUpdated = 0 
                stockUpdated = item.compraItem.stock + item.cantidad
                empUpdated = item.compraItem.empaquesStock + item.empaques

                CompraItem.updateOne({_id: item.compraItem._id },
                    {"$inc": { "stock":  +item.cantidad, "empaquesStock": +item.empaques }},
                    (err, doc) => {
                        if(err){mensajes.push(err)}
                        mensajes.push("Item actualizado")
                    })
            })
            laventa.itemsCancelados = itemsquesevanacancelar

            let noseguardolaventa = await laventa.save().catch(err=>console.log(err))
            let noventaitemseliminados = await VentaItem.deleteMany({"venta": laventa._id}).catch(err=>err)
            let noingresoseliminados = await Ingreso.deleteMany({"venta": laventa._id}).catch(err=>err)

        return res.status(200).send({
            status: 'success',
            mensajes: mensajes,
            venta: laventa
        })
    },
}

module.exports = controller;
