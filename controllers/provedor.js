'use strict'
const con = require('../src/dbuser')

const controller = {
    save: (req, res) => {
        //recoger parametros
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Provedor = conn.model('Provedor')
        
        let provedor = new Provedor();
            
            //Asignar valores
            provedor.nombre = params.nombre;
            provedor.clave = params.clave;
            provedor.direccion = params.direccion;
            provedor.tel1 = params.tel1;
            provedor.cta1 = params.cta1;
            provedor.email = params.email;
            provedor.diasDeCredito = params.diasDeCredito;
            provedor.comision = params.comision;
            provedor.ref = params.ref;
            provedor.banco1 = params.banco1
            provedor.sexo = params.sexo

            //Guardar objeto
            provedor.save((err, provedorStored) => {
                conn.close()
                if(err || !provedorStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El provedor no se guardó' + err
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    message: 'Productor guardado correctamente.',
                    provedor: provedorStored
                })
            })
    },

    getProvedors: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const Provedor = conn.model('Provedor')
        const resp = await Provedor
            .find({})
            .sort({nombre: 1})
            .lean()
            .then(provedors => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    provedors: provedors
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los provedores',
                    err
                })
            })
    },

    getProvedor: async (req, res) => {
        const provedorId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Provedor = conn.model('Provedor')
        if(!provedorId){
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el provedor'
            })
        }

        const resp = await Provedor
            .findById(provedorId)
            .lean()
            .then(provedor => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    provedor
                })
            })
            .catch(err => {
                conn.close()
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el provedor.',
                    err
                })
           })
    },

    update: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const params = req.body;
        const Provedor = conn.model('Provedor')
        Provedor.findOneAndUpdate({_id: params._id}, params, {new:true}, (err, provedorUpdated) => {
            conn.close()
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar'
                })
            }
            if(!provedorUpdated){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el provedor'
                })
            }
            return res.status(200).send({
                status: 'success',
                provedor: provedorUpdated
            })
        })
    },

    delete: (req, res) => {
        const provedorId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Provedor = conn.model('Provedor')
        Provedor.findOneAndDelete({_id: provedorId}, (err, provedorRemoved) => {
            conn.close()
            if(!provedorRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el provedor.'
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
                message: 'El Proveedor se eliminó correctamente',
                provedorRemoved
            })
        })

    }

}

module.exports = controller;