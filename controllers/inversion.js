'use strict'
const mongoose = require('mongoose');

const con = require('../src/dbuser')

var controller = {
    save: async (req, res) => {
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Inversion = conn.model( 'Inversion')
        
        const numeroInversiones = await Inversion.estimatedDocumentCount()
        const nuevaInversion = await Inversion.create({
            _id : mongoose.Types.ObjectId(),
            folio : numeroInversiones + 1,
            provedor : params.productor,
            descripcion : params.descripcion,
            fecha : params.fecha,
            status : 'ACTIVO',
        })
        
        let inversionPopulated = await nuevaInversion.populate('provedor')

        if(inversionPopulated){
            conn.close()  
            return res.status(200).send({
                status: 'success',
                message: 'Inversion registrada correctamente.',
                inversion: inversionPopulated
            })            
        }
    },

    getInversions: async (req, res) => {
        const bd = req.params.bd
        let mes = req.params.mes
        let year = req.params.year
        if(mes<10){
            mes = "0"+ mes
        }
        const conn = con(bd)
        const Inversion = conn.model('Inversion')
         
        const resp = await Inversion
            .find({
                fecha: { $gt: year + "-" + mes + "-00", $lt: year + "-" + mes + "-32" }
            })
            .sort('_id')
            .lean()
            .populate('provedor', 'nombre diasDeCredito comision email cta1 tel1')
            .populate('compras')  
            .populate({ path: 'compras',
                populate: { path: 'provedor', select: 'nombre diasDeCredito comision email cta1 tel1'},
            })
            .populate({ path: 'compras',
                populate: { path: 'ubicacion'}
            })
            .populate({ path: 'compras',
                populate: { path: 'tipoCompra'}
            })
            .populate({ path: 'compras',
                populate: { path: 'gastos'}
            })
            .populate({ path: 'compras',
                populate: { path: 'pagos'}
            })
            .populate({ path: 'compras',
                populate: { path: 'ventaItems'}
            })
            .populate('gastos')
            .populate({
                path: 'gastos',
                populate: { path: 'ubicacion'},
            })
            .then(inversiones => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    inversions: inversiones
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver las inversiones' + err
                })
            })
    },

    getInversion: async (req, res) => {
        const Id = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Inversion = conn.model('Inversion')

        let data = {}

        conn.close()
        return res.status(200).send({
            status: 'success',
            data
        })
    },

    open: async (req, res) => {
        const Id = req.params.id
        const bd = req.params.bd
        const conn = con(bd)
        const Inversion = conn.model('Inversion')
        const resp = await Inversion
            .findOneAndUpdate({_id: Id}, {status: "ACTIVO"} )
            .then(inv => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Inversion activada correctamente.',
                    inversion: inv
                })
            })
            .catch(err => {
                conn.close()
                return res.status(404).send({
                    status: "error",
                    err
                })
            })
    },

    close: async (req, res) => {
        const Id = req.params.id
        const bd = req.params.bd
        const conn = con(bd)
        const Inversion = conn.model('Inversion')
        const resp = await Inversion
            .findOneAndUpdate({_id: Id}, {status: "CERRADO"} )
            .then(inv => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Inversion cerrada correctamente.',
                    inversion: inv
                })
            })
            .catch(err => {
                conn.close()
                return res.status(404).send({
                    status: "error",
                    err
                })
            })
    },

    delete: (req, res) => {
        const Id = req.params.id
        const bd = req.params.bd
        const conn = con(bd)
        const Inversion = conn.model('Inversion')
        Inversion.findOneAndDelete({ _id: Id }, (err, invRemoved) => {
            conn.close()
            if (!invRemoved) {
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo eliminar.'
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
                message: 'Inversion eliminada correctamente',
                inversion: invRemoved
            })
        })

    },

    cancel: (req, res) => {
        const Id = req.params.id
        const bd = req.params.bd
        const conn = con(bd)
        const Inversion = conn.model('Inversion')
        Inversion.findById(Id).exec((err, inversion) => {
            inversion.status = "CANCELADO"

            inversion.save((err, saved) => {
                if(err | !saved){
                    conn.close()
                    return res.status(200).send({
                        status: 'error',
                        message: 'Ocurrió un error',
                        err
                    })
                }
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Compra CANCELADA correctamente.',
                    saved
                })
            })
        })
    },

    update: (req, res) => {
        const inversion = req.body
        const bd = req.params.bd
        const conn = con(bd)
        const Inversion = conn.model('Inversion')

        Inversion
            .findOneAndUpdate({ _id: inversion._id }, inversion, { new: true })
            .then(invSaved =>{
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    inversion: invSaved
                })
            })
            .catch(err=>{
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar',
                    err
                }) 
            })
    },
}

module.exports = controller;