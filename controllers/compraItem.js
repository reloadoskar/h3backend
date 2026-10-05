const mongoose = require('mongoose');
const con = require('../src/dbuser')
const { parsePagination, pageResult } = require('../src/pagination')

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
const controller = {

    save: async (req, res) => {
        //recoger parametros
        // const params = req.body;
        // const bd = req.params.bd
        // const conn = await con(bd)
    },

    getItems: async (req, res) => {
        const {user, search, pagination} = req.body
        if(!user || !user.database){
            return res.status(400).send({status: 'error', message: 'Debe indicar el usuario y su base de datos.'})
        }

        let conn
        try{
            const {limit, cursor} = parsePagination(pagination)
            conn = await con(user)
            const CompraItem = conn.model('CompraItem')
            const Compra = conn.model('Compra')
            const Producto = conn.model('Producto')
            const filter = {stock: {$gt: 0}}
            const normalizedSearch = String(search || '').trim()

            if(cursor){
                if(!cursor.createdAt || !mongoose.Types.ObjectId.isValid(cursor.id)){
                    return res.status(400).send({status: 'error', message: 'El cursor de paginación no es válido.'})
                }
                const cursorDate = new Date(cursor.createdAt)
                if(Number.isNaN(cursorDate.getTime())){
                    return res.status(400).send({status: 'error', message: 'El cursor de paginación no es válido.'})
                }
                filter.$and = [{
                    $or: [
                        {createdAt: {$lt: cursorDate}},
                        {createdAt: cursorDate, _id: {$lt: mongoose.Types.ObjectId(cursor.id)}}
                    ]
                }]
            }

            let documents
            if(normalizedSearch){
                const expression = new RegExp(escapeRegExp(normalizedSearch), 'i')
                const searchConditions = [
                    {'producto.descripcion': expression},
                    {'compra.clave': expression},
                    {clasificacion: expression}
                ]
                if(Number.isFinite(Number(normalizedSearch))){
                    searchConditions.push({'compra.folio': Number(normalizedSearch)})
                }
                documents = await CompraItem.aggregate([
                    {$match: filter},
                    {$sort: {createdAt: -1, _id: -1}},
                    {$lookup: {
                        from: Producto.collection.name,
                        localField: 'producto',
                        foreignField: '_id',
                        pipeline: [{$project: {_id: 1, descripcion: 1}}],
                        as: 'producto'
                    }},
                    {$unwind: '$producto'},
                    {$lookup: {
                        from: Compra.collection.name,
                        localField: 'compra',
                        foreignField: '_id',
                        pipeline: [{$project: {_id: 1, clave: 1, folio: 1}}],
                        as: 'compra'
                    }},
                    {$unwind: '$compra'},
                    {$match: {$or: searchConditions}},
                    {$limit: limit + 1},
                    {$project: {
                        compra: 1,
                        producto: 1,
                        ubicacion: 1,
                        clasificacion: 1,
                        cantidad: 1,
                        empaques: 1,
                        stock: 1,
                        empaquesStock: 1,
                        costo: 1,
                        importe: 1,
                        createdAt: 1
                    }}
                ])
            }else{
                documents = await CompraItem
                    .find(filter)
                    .select('compra producto ubicacion clasificacion cantidad empaques stock empaquesStock costo importe createdAt')
                    .sort({createdAt: -1, _id: -1})
                    .limit(limit + 1)
                    .populate('compra', 'clave folio')
                    .populate('producto', 'descripcion')
                    .lean()
            }

            const page = pageResult(documents, limit, item => ({
                createdAt: item.createdAt,
                id: item._id
            }))

            return res.status(200).send({
                status: 'success',
                items: page.items,
                pagination: page.pagination
            })
        }catch(err){
            const statusCode = err.statusCode || 500
            return res.status(statusCode).send({
                status: 'error',
                message: statusCode === 400 ? err.message : 'No fue posible consultar los items disponibles.'
            })
        }finally{
            if(conn) await conn.close().catch(() => {})
        }
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