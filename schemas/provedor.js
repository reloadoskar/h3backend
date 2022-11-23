'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProvedorSchema = Schema({
    nombre: {type: String, unique: true},
    sexo: String,
    clave: {type: String},
    cuentas: [{type: Schema.ObjectId, ref: 'Egreso' }],
    pagos: [{type: Schema.ObjectId, ref: 'Egreso'}],
    rfc: String,
    direccion: String,
    tel1: Number,
    tel2: Number,
    email: {type: String},
    banco1: String,
    cta1: Number,
    banco2: String,
    cta2: Number,
    diasDeCredito: Number,
    comision: Number,
    ref: String
},{
    timestamps: true
});

module.exports = ProvedorSchema