const con = require('../src/dbuser')

exports.cxp_list = async (req, res) => {
    const user = req.body
    const conn = con(user)

    const Egreso = conn.model('Egreso')

    let resp = await Egreso
        .find({saldo: {$gt:0}})
        .populate({ 
            path: 'compra',
            select: 'folio provedor remision importe saldo fecha status clave',
            populate: {path: 'provedor', select: 'nombre clave diasDeCredito comision'}
        })
        .lean()
        .then( cuentas => {
            conn.close()
            return res.status(200).send({
                status: 'success',
                message: 'Cuentas encontradas',
                cuentas
            })
        })
        .catch(error =>{
            conn.close()
            return res.status(500).send({
                status: 'error',
                message: 'Cuentas encontradas'+ error.message,
            })
        })
}

exports.cxp_create_pago = async (req, res) => {
    let {user, data} = req.body
    const conn = con(user)

    const Egreso = conn.model('Egreso')
    // const Provedor = conn.model('Provedor')
    const Compra = conn.model('Compra')
    
    const cuentas = data.provedor.cuentas
    let importe = data.importe

    console.log("Creando pago por: " + importe)
    console.log("Obteniendo la cuenta de egresos...")
    const ultimoFolioEgreso = await Egreso.estimatedDocumentCount()
    console.log("Obtenido: "+ ultimoFolioEgreso)
    
    let siguienteFolio = ultimoFolioEgreso + 1
    
    console.log("Mapeando cuentas...")
    
    let i = 0;
    while (importe > 0) {
        console.info("Cuenta id: " + cuentas[i]._id + " saldo: $" + cuentas[i].saldo)
        let saldo = cuentas[i].saldo;  
        if(saldo>=importe){ 
            console.log("Saldo mayor/igual al importe: " + i + ":" + cuentas[i].saldo)
            console.log("Creando nuevo egreso...")
            const nuevoEgreso = await Egreso.create({
                folio: siguienteFolio + i,
                ubicacion: data.ubicacion,
                fecha: data.fecha,
                tipo: 'PAGO',
                importe: importe,
                saldo: 0,
                descripcion: "PAGO A: " + cuentas[i].concepto + " #"+ cuentas[i].compra.folio,
                compra: cuentas[i].compra,
                concepto: "PAGO",
            })
            .then(async egresoGuardado=>{
                console.log("Egreso guardado: "+ egresoGuardado)

                console.log("Actualizando compra: "+ cuentas[i].compra._id)
                let compraActualizada = await Compra
                    .findOneAndUpdate({_id: cuentas[i].compra._id}, {$push: {pagos: egresoGuardado._id}} , {new: true})
                    .then( async compra=>{
                        console.log("Compra actualizada." + compra)

                        console.log("Actualizando cuenta...." + cuentas[i]._id )
                        let nuevoSaldo = cuentas[i].saldo-=importe;
                        let cuentaActualizada = await Egreso
                            .findOneAndUpdate({id_: cuentas[i]._id}, { saldo: nuevoSaldo }, {new: true})
                            .then(cuenta=>{
                                console.log("Cuenta actualizada: " + cuenta)
                            })
                            .catch(err=>{
                                conn.close()
                                console.error("Error: no se actualizo la cuenta." + err)
                            })
                    })
                    .catch(err=>{
                        conn.close()
                        console.error("Error: no se actualizo la compra." + err)
                    })
            })
            .catch(err=>{
                conn.close()
                console.error("Error: no se guardo el egreso." + err)
            })
            cuentas[i].saldo-=importe;
            importe=0;  
        }else{ //saldo menor al importe
            console.log("Saldo menor al importe: " + i + ":" + cuentas[i].saldo)
            console.log("Creando nuevo egreso...")
            const nuevoEgreso = await Egreso.create({
                folio: siguienteFolio + i,
                ubicacion: data.ubicacion,
                fecha: data.fecha,
                tipo: 'PAGO',
                importe: importe,
                saldo: 0,
                descripcion: "PAGO A: " + cuentas[i].concepto + " #"+ cuentas[i].compra.folio,
                compra: cuentas[i].compra,
                concepto: "PAGO",
            })
            .then( async egresoGuardado=>{
                console.log("Egreso guardado: "+ egresoGuardado)

                console.log("Actualizando compra: "+ cuentas[i].compra._id)
                let compraActualizada = await Compra
                    .findOneAndUpdate({_id: cuentas[i].compra._id}, { $push: {pagos: nuevoEgreso._id}}, {new: true})
                    .then( async compra=>{
                        console.info("Se actualizo la compra" + compra)

                        console.log("Actualizando cuenta: " + cuentas[i]._id)
                        let cuentaActualizada = await Egreso
                            .findOneAndUpdate({_id: cuenta._id}, { saldo: 0 } , {new: true})
                            .then( async cuenta=>{
                                console.info("Se actualizo la cuenta" + cuenta)
                            })
                            .catch(err=>{
                                conn.close()
                                console.error("Error: no se actualizo la cuenta." + err)
                            })
                    })
                    .catch(err=>{
                        conn.close()
                        console.error("Error: no se actualizo la compra." + err)
                    })
            })
            .catch(err=>{
                conn.close()
                console.error("Error: no se guardo el egreso." + err)
            })
            importe-=cuentas[i].saldo;
            cuentas[i].saldo=0;
        }
        i++;  
    }
    conn.close()
    return res.status(200).send({
        status: 'success',
        message: "Pago guardado.",
        cuentas
    })
}

exports.cxp_update_saldo = (req, res) => {
    const {user, data} = req.body
    const conn = con(user)
    const compras = data.compras
    const importe = data.importe
    const Egreso = conn.model('Egreso')
    let saldoCompra = 0
    compras.map(compra => {
        if(importe>0){
            if(importe >= compra.saldo) {
                Egreso.findByIdAndUpdate(compra._id, { saldo: 0 })
                return importe -= compra.saldo
    
            }else{
                saldoCompra = compra.saldo - importe
                Egreso.findByIdAndUpdate(compra._id, { saldo: saldoCompra })
                return importe = 0
            }
        }
    })
    conn.close()
    return res.status(200).send({
        status: 'success',
        message: "Saldo actualizado",

    })
}