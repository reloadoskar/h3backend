'use strict'
const con = require('../src/dbuser')

const controller = {
    save: (req, res) => {
        //recoger parametros
        const {user, data} = req.body;
        const conn = con(user)
        const Provedor = conn.model('Provedor')
        
        let provedor = new Provedor();
            
            //Asignar valores
            provedor.nombre = data.nombre;
            provedor.clave = data.clave;
            provedor.direccion = data.direccion;
            provedor.tel1 = data.tel1;
            provedor.cta1 = data.cta1;
            provedor.email = data.email;
            provedor.diasDeCredito = data.diasDeCredito;
            provedor.comision = data.comision;
            provedor.ref = data.ref;
            provedor.banco1 = data.banco1
            provedor.sexo = data.sexo

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
        const user = req.body
        const conn = con(user)
        const Provedor = conn.model('Provedor')
        const resp = await Provedor
            .find({})
            .sort({"nombre": 1})
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
        const {user, data} = req.body
        const conn = con(user)
        const Provedor = conn.model('Provedor')
        Provedor.findOneAndUpdate({_id: data._id}, data, {new:true}, (err, provedorUpdated) => {
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
        const {user, id} = req.body;
        const conn = con(user)
        const Provedor = conn.model('Provedor')
        Provedor.findOneAndDelete({_id: id}, (err, provedorRemoved) => {
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