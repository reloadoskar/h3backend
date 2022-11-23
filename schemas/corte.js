'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CorteSchema = Schema({
    creditos: [],
    egresos: [],
    fecha: {type: String},
    ingresos: [],
    status: String,
    ubicacion: {type: Schema.ObjectId, ref: 'Ubicacion'},
    ventaItems: [],
    ventaPorCompraItem: [],
    ventaPorProducto: [],
    ventas: [],
    total: Number,
    tacuenta: Number,
    tcreditos: Number,
    tingresos: Number,
    tegresos: Number,
    tventas: Number,
    
},{
    timestamps: true
});

module.exports = CorteSchema