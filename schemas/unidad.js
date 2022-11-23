'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UnidadSchema = Schema({
    unidad: {type: String, unique: true},
    abr: String,
},{
    timestamps: true
});

module.exports = UnidadSchema