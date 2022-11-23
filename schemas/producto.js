'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
    clave: {type: String, unique: true},
    descripcion: {type: String, unique: true},
    costo: Number,
    unidad: { type: Schema.ObjectId, ref: 'Unidad' },
    empaque: { type: Schema.ObjectId, ref: 'Empaque' },
    precio1: Number,
    precio2: Number,
    precio3: Number,
},{
    timestamps: true
});

module.exports = ProductoSchema