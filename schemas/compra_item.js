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

CompraItemSchema.index({createdAt: -1, _id: -1, stock: 1})
CompraItemSchema.index({compra: 1})
CompraItemSchema.index({ubicacion: 1, stock: 1})
CompraItemSchema.index({createdAt: 1})

module.exports = CompraItemSchema