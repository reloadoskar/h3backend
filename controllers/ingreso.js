'use strict'
const con = require('../src/dbuser')
const controller = {
    save: (req, res) => {
        //recoger parametros
        const params = req.body;
        const bd = req.params.bd
        const conn = con(bd)
        const Ingreso = conn.model('Ingreso')
        let ingreso = new Ingreso()

        ingreso.ubicacion = params.ubicacion
        ingreso.concepto = params.concepto
        ingreso.descripcion = params.descripcion
        ingreso.fecha = params.fecha
        ingreso.tipoPago = params.tipoPago
        ingreso.importe = params.importe

        if (ingreso.concepto === "PRESTAMO") {
            Compra.estimatedDocumentCount((err, count) => {
                const nDocuments = count
                var compra = new Compra()
                compra._id = mongoose.Types.ObjectId(),
                    compra.folio = nDocuments + 1
                compra.provedor = params.provedor
                compra.ubicacion = params.ubicacion
                compra.tipoCompra = "PRESTAMO"
                compra.importe = params.importe
                compra.saldo = params.importe
                compra.fecha = params.fecha
                compra.status = 'ACTIVO'
                compra.save()
            })
        }

        ingreso.save((err, ingresoSaved) => {
            conn.close()
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "No se pudo registrar el Ingreso.",
                    err
                })
            }
            return res.status(200).send({
                status: 'success',
                message: "Ingreso registrado correctamente.",
                ingreso: ingresoSaved
            })
        })
    },

    getIngresos: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const Ingreso = conn.model('Ingreso')
        const resp = await Ingreso
            .find({ importe: { $gt: 0 } }).sort({ fecha: -1, createdAt: -1 })
            .populate({ path: 'ubicacion', select: 'nombre' })
            .lean()
            .then(ingresos => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    ingresos
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los ingresos' + err
                })
            })
    },

    getIngreso: async (req, res) => {
        const ingresoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Ingreso = conn.model('Ingreso')
        if (!ingresoId) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el ingreso'
            })
        }

        const resp = await Ingreso
            .findById(ingresoId)
            .lean()
            .then(ingreso => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    ingreso
                })
            })
            .catch(err => {
                conn.close()
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe el ingreso.',
                    err
                })
            })
    },

    getCuentasdelosClientes: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd) 
        const Ingreso = conn.model('Ingreso') 

        const resp = await Ingreso
            .aggregate([
                { $match: { saldo: { $gt: 0 } } },
                { $lookup: { from: "ventas", localField: "venta", foreignField: "_id", as: "venta" } },
                { $unwind: "$venta" },
                { $addFields: { cliente: "$venta.cliente" } },
                {
                    $group: {
                        _id: "$cliente",
                        cliente: { $first: "$cliente" },
                        saldo: { $sum: "$saldo" },
                        importe: { $sum: "$importe" }
                    }
                },
                { $lookup: { from: "clientes", localField: "cliente", foreignField: "_id", as: "cliente" } },
                { $unwind: "$cliente" }
            ])
            .then(ingresos => {
                conn.close()
                return res.status(200).send({
                    status: "success",
                    cuentas: ingresos
                })
            })
            .catch(err => {
                return res.status(200).send({
                    status: "error",
                    message: "aca: " + err,
                })
            })
    },

    update: async (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const params = req.body;
        const Ingreso = conn.model('Ingreso')

        const resp = await Ingreso
            .findOneAndUpdate({ _id: params._id }, params, { new: true })
            .then(ingresoUpdated => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: 'Todo bien 👌',
                    ingreso: ingresoUpdated
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
        const ingresoId = req.params.id;
        const bd = req.params.bd
        const conn = con(bd)
        const Ingreso = conn.model('Ingreso')
        const ingreso = await Ingreso
            .findById(ingresoId)
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'No se encontró la cuenta.',
                    err
                })
            })

        const updateCuenta = await Ingreso.findByIdAndUpdate(ingreso.referenciaCobranza, { $inc: { saldo: ingreso.importe } })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo actualizar la cuenta.',
                    err
                })
            })

        const removeIngreso = await Ingreso
            .findOneAndDelete({ _id: ingresoId })
            .then(ingresoRemoved => {
                conn.close()
                return res.status(200).send({
                    status: 'success',
                    message: "Ingreso cancelado correctamente.",
                    ingresoRemoved
                })
            })
            .catch(err => {
                conn.close()
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo borrar el ingreso.',
                    err
                })
            })
    },

    getIngresosMonthYear: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const year = req.params.year
        let month = req.params.month

        const Ingreso = conn.model('Ingreso')

        const ing = Ingreso
            .find({ fecha: { $gt: year + "-" + month + "-00", $lt: year + "-" + month + "-32" } })
            .sort({ folio: 1 })
            .populate('ubicacion')
            .then(ingresos => {
                conn.close()
                return res.status(200).send({
                    status: "success",
                    message: "Ingresos encontrados. 👍",
                    ingresos
                })
            })
            .catch(err => {
                conn.close()
                return res.status(200).send({
                    status: "error",
                    message: "Ocurrio un error: " + err
                })

            })
    },


    getIngresosDelDia: (req, res) => {
        const bd = req.params.bd
        const conn = con(bd)
        const fecha = req.params.fecha

        const Ingreso = conn.model('Ingreso')
        try {
            Ingreso.ingresosDelDia(fecha)
                .then(ingresos => {
                    conn.close()
                    return res.status(200).send({
                        status: "success",
                        ingresos
                    })
                })
                .catch(err => {
                    conn.close()
                    console.log(err)
                    throw "No se cargaron los ingresos."
                })
        } catch (err) {
            conn.close()
            return res.status(200).send({
                status: "error",
                message: err
            })
        }
    }
}

module.exports = controller;