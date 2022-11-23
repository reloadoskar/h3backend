'use strict'
const con = require('../src/dbuser')

const controller = {
    save: (req, res) => {
        //recoger parametros
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const TipoCompra = conn.model('TipoCompra')
        
        //Crear el objeto a guardar
        let tipocompra = new TipoCompra();
            
        //Asignar valores
        tipocompra.tipo = params.tipo;

        //Guardar objeto
        tipocompra.save((err, tipocompraStored) => {
            conn.close()
                if(err || !tipocompraStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tipocompra no se guardó'
                    })
                }
                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    message: 'Se creó correctamente',
                    tipocompra: tipocompraStored
                })
            })
    },

    getTipoCompras: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const TipoCompra = conn.model('TipoCompra')
        TipoCompra.find({}).sort('_id').exec( (err, tipocompras) => {
            conn.close()
            if(err || !tipocompras){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los tipocompras'
                })
            }
            return res.status(200).send({
                status: 'success',
                tipoCompras: tipocompras
            })
        })
    },

    getTipoCompra: (req, res) => {
        const tipocompraId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const TipoCompra = conn.model('TipoCompra')
        if(!tipocompraId){
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el tipocompra'
            })
        }

        TipoCompra.findById(tipocompraId, (err, tipocompra) => {
            conn.close()
            if(err || !tipocompra){
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el tipocompra.'
                })
            }
            return res.status(200).send({
                status: 'success',
                tipocompra
            })
        })
    },

    update: (req, res) => {
        const tipocompraId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const params = req.body;
        const TipoCompra = conn.model('TipoCompra')

        TipoCompra.findOneAndUpdate({_id: tipocompraId}, params, {new:true}, (err, tipocompraUpdated) => {
            conn.close()
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar'
                })
            }
            if(!tipocompraUpdated){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el tipocompra'
                })
            }
            return res.status(200).send({
                status: 'success',
                tipocompra: tipocompraUpdated
            })
        })
    },

    delete: (req, res) => {
        const tipocompraId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const TipoCompra = conn.model('TipoCompra')
        TipoCompra.findOneAndDelete({_id: tipocompraId}, (err, tipocompraRemoved) => {
            conn.close()
            if(!tipocompraRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el tipocompra.'
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
                tipocompraRemoved
            })
        })

    }

}

module.exports = controller;