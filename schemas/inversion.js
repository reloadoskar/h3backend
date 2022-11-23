'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InversionSchema = Schema({
    folio: Number,
    provedor: { type: Schema.ObjectId, ref: 'Provedor' },
    compras: [{ type: Schema.ObjectId, ref: 'Compra'}],
    gastos: [{ type: Schema.ObjectId, ref: 'Egreso'}],
    fecha: String,
    descripcion: String,
    status: String,
    importe: Number,
    saldo: Number,
},{
    timestamps: true
});

module.exports = InversionSchema