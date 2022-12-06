'use strict'
const con = require('../src/dbuser')

const controller = {
    save: async (req, res) => {
        //recoger parametros
        const {user, data} = req.body;
        const conn = await con(user)
        const TipoCompra = conn.model('TipoCompra')
        
        //Crear el objeto a guardar
        let tipocompra = new TipoCompra();
            
        //Asignar valores
        tipocompra.tipo = data.tipo;

        //Guardar objeto
        tipocompra.save((err, tipocompraStored) => {
            conn.close()
                if(err || !tipocompraStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tipocompra no se guardó' + err.message
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

    getTipoCompras: async (req, res) => {
        const user = req.body
        const conn = await con(user)
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

    getTipoCompra: async (req, res) => {
        const tipocompraId = req.params.id;
        const bd = req.params.bd
        const conn = await con(bd)
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

    update: async (req, res) => {
        const tipocompraId = req.params.id;
        const bd = req.params.bd
        const conn = await con(bd)
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

    delete: async (req, res) => {
        const tipocompraId = req.params.id;
        const bd = req.params.bd
        const conn = await con(bd)
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