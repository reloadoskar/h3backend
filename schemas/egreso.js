'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EgresoSchema = Schema({
    folio: Number, 
    tipo: String,
    ubicacion: { type: Schema.ObjectId, ref: 'Ubicacion' },
    concepto: String,
    descripcion: String,
    tipoPago: String,
    fecha: String,
    importe: Number,
    saldo: Number,
    compra: {type: Schema.ObjectId, ref: 'Compra'},
    inversion: {type: Schema.ObjectId, ref: 'Inversion'},
    cuenta: {type: Schema.ObjectId, ref: 'Egreso'}
},{
    timestamps: true
});

EgresoSchema.statics.egresosDelDia = function(fecha){
    return new Promise((resolve, reject) => {
        this.find({fecha: fecha})
            .populate('ubicacion')
            .populate({path: 'compra', select: 'folio status'})
            .sort({"createdAt": 1 })
            .exec((err, docs) => {
                if(err) {
                    console.error(err)
                    return reject(err)
                }
          
                resolve(docs)
            })
        })
    }

module.exports = EgresoSchema