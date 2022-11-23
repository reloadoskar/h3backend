'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UbicacionSchema = Schema({
    nombre: {type: String, unique: true},
    tipo: {type: String},
    direccion: {type: String},
    telefono: {type: String}
});

UbicacionSchema.virtual('ingresos', {
    ref: 'Ingreso',
    localField: '_id',
    foreignField: 'ubicacion',
    justOne: false,
    // match: { isActive: true }
  });

module.exports = UbicacionSchema