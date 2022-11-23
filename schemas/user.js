'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
        nombre: {type: String},
        apellido1: {type: String},
        apellido2: {type: String},
        telefono: {type: String, unique: true},
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        database: String,
        level: Number,
        fechaInicio: String,
        tryPeriodEnds: String,
        paidPeriodEnds: String,
    },{
        timestamps: true
    });

module.exports = UserSchema