'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProduccionSchema = Schema({
    clave: {type: String, unique: true},
    folio: {type: Number, unique: true},
    fecha: String,
    insumos: [{ type: Schema.ObjectId, ref: 'Insumo' }],
    egresos: [{ type: Schema.ObjectId, ref: 'Egreso' }],
    productos: [{ type: Schema.ObjectId, ref: 'ProduccionItem'}],
    ventas: [{ type: Schema.ObjectId, ref: 'Venta'}],
    costo: { type: Number, default: 0},
    valor: { type: Number, default: 0},
    status: { type: String },
},{
    timestamps: true
});

module.exports = ProduccionSchema