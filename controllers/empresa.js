'use strict'
const con = require('../src/dbuser')
const controller = {
    save: async (req, res) => {
        const {user, data} = req.body;
        let errorStatusCode = 500;
        try {
            const conn = await con(user)
            const Empresa = conn.model('Empresa')
    
            let nEmpresa = Empresa.create(data)
            
            if(!nEmpresa){
                conn.close()
                errorStatusCode = 401;
                throw new Error('No se creó la empresa');
            }

            return res.status(200).send({
                status: 'succes',
                message: 'Se guardo correctamente',
                empresa: nEmpresa
            })
            
        } catch (error) {
            return res.status(errorStatusCode).send({
                status: 'error',
                message: error.message,
            })
        }


    },
    
    get: async (req, res) => {
        const user = req.body;
        const conn = await con(user)
        const Empresa = conn.model('Empresa')

        const resp = await Empresa
            .findOne({bd: user.database})
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
        const {user, data} = req.body;
        const conn = await con(user)
        const Empresa = conn.model('Empresa')
        console.log(data)
        const resp = await Empresa
            .findOneAndUpdate({ _id: data._id }, data, { new: true })
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