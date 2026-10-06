'use strict'

const assert = require('assert')
const jwt = require('jsonwebtoken')
const { createAuthenticateApi, enforceAuthenticatedDatabase } = require('../src/authenticateApi')
const { normalizeTenantUser } = require('../src/dbuser')

const secret = 'a-secure-test-secret-with-32-characters'

function runMiddleware(req) {
  return new Promise(resolve => {
    const response = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code
        return this
      },
      send(body) {
        this.body = body
        resolve({ nextCalled: false, response: this, req })
      }
    }
    const middleware = createAuthenticateApi({ secret })
    middleware(req, response, () => resolve({ nextCalled: true, response, req }))
  })
}

async function run() {
  const publicResult = await runMiddleware({ method: 'POST', path: '/user/login', headers: {}, body: {} })
  assert.strictEqual(publicResult.nextCalled, true)

  const missingResult = await runMiddleware({ method: 'POST', path: '/productos', headers: {}, body: {} })
  assert.strictEqual(missingResult.response.statusCode, 401)
  assert.strictEqual(missingResult.response.body.message, 'Sesión no válida o expirada.')

  const payload = {
    _id: '507f1f77bcf86cd799439011',
    nombre: 'QA',
    database: 'TENANT_QA',
    level: 2,
    ubicacion: { _id: '507f1f77bcf86cd799439012' }
  }
  const token = jwt.sign(payload, secret, { expiresIn: '1h' })
  const validResult = await runMiddleware({
    method: 'POST',
    path: '/productos',
    headers: { authorization: `Bearer ${token}` },
    body: {
      database: 'ATTACKER_TOP_LEVEL_TENANT',
      user: { database: 'ATTACKER_TENANT', level: 1 }
    }
  })
  assert.strictEqual(validResult.nextCalled, true)
  assert.strictEqual(validResult.req.body.database, 'TENANT_QA')
  assert.strictEqual(validResult.req.body.user.database, 'TENANT_QA')
  assert.strictEqual(validResult.req.body.user.level, 2)
  assert.strictEqual(validResult.req.auth.database, 'TENANT_QA')

  const invalidResult = await runMiddleware({
    method: 'POST',
    path: '/productos',
    headers: { authorization: 'Bearer invalid-token' },
    body: {}
  })
  assert.strictEqual(invalidResult.response.statusCode, 401)

  const missingClaimsToken = jwt.sign({ nombre: 'QA', level: 2 }, secret, { expiresIn: '1h' })
  const missingClaimsResult = await runMiddleware({
    method: 'POST',
    path: '/productos',
    headers: { authorization: `Bearer ${missingClaimsToken}` },
    body: {}
  })
  assert.strictEqual(missingClaimsResult.response.statusCode, 401)

  const optionsResult = await runMiddleware({ method: 'OPTIONS', path: '/productos', headers: {}, body: {} })
  assert.strictEqual(optionsResult.nextCalled, true)

  const matchingRequest = { auth: { database: 'TENANT_QA' }, params: { bd: 'TENANT_QA' } }
  let matchingNextCalled = false
  enforceAuthenticatedDatabase(matchingRequest, {}, () => { matchingNextCalled = true }, 'TENANT_QA')
  assert.strictEqual(matchingNextCalled, true)
  assert.strictEqual(matchingRequest.params.bd, 'TENANT_QA')

  const mismatchResponse = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this },
    send(body) { this.body = body; return this }
  }
  enforceAuthenticatedDatabase(
    { auth: { database: 'TENANT_QA' }, params: { bd: 'OTHER_TENANT' } },
    mismatchResponse,
    () => { throw new Error('No debe continuar con un tenant distinto') },
    'OTHER_TENANT'
  )
  assert.strictEqual(mismatchResponse.statusCode, 403)
  assert.strictEqual(mismatchResponse.body.message, 'No tiene acceso a esta empresa.')

  assert.deepStrictEqual(normalizeTenantUser('TENANT_QA'), {
    nombre: 'Usuario autenticado',
    database: 'TENANT_QA'
  })
  assert.deepStrictEqual(normalizeTenantUser({ nombre: 'QA', database: 'TENANT_QA' }), {
    nombre: 'QA',
    database: 'TENANT_QA'
  })
  assert.throws(() => normalizeTenantUser(''), /tenant/i)

  console.log('PASS autenticación API verifica JWT y deriva el tenant del token')
}

run().catch(error => {
  console.error(error.stack || error)
  process.exitCode = 1
})
