'use strict'
const con = require('../src/dbuser')

const controller = {
    save: async (req, res) => {
        const {user, data} = req.body;
        let errorStatusCode=500
        console.log("H3S> Holi, voy a guardar un cliente, comper'...")
        try {
            const conn = await con(user)
            if(!conn){
                errorStatusCode=401
                conn.close()
                throw new Error("Ash!! No me pudo conectar. 💀")
            }
            const Cliente = conn.model('Cliente')
            console.log("H3S> Creando cliente...")
            let nuevoCliente = await Cliente.create(data)
            if(!nuevoCliente){
                errorStatusCode=401
                conn.close()
                throw new Error('NOUP!, no se guardo el cliente. 💀🤔')
            }
            console.log("H3S> Yastuvooo 🤖")
            conn.close()
            return res.status(200).send({
                status: 'success',
                message: 'Cliente guardado correctamente.',
                cliente: nuevoCliente            })
            
        } catch (error) {
            console.log("H3S> Cómo de que no puedo hacerlo ahora?!! ❌")
            return res.status(errorStatusCode).send({
                status: 'error',
                message: 'El cliente no se guardó: '+error.message,
            })
        }
    },

    getClientes: async (req, res) => {
        const user = req.body
        let errorStatusCode=500
        try {
            const conn = await con(user)
            if(!conn){
                errorStatusCode=401
                throw new Error("No hay conectividad broww!!")
            }
            const Cliente = conn.model('Cliente')
            const clientes = await Cliente.find({})
                .sort('createdAt')

            if(!clientes){
                errorStatusCode=401
                throw new Error("No se hallaron los clientes.")
            }

            conn.close()
            return res.status(200).send({
                status: 'success',
                message: 'Ok',
                clientes
            })
            
        } catch (error) {
            return res.status(errorStatusCode).send({
                status: 'error',
                message: 'Error al devolver los clientes',
            })
        }
    },

    getCliente: async (req, res) => {
        const {user, id} = req.body
        let errorStatusCode = 500 
        try {
            const conn = await con(user)
            if(!conn){
                errorStatusCode=401
                throw new Error("No conecting..")
            }
            const Cliente = conn.model('Cliente')
            const cliente = await Cliente.findById(id)
            if(!cliente){
                errorStatusCode=401
                throw new Error("No se encontro el cliente")
            }
            conn.close()
            return res.status(200).send({
                status: 'success',
                cliente
            })
        } catch (error) {
            return res.status(errorStatusCode).send({
                status: 'error',
                message: 'No existe el cliente.'
            })
        }
                
    },

    update: async (req, res) => {
        const {user, data} = req.body;
        const conn = await con(user)
        const Cliente = conn.model('Cliente')
            // Find and update
            // console.log(data)
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
        const conn = await con(user)
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