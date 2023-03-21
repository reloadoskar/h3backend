'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CambioSchema = Schema({
    folio: Number,
    status: {type: String, default: 'SOLICITANDO'},
    ubicacion: {type: Schema.ObjectId, ref: 'Ubicacion'},
    fecha: {type: String},
    compraItem: {type: Schema.ObjectId, ref: 'CompraItem'},
    piezas: Number,
    pesob: Number,
    tara: Number,
    peson: Number,
    respuesta: {},
    firma:{}
},{
    timestamps: true
});

module.exports = CambioSchema