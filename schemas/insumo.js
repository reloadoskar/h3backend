'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InsumoSchema = Schema({
    produccion: { type: Schema.ObjectId, ref: 'Produccion'},
    ubicacion: { type: Schema.ObjectId, ref: 'Ubicacion' },
    compraItem: { type: Schema.ObjectId, ref: 'CompraItem' },
    fecha: String,
    cantidad: Number,
    disponible: Number,
    importe: Number,
},{
    timestamps: true
});

module.exports = InsumoSchema