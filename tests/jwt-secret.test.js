'use strict'
const assert = require('assert')
const { getJwtSecret } = require('../src/jwtSecret')

assert.throws(
  () => getJwtSecret({}),
  /SECRET_KEY debe estar configurada/
)

assert.throws(
  () => getJwtSecret({ SECRET_KEY: 'short' }),
  /al menos 32 caracteres/
)

const validSecret = 'a'.repeat(32)
assert.strictEqual(getJwtSecret({ SECRET_KEY: validSecret }), validSecret)

console.log('PASS configuración segura del secreto JWT')
