'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BalanceSchema = Schema({
    fecha: {type: String, unique: true},
    total: {type: Number},
    disponible:  [],
    inventario:  [],
    porCobrar:  [],
    porPagar:  [],
},{
    timestamps: true
});

module.exports = BalanceSchema