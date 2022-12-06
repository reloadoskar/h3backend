const mongoose = require('mongoose');
const con = require('../src/dbuser')
const controller = {

    save: async (req, res) => {
        //recoger parametros
        const params = req.body;
        const bd = req.params.bd
        const conn = await con(bd)
    },

    getItems: async (req, res) => {
        const bd = req.params.bd
        const conn = await con(bd)

        const CompraItem = conn.model('CompraItem')
        const resp = await CompraItem
            .find({stock: {$gt: 0}})
            .lean()
            .populate("compra")
            .populate("producto")
            .then(items => {
                conn.close()
                return res.status(200).send({
                    status: "success",
                    items: items
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: "error",
                    message: "Error al devolver items"
                })
            })
    },

    subtractStock: async (req, res) => {
        const bd = req.params.bd
        const params = req.body
        const conn = await con(bd)
        const CompraItem = conn.model('CompraItem')
        CompraItem.findById(params.id).exec((err, item) => {
            if(err||!item){
                console.log(err)
            }
            item.stock -= params.cantidad
            item.empaquesStock -= params.cantidad

            item.save((err, itemSaved) => {
                conn.close()
                mongoose.connection.close()
                return res.status(200).send({
                    status: "success",
                    item: itemSaved
                })
            })
        })
    },

    addStock: async (req, res) => {
        const bd = req.params.bd
        const params = req.body
        const conn = await con(bd)
        const CompraItem = conn.model('CompraItem')
        CompraItem.findById(params.id).exec((err, item) => {
            if(err||!item){
                conn.close()
                return res.status(500).send({
                    status: "error",
                })
            }else{

                item.stock += params.cantidad
                item.empaquesStock += params.cantidad
                
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