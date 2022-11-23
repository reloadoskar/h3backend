'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LiquidacionSchema = Schema({
    compra: { type: Schema.ObjectId, ref: 'Compra'},
    items: [],
    gastos: [],
    pagos: [],
    tventas: Number,
    tgastos: Number,
    tpagos: Number,
    comprod: Number,
    tcomision: Number,
    descom: Boolean,
    despag: Boolean,
    desgas: Boolean,
    saldo: Number
},{
    timestamps: true
});

module.exports = LiquidacionSchema