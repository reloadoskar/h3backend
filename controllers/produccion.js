'use strict'
const con = require('../src/dbuser')

const controller = {
    save: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const Produccion = conn.model('Produccion')
        //Crear el objeto a guardar

        Produccion.estimatedDocumentCount((err, count) => {
            if (err) console.log(err)
            const nDocuments = count

            let produccion = new Produccion();

            produccion.fecha = new Date().toISOString()
            produccion.folio = nDocuments + 1
            produccion.clave = "PRO-"+produccion.folio
            produccion.status = "ACTIVO"
            produccion.costo = 0
            produccion.valor = 0

            //Guardar objeto
            produccion.save((err, produccionStored) => {
                conn.close()
                if (err || !produccionStored) {
                    return res.status(200).send({
                        status: 'error',
                        message: 'La produccion no se creó'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    message: 'Producción creada correctamente.',
                    produccion: produccionStored
                })
            })


        })
    },

    getProduccions: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const Produccion = conn.model('Produccion')
        Produccion.find({})
            .populate('insumos')
            .populate({
                path:'insumos', 
                populate: {
                    path: 'compraItem',
                    populate: 'producto'
                }
            })
            .sort('folio')
            .exec((err, produccions) => {
                conn.close()
                if (err || !produccions) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al devolver los produccions'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    produccions: produccions
                })
        })
    },

    getProduccion: (req, res) => {
        const produccionId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Produccion = conn.model('Produccion')
        if (!produccionId) {
            mongoose.connection.close()
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe la producción: ',
                produccionId
            })
        }

        Produccion.findById(produccionId)
        .populate('insumos')
        .populate('egresos')
        .populate('items')
        .populate('ventas')
        .lean()
        .then(produccion => {
            conn.close()
            return res.status(200).send({
                status: 'success',
                produccion
            })
        })
        .catch( err => {     
            conn.close()       
            return res.status(404).send({
                status: 'success',
                message: 'Ocurrio un error.',
                err
            })            
        })
    },

    update: (req, res) => {
        const produccionId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const params = req.body;
        const Produccion = conn.model('Produccion')

        Produccion.findOneAndUpdate({ _id: produccionId }, params, { new: true }, (err, produccionUpdated) => {
            conn.close()
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar'
                })
            }

            if (!produccionUpdated) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el produccion'
                })
            }

            return res.status(200).send({
                status: 'success',
                produccion: produccionUpdated
            })
        })
    },

    delete: (req, res) => {
        const produccionId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Produccion = conn.model('Produccion')
        Produccion.findOneAndDelete({ _id: produccionId }, (err, produccionRemoved) => {
            conn.close()
            if (!produccionRemoved) {
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el produccion.'
                })
            }
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Ocurrio un error.'
                })
            }
            return res.status(200).send({
                status: 'success',
                message: 'Produccion eliminado correctamente.',
                produccionRemoved
            })
        })

    }

}

module.exports = controller;