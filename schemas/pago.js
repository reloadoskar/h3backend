'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PagoSchema = Schema({
    folio: Number,
    ubicacion: { type: Schema.ObjectId, ref: 'Ubicacion' },
    fecha: String,
    importe: Number
},{
    timestamps: true
});

module.exports = PagoSchema