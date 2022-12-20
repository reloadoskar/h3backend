'use strict'
const con = require('../src/dbuser')

const controller = {
    getBalance: async (req, res) => {
        const user = req.body
        const conn = con(user)
        console.log("getBalance")
        const Balance = conn.model('Balance', require('../schemas/balance'))
    
        const resp = await Balance.findOne().sort('fecha')
            .lean()
            .then(doc => {
                return res.status(200).send({
                    status: "success",
                    doc
                })
            })
            .catch(err => {
                return res.status(500).send({status:"error", err})
            })
        conn.close()
    },

    disponiblexUbicacion: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        console.log("disponiblexUbicacion")
        const Ubicacion = conn.model('Ubicacion')
        let disp = []
        Ubicacion.find({})
            .then(ubicacions => {
                ubicacions.forEach(ub => {

                })
            })
            .catch(err => {
                console.log(err)
            })
        conn.close()
    },
}

module.exports = controller