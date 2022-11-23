'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmpresaSchema = Schema({
    bd: Number,
    nombre: String, 
    rfc: String, 
    calle: String, 
    numero: Number,
    colonia: String,
    cp: Number,
    municipio: String, 
    alcaldia: String,  
    localidad: String,
    estado: String, 
    pais: String, 
    telefono: Number,
    email: String,
    facebook: String,
    instagram: String,
    plan: String,
    duracion: Number,
    fechaInicio: Date,
    fechaFinal: Date,
    costo: Number,
    Saldo: Number,
    pagos:[{ type: Schema.ObjectId, ref: 'Egreso' }]
},{
    timestamps: true
});

module.exports = EmpresaSchema