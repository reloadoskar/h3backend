'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProduccionItemSchema = Schema({
    produccion: { type: Schema.ObjectId, ref: 'Produccion'},
    producto: { type: Schema.ObjectId, ref: 'Producto' },
    insumos: Array,
    fecha: String,
    cantidad: Number,
    stock: Number,
    costo: Number,
    importe: Number
},{
    timestamps: true
})

module.exports = ProduccionItemSchema