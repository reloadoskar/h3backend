'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MovimientoSchema = Schema({
    fecha: String,
    folio: Number,
    origen: {},
    destino: {},
    item: {},
    clasificacion: String,
    cantidad: Number,
    empaques: Number,
    comentario: String,
    pesadas: [],
    tara: Number,
    ttara: Number,
    bruto: Number,
    neto: Number,
    status: String
},{
    timestamps: true
});

module.exports = MovimientoSchema