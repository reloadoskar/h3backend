'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PorPagarCuentaSchema = Schema({
    provedor: { type: Schema.ObjectId, ref: 'Provedor' },
    compra: {type: Schema.ObjectId, ref: 'Compra'},
    status: {type: Schema.ObjectId, ref: 'Status'},
    tipo_compra: {type: Schema.ObjectId, ref: 'TipoCompra'},
    descripcion: String,
    importe: Number,
    saldo: Number,
},{
    timestamps: true
});

module.exports = PorPagarCuentaSchema