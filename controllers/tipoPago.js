'use strict'
const con = require('../src/dbuser')

const controller = {
    save: async (req, res) => {
        const bd = req.params.bd
        const conn = await con(bd)
        const params = req.body;
        const TipoPago = conn.model('TipoPago')
        let tipopago = new TipoPago();
            
        //Asignar valores
        tipopago.tipo = params.tipo;

        //Guardar objeto
        tipopago.save((err, tipopagoStored) => {
            conn.close()
            if(err || !tipopagoStored){
                return res.status(404).send({
                    status: 'error',
                    message: 'El tipopago no se guardó'
                })
            }
            return res.status(200).send({
                status: 'success',
                tipopago: tipopagoStored
            })
        })
    },

    getTipoPagos: async (req, res) => {
        const bd = req.params.bd
        const conn = await con(bd)
        const TipoPago = conn.model('TipoPago')
        TipoPago.find({}).sort('_id').exec( (err, tipopagos) => {
            conn.close()
            if(err || !tipopagos){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los tipopagos'
                })
            }
            return res.status(200).send({
                status: 'success',
                tipopagos
            })
        })
    },

    getTipoPago: async (req, res) => {
        const tipopagoId = req.params.id;
        const bd = req.params.bd
        const conn = await con(bd)
        const TipoPago = conn.model('TipoPago')
        if(!tipopagoId){
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el tipopago'
            })
        }

        TipoPago.findById(tipopagoId, (err, tipopago) => {
            conn.close()
            if(err || !tipopago){
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el tipopago.'
                })
            }
            return res.status(200).send({
                status: 'success',
                tipopago
            })
        })
    },

    update: async (req, res) => {
        const tipopagoId = req.params.id;
        const bd = req.params.bd
        const conn = await con(bd)
        const params = req.body;
        const TipoPago = conn.model('TipoPago')
        
        TipoPago.findOneAndUpdate({_id: tipopagoId}, params, {new:true}, (err, tipopagoUpdated) => {
            conn.close()
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar'
                })
            }
            if(!tipopagoUpdated){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el tipopago'
                })
            }
            return res.status(200).send({
                status: 'success',
                tipopago: tipopagoUpdated
            })
        })
    },

    delete: async (req, res) => {
        const tipopagoId = req.params.id;
        const bd = req.params.bd
        const conn = await con(bd)
        const TipoPago = conn.model('TipoPago')
        TipoPago.findOneAndDelete({_id: tipopagoId}, (err, tipopagoRemoved) => {
            conn.close()
            if(!tipopagoRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el tipopago.'
                })
            }
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            }
            return res.status(200).send({
                status: 'success',
                tipopagoRemoved
            })
        })

    }

}

module.exports = controller;