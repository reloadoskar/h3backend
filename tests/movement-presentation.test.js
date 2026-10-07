'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const {
  collectMovementReferenceIds,
  hydrateMovementReferences
} = require('../src/movementPresentation')

test('collects references from modern movement snapshots without duplicating ids', () => {
  const refs = collectMovementReferenceIds([
    {
      origen: '507f1f77bcf86cd799439011',
      destino: '507f1f77bcf86cd799439012',
      item: {
        compra: '507f1f77bcf86cd799439013',
        producto: '507f1f77bcf86cd799439014'
      }
    },
    {
      origen: '507f1f77bcf86cd799439011',
      item: { producto: { _id: '507f1f77bcf86cd799439014', descripcion: 'Legacy' } }
    }
  ])

  assert.deepEqual(refs.ubicacionIds.sort(), [
    '507f1f77bcf86cd799439011',
    '507f1f77bcf86cd799439012'
  ])
  assert.deepEqual(refs.compraIds, ['507f1f77bcf86cd799439013'])
  assert.deepEqual(refs.productoIds, ['507f1f77bcf86cd799439014'])
})

test('hydrates modern movement references while preserving embedded legacy snapshots', () => {
  const movements = [
    {
      _id: 'movement-modern',
      origen: '507f1f77bcf86cd799439011',
      destino: '507f1f77bcf86cd799439012',
      item: {
        compra: '507f1f77bcf86cd799439013',
        producto: '507f1f77bcf86cd799439014'
      }
    },
    {
      _id: 'movement-legacy',
      origen: { _id: 'legacy-location', nombre: 'Origen histórico' },
      item: {
        compra: { _id: 'legacy-purchase', folio: 7 },
        producto: { _id: 'legacy-product', descripcion: 'Producto histórico' }
      }
    }
  ]

  const hydrated = hydrateMovementReferences(movements, {
    ubicaciones: [
      { _id: '507f1f77bcf86cd799439011', nombre: 'Origen' },
      { _id: '507f1f77bcf86cd799439012', nombre: 'Destino' }
    ],
    compras: [{ _id: '507f1f77bcf86cd799439013', folio: 42 }],
    productos: [{
      _id: '507f1f77bcf86cd799439014',
      descripcion: 'Producto vigente',
      unidad: { abr: 'PZA' },
      empaque: { abr: 'CJ' }
    }]
  })

  assert.equal(hydrated[0].origen.nombre, 'Origen')
  assert.equal(hydrated[0].destino.nombre, 'Destino')
  assert.equal(hydrated[0].item.compra.folio, 42)
  assert.equal(hydrated[0].item.producto.descripcion, 'Producto vigente')
  assert.equal(hydrated[0].item.producto.unidad.abr, 'PZA')
  assert.equal(hydrated[1].origen.nombre, 'Origen histórico')
  assert.equal(hydrated[1].item.producto.descripcion, 'Producto histórico')
})

test('keeps unresolved ids without throwing so historical inconsistencies do not crash the API', () => {
  const movements = [{
    origen: '507f1f77bcf86cd799439011',
    item: { producto: '507f1f77bcf86cd799439014' }
  }]

  assert.doesNotThrow(() => hydrateMovementReferences(movements, {
    ubicaciones: [],
    compras: [],
    productos: []
  }))
  assert.equal(hydrateMovementReferences(movements, {
    ubicaciones: [],
    compras: [],
    productos: []
  })[0].item.producto, '507f1f77bcf86cd799439014')
})
