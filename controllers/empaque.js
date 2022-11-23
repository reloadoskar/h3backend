'use strict'
const con = require('../src/dbuser')
const controller = {    
    save: async (req, res) => {
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Empaque = conn.model('Empaque')

        const resp = await Empaque
            .create(params)
            .then(empaqueStored => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Empaque registrado correctamente.',
                    empaque: empaqueStored
                })
            })
            .catch(err => {
                conn.close()
                return res.status(404).send({
                    status: 'error',
                    message: 'El empaque no se guardó.',
                    err
                })
            })            
    },

    getEmpaques: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const Empaque = conn.model('Empaque')
        const resp = await Empaque.find({})
            .sort('_id')
            .lean()
            .then(empaques => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    empaques: empaques
                })
            })
            .catch(err => {
                conn.close()            
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los empaques',
                    err
                })
            })
    },

    delete: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const empaqueId = req.params.id;
        const Empaque = conn.model('Empaque')

        const resp = await Empaque
            .findOneAndDelete({_id: empaqueId})
            .then(empaqueRemoved => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Empaque eliminada correctamente.',
                    empaqueRemoved
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Ocurrio un error.',
                    err
                })
            })
    }

}

module.exports = controller;