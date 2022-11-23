'use strict'
const con = require('../src/dbuser')
const controller = {
    save: async (req, res) => {
        //recoger parametros
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Egreso = conn.model('Egreso')
        const Compra = conn.model('Compra')
        const Inversion = conn.model('Inversion')

        let egreso = new Egreso()
        if(params.compra !== 1){
            const compra = await Compra.findById(params.compra)
            if(params.tipo==="PAGO"){
                compra.pagos.push(egreso._id)
            }else{
                compra.gastos.push(egreso._id)
            }
            compra.save()
            
            egreso.compra = params.compra
            egreso.cuenta = params.cuenta
        }

        if(params.inversion){
            const inversion = await Inversion.findById(params.inversion)
            inversion.gastos.push(egreso._id)
            inversion.save()
            
            egreso.inversion = params.inversion
        }

        const resp = await Egreso
        .estimatedDocumentCount()
        .then(count => {
            egreso.folio = ++count
            egreso.ubicacion = params.ubicacion
            egreso.concepto = params.concepto
            egreso.tipo = params.tipo
            egreso.descripcion = params.descripcion
            egreso.fecha = params.fecha
            egreso.importe = params.importe
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
        const bd = req.params.bd
        const conn = con(bd)
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
        const egresoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Egreso = conn.model('Egreso')
        if (!egresoId) {
            conn.close()
            return res.status(404).send({
                status: 'error',
                message: 'No existe el egreso'
            })
        }

        const resp = await Egreso
            .findById(egresoId)
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
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Egreso = conn.model('Egreso')

            // Find and update
        const resp = await Egreso
            .findOneAndUpdate({ _id: params._id }, params, { new: true })
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

    delete: (req, res) => {
        const egresoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Egreso = conn.model('Egreso')
        
        Egreso.findOneAndDelete({ _id: egresoId }, (err, egresoRemoved) => {
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

    getEgresosDelDia: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const fecha = req.params.fecha
    
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
        const bd = req.params.bd
        const conn = con(bd)
        let month = req.params.month
        const year = req.params.year
        // if (month < 10) {
        //     month = "0" + month
        // }
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