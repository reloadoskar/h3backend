'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IngresoSchema = Schema({
    concepto: String,
    venta: { type: Schema.ObjectId, ref: 'Venta'},
    ubicacion: { type: Schema.ObjectId, ref: 'Ubicacion' },
    cliente: { type: Schema.ObjectId, ref: 'Cliente' },
    // items: [{ type: Schema.ObjectId, ref: 'VentaItem' }],
    fecha: String,
    tipoPago: String,
    importe: Number,
    acuenta: Number,
    saldo: Number,
    descripcion: String,
    referenciaCobranza: { type: Schema.ObjectId, ref: 'Ingreso'}
},{
    timestamps: true
});

IngresoSchema.statics.ingresosDelDia = function(fecha){
    return new Promise((resolve, reject) => {
        this.find({fecha: fecha})
            .populate('ubicacion')
            .populate({path: 'venta', populate: { path: 'items'}})
            .sort({"createdAt": 1 })
            .exec((err, docs) => {
                if(err) {
                    console.error(err)
                    return reject(err)
                }
          
                resolve(docs)
            })
        })
    }

module.exports = IngresoSchema