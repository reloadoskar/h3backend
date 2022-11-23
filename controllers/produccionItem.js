const con = require('../src/dbuser')
const controller = {
    save: (req, res) => {
        //recoger parametros
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Produccion = conn.model('Produccion')
        const ProduccionItem = conn.model('ProduccionItem')
        let item = new ProduccionItem()

        item.produccion = params.produccion._id
        item.producto = params.producto._id
        item.insumos = params.insumos
        item.fecha = params.fecha
        item.cantidad = params.cantidad
        item.costo = params.costo
        item.stock = params.cantidad
        item.importe = params.importe


        item.save((err, itemSaved) => {
            if(err){
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: "No se pudo registrar el Producto."
                })
            }
            Produccion.findById(itemSaved.produccion).exec((err, produccion) => {
                if(err || !produccion){
                    conn.close()
                    return res.status(500).send({
                        status: 'error',
                        message: "Algo salió mal",
                        insumo: insumoSaved,
                        produccion: produccion
                    })
                }else{
                    produccion.productos.push( itemSaved._id )
                    produccion.save((err, saved) => {                        
                        conn.close()
                        return res.status(200).send({
                            status: 'success',
                            message: "Producto registrado correctamente.",
                            insumo: itemSaved,
                            produccion: saved
                        })
                    })
                }
            })
        })

    },

    getItems: (req, res) => {
        const produccionID = req.params.produccion_id
        const bd = req.params.bd
        const conn = con(bd)

        const ProduccionItem = conn.model('ProduccionItem')

        ProduccionItem.find({produccion: produccionID})
            .populate({ path: 'produccion', select: 'clave' })            
            .populate("producto")
            .exec( (err, items) => {
                conn.close()
                if(err || !items){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al devolver los productos' + err
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    items
                })
            } )
    },

    delete: (req, res) => {
        const params = req.body;
        const id = req.body._id
        const prodId = params.produccion._id
        const bd = req.params.bd
        const conn = con(bd)
        const ProduccionItem = conn.model('ProduccionItem')
        ProduccionItem.findOneAndDelete({ _id: id }, (err, insumoRemoved) => {
            if(err|| !insumoRemoved){
                console.log(err)
            }
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: "Producto eliminado correctamente",
                    insumoRemoved,
                })

        })
    },

    subtract: (req, res) => {
        const bd = req.params.bd
        const params = req.body
        const conn = con(bd)
        const ProduccionItem = conn.model('ProduccionItem')
        ProduccionItem.findById(params.id).exec((err, item) => {
            if(err||!item){
                console.log(err)
            }
            item.stock -= params.cantidad

            item.save((err, itemSaved) => {
                conn.close()
                return res.status(200).send({
                    status: "success",
                    item: itemSaved
                })
            })
        })
    },

    // add: (req, res) => {
    //     const bd = req.params.bd
    //     const params = req.body
    //     const conn = con(bd)
    //     var Insumo = conn.model('Insumo', require('../schemas/insumo'))
    //     Insumo.findById(params.id).exec((err, item) => {
    //         if(err||!item){
    //             return res.status(500).send({
    //                 status: "error",
    //             })
    //         }else{
    //             item.cantidad += params.cantidad
    //             item.save((err, itemSaved) => {
    //                 conn.close()
    //                 return res.status(200).send({
    //                     status: "success",
    //                     item: itemSaved
    //                 })
    //             })
    //         }
    //     })
    // }
}

module.exports = controller