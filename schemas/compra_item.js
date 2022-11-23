'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompraItemSchema = Schema({
    compra: { type: Schema.ObjectId, ref: 'Compra'},
    ubicacion: { type: Schema.ObjectId, ref: 'Ubicacion' },
    producto: { type: Schema.ObjectId, ref: 'Producto' },
    provedor: { type: Schema.ObjectId, ref: 'Provedor' },
    clasificacion: String,
    cantidad: Number,
    empaques: Number,
    empaquesStock: Number,
    stock: Number,
    costo: Number,
    importe: Number
},{
    timestamps: true
})

module.exports = CompraItemSchema