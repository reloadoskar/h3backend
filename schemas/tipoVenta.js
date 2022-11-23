'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TipoVentaSchema = Schema({
    tipo: {type: String, unique: true},
});

module.exports = TipoVentaSchema