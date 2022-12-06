'use strict'
const con = require('../src/dbuser')

const controller = {
    save: async (req, res) => {
        const params = req.body;
        const bd = req.params.bd
        const conn = await con(bd)
        const Egreso = conn.model('Egreso')
        const Ingreso = conn.model('Ingreso')
        let egreso = new Egreso()
        Egreso.estimatedDocumentCount((err, count) => {
            egreso.folio = ++count
            egreso.ubicacion = params.ubicacion
            egreso.concepto = "RETIRO"
            egreso.descripcion = params.descripcion
            egreso.fecha = params.fecha
            egreso.importe = params.importe
            egreso.saldo = 0
            egreso.save((err, egreso) => {
                if( err || !egreso){
                    conn.close()
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se registró el egreso.' + err
                    })
                }
                let ingreso = new Ingreso()
                ingreso.ubicacion = params.ubicacionReceptora
                ingreso.concepto = "RECEPCION"
                ingreso.descripcion = params.descripcion
                ingreso.fecha = params.fecha
                ingreso.importe = params.importe
                ingreso.save((err, ingresoSaved) => {
                    conn.close()
                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: "No se pudo registrar el Ingreso."
                        })
                    }
                    return res.status(200).send({
                        status: 'success',
                        message: "Retiro registrado correctamente.",
                        ingreso: ingresoSaved
                    })
        
                })
                
            })
        })



    },

    delete: async (req, res) => {
        const ingresoId = req.params.id;
        const bd = req.params.bd
        const conn = await con(bd)
        const Egreso = conn.model('Egreso')
        const Ingreso = conn.model('Egreso')
        Ingreso.findOneAndDelete({_id: ingresoId}, (err, ingresoRemoved) => {
            conn.close()
            if(!ingresoRemoved){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el ingreso.'
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
                ingresoRemoved
            })
        })

    }

}

module.exports = controller;