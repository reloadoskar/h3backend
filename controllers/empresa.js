'use strict'
const con = require('../src/dbuser')
const controller = {
    save: async (req, res) => {
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Empresa = conn.model('Empresa')


    },
    get: async (req, res) => {
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Empresa = conn.model('Empresa')

        const resp = await Empresa
            .findOne({bd: bd})
            .populate('pagos')
            .lean()
            .then( empresa => {
                if(!empresa){
                    let emp = new Empresa()
                    emp.bd = bd
                    emp.save((err, e) =>{
                        conn.close()
                        return res.status(200).send({
                            status: 'success',
                            empresa: emp
                        })
                    })
                }else{
                    conn.close()
                    return res.status(200).send({
                        status: 'success',
                        message: "Empresa encontrada",
                        empresa
                    })
                }
            })
            .catch(err => {
                conn.close()            
                return res.status(200).send({
                    status: 'warning',
                    message: 'No existe el registro.'+err
                })
            })
    },
    update: async (req, res) => {
        const empresa = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Empresa = conn.model('Empresa')
        const resp = await Empresa
            .findOneAndUpdate({ _id: empresa._id }, empresa, { new: true })
            .then(empSaved =>{
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    empresa: empSaved
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