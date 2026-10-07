'use strict'

require('dotenv').config()
const mongoose = require('mongoose')
const { MongoClient } = mongoose.mongo

function isObsoleteProductNameIndex(index) {
    const keys = index && index.key && Object.keys(index.key)
    return Boolean(index &&
        index.name === 'nombre_1' &&
        index.unique === true &&
        keys && keys.length === 1 &&
        keys[0] === 'nombre' &&
        index.key.nombre === 1)
}

async function migrate({ apply = false } = {}) {
    const uri = process.env.APP_MONGODB_URI
    if (!uri) throw new Error('APP_MONGODB_URI debe estar configurada.')

    const client = new MongoClient(uri, {
        connectTimeoutMS: 9000,
        serverSelectionTimeoutMS: 9000
    })
    await client.connect()

    let inspectedDatabases = 0
    let affectedDatabases = 0
    let droppedIndexes = 0
    try {
        const databases = (await client.db().admin().listDatabases()).databases
            .map(item => item.name)
            .filter(name => name.startsWith('HDR_USR_'))
        inspectedDatabases = databases.length

        for (const database of databases) {
            const db = client.db(database)
            const collections = await db.listCollections(
                { name: 'productos' },
                { nameOnly: true }
            ).toArray()
            if (!collections.length) continue

            const collection = db.collection('productos')
            const indexes = await collection.indexes()
            const namedIndex = indexes.find(index => index.name === 'nombre_1')
            if (!namedIndex) continue
            if (!isObsoleteProductNameIndex(namedIndex)) {
                throw new Error('El índice nombre_1 no coincide con el contrato obsoleto esperado.')
            }

            affectedDatabases += 1
            if (apply) {
                await collection.dropIndex('nombre_1')
                droppedIndexes += 1
            }
        }

        return {
            mode: apply ? 'apply' : 'dry-run',
            inspectedDatabases,
            affectedDatabases,
            droppedIndexes
        }
    } finally {
        await client.close()
    }
}

if (require.main === module) {
    migrate({ apply: process.argv.includes('--apply') })
        .then(result => console.log(JSON.stringify(result)))
        .catch(error => {
            console.error(error.message)
            process.exitCode = 1
        })
}

module.exports = { isObsoleteProductNameIndex, migrate }
