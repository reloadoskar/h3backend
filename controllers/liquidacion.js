'use strict'
const mongoose = require('mongoose');
const con = require('../src/dbuser')

var controller = {
    save: async (req, res) =>{
        const bd = req.params.bd
        const data = req.body
        const conn = con(bd)
        const Liquidacion = conn.model('Liquidacion')
        const liquidacion = new Liquidacion(data)
        // console.log(liquidacion)
        let resp = await liquidacion.save((err, liquidacionSaved) =>{
            conn.close()
            if(err){
                return res.status(200).send({
                    status: 'error',
                    mesage:'algo salio mal. ❌'
                })
            }
            return res.status(200).send({
                status: 'success',
                mesage:'Todo genial. 😘',
                liquidacion: liquidacionSaved
            })
        })
    }
}

module.exports = controller;