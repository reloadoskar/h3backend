'use strict'
const con = require('../src/dbuser')

const controller = {
    save: async (req, res) => {
        //recoger parametros
        const {user, data} = req.body;
        const conn = await con(user)
        const Ubicacion = conn.model('Ubicacion')

            //Crear el objeto a guardar
            let ubicacion = new Ubicacion();
            
            //Asignar valores
            ubicacion.nombre = data.nombre.toUpperCase();
            ubicacion.tipo = data.tipo.toUpperCase();

            //Guardar objeto
            ubicacion.save((err, ubicacionStored) => {
                conn.close()
                if(err || !ubicacionStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'La ubicacion no se guardó'
                    })
                }
                return res.status(200).send({
                    status: 'success',
                    message: 'Ubicación registrada correctamente.',
                    ubicacion: ubicacionStored
                })
            })

    },

    getUbicacions: async (req, res) => {
        const user = req.body
        const conn = await con(user)
        const Ubicacion = conn.model('Ubicacion')
        Ubicacion.find({}).sort('tipo').exec( (err, ubicacions) => {
            conn.close()
            if(err || !ubicacions){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los ubicacions ' + err,
                    error: err
                })
            }
            return res.status(200).send({
                status: 'success',
                ubicacions: ubicacions
            })
        })
    },

    getUbicacionsSaldo: async (req, res) => {

    },

    getUbicacion: async (req, res) => {
        const ubicacionId = req.params.id;
        const bd = req.params.bd
        const conn = await con(bd)
        const Ubicacion = conn.model('Ubicacion')

        Ubicacion.findById(ubicacionId, (err, ubicacion) => {
            conn.close()
            if(err || !ubicacion){
                return res.status(404).send({
                    status: 'success',
                    message: 'No existe la ubicacion.'
                })
            }
            return res.status(200).send({
                status: 'success',
                ubicacion
            })
        })
    },

    update: async (req, res) => {
        const {user, data} = req.body;
        const conn = await con(user)
        const Ubicacion = conn.model('Ubicacion')
    
        Ubicacion.findOneAndUpdate({_id: data._id}, data, {new:true}, (err, ubicacionUpdated) => {
            conn.close()
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar'
                })
            }
            if(!ubicacionUpdated){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el ubicacion'
                })
            }
            return res.status(200).send({
                status: 'success',
                message: 'Actualizado correctamente. 👍',
                ubicacion: ubicacionUpdated
            })
        })
    },

    delete: async (req, res) => {
        const ubicacionId = req.params.id;
        const bd = req.params.bd
        const conn = await con(bd)
        const Ubicacion = conn.model('Ubicacion')
        const Compra = conn.model('Compra')

        Compra.find({"ubicacion": ubicacionId, "status": "ACTIVO"}).exec((err, compras)=>{
            if(err){console.log(err)}
            if(compras.length > 0){
                conn.close()
                return res.status(200).send({
                    status: "warning",
                    message: "No se puede eliminar la ubicación, existen COMPRAS ACTIVAS relacionadas a éste.",
                    compras
                })
            }else{
                Ubicacion.findOneAndDelete({_id: ubicacionId}, (err, ubicacionRemoved) => {
                    conn.close()
                    if(!ubicacionRemoved){
                        return res.status(500).send({
                            status: 'error',
                            message: 'No se pudo borrar la ubicación.'
                        })
                    }
                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Ocurrio un error.'
                        })
                    }
                    return res.status(200).send({
                        status: 'success',
                        message: 'Ubicación eliminada correctamente.',
                        ubicacionRemoved
                    })
                })
            }
        })

    }

}

module.exports = controller;