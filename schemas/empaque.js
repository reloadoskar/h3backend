'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmpaqueSchema = Schema({
    empaque: {type: String, unique: true},
    abr: String,
},{
    timestamps: true
});

module.exports = EmpaqueSchema