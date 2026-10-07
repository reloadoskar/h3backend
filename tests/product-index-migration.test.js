'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const { isObsoleteProductNameIndex } = require('../scripts/migrations/remove-obsolete-product-name-index')

test('accepts only the exact obsolete unique nombre index', () => {
  assert.equal(isObsoleteProductNameIndex({
    name: 'nombre_1',
    unique: true,
    key: { nombre: 1 }
  }), true)
})

test('rejects similarly named or differently shaped indexes', () => {
  assert.equal(isObsoleteProductNameIndex({
    name: 'nombre_1',
    unique: false,
    key: { nombre: 1 }
  }), false)
  assert.equal(isObsoleteProductNameIndex({
    name: 'nombre_1',
    unique: true,
    key: { nombre: 1, clave: 1 }
  }), false)
  assert.equal(isObsoleteProductNameIndex({
    name: 'clave_1',
    unique: true,
    key: { clave: 1 }
  }), false)
})
