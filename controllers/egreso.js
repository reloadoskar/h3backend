'use strict'
const con = require('../src/dbuser')
const controller = {
    save: async (req, res) => {
        const {user, data} = req.body;
        const conn = await con(user)
        const Egreso = conn.model('Egreso')
        const Compra = conn.model('Compra')
        const Inversion = conn.model('Inversion')

        let egreso = new Egreso()
        if(data.compra !== 1){
            const compra = await Compra.findById(data.compra)
            if(data.tipo==="PAGO"){
                compra.pagos.push(egreso._id)
            }else{
                compra.gastos.push(egreso._id)
            }
            compra.save()
            
            egreso.compra = data.compra
            egreso.cuenta = data.cuenta
        }

        if(data.inversion){
            const inversion = await Inversion.findById(data.inversion)
            inversion.gastos.push(egreso._id)
            inversion.save()
            
            egreso.inversion = data.inversion
        }

        const resp = await Egreso
        .estimatedDocumentCount()
        .then(count => {
            egreso.folio = ++count
            egreso.ubicacion = data.ubicacion
            egreso.concepto = data.concepto
            egreso.tipo = data.tipo
            egreso.descripcion = data.descripcion
            egreso.fecha = data.fecha
            egreso.importe = data.importe
            egreso.saldo = 0
                egreso.save((err, egreso) => {
                    conn.close()
                    if( err || !egreso){
                        return res.status(404).send({
                            status: 'error',
                            message: 'No se registró el egreso.' + err
                        })
                    }
                    return res.status(200).send({
                        status: 'success',
                        message: 'Egreso registrado correctamente.',
                        egreso
                    })
                })
            })
    },

    getEgresos: async (req, res) => {
        const user = req.body
        const conn = await con(user)
        const Egreso = conn.model('Egreso')
        const resp = await Egreso
            .find({saldo:{$eq:0}}).sort({fecha: -1, createdAt: -1})
            .lean()
            .populate('ubicacion')
            .populate('compra', 'clave')
            .then(egresos=> {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    egresos
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los egresos' + err
                })
            })
    },

    getEgreso: async (req, res) => {
        const {user, id} = req.body
        const conn = await con(user)
        const Egreso = conn.model('Egreso')
        const resp = await Egreso
            .findById(id)
            .lean()
            .populate('compra', 'clave')
            .then( egreso => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    egreso
                })
            })
            .catch(err => {
                conn.close()            
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el egreso.',
                    err
                })
            })
    },

    update: async (req, res) => {
        const {user, data} = req.body;
        const conn = await con(user)
        const Egreso = conn.model('Egreso')

            // Find and update
        const resp = await Egreso
            .findOneAndUpdate({ _id: data._id }, data, { new: true })
            .then(egresoUpdated => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Todo bien 👌',
                    egreso: egresoUpdated
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar',
                    err
                })                
            })
    },

    delete: async (req, res) => {
        const {user, id} = req.body
        const conn = await con(user)
        const Egreso = conn.model('Egreso')
        
        Egreso.findOneAndDelete({ _id: id }, (err, egresoRemoved) => {
            conn.close()
            if (err || !egresoRemoved) {
                return res.status(200).send({
                    status: 'error',
                    message: 'No se pudo borrar el egreso.'
                })
            }
            return res.status(200).send({
                status: 'success',
                egresoRemoved
            })
        })
    },

    getEgresosDelDia: async (req, res) => {
        const {user, fecha} = req.body
        const conn = await con(user)
    
        const Egreso = conn.model('Egreso')
        try{
            Egreso.egresosDelDia(fecha)
                .then(egresos => {
                    conn.close()
                    return res.status(200).send({
                        status: "succes",
                        egresos
                    })
                })
                .catch(err => {
                    conn.close()
                    console.log(err)
                    throw "No se cargaron los egresos."
                })
            
        }catch(err){
            conn.close()
            return res.status(200).send({
                status: "error",
                message: err
            })
        }
    },

    getEgresosMonthYear: async (req, res) =>{
        const {user, year, month} = req.body
        const conn = await con(user)        
        const Egreso = conn.model('Egreso')

        const eg = Egreso
            .find({fecha: { $gt: year + "-" + month + "-00", $lt: year + "-" + month + "-32" }})
            .sort({folio: 1})
            .populate({
                path:'compra',
                select: 'folio provedor ubicacion remision importe fecha clave'
            })
            .populate('ubicacion')
            .then(egresos =>{
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: "Egresos encontrados.",
                    egresos
                })
            })
            .catch(err=>{
                conn.close()
                return res.status(200).send({
                    status: 'error',
                    message: "Ocurrió un error. "+err,
                })
            })

    }

}

module.exports = controller;