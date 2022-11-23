'use strict'
const con = require('../src/dbuser')

const controller = {
    save: (req, res) => {
        const bd= req.params.bd
        const conn = con(bd)
        const params = req.body;
        const Unidad = conn.model('Unidad')

        //Crear el objeto a guardar
        let unidad = new Unidad();
            
        //Asignar valores
        unidad.unidad = params.unidad;
        unidad.abr = params.abr;

        //Guardar objeto
        unidad.save((err, unidadStored) => {
            conn.close()
            if(err || !unidadStored){
                return res.status(404).send({
                    status: 'error',
                    message: 'La unidad no se guardó.',
                    err
                })
            }
            return res.status(200).send({
                status: 'success',
                message: 'Unidad registrada correctamente.',
                unidad: unidadStored
            })
        })

    },

    getUnidades: (req, res) => {
        const bd= req.params.bd
        const conn = con(bd)
        const Unidad = conn.model('Unidad')
        Unidad.find({}).sort('_id').exec( (err, unidads) => {
            conn.close()
            if(err || !unidads){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver las unidades'
                })
            }
            return res.status(200).send({
                status: 'success',
                unidads: unidads
            })
        })
    },

    delete: (req, res) => {
        const bd= req.params.bd
        const unidadId = req.params.id;
        const conn = con(bd)
        const Unidad = conn.model('Unidad')

        Unidad.findOneAndDelete({_id: unidadId}, (err, unidadRemoved) => {
            conn.close()
            if(!unidadRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar la unidad.'
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
                message: 'Unidad eliminada correctamente.',
                unidadRemoved
            })
        })

    }

}

module.exports = controller;