const con = require('../src/dbuser')
const controller = {
    save: (req, res) => {
        //recoger parametros
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Insumo = conn.model('Insumo')
        const Produccion = conn.model('Produccion')
        let insumo = new Insumo()

        insumo.fecha = params.fecha
        insumo.produccion = params.produccion
        // insumo.ubicacion = params.ubicacion._id
        insumo.compraItem = params.compraItem._id
        insumo.cantidad = params.cantidad
        insumo.disponible = params.cantidad
        insumo.importe = params.importe

        insumo.save((err, insumoSaved) => {
            if(err){
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: "No se pudo registrar el Insumo."
                })
            }
            Produccion.findById(insumoSaved.produccion).exec((err, produccion) => {
                if(err || !produccion){
                    conn.close()
                    return res.status(500).send({
                        status: 'error',
                        message: "Algo salió mal",
                        insumo: insumoSaved,
                        produccion: produccion
                    })
                }else{
                    produccion.insumos.push( insumoSaved._id )
                    produccion.save((err, saved) => {
                        conn.close()
                        return res.status(200).send({
                            status: 'success',
                            message: "Insumo registrado correctamente.",
                            insumo: insumoSaved,
                            produccion: saved
                        })
                    })
                }
            })
        })

    },

    getInsumos: (req, res) => {
        const produccionID = req.params.produccion_id
        const bd = req.params.bd
        const conn = con(bd)

        const Insumo = conn.model('Insumo')

        Insumo.find({produccion: produccionID})
            .populate({ path: 'produccion', select: 'clave' })            
            .populate({ path: 'compraItem', populate: 'producto' })
            .exec( (err, insumos) => {
                conn.close()
                if(err || !insumos){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al devolver los insumos' + err
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    insumos
                })
            } )

    },

    delete: (req, res) => {
        const id = req.body._id
        const bd = req.params.bd
        const conn = con(bd)
        const Insumo = conn.model('Insumo')

        Insumo.findOneAndDelete({ _id: id }, (err, insumoRemoved) => {
            mongoose.connection.close()
            conn.close()
            if(err|| !insumoRemoved){
                console.log(err)
            }
            return res.status(200).send({
                status: 'success',
                message: "Insumo eliminado correctamente",
                insumoRemoved
            })
        })
    },

    subtract: (req, res) => {
        const bd = req.params.bd
        const params = req.body
        const conn = con(bd)
        const Insumo = conn.model('Insumo')
        Insumo.findById(params.id).exec((err, item) => {
            if(err||!item){
                conn.close()
                console.log(err)
            }
            item.disponible -= params.cantidad

            item.save((err, itemSaved) => {
                conn.close()
                return res.status(200).send({
                    status: "success",
                    item: itemSaved
                })
            })
        })
    },

    add: (req, res) => {
        const bd = req.params.bd
        const params = req.body
        const conn = con(bd)
        const Insumo = conn.model('Insumo')
        Insumo.findById(params.id).exec((err, item) => {
            if(err||!item){
                conn.close()
                return res.status(500).send({
                    status: "error",
                    err
                })
            }else{
                let actual = parseInt(item.disponible)
                let cant = parseInt(params.cantidad)
                
                item.disponible = actual += cant
                
                item.save((err, itemSaved) => {
                    conn.close()
                    return res.status(200).send({
                        status: "success",
                        item: itemSaved
                    })
                })
            }
        })
    }
}

module.exports = controller