'use strict'
const con = require('../src/dbuser')
const {agruparPor, 
    agruparPorObjeto, 
    agrupaVentaItemsPorProducto, 
    agrupaVentaItemsPorVenta,
    agrupaVentaItemsPorCompraItem} = require('../tools')
var mongoose = require('mongoose');

var controller = {
    getData: async(req,res)=>{
        const {user, ubicacion, fecha} = req.body
        const conn = await con(user)
        const VentaItem = conn.model('VentaItem')
        const Venta = conn.model('Venta')
        const Egreso = conn.model('Egreso')
        const Ingreso = conn.model('Ingreso')
        const Ubicacion = conn.model('Ubicacion')
        const Corte = conn.model('Corte')

        var ecorte = await Corte.find({fecha:fecha,ubicacion: ubicacion}).populate('ubicacion').lean()

            if(ecorte.length===1){
                return res.status(200).send({
                    status:'info',
                    message: 'Corte encontrado',
                    corte: ecorte[0]
                })
            }else{
                let corte= {}
                corte.fecha = fecha
                corte.status="ABIERTO"
                
                const ub = await Ubicacion
                .findById(ubicacion)
                .lean()
                corte.ubicacion = ub
                
                const ventaItems = await VentaItem.find({ubicacion: ubicacion, fecha: fecha})
                    .populate({path:'venta',select: 'ubicacion folio cliente pesadas fecha tipoPago acuenta', populate:{path:'cliente',select: 'nombre'}})
                    .populate({path:'venta',populate:{path:'ubicacion',select: 'nombre'}})
                    .populate({path:'compra', select: 'folio'})
                    .populate({path:'compraItem', select: 'compra producto clasificacion stock cantidad empaquesStock empaques createdAt', populate:{path:'producto', select: 'descripcion empaque unidad', populate:'empaque unidad'}})
                    .populate({path:'producto', select: 'descripcion empaque unidad'})
                corte.ventaItems = ventaItems
                corte.ventaPorProducto = agrupaVentaItemsPorProducto(ventaItems, 'producto')
                corte.ventaPorCompraItem = agrupaVentaItemsPorCompraItem(ventaItems)
                // corte.ventas = agrupaVentaItemsPorVenta(ventaItems)

                const ventas = await Venta.find({ubicacion: ubicacion, fecha: fecha})
                    .populate({path:'ubicacion', select: 'nombre'})
                    .populate({path:'cliente', select:'nombre'})
                    .populate({path:'items', select: 'compra compraItem pesadas', 
                        populate: {path: 'compra', select: 'folio'}})
                    .populate({path:'items', 
                        populate: {path: 'compraItem', select: 'clasificacion producto', populate:{path:'producto', select:'descripcion'}}})

                corte.ventas = ventas
                
                const egresos = await Egreso
                .find({
                        ubicacion: ubicacion, 
                        fecha: fecha, 
                        tipo: {$ne: 'COMPRA'}})
                    .select("ubicacion concepto descripcion fecha importe")
                    .lean()
                    .sort('fecha concepto descripcion importe')
                    corte.egresos = egresos
                    
                    const ingresos = await Ingreso
                    .find({"ubicacion": ubicacion, "fecha": fecha, concepto: {$ne: 'VENTA'}})
                    .select('ubicacion concepto descripcion fecha importe')
                    .lean()
                    .populate('ubicacion')
                    .sort('ubicacion concepto descripcion fecha importe')
                    corte.ingresos = ingresos
                    
                    const creditos = await Venta
                    .find({"tipoPago": 'CRÉDITO', "ubicacion": ubicacion, "fecha": fecha })
                    .select('folio ubicacion cliente tipoPago acuenta items saldo importe')
                    .lean()
                    .populate({path:'cliente', select:'nombre tel1 email limite_de_credito'})
                    .populate({
                        path: 'items',
                        populate: { path: 'producto'},
                    })
                    .populate({
                        path: 'items',
                        populate: {path: 'compra', select: 'clave folio'}
                    })
                    .sort('ubicacion cliente tipoPago acuenta saldo importe')
                    corte.creditos = creditos
                    
                conn.close()
                return res.status(200).send({
                    status:'success',
                    message: "Corte generado correctamente",
                    corte: corte
                })
            }
    },

    save: async (req, res) => {
        const {user, data} = req.body
        const conn = await con(user)
        const Corte = conn.model('Corte')
        const Egreso = conn.model('Egreso')
        const Ingreso = conn.model('Ingreso')
        Corte.create(data, (err, corte) => {
            if(err || !corte){
                conn.close()
                return res.status(404).send({
                    status: 'error',
                    message: 'No se puedo guardar el corte.'+err,
                })
            }else{
                // guardar egreso e ingreso, definir a donde se va el corte...
                if(data.total > 0){
                    let egreso = new Egreso()
                    Egreso.estimatedDocumentCount((err, count) => {
                        egreso.folio = ++count
                        egreso.ubicacion = data.ubicacion
                        egreso.descripcion = "ENVIO DE CORTE A " + data.enviarA.nombre
                        egreso.concepto = "CORTE"
                        egreso.fecha = data.fecha
                        egreso.importe = data.total
                        egreso.saldo = 0
                        egreso.save((err, egreso) => {
                            if( err || !egreso){
                                conn.close()
                                return res.status(404).send({
                                    status: 'error',
                                    message: 'No se registró el egreso.' + err
                                })
                            }
                            let ingreso = new Ingreso()
                            
                            ingreso.ubicacion = data.enviarA._id
                            ingreso.descripcion = "RECEPCIÓN DE CORTE "+ data.ubicacion.nombre
                            ingreso.concepto = "CORTE"
                            ingreso.fecha = data.fecha
                            ingreso.importe = data.total
                            ingreso.saldo = 0
                            ingreso.save((err, ingresoSaved) => {
                                    conn.close()
                                    if(err){
                                        return res.status(500).send({
                                            status: 'error',
                                            message: "No se pudo registrar el Ingreso.",
                                            err
                                        })
                                    }                        
                                    return res.status(200).send({
                                            status: 'success', 
                                            message: 'Corte guardado correctamente',
                                            corte 
                                    })
                                })
                        })
                    })
                }else{
                    conn.close()
                    return res.status(200).send({
                        status: 'success',
                        message: 'Corte cerrado.'
                    })
                }
            }
        })
    },

    exist: async (req, res) => {
        const {user, ubicacion, fecha} = req.body
        const conn = await con(user)
        const Corte = conn.model('Corte')
        
        try{
            const response = await Corte
                .find({ubicacion: ubicacion, fecha: fecha})
                .lean()
                .then(corte => {
                    conn.close()
                    return res.status(200).send({
                        status: 'success',
                        corte: corte
                    })
                })
                .catch(err => {
                    conn.close()
                    return res.status(404).send({
                        status: "error",
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

    open: async (req, res) => {
        const {user, ubicacion, fecha} = req.body
        const conn = await con(user)
        const Corte = conn.model('Corte')

        try{

            const resp = await Corte
                .deleteOne({ubicacion: ubicacion, fecha: fecha})
                .then(corte => {
                    conn.close()
                    return res.status(200).send({
                        status: 'success',
                        message: 'El corte ahora esta abierto.',
                        corte
                    })
                })
                .catch(err => {
                    conn.close()
                    return res.status(404).send({
                        status: "error",
                        message: " :"+err
                    })
                })

        }catch(err){
            conn.close()
            return res.status(200).send({
                status: 'error',
                message:'error desconocido: '+err,
                ubicacion, fecha
            })
        }
    },
    
    getEgresos: async (req, res) => {
        const ubicacion = req.params.ubicacion;
        const fecha = req.params.fecha;
        const bd = req.params.bd
        const conn = await con(bd)
        
        const Egreso = conn.model('Egreso')
        const resp = await Egreso
            .find({"ubicacion": ubicacion, "fecha": fecha})
            .lean()
            .then(egresos=> {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'se encontraron resultados:',
                    egresos: egresos
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'No se encontraron resultados',
                    err
                })
            })
    },

    getIngresos: async (req, res) => {
        const ubicacion = req.params.ubicacion
        const fecha = req.params.fecha
        const bd = req.params.bd
        const conn = await con(bd)
        
        const Ingreso = conn.model('Ingreso')
        const resp = await Ingreso
            .find({"ubicacion": ubicacion, "fecha": fecha, concepto: {$ne: 'VENTA'}})
            .lean()
            .then(ingresos => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    ingresos
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    err
                })
            }) 
    }
}

module.exports = controller