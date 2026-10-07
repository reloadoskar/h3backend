'use strict'
const mongoose = require('mongoose')
const con = require('../src/dbuser')

const controller = {
    save: async (req, res) => {
        let conn
        try {
            const { user, data } = req.body || {}
            if (!data || typeof data.clave !== 'string' || typeof data.descripcion !== 'string' ||
                !data.clave.trim() || !data.descripcion.trim()) {
                return res.status(400).send({
                    status: 'error',
                    message: 'La clave y la descripción del producto son obligatorias.'
                })
            }
            if (!mongoose.isValidObjectId(data.unidad) || !mongoose.isValidObjectId(data.empaque)) {
                return res.status(400).send({
                    status: 'error',
                    message: 'La unidad y el empaque del producto no son válidos.'
                })
            }

            conn = await con(user)
            const Producto = conn.model('Producto')
            const producto = {
                ...data,
                clave: data.clave.trim().toUpperCase(),
                descripcion: data.descripcion.trim().toUpperCase()
            }
            const productoGuardado = await Producto.create(producto)
            try {
                await productoGuardado.populate('unidad empaque')
            } catch (error) {
                console.error('El producto se guardó, pero no fue posible cargar sus relaciones.')
            }

            return res.status(200).send({
                status: 'success',
                message: 'Producto guardado correctamente.',
                producto: productoGuardado
            })
        } catch (error) {
            if (error && error.code === 11000) {
                const duplicateField = error.keyPattern && Object.keys(error.keyPattern)[0]
                const duplicateMessages = {
                    clave: 'Ya existe un producto con esa clave.',
                    descripcion: 'Ya existe un producto con esa descripción.'
                }
                return res.status(409).send({
                    status: 'error',
                    message: duplicateMessages[duplicateField] || 'Ya existe un producto con esos datos.'
                })
            }

            return res.status(500).send({
                status: 'error',
                message: 'No fue posible guardar el producto.'
            })
        } finally {
            if (conn) {
                try {
                    await conn.close()
                } catch (error) {
                    console.error('No fue posible cerrar la conexión del producto.')
                }
            }
        }
    },

    getProductos: async (req, res) => {
        const user = req.body
        const conn = await con(user)
        const Producto = conn.model('Producto')
        const Unidad = conn.model('Unidad')
        const Empaque = conn.model('Empaque')
        const resp = await Producto
            .find({})
            .populate('unidad')
            .populate('empaque')
            .sort('clave')
            .lean()
            .then( productos => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    products: productos
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los productos',
                    err
                })
            })
    },

    getProducto: async (req, res) => {
        const {user, id} = req.body
        const productoId = id;
        const conn = await con(user)
        const Producto = conn.model('Producto')
        if(!productoId){
            mongoose.connection.close()
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el producto'
            })
        }
        const producto = await Producto.findById(productoId).populate("unidad empaque")

        if(!producto){
            return res.status(401).send({
                status: "error",
                message: "No se encontro el producto."
            })
        }

        conn.close()
        return res.status(200).send({
            status: 'success',
            mesage: 'Producto encontrado.',
            product: producto
        })


            // .then( producto => {
            //     conn.close()
            //     return res.status(200).send({
            //         status: 'success',
            //         producto
            //     })
            // })
            // .catch(err => {
            //     conn.close()
            //     return res.status(404).send({
            //         status: 'success',
            //         mesage: 'No existe el producto.',
            //         err
            //     })
            // })        
    },

    getProductosMasVendidos: async (req, res) => {
        // const {user, year, month} = req.body
        // const conn = await con(user)
        // const Producto = conn.model('Producto')
    },

    update: async (req, res) => {
        const {user, data} = req.body;
        const conn = await con(user)
        const params = data;
        params.empaque = data.empaque._id
        params.unidad = data.unidad._id
        const Producto = conn.model('Producto')

        Producto.findOneAndUpdate({_id: data._id}, params, {new:true}, (err, productoUpdated) => {
            conn.close()
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar'
                })
            }
            if(!productoUpdated){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el producto'
                })
            }
            return res.status(200).send({
                status: 'success',
                message: "Actualizado correctamente",
                producto: productoUpdated
            })
        })
    },

    delete: async (req, res) => {
        const productoId = req.params.id;
        const bd = req.params.bd
        const conn = await con(bd)
        const Producto = conn.model('Producto')
        Producto.findOneAndDelete({_id: productoId}, (err, productoRemoved) => {
            conn.close()
            if(!productoRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el producto.'
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
                message: 'Producto eliminado correctamente.',
                productoRemoved
            })
        })

    }

}

module.exports = controller;