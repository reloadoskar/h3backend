'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PorCobrarCuentaSchema = Schema({
    cliente: { type: Schema.ObjectId, ref: 'Cliente' },
    ingreso: {type: Schema.ObjectId, ref: 'Ingreso'},
    status: {type: Schema.ObjectId, ref: 'Status'},
    tipo_venta: {type: Schema.ObjectId, ref: 'TipoVenta'},
    descripcion: String,
    importe: Number,
    saldo: Number,
},{
    timestamps: true
});

module.exports = PorCobrarCuentaSchema