'use strict'
const con = require('../src/dbuser')

const controller = {
    save: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const params = req.body;
        const Producto = conn.model('Producto')

        let producto = new Producto();
            
            //Asignar valores
            producto.clave = params.clave.toUpperCase();
            producto.descripcion = params.descripcion.toUpperCase();
            producto.costo = params.costo;
            producto.unidad = params.unidad;
            producto.empaque = params.empaque;
            producto.precio1 = params.precio1;
            producto.precio2 = params.precio2;
            producto.precio3 = params.precio3;

            //Guardar objeto
            producto.save((err, productoStored) => {
                // productoStored.populate("unidad").lean()
                conn.close()
                if(err || !productoStored){
                    return res.status(200).send({
                        status: 'error',
                        message: 'El producto no se guardó'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    message: 'Producto guardado correctamente.',
                    producto: productoStored
                })
            })

    },

    getProductos: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
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
        const productoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Producto = conn.model('Producto')
        if(!productoId){
            mongoose.connection.close()
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el producto'
            })
        }
        const resp = await Producto
            .findById(productoId)
            .lean()
            .then( producto => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    producto
                })
            })
            .catch(err => {
                conn.close()
                return res.status(404).send({
                    status: 'success',
                    mesage: 'No existe el producto.',
                    err
                })
            })        
    },

    getProductosMasVendidos: (req, res) => {
        const year = req.params.year
        const month = req.params.month
        const bd = req.params.bd
        const conn = con(bd)
        const Producto = conn.model('Producto')
    },

    update: (req, res) => {
        const productoId = req.body._id;
        const bd = req.params.bd
        const conn = con(bd)
        const params = req.body;
        params.empaque = req.body.empaque._id
        params.unidad = req.body.unidad._id
        const Producto = conn.model('Producto')

        Producto.findOneAndUpdate({_id: productoId}, params, {new:true}, (err, productoUpdated) => {
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

    delete: (req, res) => {
        const productoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
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