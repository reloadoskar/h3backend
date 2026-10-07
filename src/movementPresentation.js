'use strict'

function referenceKey(value) {
    if(value === null || value === undefined) return null
    const candidate = value && value._id !== undefined ? value._id : value
    const key = String(candidate)
    return key && key !== '[object Object]' ? key : null
}

function uniqueReferenceIds(values) {
    return [...new Set(values.map(referenceKey).filter(Boolean))]
}

function collectMovementReferenceIds(movements = []) {
    return {
        ubicacionIds: uniqueReferenceIds(movements.flatMap(mov => [mov && mov.origen, mov && mov.destino])),
        compraIds: uniqueReferenceIds(movements.map(mov => mov && mov.item && mov.item.compra)),
        productoIds: uniqueReferenceIds(movements.map(mov => mov && mov.item && mov.item.producto))
    }
}

function indexReferences(documents = []) {
    return new Map(documents.map(document => [referenceKey(document), document]))
}

function hydrateReference(value, index) {
    const hydrated = index.get(referenceKey(value))
    if(!hydrated) return value
    if(value && typeof value === 'object' && !Array.isArray(value)) {
        return {...hydrated, ...value}
    }
    return hydrated
}

function hydrateMovementReferences(movements = [], references = {}) {
    const ubicaciones = indexReferences(references.ubicaciones)
    const compras = indexReferences(references.compras)
    const productos = indexReferences(references.productos)

    return movements.map(movement => ({
        ...movement,
        origen: hydrateReference(movement.origen, ubicaciones),
        destino: hydrateReference(movement.destino, ubicaciones),
        item: movement.item ? {
            ...movement.item,
            compra: hydrateReference(movement.item.compra, compras),
            producto: hydrateReference(movement.item.producto, productos)
        } : movement.item
    }))
}

module.exports = {
    collectMovementReferenceIds,
    hydrateMovementReferences
}
