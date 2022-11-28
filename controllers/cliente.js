'use strict'
const con = require('../src/dbuser')

const controller = {
    save: (req, res) => {
        //recoger parametros
        const {user, data} = req.body;
        const conn = con(user)
        const Cliente = conn.model('Cliente')

        //Crear el objeto a guardar
        let cliente = new Cliente();

        //Asignar valores
        cliente.nombre = data.nombre;
        cliente.direccion = data.direccion;
        cliente.ubicacion = data.ubicacion;
        cliente.rfc = data.rfc;
        cliente.tel1 = data.tel1;
        cliente.email = data.email;
        cliente.limite_de_credito = data.limite_de_credito;
        cliente.credito_disponible = data.limite_de_credito;
        cliente.dias_de_credito = data.dias_de_credito;

        //Guardar objeto
        cliente.save((err, clienteStored) => {
            conn.close()
            if (err || !clienteStored) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El cliente no se guardó',
                    err: err
                })
            }
            //Devolver respuesta
            return res.status(200).send({
                status: 'success',
                message: 'Cliente guardado correctamente.',
                cliente: clienteStored
            })
        })

    },

    getClientes: async (req, res) => {
        const user = req.body
        const conn = con(user)
        const Cliente = conn.model('Cliente')
        
        const resp = await Cliente.find({})
            .sort('createdAt')
            .lean()
            .then((clientes) => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Ok',
                    clientes
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los clientes',
                    err
                })
            })
    },

    getCliente: async (req, res) => {
        const clienteId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Cliente = conn.model('Cliente')
        if (!clienteId) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el cliente'
            })
        }
        
        const resp = await Cliente.findById(clienteId)
            .lean()
            .then(cliente => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    cliente
                })
            })
            .catch(err => { 
                conn.close()               
                if (err || !cliente) {
                    return res.status(404).send({
                        status: 'success',
                        message: 'No existe el cliente.'
                    })
                }
            }) 
    },

    update: async (req, res) => {
        const {user, data} = req.body;
        const conn = con(user)
        const Cliente = conn.model('Cliente')
            // Find and update
            console.log(data)
        Cliente
            .findOneAndUpdate({_id: data._id}, data, { new: true } )
            .then( updatd => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: "Actualizado correctamente",
                    cliente: updatd
                })
            })
            .catch(err => {
                conn.close()
                return res.status(401).send({
                    status: 'error',
                    message: "No se pudo actualizar " + err.message,
                    err
                })
            })                
    },

    delete: async (req, res) => {
        const {user, id} = req.body
        const conn = con(user)
        const Cliente = conn.model('Cliente')
        Cliente.findOneAndDelete({ _id: id }, (err, clienteRemoved) => {
                if (!clienteRemoved) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se pudo borrar el cliente.'
                    })
                }
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Ocurrio un error.'
                    })
                }
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Cliente eliminado correctamente.',
                    clienteRemoved
                })
            })
    }

}

module.exports = controller;