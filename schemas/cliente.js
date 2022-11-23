'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClienteSchema = Schema({
    nombre: {type: String, unique: true},
    sexo: String,
    rfc: {type: String},
    direccion: String,
    tel1: String,
    tel2: String,
    email: { type: String, lowercase: true },
    dias_de_credito: Number,
    limite_de_credito: Number,
    credito_disponible: Number,
    cuentas: [{type: Schema.ObjectId, ref: 'Ingreso' }],
    pagos: [{type: Schema.ObjectId, ref: 'Ingreso' }],
    ubicacion: {},
},{
    timestamps: true
});

module.exports = ClienteSchema