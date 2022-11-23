'use strict'
const con = require('../src/dbuser')

var controller = {
    save: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const params = req.body;
        const Status = conn.model('Status')

        //Crear el objeto a guardar
        var status = new Status();
        //Asignar valores
        status.nombre = params.nombre;
            

        //Guardar objeto
        status.save((err, statusStored) => {
                conn.close()
                if(err || !statusStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El status no se guardó'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    status: statusStored
                })
            })

    },

    getStatuss: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const Status = conn.model('Status')
        Status.find({}).sort('_id').exec( (err, statuss) => {
            conn.close()
            if(err || !statuss){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los statuss'
                })
            }
            return res.status(200).send({
                status: 'success',
                statuss
            })
        })
    },

    getStatus: (req, res) => {
        const statusId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Status = conn.model('Status')

        if(!statusId){
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el status'
            })
        }

        Status.findById(statusId, (err, status) => {
            conn.close()
            if(err || !status){
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el status.'
                })
            }
            return res.status(200).send({
                status: 'success',
                status
            })
        })
    },

    update: (req, res) => {
        const statusId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const params = req.body;
        const Status = conn.model('Status')

        Status.findOneAndUpdate({_id: statusId}, params, {new:true}, (err, statusUpdated) => {
            conn.close()
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar'
                })
            }
            if(!statusUpdated){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el status'
                })
            }
            return res.status(200).send({
                status: 'success',
                statusUpdated
            })
        })
    },

    delete: (req, res) => {
        const statusId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Status = conn.model('Status')

        Status.findOneAndDelete({_id: statusId}, (err, statusRemoved) => {
            conn.close()
            if(!statusRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el status.'
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
                statusRemoved
            })
        })

    }

}

module.exports = controller;