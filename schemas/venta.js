'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VentaSchema = Schema({
    folio: Number,
    ingreso: {type: Schema.ObjectId, ref: 'Ingreso'},
    ubicacion: { type: Schema.ObjectId, ref: 'Ubicacion' },
    cliente: { type: Schema.ObjectId, ref: 'Cliente' },
    fecha: String,
    tipoPago: String,
    importe: Number,
    acuenta: Number,
    saldo: Number,
    items: [{type: Schema.ObjectId, ref: 'VentaItem'}],
    pagos: [{type: Schema.ObjectId, ref: 'Ingreso'}],
    status: String,
    itemsCancelados: [{}],
},{
    timestamps: true
});

module.exports = VentaSchema