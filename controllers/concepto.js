'use strict'
const con = require('../src/dbuser')

const controller = {
    save: (req, res) => {
        const {user, data} = req.body;
        const conn = con(user)
        const Concepto = conn.model('Concepto')
        //recoger parametros

        //Crear el objeto a guardar
        let concepto = new Concepto();
            
        //Asignar valores
        concepto.concepto = data.concepto;

        //Guardar objeto
        concepto.save((err, conceptoStored) => {
            conn.close()
            if(err || !conceptoStored){
                return res.status(404).send({
                    status: 'error',
                    message: 'El concepto no se guardó.',
                    err
                })
            }
            //Devolver respuesta
            return res.status(200).send({
                status: 'success',
                message: 'Concepto registrado correctamente.',
                concepto: conceptoStored
            })
        })

    },

    getConceptos: async (req, res) => {
        const user = req.body
        const conn = con(user)
        const Concepto = conn.model('Concepto')
        const resp = await Concepto
            .find({})
            .sort('concepto')
            .lean()
            .then(conceptos => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    conceptos: conceptos
                })
            })
            .catch( err => {
                conn.close()            
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los conceptos'
                })
            })
    },

    delete: (req, res) => {
        const {user, id} = req.body
        const conn = con(user)
        const Concepto = conn.model('Concepto')

        Concepto.findOneAndDelete({_id: id}, (err, conceptoRemoved) => {
            conn.close()
            if(!conceptoRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar la concepto.'
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
                message: 'Concepto eliminado correctamente.',
                conceptoRemoved
            })
        })

    }

}

module.exports = controller;